"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { AppSettings, FontSize, ReadingText, SavedWord, TextStatus, WordStatus } from "@/types";
import type { WordExplanation } from "@/lib/ai/types";
import { tokenizeParagraphsToSentences, type Token } from "@/lib/words";
import { getSavedWords, saveWord } from "@/lib/storage";
import { lookupWord } from "@/lib/dictionary/lookup";
import { translateParagraphsWithDictionary } from "@/lib/dictionary/articleTranslation";
import { getArticleTranslation } from "@/lib/ai/client";
import { saveCustomDictionaryEntry } from "@/lib/dictionary/custom";
import { NOT_TRANSLATED_YET } from "@/lib/dictionary/constants";
import { generateFallbackExample } from "@/lib/dictionary/exampleGenerator";
import { getKnownWords, markKnown } from "@/lib/knownWords";
import { getProgress, markCompleted, markOpened } from "@/lib/progress";
import { recordArchiveEntry } from "@/lib/archive";
import { defaultSpacedRepetitionFields } from "@/lib/spacedRepetition";
import { estimateDifficulty, type DifficultyEstimate } from "@/lib/difficulty";
import { recordArticleCompleted } from "@/lib/recommendation/interests";
import { DEFAULT_SETTINGS, getSettings } from "@/lib/settings";
import { canSpeak, speakFrenchParagraphs, stopSpeaking } from "@/lib/speech";
import WordSheet, { type ActiveWordState } from "@/components/WordSheet";
import SentenceSheet, { type ActiveSentenceState } from "@/components/SentenceSheet";
import Toast from "@/components/Toast";

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  small: "text-base",
  medium: "text-[1.15rem]",
  large: "text-[1.35rem]",
};

type TranslationState = "idle" | "loading" | "ready" | "error";

