"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { AppSettings, FontSize, ReadingText, SavedWord, TextStatus, WordStatus } from "@/types";
import { texts as hardcodedTexts } from "@/data/texts";
import { tokenize, tokenizeParagraphsToSentences, type SentenceGroup, type Token } from "@/lib/words";
import { deleteWord, getSavedWords, saveWord } from "@/lib/storage";
import { lookupWord } from "@/lib/dictionary/lookup";
import {
  cacheDictionarySentenceTranslations,
  findPhraseTranslationMatch,
  translateSentencesWithDictionaryCache,
  type DictionaryArticleTranslationMode,
} from "@/lib/dictionary/articleTranslation";
import { getArticleTranslation } from "@/lib/ai/client";
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
import { getArticleFeedbackForText, saveArticleFeedback, type ArticleDifficultyFeedback } from "@/lib/articleFeedback";
import { findPronounReference } from "@/lib/pronounReferences";
import { getCachedRssTexts, getOfflineRssTexts } from "@/lib/rss/rssTextCache";
import {
  findRelatedArticles,
  type MultipleChoiceQuestion,
  type ToneQuestion,
} from "@/lib/comprehension";
import {
  buildComprehensionQuestionBundle,
  getOrCreateComprehensionQuestionBundle,
  type ComprehensionQuestionBundle,
} from "@/lib/comprehensionCache";
import WordSheet, { type ActiveWordState } from "@/components/WordSheet";
import SentenceSheet, { type ActiveSentenceState } from "@/components/SentenceSheet";
import PhraseSheet, { type ActivePhraseState } from "@/components/PhraseSheet";
import Toast from "@/components/Toast";

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  small: "text-base",
  medium: "text-[1.15rem]",
  large: "text-[1.35rem]",
};

type TranslationState = "idle" | "loading" | "ready";
/** How many paragraphs go in each translation request — small enough that the first chunk (typically what's on screen when the toggle is tapped) comes back in a couple of seconds instead of waiting for the whole article, large enough that each request still has some real context to work with. */
const PARAGRAPHS_PER_TRANSLATION_CHUNK = 2;

