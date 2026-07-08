"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { AppSettings, FontSize, ReadingText, SavedWord, TextStatus, WordStatus } from "@/types";
import { tokenizeParagraphsToSentences } from "@/lib/words";
import { getSavedWords, saveWord } from "@/lib/storage";
import { lookupWord } from "@/lib/dictionary/lookup";
import { NOT_TRANSLATED_YET } from "@/lib/dictionary/constants";
import { generateFallbackExample } from "@/lib/dictionary/exampleGenerator";
import { getKnownWords, isKnown, markKnown } from "@/lib/knownWords";
import { getProgress, markCompleted, markOpened } from "@/lib/progress";
import { recordArchiveEntry } from "@/lib/archive";
import { defaultSpacedRepetitionFields } from "@/lib/spacedRepetition";
import { estimateDifficulty, type DifficultyEstimate } from "@/lib/difficulty";
import { recordArticleCompleted } from "@/lib/recommendation/interests";
import { DEFAULT_SETTINGS, getSettings } from "@/lib/settings";
import WordSheet, { type ActiveWordState } from "@/components/WordSheet";
import SentenceSheet, { type ActiveSentenceState } from "@/components/SentenceSheet";
import Toast from "@/components/Toast";

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  small: "text-base",
  medium: "text-[1.15rem]",
  large: "text-[1.35rem]",
};

export default function Reader({ text }: { text: ReadingText }) {
  const paragraphs = useMemo(() => tokenizeParagraphsToSentences(text.body), [text.body]);
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

    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, [text.id]);

  function showToast(message: string) {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToastMessage(message);
    toastTimeout.current = setTimeout(() => setToastMessage(null), 1400);
  }

  function handleWordTap(sentenceText: string, clean: string) {
    if (!clean) return;

    const lookup = lookupWord(clean);
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

  function saveActiveWord(wordStatus: Exclude<WordStatus, "known">) {
    if (!activeWord) return;
    const { lookup, contextSentence, word } = activeWord;
    const missing = lookup.source === "missing";
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
      translations: lookup.translations,
      primaryTranslation: missing ? NOT_TRANSLATED_YET : lookup.translations[0] ?? NOT_TRANSLATED_YET,
      partOfSpeech: lookup.partOfSpeech,
      gender: lookup.gender,
      cefr: lookup.cefr,
      frequencyRank: lookup.frequencyRank,
      articleContextSentence: contextSentence,
      exampleSentenceFr: firstExample?.fr ?? fallbackExample.fr,
      exampleSentenceEn: firstExample?.en ?? fallbackExample.en,
      sourceTextTitle: text.title,
      savedAt: new Date().toISOString(),
      reviewCount: 0,
      lastReviewedAt: null,
      status: wordStatus,
      missingFromDictionary: missing,
      ...defaultSpacedRepetitionFields(),
    };
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

  function wordClassName(clean: string): string {
    const base = "cursor-pointer rounded px-0.5 py-0.5 transition-colors";
    const entry = lookupWord(clean);
    const lemma = entry.lemma?.toLowerCase();
    const known = knownSet.has(clean) || (!!lemma && knownSet.has(lemma));

    if (known && settings.showKnownWordStyling) {
      return `${base} text-slate-400`;
    }

    if (settings.showSavedHighlights) {
      const wordStatus = wordStatusMap.get(clean);
      const missingUnderline =
        entry.source === "missing"
          ? " underline decoration-dashed decoration-slate-400 underline-offset-2"
          : "";
      if (wordStatus === "learning") return `${base} bg-amber-200/80 text-slate-900${missingUnderline}`;
      if (wordStatus === "unsure") return `${base} bg-sky-200/70 text-slate-900${missingUnderline}`;
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

      <h1 className="text-2xl font-extrabold leading-tight text-slate-900">
        {text.title}
      </h1>
      <p className="mt-1 text-xs text-slate-400">
        {difficulty?.cefr ?? text.difficulty} · {text.minutes} min · tap a word for its meaning, tap
        a sentence for more
      </p>
      {difficulty && (
        <p className="mt-1 text-xs italic text-slate-400">
          This text looks like {difficulty.cefr} ({difficulty.label.toLowerCase()}). Around{" "}
          {Math.round(difficulty.unknownWordRatio * 100)}% of words may be unfamiliar.
        </p>
      )}

      <article
        className={`no-select mt-6 space-y-6 ${FONT_SIZE_CLASSES[settings.fontSize]} leading-[1.8] text-slate-800`}
      >
        {paragraphs.map((sentences, pi) => (
          <p key={pi}>
            {sentences.map((sg, si) => (
              <Fragment key={si}>
                <span
                  onClick={() => handleSentenceTap(sg.text)}
                  className="cursor-pointer rounded underline decoration-dotted decoration-slate-300 underline-offset-4 transition-colors active:bg-sky-100/60"
                >
                  {sg.tokens.map((tok, ti) =>
                    tok.isWord ? (
                      <span
                        key={ti}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWordTap(sg.text, tok.clean);
                        }}
                        className={wordClassName(tok.clean)}
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
            className="text-xs font-semibold text-slate-400 underline underline-offset-2"
          >
            Translate article later
          </button>
          {showTranslateLaterNote && (
            <p className="mx-auto mt-2 max-w-sm text-xs text-slate-400">
              Full article translation is intentionally disabled for now. Use
              word and sentence support while reading.
            </p>
          )}
        </div>

        {/* RSS-only metadata. */}
        {text.sourceUrl && (
          <a
            href={text.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-slate-400 underline underline-offset-2"
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
        onUnsure={() => saveActiveWord("unsure")}
        onSave={() => saveActiveWord("learning")}
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