export default function Reader({ text }: { text: ReadingText }) {
  const paragraphs = useMemo(() => tokenizeParagraphsToSentences(text.body), [text.body]);
  /** Instant, free, offline word-for-word fallback — shown immediately while the fluent AI translation loads, and again if AI isn't configured or the call fails. */
  const literalParagraphs = useMemo(() => translateParagraphsWithDictionary(paragraphs), [paragraphs]);
  const paragraphTexts = useMemo(
    () => paragraphs.map((sentences) => sentences.map((sg) => sg.text).join(" ")),
    [paragraphs]
  );
  // Flat, ordered list of every sentence in the article, so a tapped word or
  // sentence can look up its immediate neighbours for AI context.
  const flatSentences = useMemo(() => paragraphs.flatMap((p) => p.map((s) => s.text)), [paragraphs]);

  function neighbours(sentenceText: string): { previous: string | null; next: string | null } {
    const i = flatSentences.indexOf(sentenceText);
    if (i === -1) return { previous: null, next: null };
    return { previous: i > 0 ? flatSentences[i - 1] : null, next: i < flatSentences.length - 1 ? flatSentences[i + 1] : null };
  }

  const [wordStatusMap, setWordStatusMap] = useState<Map<string, WordStatus>>(new Map());
  const [knownSet, setKnownSet] = useState<Set<string>>(new Set());
  const [activeWord, setActiveWord] = useState<ActiveWordState | null>(null);
  const [activeSentence, setActiveSentence] = useState<ActiveSentenceState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Start with the neutral defaults (matching SSR output) so the first
  // client render can't mismatch the server-rendered markup; the effect
  // below swaps in the real, localStorage-backed settings after mount.
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState<TextStatus>("unread");
  const [difficulty, setDifficulty] = useState<DifficultyEstimate | null>(null);
  const [showTranslateLaterNote, setShowTranslateLaterNote] = useState(false);
  const [showEnglishTranslation, setShowEnglishTranslation] = useState(false);
  const [translationState, setTranslationState] = useState<TranslationState>("idle");
  const [fluentParagraphs, setFluentParagraphs] = useState<string[] | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [canUseSpeech, setCanUseSpeech] = useState(false);
  const [isSpeakingArticle, setIsSpeakingArticle] = useState(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved words + known words + settings + progress once on mount,
  // and record that this text has been opened.
  useEffect(() => {
    const known = new Set(getKnownWords());
    setWordStatusMap(new Map(getSavedWords().map((w) => [w.word, w.status])));
    setKnownSet(known);
    setSettings(getSettings());
    // Skip for English-language sources — the estimator's French dictionary
    // lookups would score plain English text as near-100% "unfamiliar."
    if (text.language !== "en") setDifficulty(estimateDifficulty(text.body, known));
    markOpened(text.id);
    setStatus(getProgress(text.id).status);
    setCanUseSpeech(canSpeak());
    // A different article needs its own fluent translation — getArticleTranslation
    // is cache-first per article, so re-toggling back on for an already-translated
    // article is instant again; only a genuinely new article re-fetches.
    setShowEnglishTranslation(false);
    setTranslationState("idle");
    setFluentParagraphs(null);
    setTranslationError(null);

    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      // Never let audio keep playing after navigating away from the article.
      stopSpeaking();
      setIsSpeakingArticle(false);
    };
    // text.body/text.language can't change independently of text.id in this
    // app (a different article is always a whole new `text` object), so
    // re-running only on id change is intentional, not a missing dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text.id]);

  function handleToggleListenToArticle() {
    if (isSpeakingArticle) {
      stopSpeaking();
      setIsSpeakingArticle(false);
      return;
    }
    const started = speakFrenchParagraphs([text.title, ...paragraphTexts], "normal", () => setIsSpeakingArticle(false));
    if (started) setIsSpeakingArticle(true);
  }

  async function handleFetchFluentTranslation() {
    setTranslationState("loading");
    setTranslationError(null);
    const result = await getArticleTranslation(text.id, {
      paragraphs: paragraphTexts,
      articleTitle: text.title,
      level: "A2/B1 French learner",
    });
    if (result.data) {
      setFluentParagraphs(result.data.paragraphs);
      setTranslationState("ready");
    } else {
      setTranslationError(result.error);
      setTranslationState("error");
    }
  }

  function handleToggleEnglishTranslation() {
    const next = !showEnglishTranslation;
    setShowEnglishTranslation(next);
    if (next && translationState === "idle") void handleFetchFluentTranslation();
  }

  function showToast(message: string) {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToastMessage(message);
    toastTimeout.current = setTimeout(() => setToastMessage(null), 1400);
  }

  /** Nearest preceding/following *word* tokens around `index` — skips punctuation/whitespace tokens, so "à travers" is found even with a space token in between. */
  function adjacentWords(tokens: Token[], index: number): { previousWord: string | null; nextWord: string | null } {
    let previousWord: string | null = null;
    for (let i = index - 1; i >= 0; i--) {
      if (tokens[i].isWord) {
        previousWord = tokens[i].clean;
        break;
      }
    }
    let nextWord: string | null = null;
    for (let i = index + 1; i < tokens.length; i++) {
      if (tokens[i].isWord) {
        nextWord = tokens[i].clean;
        break;
      }
    }
    return { previousWord, nextWord };
  }

  function handleWordTap(sentenceText: string, tokens: Token[], index: number) {
    const clean = tokens[index]?.clean;
    if (!clean) return;

    const lookup = lookupWord(tokens[index].text, adjacentWords(tokens, index));
    const lemma = lookup.lemma?.toLowerCase();
    const known = knownSet.has(clean) || (!!lemma && knownSet.has(lemma));
    const existingStatus: WordStatus | null = known ? "known" : wordStatusMap.get(clean) ?? null;
    const { previous } = neighbours(sentenceText);

    setActiveSentence(null);
    setActiveWord({
      word: clean,
      contextSentence: sentenceText,
      surroundingSentence: previous,
      lookup,
      existingStatus,
    });
  }

  function handleSentenceTap(sentenceText: string) {
    const { previous, next } = neighbours(sentenceText);
    setActiveWord(null);
    setActiveSentence({ sentence: sentenceText, previousSentence: previous, nextSentence: next });
  }

  function handleKnow() {
    if (!activeWord) return;
    const lemma = activeWord.lookup.lemma;
    markKnown(activeWord.word);
    if (lemma) markKnown(lemma);
    setKnownSet((prev) => {
      const next = new Set(prev);
      next.add(activeWord.word);
      if (lemma) next.add(lemma.toLowerCase());
      return next;
    });
    setActiveWord(null);
    showToast("Marked as known");
  }

  function saveActiveWord(wordStatus: Exclude<WordStatus, "known">, aiBackfill: WordExplanation | null = null) {
    if (!activeWord) return;
    const { lookup, contextSentence, word } = activeWord;
    const missing = lookup.source === "missing";
    // A dictionary miss that's already been looked up via "Ask AI for
    // nuance" this session gets backfilled with the AI's translation and
    // example instead of the generic "Not translated yet" placeholder — see
    // WordSheet's onSave/onUnsure, which pass through whatever it fetched.
    const backfilled = missing && !!aiBackfill;
    const firstExample = lookup.examples[0];
    const fallbackExample = generateFallbackExample({
      word,
      lemma: lookup.lemma,
      partOfSpeech: lookup.partOfSpeech,
      gender: lookup.gender,
      translations: lookup.translations,
    });
    const entry: SavedWord = {
      word,
      lemma: lookup.lemma,
      translations: backfilled ? [aiBackfill.translation] : lookup.translations,
      primaryTranslation: backfilled
        ? aiBackfill.translation
        : missing
          ? NOT_TRANSLATED_YET
          : lookup.translations[0] ?? NOT_TRANSLATED_YET,
      partOfSpeech: backfilled ? aiBackfill.partOfSpeech : lookup.partOfSpeech,
      gender: lookup.gender,
      cefr: lookup.cefr,
      frequencyRank: lookup.frequencyRank,
      articleContextSentence: contextSentence,
      exampleSentenceFr: backfilled ? aiBackfill.simpleExampleFr : firstExample?.fr ?? fallbackExample.fr,
      exampleSentenceEn: backfilled ? aiBackfill.simpleExampleEn : firstExample?.en ?? fallbackExample.en,
      sourceTextTitle: text.title,
      savedAt: new Date().toISOString(),
      reviewCount: 0,
      lastReviewedAt: null,
      status: wordStatus,
      missingFromDictionary: missing && !backfilled,
      ...defaultSpacedRepetitionFields(),
    };
    if (backfilled) {
      saveCustomDictionaryEntry({
        lemma: (aiBackfill.lemma ?? word).toLowerCase(),
        forms: aiBackfill.lemma && aiBackfill.lemma.toLowerCase() !== word ? [word] : undefined,
        translations: [aiBackfill.translation],
        partOfSpeech: aiBackfill.partOfSpeech ?? undefined,
        gender:
          lookup.gender === "masculine" || lookup.gender === "feminine" || lookup.gender === "both"
            ? lookup.gender
            : undefined,
        examples: [{ fr: aiBackfill.simpleExampleFr, en: aiBackfill.simpleExampleEn }],
      });
    }
    saveWord(entry);
    setWordStatusMap((prev) => new Map(prev).set(word, wordStatus));
    setActiveWord(null);
    showToast(wordStatus === "learning" ? "Saved — Learning" : "Saved — Unsure");
  }

  function handleMarkCompleted() {
    const completedAt = new Date().toISOString();
    markCompleted(text.id);
    recordArchiveEntry({
      textId: text.id,
      title: text.title,
      sourceName: text.sourceName ?? null,
      completedAt,
      category: text.category,
      cefr: difficulty?.cefr ?? text.difficulty,
      minutes: text.minutes,
      openedAt: getProgress(text.id).openedAt,
    });
    // Feeds the automatically-learned interest profile behind the home
    // page's recommendations — see src/lib/recommendation/interests.ts.
    recordArticleCompleted(text.category);
    setStatus("completed");
  }

  function wordClassName(token: Token): string {
    const base = "cursor-pointer rounded px-0.5 py-0.5 transition-colors";
    const clean = token.clean;
    const entry = lookupWord(token.text);
    const lemma = entry.lemma?.toLowerCase();
    const known = knownSet.has(clean) || (!!lemma && knownSet.has(lemma));

    if (known && settings.showKnownWordStyling) {
      return `${base} text-ink-muted`;
    }

    if (settings.showSavedHighlights) {
      const wordStatus = wordStatusMap.get(clean);
      const missingUnderline =
        entry.source === "missing"
          ? " underline decoration-dashed decoration-ink-muted underline-offset-2"
          : "";
      if (wordStatus === "learning") return `${base} bg-amber-200/80 text-ink${missingUnderline}`;
      if (wordStatus === "unsure") return `${base} bg-sky-200/70 text-ink${missingUnderline}`;
    }

    return `${base} active:bg-brand/10`;
  }

  return (
    <div className="px-4 pt-4">
      {/* Header with back button */}
      <div className="mb-4 flex items-center gap-2">
        <Link
          href="/"
          className="-ml-2 flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-brand active:scale-95"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </Link>
      </div>

      {(difficulty?.cefr ?? text.difficulty) && (
        <span className="mb-2 inline-block rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand capitalize">
          {text.category}
        </span>
      )}
      <h1 className="text-2xl font-extrabold leading-tight text-ink">
        {text.title}
      </h1>
      <p className="mt-1 text-xs text-ink-muted">
        {difficulty?.cefr ?? text.difficulty} · {text.minutes} min · tap a word for its meaning, tap
        a sentence for more
      </p>
      {difficulty && (
        <p className="mt-1 text-xs italic text-ink-muted">
          This text looks like {difficulty.cefr} ({difficulty.label.toLowerCase()}). Around{" "}
          {Math.round(difficulty.unknownWordRatio * 100)}% of words may be unfamiliar.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {canUseSpeech && (
          <button
            type="button"
            onClick={handleToggleListenToArticle}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold active:scale-95 ${
              isSpeakingArticle ? "bg-brand text-white" : "bg-cream-card text-ink shadow-sm"
            }`}
          >
            {isSpeakingArticle ? (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
                Stop listening
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5 6 9H3v6h3l5 4z" />
                  <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                  <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                </svg>
                Listen to article
              </>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={handleToggleEnglishTranslation}
          className="inline-flex items-center gap-2 rounded-full bg-cream-card px-3.5 py-2 text-xs font-semibold text-ink shadow-sm active:scale-95"
          aria-pressed={showEnglishTranslation}
        >
          <span
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              showEnglishTranslation ? "bg-brand" : "bg-cream-dark"
            }`}
            aria-hidden="true"
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                showEnglishTranslation ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
          English
        </button>
      </div>

      {showEnglishTranslation && (
        <p className="mt-2 text-[11px] text-ink-muted">
          {translationState === "loading" && "Translating fluently…"}
          {translationState === "ready" && "Fluent AI translation, shown under each paragraph."}
          {translationState === "error" && (
            <>
              {translationError} Showing the instant offline (word-for-word) version instead.{" "}
              <button type="button" onClick={handleFetchFluentTranslation} className="underline">
                Try fluent translation again
              </button>
            </>
          )}
        </p>
      )}

      <article
        className={`no-select mt-6 space-y-6 ${FONT_SIZE_CLASSES[settings.fontSize]} leading-[1.8] text-ink`}
      >
        {paragraphs.map((sentences, pi) => (
          <div key={pi}>
            <p>
              {sentences.map((sg, si) => (
                <Fragment key={si}>
                  <span
                    onClick={() => handleSentenceTap(sg.text)}
                    className="cursor-pointer rounded underline decoration-dotted decoration-cream-dark underline-offset-4 transition-colors active:bg-sky-100/60"
                  >
                    {sg.tokens.map((tok, ti) =>
                      tok.isWord ? (
                        <span
                          key={ti}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWordTap(sg.text, sg.tokens, ti);
                          }}
                          className={wordClassName(tok)}
                        >
                          {tok.text}
                        </span>
                      ) : (
                        <span key={ti}>{tok.text}</span>
                      )
                    )}
                  </span>
                  {si < sentences.length - 1 && " "}
                </Fragment>
              ))}
            </p>
            {showEnglishTranslation && (
              <p className="mt-1.5 border-l-2 border-cream-dark pl-3 text-[0.9em] italic leading-relaxed text-ink-muted">
                {translationState === "ready" && fluentParagraphs ? fluentParagraphs[pi] : literalParagraphs[pi]}
              </p>
            )}
          </div>
        ))}
      </article>

      {/* Reading progress */}
      <div className="mt-8 mb-4 flex justify-center">
        {status === "completed" ? (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-2.5 text-sm font-semibold text-emerald-700">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Completed
          </span>
        ) : (
          <button
            onClick={handleMarkCompleted}
            className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white active:scale-95"
          >
            Mark as completed
          </button>
        )}
      </div>

      <div className="mb-6 space-y-2 text-center">
        <div>
          <button
            onClick={() => setShowTranslateLaterNote((v) => !v)}
            className="text-xs font-semibold text-ink-muted underline underline-offset-2"
          >
            About the English translation
          </button>
          {showTranslateLaterNote && (
            <p className="mx-auto mt-2 max-w-sm text-xs text-ink-muted">
              The English toggle asks an AI tutor for a fluent, natural translation of each paragraph, shown
              right under it — that takes a moment and needs AI configured on the server. Until it's ready
              (or if AI isn't available), an instant offline word-for-word version from the local dictionary
              is shown instead, so there's never nothing to read.
            </p>
          )}
        </div>

        {/* RSS-only metadata. */}
        {text.sourceUrl && (
          <a
            href={text.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-ink-muted underline underline-offset-2"
          >
            Original source
          </a>
        )}
      </div>

      <WordSheet
        state={activeWord}
        articleTitle={text.title}
        onClose={() => setActiveWord(null)}
        onKnow={handleKnow}
        onUnsure={(aiBackfill) => saveActiveWord("unsure", aiBackfill)}
        onSave={(aiBackfill) => saveActiveWord("learning", aiBackfill)}
      />
      <SentenceSheet
        state={activeSentence}
        articleTitle={text.title}
        onClose={() => setActiveSentence(null)}
      />
      <Toast message={toastMessage} />
    </div>
  );
}