export default function Reader({ text }: { text: ReadingText }) {
  const paragraphs = useMemo(() => tokenizeParagraphsToSentences(text.body), [text.body]);
  /** Instant, free, offline fallback, one per sentence. Defaults to phrase-aware, with literal still available from Settings. */
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const offlineTranslationMode: DictionaryArticleTranslationMode = settings.translationMode === "literal" ? "literal" : "phrase-aware";
  const offlineSentences = useMemo(
    () => translateSentencesWithDictionaryCache(text.id, text.body, paragraphs, offlineTranslationMode),
    [offlineTranslationMode, paragraphs, text.body, text.id]
  );
  const paragraphTexts = useMemo(
    () => paragraphs.map((sentences) => sentences.map((sg) => sg.text).join(" ")),
    [paragraphs]
  );
  // Flat, ordered list of every sentence in the article, so a tapped word or
  // sentence can look up its immediate neighbours for AI context.
  const flatSentences = useMemo(() => paragraphs.flatMap((p) => p.map((s) => s.text)), [paragraphs]);
  /** Index into the flat sentence arrays above where each paragraph starts — lets the render loop (which walks paragraphs, then sentences within each) find the right flat-array slot, and lets each chunk's AI request convey real (local) paragraph breaks without the response needing to track them. */
  const paragraphBreakBeforeIndex = useMemo(() => {
    const offsets: number[] = [];
    let running = 0;
    for (const sentences of paragraphs) {
      offsets.push(running);
      running += sentences.length;
    }
    return offsets;
  }, [paragraphs]);
  /**
   * Paragraphs grouped into small translation chunks, each carrying its own
   * flat sentence list, local paragraph-break offsets (for that chunk's own
   * request), and where it starts in the article's overall flat sentence
   * array (for merging the response back into place). Translated
   * sequentially, top to bottom — see handleFetchFluentTranslation — so the
   * start of the article (almost always what's on screen when a reader taps
   * the toggle) shows a fluent translation well before the rest of a long
   * article finishes.
   */
  const translationChunks = useMemo(() => {
    const chunks: { sentences: string[]; paragraphBreakBeforeIndex: number[]; globalStartIndex: number }[] = [];
    for (let i = 0; i < paragraphs.length; i += PARAGRAPHS_PER_TRANSLATION_CHUNK) {
      const chunkParagraphs = paragraphs.slice(i, i + PARAGRAPHS_PER_TRANSLATION_CHUNK);
      const sentences = chunkParagraphs.flatMap((sentences) => sentences.map((sg) => sg.text));
      const localBreaks: number[] = [];
      let running = 0;
      for (const sentences of chunkParagraphs) {
        localBreaks.push(running);
        running += sentences.length;
      }
      chunks.push({ sentences, paragraphBreakBeforeIndex: localBreaks, globalStartIndex: paragraphBreakBeforeIndex[i] });
    }
    return chunks;
  }, [paragraphs, paragraphBreakBeforeIndex]);

  function neighbours(sentenceText: string): { previous: string | null; next: string | null } {
    const i = flatSentences.indexOf(sentenceText);
    if (i === -1) return { previous: null, next: null };
    return { previous: i > 0 ? flatSentences[i - 1] : null, next: i < flatSentences.length - 1 ? flatSentences[i + 1] : null };
  }

  const [wordStatusMap, setWordStatusMap] = useState<Map<string, WordStatus>>(new Map());
  const [knownSet, setKnownSet] = useState<Set<string>>(new Set());
  const [activeWord, setActiveWord] = useState<ActiveWordState | null>(null);
  const [activeSentence, setActiveSentence] = useState<ActiveSentenceState | null>(null);
  const [activePhrase, setActivePhrase] = useState<ActivePhraseState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<TextStatus>("unread");
  const [difficulty, setDifficulty] = useState<DifficultyEstimate | null>(null);
  const [articleSavedWordCount, setArticleSavedWordCount] = useState(0);
  const [articleFeedback, setArticleFeedback] = useState<ArticleDifficultyFeedback | null>(null);
  const [articlePool, setArticlePool] = useState<ReadingText[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<ReadingText[]>([]);
  const [gistAnswer, setGistAnswer] = useState<number | null>(null);
  const [toneAnswers, setToneAnswers] = useState<Record<string, number>>({});
  const [summaryDraft, setSummaryDraft] = useState("");
  const [showTranslateLaterNote, setShowTranslateLaterNote] = useState(false);
  const [showEnglishTranslation, setShowEnglishTranslation] = useState(false);
  const [translationState, setTranslationState] = useState<TranslationState>("idle");
  /** null = translation hasn't started; otherwise one slot per flat sentence, filled in progressively chunk-by-chunk (still-null slots render the offline fallback). */
  const [fluentSentences, setFluentSentences] = useState<(string | null)[] | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [canUseSpeech, setCanUseSpeech] = useState(false);
  const [isSpeakingArticle, setIsSpeakingArticle] = useState(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [comprehensionQuestions, setComprehensionQuestions] = useState<ComprehensionQuestionBundle>(() =>
    buildComprehensionQuestionBundle(text, [])
  );
  const gistQuestion = comprehensionQuestions.gistQuestion;
  const toneQuestions = comprehensionQuestions.toneQuestions;

  useEffect(() => {
    cacheDictionarySentenceTranslations(text.id, text.body, offlineSentences, offlineTranslationMode);
  }, [offlineSentences, offlineTranslationMode, text.body, text.id]);

  useEffect(() => {
    setComprehensionQuestions(getOrCreateComprehensionQuestionBundle(text, articlePool));
  }, [articlePool, text]);

  // Load saved words + known words + settings + progress once on mount,
  // and record that this text has been opened.
  useEffect(() => {
    const known = new Set(getKnownWords());
    const savedWords = getSavedWords();
    setWordStatusMap(new Map(savedWords.map((w) => [w.word, w.status])));
    setArticleSavedWordCount(savedWords.filter((word) => word.sourceTextTitle === text.title && word.status !== "known").length);
    setKnownSet(known);
    const loadedSettings = getSettings();
    setSettings(loadedSettings);
    // Skip for English-language sources — the estimator's French dictionary
    // lookups would score plain English text as near-100% "unfamiliar."
    if (text.language !== "en") setDifficulty(estimateDifficulty(text.body, known));
    markOpened(text.id);
    setStatus(getProgress(text.id).status);
    setArticleFeedback(getArticleFeedbackForText(text.id)?.feedback ?? null);
    const candidates = dedupeArticles([...getCachedRssTexts(), ...getOfflineRssTexts(), ...hardcodedTexts]);
    setArticlePool(candidates);
    setRelatedArticles(findRelatedArticles(text, candidates));
    setGistAnswer(null);
    setToneAnswers({});
    setSummaryDraft("");
    setCanUseSpeech(canSpeak());
    // A different article needs its own fluent translation — getArticleTranslation
    // is cache-first per article, so re-toggling back on for an already-translated
    // article is instant again; only a genuinely new article re-fetches.
    setShowEnglishTranslation(false);
    setTranslationState("idle");
    setFluentSentences(null);
    setTranslationError(null);

    // Pre-warm the fluent translation in the background as soon as the
    // article opens, rather than waiting for the reader to tap "Show
    // English" — so it's already sitting in cache by the time they check
    // it. This doesn't reveal the translation UI (showEnglishTranslation
    // stays false); it just fills fluentSentences ahead of time. Opt-in via
    // the same aiTranslationEnabled setting the toggle itself respects — a
    // reader who's turned AI translation off shouldn't pay for an API call
    // on every article they merely open, only ones they explicitly ask to
    // see translated.
    if (loadedSettings.translationMode === "natural" && loadedSettings.aiTranslationEnabled) {
      void handleFetchFluentTranslation();
    }

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

  /**
   * Fetches each translation chunk in turn (not all at once) — every
   * resolved chunk is merged into `fluentSentences` immediately, so the
   * start of the article upgrades from the literal fallback to a fluent
   * translation while later chunks are still in flight, instead of the
   * reader waiting for the entire article before seeing anything fluent.
   * A chunk that fails just leaves its slots on the literal fallback
   * (recorded in `translationError` for a soft, non-blocking retry link)
   * rather than aborting the remaining chunks.
   */
  async function handleFetchFluentTranslation() {
    setTranslationState("loading");
    setTranslationError(null);
    setFluentSentences(new Array<string | null>(flatSentences.length).fill(null));

    let lastError: string | null = null;
    for (const chunk of translationChunks) {
      const result = await getArticleTranslation(text.id, {
        sentences: chunk.sentences,
        paragraphBreakBeforeIndex: chunk.paragraphBreakBeforeIndex,
        articleTitle: text.title,
        level: "A2/B1 French learner",
      });
      if (result.data) {
        setFluentSentences((prev) => {
          const next = prev ? [...prev] : new Array<string | null>(flatSentences.length).fill(null);
          result.data.sentences.forEach((s, i) => {
            next[chunk.globalStartIndex + i] = s;
          });
          return next;
        });
      } else {
        lastError = result.error;
      }
    }
    setTranslationError(lastError);
    setTranslationState("ready");
  }

  function handleToggleEnglishTranslation() {
    const next = !showEnglishTranslation;
    setShowEnglishTranslation(next);
    if (next && translationState === "idle" && shouldUseFluentTranslation()) void handleFetchFluentTranslation();
  }

  function shouldUseFluentTranslation(): boolean {
    return settings.translationMode === "natural" && settings.aiTranslationEnabled;
  }

  function translationModeLabel(): string {
    if (settings.translationMode === "literal") return "Literal";
    if (settings.translationMode === "phrase-aware") return "Phrase-aware";
    return settings.aiTranslationEnabled ? "Natural" : "Phrase-aware";
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
    let existingStatus: WordStatus | null = known ? "known" : wordStatusMap.get(clean) ?? null;
    const { previous } = neighbours(sentenceText);
    const pronounReference = findPronounReference(
      clean,
      tokens,
      index,
      previous ? tokenize(previous) : null
    );

    if (!known && !existingStatus) {
      const nextWords = saveWord(buildSavedWord(clean, lookup, sentenceText, "learning"));
      existingStatus = "learning";
      setWordStatusMap((prev) => new Map(prev).set(clean, "learning"));
      setArticleSavedWordCount(nextWords.filter((saved) => saved.sourceTextTitle === text.title && saved.status !== "known").length);
    }

    setActiveSentence(null);
    setActivePhrase(null);
    setActiveWord({
      word: clean,
      contextSentence: sentenceText,
      surroundingSentence: previous,
      lookup,
      existingStatus,
      pronounReference,
    });
  }

  function handleSentenceTap(sentenceText: string) {
    const { previous, next } = neighbours(sentenceText);
    setActiveWord(null);
    setActivePhrase(null);
    setActiveSentence({ sentence: sentenceText, previousSentence: previous, nextSentence: next });
  }

  function handlePhraseTap(sentenceText: string, phrase: ActivePhraseState) {
    setActiveWord(null);
    setActiveSentence(null);
    setActivePhrase({ ...phrase, contextSentence: sentenceText });
  }

  function handleKnow() {
    if (!activeWord) return;
    const lemma = activeWord.lookup.lemma;
    markKnown(activeWord.word);
    if (lemma) markKnown(lemma);
    const nextWords = deleteWord(activeWord.word);
    setKnownSet((prev) => {
      const next = new Set(prev);
      next.add(activeWord.word);
      if (lemma) next.add(lemma.toLowerCase());
      return next;
    });
    setWordStatusMap((prev) => {
      const next = new Map(prev);
      next.delete(activeWord.word);
      return next;
    });
    setArticleSavedWordCount(nextWords.filter((saved) => saved.sourceTextTitle === text.title && saved.status !== "known").length);
    setActiveWord(null);
    showToast("Removed from saved words");
  }

  function buildSavedWord(
    word: string,
    lookup: ActiveWordState["lookup"],
    contextSentence: string,
    wordStatus: Exclude<WordStatus, "known">
  ): SavedWord {
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
    return entry;
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

  function handleArticleFeedback(feedback: ArticleDifficultyFeedback) {
    saveArticleFeedback(text, feedback, difficulty?.cefr ?? text.difficulty);
    setArticleFeedback(feedback);
    showToast(feedback === "good" ? "Saved as a good match" : feedback === "hard" ? "Saved as too hard" : "Saved as too easy");
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

  function handleToneAnswer(question: ToneQuestion, answerIndex: number) {
    setToneAnswers((prev) => ({ ...prev, [question.id]: answerIndex }));
  }

  function isHighlightedReference(tokens: Token[], tokenIndex: number): boolean {
    const reference = activeWord?.pronounReference;
    if (!reference || !tokens[tokenIndex]?.isWord) return false;
    const referenceWords = tokenize(reference.antecedentText).filter((t) => t.isWord).map((t) => t.clean);
    if (referenceWords.length === 0) return false;

    const wordPositions = tokens
      .map((token, index) => ({ token, index }))
      .filter((item) => item.token.isWord);

    for (let start = 0; start <= wordPositions.length - referenceWords.length; start++) {
      const window = wordPositions.slice(start, start + referenceWords.length);
      if (window.every((item, offset) => item.token.clean === referenceWords[offset])) {
        return window.some((item) => item.index === tokenIndex);
      }
    }
    return false;
  }

  /** The clickable, word-tappable French sentence — shared between the normal flowing-paragraph layout and the per-sentence interlinear layout below, so the tap targets don't have to be defined twice. */
  function phraseClassName(): string {
    return "cursor-pointer rounded bg-brand-light/80 px-0.5 py-0.5 text-brand underline decoration-dotted underline-offset-4 transition-colors active:bg-brand-light";
  }

  function renderSentenceSpan(sg: SentenceGroup, key: number) {
    const renderedTokens: ReactNode[] = [];
    for (let ti = 0; ti < sg.tokens.length; ti++) {
      const tok = sg.tokens[ti];
      const phrase = tok.isWord ? findPhraseTranslationMatch(sg.tokens, ti) : null;
      if (phrase) {
        const phraseText = sg.tokens.slice(ti, phrase.endIndex + 1).map((token) => token.text).join("");
        renderedTokens.push(
          <span
            key={ti}
            onClick={(e) => {
              e.stopPropagation();
              handlePhraseTap(sg.text, {
                phrase: phraseText.toLowerCase(),
                lemma: phrase.lemma,
                translation: phrase.translation,
                partOfSpeech: phrase.partOfSpeech,
                contextSentence: sg.text,
              });
            }}
            className={phraseClassName()}
          >
            {phraseText}
          </span>
        );
        ti = phrase.endIndex;
        continue;
      }

      renderedTokens.push(
        tok.isWord ? (
          <span
            key={ti}
            onClick={(e) => {
              e.stopPropagation();
              handleWordTap(sg.text, sg.tokens, ti);
            }}
            className={`${wordClassName(tok)} ${isHighlightedReference(sg.tokens, ti) ? "bg-emerald-200/80 ring-2 ring-emerald-400" : ""}`}
          >
            {tok.text}
          </span>
        ) : (
          <span key={ti}>{tok.text}</span>
        )
      );
    }

    return (
      <span
        key={key}
        onClick={() => handleSentenceTap(sg.text)}
        className="cursor-pointer rounded underline decoration-dotted decoration-cream-dark underline-offset-4 transition-colors active:bg-sky-100/60"
      >
        {renderedTokens}
      </span>
    );
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
        a sentence to explain it
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
          Translate ({translationModeLabel()})
        </button>
      </div>

      {showEnglishTranslation && (
        <p className="mt-2 text-[11px] text-ink-muted">
          {!shouldUseFluentTranslation() && (
            <>
              Showing the free, instant offline {settings.translationMode === "literal" ? "literal" : "phrase-aware"} translation.
            </>
          )}
          {shouldUseFluentTranslation() && translationState === "loading" && "Translating naturally, starting from the top..."}
          {shouldUseFluentTranslation() && translationState === "ready" && !translationError && "Natural English translation, shown under each sentence."}
          {shouldUseFluentTranslation() && translationState === "ready" && translationError && (
            <>
              Some parts could not be translated naturally ({translationError}), so those lines use the offline phrase-aware version.{" "}
              <button type="button" onClick={handleFetchFluentTranslation} className="underline">
                Try again
              </button>
            </>
          )}
        </p>
      )}

      <article
        className={`no-select mt-6 space-y-6 ${FONT_SIZE_CLASSES[settings.fontSize]} leading-[1.8] text-ink`}
      >
        {paragraphs.map((sentences, pi) =>
          showEnglishTranslation ? (
            // Interlinear layout: each sentence gets its own line, with its
            // translation directly underneath — true "between the lines,"
            // which a flowing multi-sentence paragraph can't support (there'd
            // be nowhere to put a translation for the 2nd+ sentence without
            // it reading as belonging to the wrong one).
            <div key={pi} className="space-y-3">
              {sentences.map((sg, si) => {
                const flatIndex = paragraphBreakBeforeIndex[pi] + si;
                return (
                  <div key={si}>
                    <p>{renderSentenceSpan(sg, si)}</p>
                    <p className="mt-1 border-l-2 border-cream-dark pl-3 text-[0.9em] italic leading-relaxed text-ink-muted">
                      {fluentSentences?.[flatIndex] ?? offlineSentences[flatIndex]}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            // Normal reading layout: sentences flow together into one paragraph.
            <p key={pi}>
              {sentences.map((sg, si) => (
                <Fragment key={si}>
                  {renderSentenceSpan(sg, si)}
                  {si < sentences.length - 1 && " "}
                </Fragment>
              ))}
            </p>
          )
        )}
      </article>

      <section className="mt-8 space-y-4">
        <ComprehensionQuestion
          question={gistQuestion}
          selected={gistAnswer}
          onSelect={setGistAnswer}
        />

        <section className="space-y-3">
          <h2 className="px-1 text-sm font-bold uppercase tracking-wide text-ink-muted">Tone check</h2>
          {toneQuestions.map((question) => (
            <ComprehensionQuestion
              key={question.id}
              question={question}
              selected={toneAnswers[question.id] ?? null}
              onSelect={(answer) => handleToneAnswer(question, answer)}
            />
          ))}
        </section>

        {relatedArticles.length > 0 && (
          <RelatedArticles articles={relatedArticles} />
        )}

        <div className="rounded-3xl bg-cream-card p-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Summarise it</h2>
          <textarea
            value={summaryDraft}
            onChange={(event) => setSummaryDraft(event.target.value)}
            rows={4}
            placeholder="Write the article's main point in English or French."
            className="mt-3 w-full resize-none rounded-2xl bg-cream px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
          />
          <p className="mt-2 text-xs text-ink-muted">
            Aim for one sentence about what happened and one sentence about why it matters.
          </p>
        </div>
      </section>

      {/* Reading progress */}
      <div className="mt-8 mb-4 flex justify-center">
        {status === "completed" ? (
          <div className="space-y-2 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-2.5 text-sm font-semibold text-emerald-700">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Completed
            </span>
            <div className="rounded-3xl bg-cream-card p-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">How did this level feel?</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(
                  [
                    { value: "too-easy", label: "Too easy" },
                    { value: "good", label: "Good" },
                    { value: "hard", label: "Hard" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleArticleFeedback(option.value)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold active:scale-95 ${
                      articleFeedback === option.value ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {articleSavedWordCount > 0 && (
              <Link
                href={`/review?article=${encodeURIComponent(text.title)}`}
                className="block rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white active:scale-95"
              >
                Review {articleSavedWordCount} {articleSavedWordCount === 1 ? "word" : "words"} from this article
              </Link>
            )}
          </div>
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
            About Translate vs. tap-to-explain
          </button>
          {showTranslateLaterNote && (
            <p className="mx-auto mt-2 max-w-sm text-xs text-ink-muted">
              The Translate toggle asks an AI tutor for a fluent, natural translation of each sentence, shown
              right under it — for reading the whole article in English alongside the French. Unless "Fluent AI
              translation" is off in Settings, this starts loading in the background as soon as you open the
              article — usually ready by the time you tap the toggle, rather than making you wait. It still
              uses your OpenAI quota either way, once per article (cached after that). Until it's ready (or if
              AI isn't available or turned off in Settings), an instant, free offline word-for-word version from
              the local dictionary is shown instead, so there's never nothing to read. Tapping a single sentence
              is different: it opens "Ask AI to explain," a deeper one-sentence breakdown with grammar notes and
              vocabulary — reach for that when one line is confusing rather than the whole article.
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
      />
      <SentenceSheet
        state={activeSentence}
        articleTitle={text.title}
        onClose={() => setActiveSentence(null)}
      />
      <PhraseSheet
        state={activePhrase}
        articleTitle={text.title}
        onClose={() => setActivePhrase(null)}
        onSaved={() => showToast("Saved phrase")}
        onKnown={() => showToast("Marked phrase as known")}
      />
      <Toast message={toastMessage} />
    </div>
  );
}

function dedupeArticles(articles: ReadingText[]): ReadingText[] {
  const byId = new Map<string, ReadingText>();
  for (const article of articles) byId.set(article.id, article);
  return [...byId.values()];
}

function RelatedArticles({ articles }: { articles: ReadingText[] }) {
  return (
    <section className="border-t border-cream-dark pt-4">
      <div className="px-1">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Related Articles</h2>
        <p className="mt-0.5 text-xs text-ink-muted">
          Same story area, different source. Use these after the quiz to meet repeated vocabulary in a new register.
        </p>
      </div>
      <div className="mt-3 divide-y divide-cream-dark rounded-2xl border border-cream-dark bg-cream/60">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/reader/${article.id}`}
            className="block px-3 py-3 active:bg-cream-dark/60"
          >
            <p className="text-sm font-semibold leading-snug text-ink">{article.title}</p>
            <p className="mt-1 text-xs text-ink-muted">
              {article.sourceName ?? "Saved text"}
              {article.publishedAt ? ` - ${new Date(article.publishedAt).toLocaleDateString()}` : ""}
            </p>
            {article.blurbEn && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">{article.blurbEn}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

function ComprehensionQuestion({
  question,
  selected,
  onSelect,
}: {
  question: MultipleChoiceQuestion;
  selected: number | null;
  onSelect: (answerIndex: number) => void;
}) {
  const answered = selected !== null;
  const correct = answered && selected === question.answerIndex;
  return (
    <div className="rounded-3xl bg-cream-card p-4 shadow-sm">
      <p className="text-sm font-bold text-ink">{question.prompt}</p>
      <div className="mt-3 space-y-2">
        {question.choices.map((choice, index) => {
          const isSelected = selected === index;
          const isAnswer = answered && index === question.answerIndex;
          return (
            <button
              key={`${question.id}-${index}-${choice}`}
              type="button"
              onClick={() => onSelect(index)}
              className={`w-full rounded-2xl px-3 py-2 text-left text-sm font-medium active:scale-[0.99] ${
                isAnswer
                  ? "bg-emerald-100 text-emerald-800"
                  : isSelected
                    ? "bg-rose-100 text-rose-800"
                    : "bg-cream text-ink"
              }`}
            >
              {choice}
            </button>
          );
        })}
      </div>
      {answered && question.explanation && (
        <p className={`mt-2 text-xs font-semibold ${correct ? "text-emerald-700" : "text-rose-700"}`}>
          {correct ? "Correct." : "Not quite."} {question.explanation}
        </p>
      )}
    </div>
  );
}
