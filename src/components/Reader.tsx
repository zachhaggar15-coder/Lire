"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AppSettings, FontSize, ReadingText, SavedWord, TextStatus, WordStatus } from "@/types";
import { tokenize, tokenizeParagraphsToSentences, type SentenceGroup, type Token } from "@/lib/words";
import { deleteWord, getSavedWords, saveWord } from "@/lib/storage";
import { getSavedPhrases } from "@/lib/phrases";
import { lookupWord } from "@/lib/dictionary/lookup";
import { useGeneratedDictionary } from "@/lib/dictionary/useGeneratedDictionary";
import {
  cacheDictionarySentenceTranslations,
  buildComposedPhraseTranslationMatch,
  findContainingPhraseTranslationMatch,
  findPhraseTranslationMatch,
  translateSentencesWithDictionaryCache,
  type DictionaryArticleTranslationMode,
} from "@/lib/dictionary/articleTranslation";
import { getArticleTranslation } from "@/lib/ai/client";
import type { ArticleTranslationAlignmentSegment } from "@/lib/ai/types";
import { NOT_TRANSLATED_YET } from "@/lib/dictionary/constants";
import { buildContextualTranslation } from "@/lib/dictionary/contextualTranslation";
import { generateFallbackExample } from "@/lib/dictionary/exampleGenerator";
import {
  findNaturalTranslationForToken,
  isWordScopedAlignment,
  type ResolvedTranslationAlignment,
} from "@/lib/translationAlignment";
import { getKnownWords, markKnown } from "@/lib/knownWords";
import { getProgress, markCompleted, markOpened } from "@/lib/progress";
import { recordArchiveEntry } from "@/lib/archive";
import { defaultSpacedRepetitionFields } from "@/lib/spacedRepetition";
import { estimateDifficulty, type DifficultyEstimate } from "@/lib/difficulty";
import { recordArticleCompleted } from "@/lib/recommendation/interests";
import { DEFAULT_SETTINGS, getSettings } from "@/lib/settings";
import { getCustomTexts } from "@/lib/customTexts";
import { canSpeak, speakFrenchParagraphs, stopSpeaking } from "@/lib/speech";
import { getArticleFeedbackForText, saveArticleFeedback, type ArticleDifficultyFeedback } from "@/lib/articleFeedback";
import { getArticleSummary, saveArticleSummary } from "@/lib/articleSummaries";
import { findPronounReference } from "@/lib/pronounReferences";
import { getCachedRssTexts, getOfflineRssTexts } from "@/lib/rss/rssTextCache";
import { isLikelySourceBoilerplateToken } from "@/lib/rss/sourceNoise";
import { buildInferenceChallenge, shouldOfferInference } from "@/lib/inference";
import { rankLearningCandidates, selectInferenceWords, type LearningCandidate, type WordTapRecord } from "@/lib/learningCandidates";
import { getInferenceResult, getWordTapsForArticle, recordInferenceResult, recordWordTap } from "@/lib/wordLearning";
import { buildHeadlineComparison, countFrenchWords, isProperNounWord, type HeadlineComparison } from "@/lib/readingAnalytics";
import { recordSecondPass, recordTranslationBudgetResult, suggestedTranslationAllowance } from "@/lib/readingInsights";
import { formatCategory } from "@/lib/format";
import { trackEvent } from "@/lib/analytics/client";
import { createActiveTimeTracker, type ActiveTimeTracker } from "@/lib/analytics/session";
import { applyReadingSessionToState, isMeaningfulReadingSession } from "@/lib/validation/definitions";
import { getValidationState, saveValidationState, updateValidationState } from "@/lib/validation/state";
import { isStarterText } from "@/lib/publicDomainBank";
import {
  quickChallengeForArticle,
  recordGamifiedArticleCompletion,
  recordSecondPassXp,
  readingWordsFromText,
  translationBudgetForMode,
  type ArticleCompletionRecord,
  type TranslationChallengeMode,
} from "@/lib/gamification";
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
import { addLevelScore, levelPointsForCompletion, type LevelScoreChange } from "@/lib/levelScore";
import { getCurrentStreak, getStreakWeek, isActiveToday, type StreakDay } from "@/lib/habit";
import { getJourneyState, markJourneyStageSeen, type JourneyState } from "@/lib/journey/state";
import { JOURNEY_BANDS } from "@/lib/journey/ladder";
import LessonCompleteScreen, { type JourneyMoment, type LessonMiniReviewItem } from "@/components/LessonCompleteScreen";
import WordSheet, { type ActiveWordState } from "@/components/WordSheet";
import SentenceSheet, { type ActiveSentenceState } from "@/components/SentenceSheet";
import PhraseSheet, { type ActivePhraseState } from "@/components/PhraseSheet";
import Toast from "@/components/Toast";
import { CompletionSummary } from "@/components/GamificationCards";
import PostSessionResearchPrompt from "@/components/PostSessionResearchPrompt";
import { AndroidBetaButton } from "@/components/AndroidBetaModal";
import { FeedbackButton } from "@/components/FeedbackModal";

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  small: "text-base",
  medium: "text-[1.15rem]",
  large: "text-[1.35rem]",
};

type TranslationState = "idle" | "loading" | "ready";
/** How many paragraphs go in each translation request — small enough that the first chunk (typically what's on screen when the toggle is tapped) comes back in a couple of seconds instead of waiting for the whole article, large enough that each request still has some real context to work with. */
const PARAGRAPHS_PER_TRANSLATION_CHUNK = 2;

function buildWordStatusMap(words: SavedWord[]): Map<string, WordStatus> {
  const map = new Map<string, WordStatus>();
  for (const word of words) {
    map.set(word.word.toLowerCase(), word.status);
    if (word.lemma) map.set(word.lemma.toLowerCase(), word.status);
  }
  return map;
}

function lookupWordStatus(map: Map<string, WordStatus>, word: string, lemma: string | null | undefined): WordStatus | null {
  const wordKey = word.toLowerCase();
  const lemmaKey = lemma?.toLowerCase() ?? null;
  return map.get(wordKey) ?? (lemmaKey ? map.get(lemmaKey) ?? null : null);
}

function journeyMomentForCompletion(before: JourneyState | null, after: JourneyState | null, textId: string): JourneyMoment | null {
  if (!before || !after) return null;
  const beforeStage = before.stages.find((stage) => stage.stage.textIds.includes(textId));
  if (!beforeStage || beforeStage.status === "cleared") return null;
  const afterStage = after.stages.find((stage) => stage.stage.globalIndex === beforeStage.stage.globalIndex);
  if (!afterStage || afterStage.status !== "cleared") return null;

  const band = afterStage.stage.band;
  const bandClearedBefore = before.stages.filter((stage) => stage.stage.band === band).every((stage) => stage.status === "cleared");
  const bandClearedAfter = after.stages.filter((stage) => stage.stage.band === band).every((stage) => stage.status === "cleared");

  if (!bandClearedBefore && bandClearedAfter) {
    const nextBand = JOURNEY_BANDS[JOURNEY_BANDS.indexOf(band) + 1] ?? null;
    return {
      kind: "band",
      title: nextBand ? `${nextBand} path unlocked!` : `${band} path complete!`,
      detail: nextBand
        ? `${band} is clear. Your journey now continues into ${nextBand}.`
        : "You have cleared every guided stage available right now.",
      actionLabel: "Continue journey",
    };
  }

  return {
    kind: "stage",
    title: "Stage cleared!",
    detail: `${afterStage.stage.label} is clear. The next stage is open on your journey map.`,
    actionLabel: "Continue journey",
  };
}

export default function Reader({ text }: { text: ReadingText }) {
  const router = useRouter();
  const isImportedText = text.id.startsWith("custom-");
  const isStarterLesson = isStarterText(text);
  const showInterpretationChecks = !isImportedText && !isStarterLesson;
  const paragraphs = useMemo(() => tokenizeParagraphsToSentences(text.body), [text.body]);
  /** Instant, free, offline fallback, one per sentence. Defaults to phrase-aware, with literal still available from Settings. */
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  /**
   * Changes once the broad generated dictionary has loaded (it's fetched on
   * demand now rather than bundled into every page). Anything derived from
   * dictionary lookups — the difficulty estimate, the offline sentence
   * translations — is keyed on this so it recomputes with full coverage
   * instead of being stuck with whatever the curated layer alone produced.
   */
  const dictionaryRevision = useGeneratedDictionary();
  const offlineTranslationMode: DictionaryArticleTranslationMode = settings.translationMode === "literal" ? "literal" : "phrase-aware";
  const offlineSentences = useMemo(
    () => translateSentencesWithDictionaryCache(text.id, text.body, paragraphs, offlineTranslationMode),
    // dictionaryRevision: recompute once the broad dictionary finishes loading,
    // so the offline translation isn't left with curated-only coverage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [offlineTranslationMode, paragraphs, text.body, text.id, dictionaryRevision]
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

  /**
   * Returns to wherever the reader came from — the Articles or Live News list
   * they were browsing, most often — instead of always dumping them on the
   * dashboard and making them navigate back down. Falls back to the dashboard
   * for a cold entry (shared link, refresh) where there's no in-app history.
   */
  function handleBack() {
    const cameFromApp =
      typeof window !== "undefined" && window.history.length > 1 && document.referrer.startsWith(window.location.origin);
    if (cameFromApp) {
      router.back();
      return;
    }
    router.push("/");
  }

  function neighbours(sentenceText: string): { previous: string | null; next: string | null } {
    const i = flatSentences.indexOf(sentenceText);
    if (i === -1) return { previous: null, next: null };
    return { previous: i > 0 ? flatSentences[i - 1] : null, next: i < flatSentences.length - 1 ? flatSentences[i + 1] : null };
  }

  const [wordStatusMap, setWordStatusMap] = useState<Map<string, WordStatus>>(new Map());
  const [savedWordsSnapshot, setSavedWordsSnapshot] = useState<SavedWord[]>([]);
  const [knownSet, setKnownSet] = useState<Set<string>>(new Set());
  const [recentSavedWords, setRecentSavedWords] = useState<Set<string>>(new Set());
  const [recentKnownWords, setRecentKnownWords] = useState<Set<string>>(new Set());
  const [activeWord, setActiveWord] = useState<ActiveWordState | null>(null);
  const [activeSentence, setActiveSentence] = useState<ActiveSentenceState | null>(null);
  const [activePhrase, setActivePhrase] = useState<ActivePhraseState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<TextStatus>("unread");
  const [lessonStep, setLessonStep] = useState(0);
  const [difficulty, setDifficulty] = useState<DifficultyEstimate | null>(null);
  const [articleSavedWordCount, setArticleSavedWordCount] = useState(0);
  const [articleFeedback, setArticleFeedback] = useState<ArticleDifficultyFeedback | null>(null);
  const [articleTapRecords, setArticleTapRecords] = useState<WordTapRecord[]>([]);
  const [articlePool, setArticlePool] = useState<ReadingText[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<ReadingText[]>([]);
  const [gistAnswer, setGistAnswer] = useState<number | null>(null);
  const [toneAnswers, setToneAnswers] = useState<Record<string, number>>({});
  const [summaryDraft, setSummaryDraft] = useState("");
  const [showTranslateLaterNote, setShowTranslateLaterNote] = useState(false);
  const [showEnglishTranslation, setShowEnglishTranslation] = useState(false);
  const [translationUses, setTranslationUses] = useState(0);
  const [challengeMode, setChallengeMode] = useState<TranslationChallengeMode>("none");
  const [quickChallengeAnswer, setQuickChallengeAnswer] = useState<string | null>(null);
  const [inferenceStats, setInferenceStats] = useState({ attempted: 0, correct: 0 });
  const [completionResult, setCompletionResult] = useState<ArticleCompletionRecord | null>(null);
  /** When set, the full-screen "lesson complete" celebration is shown over the reader. */
  const [lessonComplete, setLessonComplete] = useState<{
    scoreChange: LevelScoreChange;
    percentRead: number;
    wordsTapped: number;
    savedWords: number;
    reviewItems: LessonMiniReviewItem[];
    streak: { count: number; extended: boolean; week: StreakDay[] };
    journeyMoment: JourneyMoment | null;
  } | null>(null);
  const [rereadMode, setRereadMode] = useState(false);
  const [secondPassStartedAt, setSecondPassStartedAt] = useState<string | null>(null);
  const [translationState, setTranslationState] = useState<TranslationState>("idle");
  /** null = translation hasn't started; otherwise one slot per flat sentence, filled in progressively chunk-by-chunk (still-null slots render the offline fallback). */
  const [fluentSentences, setFluentSentences] = useState<(string | null)[] | null>(null);
  /** Same shape as fluentSentences, but each slot contains natural French→English word/phrase alignment hints for interlinear rendering and word taps. */
  const [fluentAlignments, setFluentAlignments] = useState<(ArticleTranslationAlignmentSegment[] | null)[] | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [canUseSpeech, setCanUseSpeech] = useState(false);
  const [isSpeakingArticle, setIsSpeakingArticle] = useState(false);
  const [activeAudioParagraph, setActiveAudioParagraph] = useState<number | null>(null);
  const [scrollProgressPercent, setScrollProgressPercent] = useState(0);
  /** False when the whole article already fits on screen — a scroll percentage would be noise. */
  const [showProgressBadge, setShowProgressBadge] = useState(false);
  const articleRef = useRef<HTMLElement | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rewardTimeouts = useRef<number[]>([]);
  const sentenceHoldTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentenceHoldTriggered = useRef(false);
  const phraseHoldTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phraseHoldTriggered = useRef(false);
  /** Latest summary text plus the article it belongs to, for the debounced/flush writes below. */
  const latestSummary = useRef<{ articleId: string; draft: string }>({ articleId: text.id, draft: "" });
  const readingStartedAt = useRef<string>(new Date().toISOString());
  const activeTimeTracker = useRef<ActiveTimeTracker | null>(null);
  const maxProgressPercent = useRef(0);
  const progressMilestones = useRef<Set<number>>(new Set());
  const completedRef = useRef(false);
  const finalizedSessionRef = useRef(false);
  const learningActionCount = useRef(0);
  const wordLookupCount = useRef(0);
  const wordsSavedThisSession = useRef(0);
  const phraseInteractionCount = useRef(0);
  const sentenceInteractionCount = useRef(0);
  const aiUsedThisSession = useRef(false);
  const speechUsedThisSession = useRef(false);
  const comprehensionStarted = useRef(false);
  const comprehensionCompleted = useRef(false);
  const [comprehensionQuestions, setComprehensionQuestions] = useState<ComprehensionQuestionBundle>(() =>
    buildComprehensionQuestionBundle(text, [])
  );
  const gistQuestion = comprehensionQuestions.gistQuestion;
  const toneQuestions = comprehensionQuestions.toneQuestions;
  const inferenceWords = useMemo(() => selectInferenceWords(text, knownSet, 2), [knownSet, text]);
  const learningCandidates = useMemo(
    () => rankLearningCandidates(text, knownSet, savedWordsSnapshot, articleTapRecords, 6),
    [articleTapRecords, knownSet, savedWordsSnapshot, text]
  );
  const activeInference = useMemo(() => {
    if (isStarterLesson) return null;
    if (!activeWord || !shouldOfferInference(activeWord.word, inferenceWords)) return null;
    if (getInferenceResult(text.id, activeWord.word)) return null;
    const sentenceIndex = flatSentences.indexOf(activeWord.contextSentence);
    const sentenceTranslation =
      sentenceIndex === -1
        ? activeWord.contextSentence
        : fluentSentences?.[sentenceIndex] ?? offlineSentences[sentenceIndex] ?? activeWord.contextSentence;
    return buildInferenceChallenge(activeWord.word, activeWord.lookup, activeWord.contextSentence, sentenceTranslation);
  }, [activeWord, flatSentences, fluentSentences, inferenceWords, isStarterLesson, offlineSentences, text.id]);
  const translationAllowance = useMemo(
    () => suggestedTranslationAllowance(difficulty?.unknownWordRatio),
    [difficulty?.unknownWordRatio]
  );
  const articleWordCount = useMemo(() => readingWordsFromText(text), [text]);
  const challengeBudget = useMemo(
    () => translationBudgetForMode(challengeMode, articleWordCount, difficulty?.unknownWordRatio),
    [articleWordCount, challengeMode, difficulty?.unknownWordRatio]
  );
  const displayTranslationBudget = challengeBudget ?? translationAllowance;
  const quickChallenge = useMemo(() => quickChallengeForArticle(text), [text]);
  const headlineComparison = useMemo(
    () => (showInterpretationChecks ? buildHeadlineComparison(text, articlePool) : null),
    [articlePool, showInterpretationChecks, text]
  );
  const isChunkedStarterLesson = isStarterLesson && !rereadMode && status !== "completed";
  const visibleParagraphEntries = useMemo(
    () =>
      isChunkedStarterLesson
        ? [{ sentences: paragraphs[Math.min(lessonStep, Math.max(0, paragraphs.length - 1))] ?? [], paragraphIndex: Math.min(lessonStep, Math.max(0, paragraphs.length - 1)) }]
        : paragraphs.map((sentences, paragraphIndex) => ({ sentences, paragraphIndex })),
    [isChunkedStarterLesson, lessonStep, paragraphs]
  );
  const lessonStepCount = Math.max(1, paragraphs.length);
  const currentLessonStep = Math.min(lessonStep + 1, lessonStepCount);
  const isLastLessonStep = currentLessonStep >= lessonStepCount;
  const lessonProgress = isChunkedStarterLesson ? Math.round((currentLessonStep / lessonStepCount) * 100) : 100;

  /**
   * The first difficulty estimate may have run against curated-only coverage,
   * which overstates how many words are unfamiliar. Redo it once the broad
   * dictionary lands.
   */
  useEffect(() => {
    if (dictionaryRevision === 0 || text.language === "en") return;
    setDifficulty(estimateDifficulty(text.body, new Set(getKnownWords())));
  }, [dictionaryRevision, text.body, text.language]);

  useEffect(() => {
    cacheDictionarySentenceTranslations(text.id, text.body, offlineSentences, offlineTranslationMode);
  }, [offlineSentences, offlineTranslationMode, text.body, text.id]);

  /**
   * Persist the summary shortly after typing stops. Debounced so a long
   * summary doesn't re-serialise the whole stored list on every keystroke.
   */
  useEffect(() => {
    latestSummary.current = { articleId: text.id, draft: summaryDraft };
    const handle = setTimeout(() => saveArticleSummary(text.id, summaryDraft), 600);
    return () => clearTimeout(handle);
  }, [summaryDraft, text.id]);

  /**
   * Flush on close/article change, so the last keystrokes inside the debounce
   * window survive navigating away. Guarded on article id so a pending draft
   * is never written against the wrong article.
   */
  useEffect(() => {
    const articleId = text.id;
    return () => {
      if (latestSummary.current.articleId !== articleId) return;
      saveArticleSummary(articleId, latestSummary.current.draft);
    };
  }, [text.id]);

  useEffect(() => {
    const startedAt = new Date().toISOString();
    readingStartedAt.current = startedAt;
    activeTimeTracker.current = createActiveTimeTracker();
    maxProgressPercent.current = 0;
    progressMilestones.current = new Set();
    setScrollProgressPercent(0);
    completedRef.current = false;
    finalizedSessionRef.current = false;
    learningActionCount.current = 0;
    wordLookupCount.current = 0;
    wordsSavedThisSession.current = 0;
    phraseInteractionCount.current = 0;
    sentenceInteractionCount.current = 0;
    aiUsedThisSession.current = false;
    speechUsedThisSession.current = false;
    comprehensionStarted.current = false;
    comprehensionCompleted.current = false;

    updateValidationState((state) => ({
      ...state,
      firstArticleOpenedAt: state.firstArticleOpenedAt ?? startedAt,
    }));
    trackEvent("article_opened", {
      articleId: text.id,
      articleCategory: text.category,
      articleDifficulty: text.difficulty,
      estimatedReadingTime: text.minutes,
      articleSourceType: text.sourceName ? "rss" : text.id.startsWith("pd-") ? "public_domain" : text.id.startsWith("custom-") ? "custom" : "built_in",
    });
    trackEvent("reading_session_started", { articleId: text.id });

    function markInteraction() {
      activeTimeTracker.current?.markInteraction();
    }
    function handleVisibility() {
      activeTimeTracker.current?.markVisible(document.visibilityState === "visible");
    }
    /**
     * Progress through the article, as a fraction of the scrolling needed to
     * bring its last line into view.
     *
     * The previous version measured a "read line" 75% down the viewport
     * against the top of the article, which reported a large number before
     * the reader had moved at all — a short article opened at "72% read".
     * Measuring actual scrolled distance instead starts every article at 0%
     * and reaches 100% exactly when the end is on screen.
     */
    function articleScrollPercent(): number {
      const article = articleRef.current;
      if (article) {
        const articleTop = article.getBoundingClientRect().top + window.scrollY;
        const articleBottom = articleTop + Math.max(1, article.scrollHeight);
        const scrollNeeded = articleBottom - window.innerHeight;
        // The whole article already fits on screen: there's no scrolling to
        // measure, so treat it as fully in view rather than inventing a number.
        if (scrollNeeded <= 0) return 100;
        return Math.max(0, Math.min(100, Math.round((window.scrollY / scrollNeeded) * 100)));
      }
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      return Math.max(0, Math.min(100, Math.round((window.scrollY / maxScroll) * 100)));
    }
    function updateScrollProgress(markAsInteraction: boolean) {
      if (markAsInteraction) markInteraction();
      const article = articleRef.current;
      // A "% read" badge only says anything when there's something to scroll.
      setShowProgressBadge(
        !article || article.getBoundingClientRect().top + window.scrollY + article.scrollHeight - window.innerHeight > 0
      );
      const percent = articleScrollPercent();
      setScrollProgressPercent(percent);
      maxProgressPercent.current = Math.max(maxProgressPercent.current, percent);
      for (const milestone of [25, 50, 75]) {
        if (percent >= milestone && !progressMilestones.current.has(milestone)) {
          progressMilestones.current.add(milestone);
          trackEvent(`reading_progress_${milestone}` as "reading_progress_25" | "reading_progress_50" | "reading_progress_75", {
            articleId: text.id,
            percentageRead: milestone,
          });
        }
      }
    }
    function handleScroll() {
      updateScrollProgress(true);
    }
    function handleResize() {
      updateScrollProgress(false);
    }

    window.addEventListener("pointerdown", markInteraction, { passive: true });
    window.addEventListener("keydown", markInteraction);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);
    handleResize();

    return () => {
      window.removeEventListener("pointerdown", markInteraction);
      window.removeEventListener("keydown", markInteraction);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (!completedRef.current) finalizeReadingSession(false);
    };
    // This effect intentionally represents one reader session per article id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text.id]);

  useEffect(() => {
    if (!showInterpretationChecks) return;
    setComprehensionQuestions(getOrCreateComprehensionQuestionBundle(text, articlePool));
  }, [articlePool, showInterpretationChecks, text]);

  // Load saved words + known words + settings + progress once on mount,
  // and record that this text has been opened.
  useEffect(() => {
    const known = new Set(getKnownWords());
    const savedWords = getSavedWords();
    setWordStatusMap(buildWordStatusMap(savedWords));
    setSavedWordsSnapshot(savedWords);
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
    setArticleTapRecords(getWordTapsForArticle(text.id).map((tap) => ({ word: tap.word, lemma: tap.lemma, count: tap.count })));
    setLessonStep(0);
    // Start with what's already local (imported + RSS), so related articles
    // and the headline comparison can render immediately. The bundled text
    // library is ~1.3 MB and is only needed to widen that pool, so it's
    // fetched separately rather than loaded before the article can be read.
    const localCandidates = dedupeArticles([...getCustomTexts(), ...getCachedRssTexts(), ...getOfflineRssTexts()]);
    setArticlePool(localCandidates);
    setRelatedArticles(buildRelatedArticles(text, localCandidates));
    void import("@/data/texts").then(({ texts: builtInTexts }) => {
      const widened = dedupeArticles([...localCandidates, ...builtInTexts]);
      setArticlePool(widened);
      setRelatedArticles(buildRelatedArticles(text, widened));
    });
    setGistAnswer(null);
    setToneAnswers({});
    // Restore any summary written for this article on an earlier visit, so a
    // second pass builds on the first rather than starting from a blank box.
    setSummaryDraft(getArticleSummary(text.id));
    setCanUseSpeech(canSpeak());
    // A different article needs its own fluent translation — getArticleTranslation
    // is cache-first per article, so re-toggling back on for an already-translated
    // article is instant again; only a genuinely new article re-fetches.
    setShowEnglishTranslation(false);
    setTranslationUses(0);
    setChallengeMode("none");
    setQuickChallengeAnswer(null);
    setInferenceStats({ attempted: 0, correct: 0 });
    setCompletionResult(null);
    setRereadMode(false);
    setSecondPassStartedAt(null);
    setTranslationState("idle");
    setFluentSentences(null);
    setFluentAlignments(null);
    setTranslationError(null);
    setActiveAudioParagraph(null);

    // Pre-warm the fluent translation in the background as soon as the
    // article opens, rather than waiting for the reader to tap "Show
    // English" — so it's already sitting in cache by the time they check
    // it. This doesn't reveal the translation UI (showEnglishTranslation
    // stays false); it just fills fluentSentences ahead of time. Opt-in via
    // the same aiTranslationEnabled setting the toggle itself respects — a
    // reader who's turned AI translation off should use the free offline
    // translation path and avoid OpenAI calls from both prewarm and toggle.
    if (loadedSettings.translationMode === "natural" && loadedSettings.aiTranslationEnabled) {
      void handleFetchFluentTranslation();
    }

    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      rewardTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      rewardTimeouts.current = [];
      if (sentenceHoldTimeout.current) clearTimeout(sentenceHoldTimeout.current);
      if (phraseHoldTimeout.current) clearTimeout(phraseHoldTimeout.current);
      // Never let audio keep playing after navigating away from the article.
      stopSpeaking();
      setIsSpeakingArticle(false);
      setActiveAudioParagraph(null);
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
      setActiveAudioParagraph(null);
      return;
    }
    const started = speakFrenchParagraphs([text.title, ...paragraphTexts], "normal", () => {
      setIsSpeakingArticle(false);
      setActiveAudioParagraph(null);
    });
    if (started) {
      setIsSpeakingArticle(true);
      setActiveAudioParagraph(null);
      speechUsedThisSession.current = true;
      recordLearningAction();
      trackEvent("speech_playback_used", { articleId: text.id, scope: "article" });
    }
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
    setFluentAlignments(new Array<ArticleTranslationAlignmentSegment[] | null>(flatSentences.length).fill(null));

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
        setFluentAlignments((prev) => {
          const next = prev ? [...prev] : new Array<ArticleTranslationAlignmentSegment[] | null>(flatSentences.length).fill(null);
          result.data.alignments?.forEach((segments, i) => {
            next[chunk.globalStartIndex + i] = segments;
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
    if (rereadMode) return;
    const next = !showEnglishTranslation;
    setShowEnglishTranslation(next);
    if (next) setTranslationUses((count) => Math.max(count, displayTranslationBudget + 1));
    if (next && translationState === "idle" && shouldUseFluentTranslation()) void handleFetchFluentTranslation();
  }

  function handlePlayParagraph(paragraph: string, paragraphIndex: number) {
    if (!canUseSpeech) return;
    if (activeAudioParagraph === paragraphIndex) {
      stopSpeaking();
      setActiveAudioParagraph(null);
      setIsSpeakingArticle(false);
      return;
    }
    const started = speakFrenchParagraphs([paragraph], "normal", () => {
      setActiveAudioParagraph((current) => (current === paragraphIndex ? null : current));
    });
    if (!started) return;
    setIsSpeakingArticle(false);
    setActiveAudioParagraph(paragraphIndex);
    speechUsedThisSession.current = true;
    recordLearningAction();
    trackEvent("speech_playback_used", { articleId: text.id, scope: "paragraph" });
  }

  function shouldUseFluentTranslation(): boolean {
    return settings.translationMode === "natural" && settings.aiTranslationEnabled;
  }

  function translationModeLabel(): string {
    if (settings.translationMode === "literal") return "Literal";
    if (settings.translationMode === "phrase-aware") return "Phrase-aware";
    return settings.aiTranslationEnabled ? "Natural" : "Phrase-aware";
  }

  function sentenceTranslationForDisplay(flatIndex: number): string | null {
    // Every French line always gets an English line directly beneath it. The
    // fluent AI translation streams in chunk by chunk, top to bottom; until a
    // given line's chunk resolves, we show the instant offline dictionary
    // translation, and each line upgrades to the fluent version in place as it
    // arrives. Without this fallback during loading, lower paragraphs briefly
    // showed French with no English, then a whole chunk's worth of English
    // appeared at once — which reads as "a paragraph, then the translation"
    // rather than line-by-line.
    return fluentSentences?.[flatIndex] ?? offlineSentences[flatIndex] ?? null;
  }

  function showToast(message: string) {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToastMessage(message);
    toastTimeout.current = setTimeout(() => setToastMessage(null), 1400);
  }

  function recordLearningAction() {
    activeTimeTracker.current?.markInteraction();
    learningActionCount.current += 1;
  }

  function rememberWordSaved(source: "tap_lookup" | "candidate") {
    const savedAt = new Date().toISOString();
    wordsSavedThisSession.current += 1;
    updateValidationState((state) => ({
      ...state,
      firstWordSavedAt: state.firstWordSavedAt ?? savedAt,
      totalWordsSaved: state.totalWordsSaved + 1,
    }));
    trackEvent("word_saved", { articleId: text.id, source });
  }

  function pulseRewardWords(kind: "saved" | "known", values: Array<string | null | undefined>) {
    const keys = values.map((value) => value?.toLowerCase()).filter((value): value is string => !!value);
    if (keys.length === 0) return;
    const setter = kind === "saved" ? setRecentSavedWords : setRecentKnownWords;
    setter((prev) => {
      const next = new Set(prev);
      keys.forEach((key) => next.add(key));
      return next;
    });
    const timeout = window.setTimeout(() => {
      setter((prev) => {
        const next = new Set(prev);
        keys.forEach((key) => next.delete(key));
        return next;
      });
    }, kind === "saved" ? 1500 : 1700);
    rewardTimeouts.current.push(timeout);
  }

  function markAiSupportUsed(kind: "word" | "sentence" | "phrase") {
    aiUsedThisSession.current = true;
    recordLearningAction();
    trackEvent(kind === "sentence" ? "ai_sentence_explanation_requested" : "ai_word_explanation_requested", {
      articleId: text.id,
      surface: kind,
    });
  }

  function recordComprehensionInteraction() {
    if (!showInterpretationChecks) return;
    if (!comprehensionStarted.current) {
      comprehensionStarted.current = true;
      trackEvent("comprehension_started", { articleId: text.id });
    }
    recordLearningAction();
  }

  function maybeMarkComprehensionCompleted(nextGistAnswer: number | null, nextToneAnswers: Record<string, number>) {
    if (!showInterpretationChecks) return;
    if (comprehensionCompleted.current) return;
    const completed = nextGistAnswer !== null && toneQuestions.every((question) => nextToneAnswers[question.id] !== undefined);
    if (!completed) return;
    comprehensionCompleted.current = true;
    trackEvent("comprehension_completed", {
      articleId: text.id,
      questionCount: toneQuestions.length + 1,
    });
  }

  function finalizeReadingSession(completed: boolean, completedAt = new Date().toISOString()) {
    if (finalizedSessionRef.current) return;
    finalizedSessionRef.current = true;
    const activeMs = activeTimeTracker.current?.activeMs() ?? 0;
    const durationMs = Math.max(0, new Date(completedAt).getTime() - new Date(readingStartedAt.current).getTime());
    const signals = {
      activeMs,
      maxProgressPercent: maxProgressPercent.current,
      completed,
      learningActions: learningActionCount.current,
    };
    const meaningful = isMeaningfulReadingSession(signals);

    if (!completed && !meaningful) {
      trackEvent("reading_session_abandoned", {
        articleId: text.id,
        activeMs,
        durationMs,
        maxProgressPercent: maxProgressPercent.current,
        learningActions: learningActionCount.current,
      });
      return;
    }

    const result = applyReadingSessionToState({
      state: getValidationState(),
      completedAt,
      signals,
    });
    saveValidationState(result.state);

    if (result.meaningful) {
      trackEvent("meaningful_reading_session_completed", {
        articleId: text.id,
        activeMs,
        durationMs,
        maxProgressPercent: maxProgressPercent.current,
        learningActions: learningActionCount.current,
        wordLookups: wordLookupCount.current,
        wordsSaved: wordsSavedThisSession.current,
        phraseInteractions: phraseInteractionCount.current,
        sentenceInteractions: sentenceInteractionCount.current,
        aiUsed: aiUsedThisSession.current,
        speechUsed: speechUsedThisSession.current,
      });
    }
    if (result.state.meaningfulSessionCount === 3) trackEvent("third_reading_session_completed", {});
    if (result.activatedNow) trackEvent("user_activated", {});
    if (result.strongNow) trackEvent("user_strongly_activated", {});
    if (result.habitNow) trackEvent("habit_forming_usage_reached", {});
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

  function naturalTranslationForWordTap(sentenceText: string, tokens: Token[], index: number): ResolvedTranslationAlignment | null {
    const sentenceIndex = flatSentences.indexOf(sentenceText);
    if (sentenceIndex === -1) return null;
    return findNaturalTranslationForToken(tokens, index, fluentAlignments?.[sentenceIndex]);
  }

  function statusForWord(clean: string, lemma: string | null | undefined): WordStatus | null {
    const lemmaKey = lemma?.toLowerCase() ?? null;
    const known = knownSet.has(clean) || (!!lemmaKey && knownSet.has(lemmaKey));
    if (known) return "known";
    return lookupWordStatus(wordStatusMap, clean, lemmaKey);
  }

  function handleWordTap(sentenceText: string, tokens: Token[], index: number) {
    if (rereadMode) return;
    const clean = tokens[index]?.clean;
    if (!clean) return;

    const adjacent = adjacentWords(tokens, index);
    const lookup = lookupWord(tokens[index].text, adjacent);
    const sourceBoilerplateToken =
      lookup.source === "missing" &&
      isLikelySourceBoilerplateToken({
        word: clean,
        contextSentence: sentenceText,
        sourceName: text.sourceName,
        sourceUrl: text.sourceUrl,
      });
    if (sourceBoilerplateToken) {
      setActiveSentence(null);
      setActivePhrase(null);
      setActiveWord(null);
      return;
    }
    const lemma = lookup.lemma?.toLowerCase();
    const existingStatus = statusForWord(clean, lemma);
    const { previous, next } = neighbours(sentenceText);
    const contextualTranslation = buildContextualTranslation({
      tokens,
      tokenIndex: index,
      contextSentence: sentenceText,
      previousSentence: previous,
      nextSentence: next,
      lookup,
    });
    const naturalTranslation = naturalTranslationForWordTap(sentenceText, tokens, index);
    const pronounReference = findPronounReference(
      clean,
      tokens,
      index,
      previous ? tokenize(previous) : null
    );
    const updatedTaps = recordWordTap(text.id, clean, lookup.lemma);
    setArticleTapRecords(updatedTaps.filter((tap) => tap.articleId === text.id).map((tap) => ({ word: tap.word, lemma: tap.lemma, count: tap.count })));
    setTranslationUses((count) => count + 1);
    recordLearningAction();
    wordLookupCount.current += 1;
    trackEvent("word_lookup_opened", {
      articleId: text.id,
      knownBeforeTap: existingStatus === "known",
      dictionarySource: lookup.source,
    });

    setActiveSentence(null);
    setActivePhrase(null);
    setActiveWord({
      word: clean,
      contextSentence: sentenceText,
      surroundingSentence: previous,
      lookup,
      contextualTranslation,
      naturalTranslation,
      existingStatus,
      pronounReference,
    });
  }

  /**
   * Adds the currently-open word to the review deck. Deliberately separate
   * from handleWordTap: a tap is a lookup, not a commitment to study the
   * word. Auto-saving on every tap meant a reader who was merely curious
   * ended up with a review queue full of words they never chose.
   */
  function handleSaveActiveWord() {
    if (!activeWord || activeWord.existingStatus) return;
    // Names and places aren't vocabulary worth reviewing. This guard used to
    // sit on the auto-save in handleWordTap; it belongs wherever the save is.
    if (isProperNounWord(activeWord.word)) {
      showToast("Names aren't added to review");
      return;
    }
    // Only a tight, word-scoped alignment can stand in as this word's
    // meaning. A clause-sized span is fine to read alongside the French, but
    // saving it would make the flashcard say "mouillé = Was a ship moored in
    // some inland port" — see isWordScopedAlignment.
    const naturalTranslation = isWordScopedAlignment(activeWord.naturalTranslation)
      ? activeWord.naturalTranslation!.english
      : null;
    const { words: nextWords, persisted } = saveWord(
      buildSavedWord(activeWord.word, activeWord.lookup, activeWord.contextSentence, "learning", naturalTranslation)
    );
    if (!persisted) {
      showToast("Couldn't save — device storage is full");
      return;
    }
    recordLearningAction();
    const nextStatusMap = buildWordStatusMap(nextWords);
    setWordStatusMap(nextStatusMap);
    setSavedWordsSnapshot(nextWords);
    setArticleSavedWordCount(nextWords.filter((saved) => saved.sourceTextTitle === text.title && saved.status !== "known").length);
    rememberWordSaved("tap_lookup");
    pulseRewardWords("saved", [activeWord.word, activeWord.lookup.lemma]);
    setActiveWord((prev) =>
      prev
        ? {
            ...prev,
            existingStatus: lookupWordStatus(nextStatusMap, prev.word, prev.lookup.lemma) ?? "learning",
          }
        : prev
    );
    showToast("Saved");
  }

  function handleSentenceTap(sentenceText: string) {
    if (rereadMode) return;
    const { previous, next } = neighbours(sentenceText);
    recordLearningAction();
    sentenceInteractionCount.current += 1;
    trackEvent("sentence_support_opened", { articleId: text.id });
    setActiveWord(null);
    setActivePhrase(null);
    setActiveSentence({ sentence: sentenceText, previousSentence: previous, nextSentence: next });
  }

  function handlePhraseTap(sentenceText: string, phrase: ActivePhraseState) {
    if (rereadMode) return;
    recordLearningAction();
    phraseInteractionCount.current += 1;
    trackEvent("phrase_support_opened", { articleId: text.id, source: phrase.source ?? "unknown" });
    setActiveWord(null);
    setActiveSentence(null);
    setActivePhrase({ ...phrase, contextSentence: sentenceText });
  }

  function handlePhraseHold(sentenceText: string, tokens: Token[], tokenIndex: number) {
    if (rereadMode) return;
    const phrase = findContainingPhraseTranslationMatch(tokens, tokenIndex) ?? buildComposedPhraseTranslationMatch(tokens, tokenIndex);
    if (!phrase) {
      showToast("No phrase found here");
      return;
    }
    handlePhraseTap(sentenceText, {
      phrase: phrase.phrase,
      lemma: phrase.lemma,
      translation: phrase.translation,
      partOfSpeech: phrase.partOfSpeech,
      contextSentence: sentenceText,
      source: phrase.source,
    });
  }

  function handleKnow() {
    if (!activeWord) return;
    const lemma = activeWord.lookup.lemma;
    recordLearningAction();
    trackEvent("word_marked_known", { articleId: text.id });
    markKnown(activeWord.word);
    if (lemma) markKnown(lemma);
    const nextWords = deleteWord(activeWord.word);
    setSavedWordsSnapshot(nextWords);
    setKnownSet((prev) => {
      const next = new Set(prev);
      next.add(activeWord.word);
      if (lemma) next.add(lemma.toLowerCase());
      return next;
    });
    setWordStatusMap(buildWordStatusMap(nextWords));
    setArticleSavedWordCount(nextWords.filter((saved) => saved.sourceTextTitle === text.title && saved.status !== "known").length);
    pulseRewardWords("known", [activeWord.word, lemma]);
    setActiveWord(null);
    showToast("Marked as known");
  }

  function buildLessonMiniReviewItems(): LessonMiniReviewItem[] {
    const items: LessonMiniReviewItem[] = [];
    const seen = new Set<string>();
    const add = (item: LessonMiniReviewItem) => {
      const key = `${item.kind}:${item.french.toLowerCase()}`;
      if (seen.has(key) || items.length >= 5) return;
      seen.add(key);
      items.push(item);
    };

    getSavedPhrases()
      .filter((phrase) => phrase.sourceTextTitle === text.title && phrase.status !== "known")
      .slice(0, 2)
      .forEach((phrase) =>
        add({
          kind: "phrase",
          french: phrase.phrase,
          english: phrase.translation,
          context: phrase.contextSentence || null,
        })
      );

    getSavedWords()
      .filter((word) => word.sourceTextTitle === text.title && word.status !== "known")
      .slice(0, 5)
      .forEach((word) =>
        add({
          kind: "word",
          french: word.lemma ?? word.word,
          english: word.primaryTranslation,
          context: word.articleContextSentence || null,
        })
      );

    getWordTapsForArticle(text.id)
      .filter((tap) => !isProperNounWord(tap.word))
      .sort((a, b) => b.count - a.count)
      .forEach((tap) => {
        if (items.length >= 5) return;
        const lookup = lookupWord(tap.word);
        const english = lookup.translations[0];
        if (!english) return;
        add({
          kind: "word",
          french: lookup.lemma ?? tap.lemma ?? tap.word,
          english,
          context: null,
        });
      });

    return items.slice(0, 5);
  }

  function startSentenceHold(sentenceText: string) {
    sentenceHoldTriggered.current = false;
    if (sentenceHoldTimeout.current) clearTimeout(sentenceHoldTimeout.current);
    sentenceHoldTimeout.current = setTimeout(() => {
      sentenceHoldTriggered.current = true;
      handleSentenceTap(sentenceText);
    }, 550);
  }

  function cancelSentenceHold() {
    if (sentenceHoldTimeout.current) clearTimeout(sentenceHoldTimeout.current);
  }

  function startPhraseHold(sentenceText: string, tokens: Token[], tokenIndex: number) {
    phraseHoldTriggered.current = false;
    if (phraseHoldTimeout.current) clearTimeout(phraseHoldTimeout.current);
    phraseHoldTimeout.current = setTimeout(() => {
      phraseHoldTriggered.current = true;
      handlePhraseHold(sentenceText, tokens, tokenIndex);
    }, 450);
  }

  function cancelPhraseHold() {
    if (phraseHoldTimeout.current) clearTimeout(phraseHoldTimeout.current);
  }

  function buildSavedWord(
    word: string,
    lookup: ActiveWordState["lookup"],
    contextSentence: string,
    wordStatus: Exclude<WordStatus, "known">,
    naturalTranslation: string | null = null
  ): SavedWord {
    const missing = lookup.source === "missing";
    const firstExample = lookup.examples[0];
    const translations = [
      ...(naturalTranslation?.trim() ? [naturalTranslation.trim()] : []),
      ...lookup.translations,
    ].filter((translation, index, values) => translation && values.indexOf(translation) === index);
    // Deliberately the dictionary's own glosses rather than `translations`,
    // which leads with the article-specific natural translation. The fallback
    // example slots a gloss into a generic frame ("C'est très X." / "It's very
    // X."), so a context-fitted phrase produces nonsense — "mouillé" aligned
    // as "was anchored" rendered "It's very was anchored." The dictionary
    // entry is the one that matches the frame's part of speech.
    // A guessed lemma may belong to a different word class than the form the
    // reader tapped, so don't let it pick the example frame or get stored as
    // this word's part of speech.
    const reliablePartOfSpeech = lookup.partOfSpeechUncertain ? null : lookup.partOfSpeech;
    const fallbackExample = generateFallbackExample({
      word,
      lemma: lookup.lemma,
      partOfSpeech: reliablePartOfSpeech,
      gender: lookup.gender,
      translations: lookup.translations.length > 0 ? lookup.translations : translations,
    });
    const entry: SavedWord = {
      word,
      lemma: lookup.lemma,
      translations,
      primaryTranslation: translations[0] ?? (missing ? NOT_TRANSLATED_YET : lookup.translations[0] ?? NOT_TRANSLATED_YET),
      partOfSpeech: reliablePartOfSpeech,
      gender: lookup.gender,
      cefr: lookup.cefr,
      frequencyRank: lookup.frequencyRank,
      articleContextSentence: contextSentence,
      exampleSentenceFr: firstExample?.fr ?? contextSentence,
      exampleSentenceEn: firstExample?.en ?? (naturalTranslation ?? translations[0] ?? fallbackExample.en),
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
    const wasAlreadyCompleted = status === "completed";
    const comprehensionItems = showInterpretationChecks
      ? [
          gistAnswer === null || !gistQuestion ? null : gistAnswer === gistQuestion.answerIndex,
          ...toneQuestions.map((question) => (toneAnswers[question.id] == null ? null : toneAnswers[question.id] === question.answerIndex)),
        ].filter((value): value is boolean => value !== null)
      : [];
    const comprehensionCorrect = comprehensionItems.filter(Boolean).length;
    const phraseCount = getSavedPhrases().filter((phrase) => phrase.sourceTextTitle === text.title).length;
    // Capture whether today already counted before markCompleted records
    // activity, so the completion screen knows if *this* finish extended the
    // streak (a celebration) versus just kept an already-earned day.
    const streakExtendedByThis = !isActiveToday();
    const journeyBefore = isStarterLesson && !wasAlreadyCompleted ? getJourneyState() : null;
    markCompleted(text.id);
    const journeyAfter = journeyBefore ? getJourneyState() : null;
    const journeyMoment = journeyMomentForCompletion(journeyBefore, journeyAfter, text.id);
    if (journeyAfter) markJourneyStageSeen(journeyAfter.currentStageIndex);
    recordTranslationBudgetResult({
      articleId: text.id,
      articleTitle: text.title,
      allowance: displayTranslationBudget,
      used: translationUses,
      metTarget: translationUses <= displayTranslationBudget,
      completedAt,
    });
    recordArchiveEntry({
      textId: text.id,
      title: text.title,
      sourceName: text.sourceName ?? null,
      completedAt,
      category: text.category,
      cefr: difficulty?.cefr ?? text.difficulty,
      minutes: text.minutes,
      wordCount: countFrenchWords(text),
      openedAt: getProgress(text.id).openedAt,
    });
    // Feeds the automatically-learned interest profile behind the home
    // page's recommendations — see src/lib/recommendation/interests.ts.
    recordArticleCompleted(text.category);
    if (!wasAlreadyCompleted) {
      updateValidationState((state) => ({
        ...state,
        completedArticleCount: state.completedArticleCount + 1,
        firstArticleCompletedAt: state.firstArticleCompletedAt ?? completedAt,
      }));
    }
    completedRef.current = true;
    trackEvent("article_completed", {
      articleId: text.id,
      activeMs: activeTimeTracker.current?.activeMs() ?? 0,
      maxProgressPercent: maxProgressPercent.current,
      wordLookups: wordLookupCount.current,
      wordsSaved: wordsSavedThisSession.current,
      phraseInteractions: phraseInteractionCount.current,
      sentenceInteractions: sentenceInteractionCount.current,
      learningActions: learningActionCount.current,
      aiUsed: aiUsedThisSession.current,
      speechUsed: speechUsedThisSession.current,
      comprehensionCorrect,
      comprehensionTotal: comprehensionItems.length,
    });
    finalizeReadingSession(true, completedAt);
    const result = recordGamifiedArticleCompletion({
      text,
      difficulty: difficulty?.cefr ?? text.difficulty,
      openedAt: getProgress(text.id).openedAt,
      completedAt,
      wordsRead: countFrenchWords(text),
      translationsUsed: translationUses,
      fullTranslationUsed: showEnglishTranslation,
      savedWords: articleSavedWordCount,
      phrasesSaved: phraseCount,
      comprehensionCorrect,
      comprehensionTotal: comprehensionItems.length,
      inferenceCorrect: inferenceStats.correct,
      inferenceAttempts: inferenceStats.attempted,
      summaryCompleted: showInterpretationChecks && summaryDraft.trim().length >= 20,
      challengeMode,
      challengeBudget,
    });
    setCompletionResult(result);
    setStatus("completed");

    // Per-level score + the full-screen celebration. The score is tied to the
    // text's stored level (the one on the card and the filter), so "B1 score"
    // means the B1 track. Re-reads award nothing (levelPointsForCompletion).
    const wordsTapped = getWordTapsForArticle(text.id).length;
    const points = levelPointsForCompletion({
      savedWords: articleSavedWordCount,
      wordsTapped,
      comprehensionCorrect,
      comprehensionTotal: comprehensionItems.length,
      alreadyCompleted: wasAlreadyCompleted,
    });
    const scoreChange = addLevelScore(text.difficulty, points);
    setLessonComplete({
      scoreChange,
      // A short lesson that fits on one screen never fires a scroll event, so
      // treat "no scroll recorded" as fully read rather than 0%.
      percentRead: Math.min(100, Math.round(maxProgressPercent.current) || 100),
      wordsTapped,
      savedWords: articleSavedWordCount,
      reviewItems: buildLessonMiniReviewItems(),
      streak: { count: getCurrentStreak(), extended: streakExtendedByThis, week: getStreakWeek() },
      journeyMoment,
    });
  }

  function handleLessonCompleteContinue() {
    // Return to where the lesson was opened from — the article tab by default,
    // or home if that's where the reader was entered from.
    let target = isStarterLesson ? "/articles#journey-current" : "/articles";
    if (typeof document !== "undefined") {
      try {
        const ref = new URL(document.referrer);
        if (ref.origin === window.location.origin && ref.pathname === "/") target = "/";
        if (ref.origin === window.location.origin && ref.pathname === "/live-news") target = "/live-news";
      } catch {
        // no usable referrer; keep the default
      }
    }
    setLessonComplete(null);
    router.push(target);
  }

  function handleContinueLesson() {
    setLessonStep((step) => Math.min(step + 1, Math.max(0, paragraphs.length - 1)));
    setActiveWord(null);
    setActiveSentence(null);
    setActivePhrase(null);
    requestAnimationFrame(() => {
      articleRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }

  function handleStartSecondPass() {
    const startedAt = new Date().toISOString();
    trackEvent("reread_started", { articleId: text.id });
    setShowEnglishTranslation(false);
    setActiveWord(null);
    setActiveSentence(null);
    setActivePhrase(null);
    setRereadMode(true);
    setSecondPassStartedAt(startedAt);
    showToast("Second pass started");
  }

  function handleFinishSecondPass() {
    recordSecondPass({
      articleId: text.id,
      articleTitle: text.title,
      startedAt: secondPassStartedAt ?? new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });
    const xp = recordSecondPassXp(text.id);
    setRereadMode(false);
    setSecondPassStartedAt(null);
    showToast(xp > 0 ? `Second pass saved (+${xp} XP)` : "Second pass saved");
  }

  function handleArticleFeedback(feedback: ArticleDifficultyFeedback) {
    saveArticleFeedback(text, feedback, difficulty?.cefr ?? text.difficulty);
    setArticleFeedback(feedback);
    showToast(feedback === "good" ? "Saved as a good match" : feedback === "hard" ? "Saved as too hard" : "Saved as too easy");
  }

  function wordClassName(token: Token): string {
    const base = "cursor-pointer rounded px-0.5 py-0.5 transition-colors";
    if (rereadMode) return "rounded px-0.5 py-0.5";
    const clean = token.clean;
    const entry = lookupWord(token.text);
    const lemma = entry.lemma?.toLowerCase();
    const wordStatus = statusForWord(clean, lemma);
    const known = wordStatus === "known";
    const recentlyKnown = recentKnownWords.has(clean) || (!!lemma && recentKnownWords.has(lemma));
    const recentlySaved = recentSavedWords.has(clean) || (!!lemma && recentSavedWords.has(lemma));

    if (known && settings.showKnownWordStyling) {
      return `${base} text-ink-muted ${recentlyKnown ? "reward-word-mastered" : ""}`;
    }

    if (recentlyKnown) {
      return `${base} reward-word-mastered`;
    }

    if (recentlySaved) {
      return `${base} bg-amber-100/80 text-ink reward-word-save`;
    }

    if (settings.showSavedHighlights) {
      const missingUnderline =
        entry.source === "missing"
          ? " underline decoration-dashed decoration-ink-muted underline-offset-2"
          : "";
      if (wordStatus === "learning") return `${base} bg-amber-200/80 text-ink${missingUnderline}`;
      if (wordStatus === "unsure") return `${base} bg-sky-200/70 text-ink${missingUnderline}`;
    }

    return `${base} active:bg-brand/10`;
  }

  function handleInferenceAnswer(word: string, lemma: string | null, correct: boolean) {
    recordLearningAction();
    recordInferenceResult(text.id, word, lemma, correct);
    setInferenceStats((stats) => ({
      attempted: stats.attempted + 1,
      correct: stats.correct + (correct ? 1 : 0),
    }));
    showToast(correct ? "Inferred correctly" : "Context attempt saved");
  }

  function handleSaveCandidate(candidate: LearningCandidate) {
    const lookup = lookupWord(candidate.word);
    const { words: nextWords, persisted } = saveWord(
      buildSavedWord(candidate.word, lookup, candidate.contextSentence, "learning")
    );
    if (!persisted) {
      showToast("Couldn't save — device storage is full");
      return;
    }
    recordLearningAction();
    rememberWordSaved("candidate");
    setSavedWordsSnapshot(nextWords);
    setWordStatusMap(buildWordStatusMap(nextWords));
    setArticleSavedWordCount(nextWords.filter((saved) => saved.sourceTextTitle === text.title && saved.status !== "known").length);
    pulseRewardWords("saved", [candidate.word, candidate.lemma]);
    showToast("Saved learning candidate");
  }

  function handleToneAnswer(question: ToneQuestion, answerIndex: number) {
    recordComprehensionInteraction();
    setToneAnswers((prev) => {
      const next = { ...prev, [question.id]: answerIndex };
      maybeMarkComprehensionCompleted(gistAnswer, next);
      return next;
    });
  }

  function handleGistAnswer(answerIndex: number) {
    recordComprehensionInteraction();
    setGistAnswer(answerIndex);
    maybeMarkComprehensionCompleted(answerIndex, toneAnswers);
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

  /** The clickable, word-tappable French sentence used inside each paragraph, so tap targets stay consistent in normal and translated reading. */
  function phraseClassName(): string {
    if (rereadMode) return "rounded px-0.5 py-0.5";
    return "cursor-pointer rounded bg-brand-light/80 px-0.5 py-0.5 text-brand underline decoration-dotted underline-offset-4 transition-colors active:bg-brand-light";
  }

  function paragraphAudioButton(paragraph: string, paragraphIndex: number): ReactNode {
    if (!canUseSpeech) return null;
    const active = activeAudioParagraph === paragraphIndex;
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          handlePlayParagraph(paragraph, paragraphIndex);
        }}
        aria-label={active ? "Stop this paragraph" : `Play paragraph ${paragraphIndex + 1}`}
        className={`mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold active:scale-95 ${
          active ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
        }`}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H3v6h3l5 4z" />
          <path d="M15 9.5a4 4 0 0 1 0 5" />
          <path d="M18 7a8 8 0 0 1 0 10" />
        </svg>
      </button>
    );
  }

  function renderTokenNodes(sg: SentenceGroup, startIndex = 0, endIndex = sg.tokens.length - 1): ReactNode[] {
    const renderedTokens: ReactNode[] = [];
    for (let ti = startIndex; ti <= endIndex; ti++) {
      const tok = sg.tokens[ti];
      const phrase = tok.isWord ? findPhraseTranslationMatch(sg.tokens, ti) : null;
      if (phrase && phrase.endIndex <= endIndex) {
        const phraseText = sg.tokens.slice(ti, phrase.endIndex + 1).map((token) => token.text).join("");
        renderedTokens.push(
          <span
            key={`${startIndex}-${ti}`}
            role={rereadMode ? undefined : "button"}
            tabIndex={rereadMode ? undefined : 0}
            onKeyDown={(event: KeyboardEvent<HTMLSpanElement>) => {
              if (rereadMode) return;
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              event.stopPropagation();
              handlePhraseTap(sg.text, {
                phrase: phraseText.toLowerCase(),
                lemma: phrase.lemma,
                translation: phrase.translation,
                partOfSpeech: phrase.partOfSpeech,
                contextSentence: sg.text,
                source: phrase.source,
              });
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
              if (!rereadMode) startPhraseHold(sg.text, sg.tokens, ti);
            }}
            onPointerUp={(event) => {
              event.stopPropagation();
              cancelPhraseHold();
            }}
            onPointerCancel={(event) => {
              event.stopPropagation();
              cancelPhraseHold();
            }}
            onPointerLeave={(event) => {
              event.stopPropagation();
              cancelPhraseHold();
            }}
            onContextMenu={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (rereadMode) return;
              handlePhraseHold(sg.text, sg.tokens, ti);
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (rereadMode) return;
              if (phraseHoldTriggered.current) {
                phraseHoldTriggered.current = false;
                return;
              }
              handlePhraseTap(sg.text, {
                phrase: phraseText.toLowerCase(),
                lemma: phrase.lemma,
                translation: phrase.translation,
                partOfSpeech: phrase.partOfSpeech,
                contextSentence: sg.text,
                source: phrase.source,
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
            key={`${startIndex}-${ti}`}
            role={rereadMode ? undefined : "button"}
            tabIndex={rereadMode ? undefined : 0}
            onKeyDown={(event: KeyboardEvent<HTMLSpanElement>) => {
              if (rereadMode) return;
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              event.stopPropagation();
              handleWordTap(sg.text, sg.tokens, ti);
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
              if (!rereadMode) startPhraseHold(sg.text, sg.tokens, ti);
            }}
            onPointerUp={(event) => {
              event.stopPropagation();
              cancelPhraseHold();
            }}
            onPointerCancel={(event) => {
              event.stopPropagation();
              cancelPhraseHold();
            }}
            onPointerLeave={(event) => {
              event.stopPropagation();
              cancelPhraseHold();
            }}
            onContextMenu={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (rereadMode) return;
              handlePhraseHold(sg.text, sg.tokens, ti);
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (rereadMode) return;
              if (phraseHoldTriggered.current) {
                phraseHoldTriggered.current = false;
                return;
              }
              handleWordTap(sg.text, sg.tokens, ti);
            }}
            className={`${wordClassName(tok)} ${!rereadMode && isHighlightedReference(sg.tokens, ti) ? "bg-emerald-200/80 ring-2 ring-emerald-400" : ""}`}
          >
            {tok.text}
          </span>
        ) : (
          <span key={`${startIndex}-${ti}`}>{tok.text}</span>
        )
      );
    }

    return renderedTokens;
  }

  function renderSentenceFrame(sg: SentenceGroup, key: number | string, children: ReactNode, className?: string) {
    return (
      <span
        key={key}
        onPointerDown={() => {
          if (!rereadMode) startSentenceHold(sg.text);
        }}
        onPointerUp={cancelSentenceHold}
        onPointerCancel={cancelSentenceHold}
        onPointerLeave={cancelSentenceHold}
        onContextMenu={(event) => {
          event.preventDefault();
          if (rereadMode) return;
          handleSentenceTap(sg.text);
        }}
        // Deliberately no plain onClick. Words stop propagation, so the only
        // clicks that reached here were ones landing on the spaces and
        // punctuation between words — i.e. mis-taps — which then opened the
        // sentence explainer unexpectedly. Holding still works, and the
        // reliable route is the "Explain the whole sentence" action in the
        // word sheet.
        className={className ?? (rereadMode ? "rounded" : "rounded transition-colors")}
      >
        {children}
      </span>
    );
  }

  function renderSentenceSpan(sg: SentenceGroup, key: number) {
    return renderSentenceFrame(sg, key, renderTokenNodes(sg));
  }


  return (
    <div className="px-4 pt-4">
      {showProgressBadge && (
        <div className="pointer-events-none fixed right-3 top-3 z-40 rounded-full bg-cream-card/95 px-2.5 py-1 text-xs font-bold tabular-nums text-brand shadow-card ring-1 ring-cream-dark/70 backdrop-blur">
          {scrollProgressPercent}% read
        </div>
      )}

      {/* Header with back button */}
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleBack}
          className="-ml-2 flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-brand active:scale-95"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
      </div>

      {(difficulty?.cefr ?? text.difficulty) && (
        <span className="mb-2 inline-block rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand capitalize">
          {formatCategory(text.category)}
        </span>
      )}
      <h1 className="text-2xl font-extrabold leading-tight text-ink">
        {text.title}
      </h1>
      {/* The stored level, matching the card that led here — see the note in
          ReadingCard. The estimate only ever speaks in the "Reading help"
          note below, where it describes the fit rather than renaming it. */}
      <p className="mt-1 text-xs text-ink-muted">
        {text.difficulty} - {text.minutes} min
      </p>
      <details className="mt-2 text-xs text-ink-muted">
        <summary className="cursor-pointer font-semibold underline underline-offset-2">Reading help</summary>
        <p className="mt-1">
          Tap a word for its meaning. Hold a word for the phrase it belongs to. For a confusing line, tap a word and choose
          &ldquo;Explain the whole sentence&rdquo;.
        </p>
        {difficulty && (
          <p className="mt-1">
            For you, this one looks {difficulty.label.toLowerCase()} — around{" "}
            {Math.round(difficulty.unknownWordRatio * 100)}% of the words may be new.
          </p>
        )}
      </details>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {canUseSpeech && (
          <button
            type="button"
            onClick={handleToggleListenToArticle}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold active:scale-95 ${
              isSpeakingArticle ? "bg-brand text-white" : "bg-cream-card text-ink shadow-card"
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
          disabled={rereadMode}
          className="inline-flex items-center gap-2 rounded-full bg-cream-card px-3.5 py-2 text-xs font-semibold text-ink shadow-card active:scale-95 disabled:opacity-50"
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
          {showEnglishTranslation ? "Hide English" : "English help"}
        </button>
      </div>

      {rereadMode && (
        <div className="mt-3 rounded-2xl bg-brand-light px-3 py-2 text-xs font-semibold text-brand">
          Second pass: English, highlights, and dictionary prompts are hidden.
        </div>
      )}

      {showEnglishTranslation && (
        <p className="mt-2 text-xs text-ink-muted">
          {!shouldUseFluentTranslation() && (
            <>
              Showing rough offline English help ({translationModeLabel().toLowerCase()}).
            </>
          )}
          {shouldUseFluentTranslation() && translationState === "loading" && "Natural English is loading. English lines will appear as soon as they are ready."}
          {shouldUseFluentTranslation() && translationState === "ready" && !translationError && "Natural English translation, aligned between the French lines."}
          {shouldUseFluentTranslation() && translationState === "ready" && translationError && (
            <>
              Some lines use rough offline help because natural English did not finish ({translationError}).{" "}
              <button type="button" onClick={handleFetchFluentTranslation} className="underline">
                Try again
              </button>
            </>
          )}
        </p>
      )}

      {isChunkedStarterLesson && (
        <section className="mt-5 rounded-card bg-cream-card p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand">Lesson step {currentLessonStep} of {lessonStepCount}</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">Read this short part, then continue.</p>
            </div>
            <span className="shrink-0 rounded-full bg-brand-light px-2.5 py-1 text-xs font-bold text-brand">{lessonProgress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-dark">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${lessonProgress}%` }} />
          </div>
        </section>
      )}

      <article
        ref={articleRef}
        className={`no-select mt-6 space-y-6 ${FONT_SIZE_CLASSES[settings.fontSize]} leading-[1.8] text-ink`}
      >
        {visibleParagraphEntries.map(({ sentences, paragraphIndex }) =>
          showEnglishTranslation ? (
            // Translated mode is line-by-line interlinear: each French sentence
            // keeps its own line (words still tappable), and the English for
            // that sentence sits directly beneath it in the opened-up gap. This
            // reads far more cleanly than stacking English under every word,
            // which spread the French out and reflowed the paragraph.
            <div key={paragraphIndex} className="flex items-start gap-2">
              {paragraphAudioButton(paragraphTexts[paragraphIndex] ?? sentences.map((sg) => sg.text).join(" "), paragraphIndex)}
              <div className="min-w-0 flex-1 space-y-5">
                {sentences.map((sg, si) => {
                  const flatIndex = paragraphBreakBeforeIndex[paragraphIndex] + si;
                  const english = sentenceTranslationForDisplay(flatIndex);
                  return (
                    <div key={si}>
                      <p className="leading-[1.7]">{renderSentenceSpan(sg, si)}</p>
                      {english && (
                        <p className="mt-1.5 border-l-2 border-brand/30 pl-3 text-[0.82em] italic leading-snug text-ink-muted">
                          {english}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Normal reading layout: sentences flow together into one paragraph.
            <div key={paragraphIndex} className="flex items-start gap-2">
              {paragraphAudioButton(paragraphTexts[paragraphIndex] ?? sentences.map((sg) => sg.text).join(" "), paragraphIndex)}
              <p className="min-w-0 flex-1">
                {sentences.map((sg, si) => (
                  <Fragment key={si}>
                    {renderSentenceSpan(sg, si)}
                    {si < sentences.length - 1 && " "}
                  </Fragment>
                ))}
              </p>
            </div>
          )
        )}
      </article>

      {/*
        Everything below the text is practice, not reading. It used to be ~15
        stacked cards the reader had to scroll past whether or not they wanted
        any of it, which buried the two things they usually do want after
        finishing: mark it read, and review the words they saved. It's now one
        opt-in block, closed by default, so finishing an article stays a short
        path and the exercises are there for whoever wants them.
      */}
      {!rereadMode && !isStarterLesson && (
        <details className="mt-8 rounded-card bg-cream-card p-4 shadow-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Practice this article</h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Comprehension checks, words worth learning, and a summary box.
              </p>
            </div>
            <svg className="h-4 w-4 shrink-0 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>

          <div className="mt-4 space-y-4">
            {showInterpretationChecks && (
              <>
                <section className="rounded-2xl bg-cream p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Quick challenge</h3>
                  <p className="mt-1 text-sm font-semibold text-ink">{quickChallenge.prompt}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickChallenge.choices.map((choice) => {
                      const answered = quickChallengeAnswer !== null;
                      const correct = choice === quickChallenge.answer;
                      const selected = quickChallengeAnswer === choice;
                      return (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => setQuickChallengeAnswer(choice)}
                          className={`rounded-full px-3 py-2 text-xs font-semibold active:scale-95 ${
                            answered && correct
                              ? "bg-emerald-100 text-emerald-800"
                              : selected
                                ? "bg-rose-100 text-rose-800"
                                : "bg-cream-card text-ink-muted"
                          }`}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {gistQuestion && (
                  <ComprehensionQuestion
                    question={gistQuestion}
                    selected={gistAnswer}
                    onSelect={handleGistAnswer}
                  />
                )}

                {toneQuestions.length > 0 && (
                <section className="space-y-3">
                  <h3 className="px-1 text-sm font-semibold uppercase tracking-wide text-ink-muted">Tone check</h3>
                  {toneQuestions.map((question) => (
                    <ComprehensionQuestion
                      key={question.id}
                      question={question}
                      selected={toneAnswers[question.id] ?? null}
                      onSelect={(answer) => handleToneAnswer(question, answer)}
                    />
                  ))}
                </section>
                )}
              </>
            )}

            {learningCandidates.length > 0 && (
              <LearningCandidatesSection candidates={learningCandidates} onSave={handleSaveCandidate} />
            )}

            {showInterpretationChecks && headlineComparison && (
              <HeadlineComparisonCard comparison={headlineComparison} />
            )}

            {showInterpretationChecks && (
              <div className="rounded-2xl bg-cream p-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Summarise it</h3>
                <textarea
                  value={summaryDraft}
                  onChange={(event) => setSummaryDraft(event.target.value)}
                  rows={4}
                  placeholder="Write the article's main point in English or French."
                  className="mt-3 w-full resize-none rounded-2xl bg-cream-card px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
                />
                <p className="mt-2 text-xs text-ink-muted">
                  Aim for one sentence about what happened and one sentence about why it matters.
                  {summaryDraft.trim() ? " Saved on this device — it'll be here next time you open the article." : ""}
                </p>
              </div>
            )}
          </div>
        </details>
      )}

      {/* Reading progress */}
      <div className="mt-8 mb-4 flex justify-center">
        {status === "completed" ? (
          <div className="w-full space-y-3 text-center">
            {completionResult ? (
              <CompletionSummary
                completion={completionResult}
                onSecondPass={handleStartSecondPass}
                reviewHref={
                  articleSavedWordCount > 0 || completionResult.phrasesSaved > 0
                    ? `/review?article=${encodeURIComponent(text.title)}`
                    : null
                }
                isLesson={isStarterLesson}
              />
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Completed
              </span>
            )}
            {rereadMode && (
              <button
                type="button"
                onClick={handleFinishSecondPass}
                className="block rounded-full bg-brand px-4 py-2.5 shadow-raised text-sm font-semibold text-white active:scale-95"
              >
                Finish second pass
              </button>
            )}
            {!rereadMode && !isStarterLesson && (
              <details className="rounded-card bg-cream-card p-3 text-left shadow-card">
                <summary className="cursor-pointer text-center text-xs font-semibold text-ink-muted underline underline-offset-2">
                  More options
                </summary>
                <div className="mt-3 rounded-2xl bg-cream p-3">
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
                {!completionResult && articleSavedWordCount > 0 && (
                  <Link
                    href={`/review?article=${encodeURIComponent(text.title)}`}
                    className="mt-3 block rounded-full bg-brand px-4 py-2.5 shadow-raised text-center text-sm font-semibold text-white active:scale-95"
                  >
                    Review {articleSavedWordCount} {articleSavedWordCount === 1 ? "word" : "words"} from this article
                  </Link>
                )}
                {!completionResult && (
                  <button
                    type="button"
                    onClick={handleStartSecondPass}
                    className="mt-3 block w-full rounded-full bg-cream-dark px-4 py-2.5 text-sm font-semibold text-ink active:scale-95"
                  >
                    Read again without English
                  </button>
                )}
                <div className="mt-3">
                  <PostSessionResearchPrompt articleId={text.id} />
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <AndroidBetaButton source="article_completion" className="rounded-full bg-brand px-4 py-2.5 shadow-raised text-sm font-semibold text-white active:scale-95" />
                  <FeedbackButton feature="reader_completion" articleId={text.id} label="Give reader feedback" />
                </div>
              </details>
            )}
          </div>
        ) : isChunkedStarterLesson && !isLastLessonStep ? (
          <button
            onClick={handleContinueLesson}
            className="rounded-full bg-brand px-5 py-3 shadow-raised text-sm font-semibold text-white active:scale-95"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleMarkCompleted}
            className="rounded-full bg-brand px-5 py-3 shadow-raised text-sm font-semibold text-white active:scale-95"
          >
            {isStarterLesson ? "Finish lesson" : "Finish reading"}
          </button>
        )}
      </div>

      {/* "What to read next" belongs after finishing, not among the exercises. */}
      {status === "completed" && !rereadMode && relatedArticles.length > 0 && (
        <details className="mb-5">
          <summary className="cursor-pointer rounded-card bg-cream-card p-4 text-sm font-semibold uppercase tracking-wide text-ink-muted shadow-card">
            {isStarterLesson ? "More lessons" : "More articles"}
          </summary>
          <div className="mt-3">
            <RelatedArticles articles={relatedArticles} />
          </div>
        </details>
      )}

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
              The Translate toggle asks an AI tutor for a fluent, natural translation with word and phrase alignments,
              shown between the French lines. Unless "Fluent AI
              translation" is off in Settings, this starts loading in the background as soon as you open the
              article — usually ready by the time you tap the toggle, rather than making you wait. It still
              uses your OpenAI quota either way, once per article (cached after that). Until it's ready (or if
              AI isn't available or turned off in Settings), an instant, free offline word-for-word version from
              the local dictionary is shown instead, so there's never nothing to read. Tapping a single sentence
              is different: it opens "Explain sentence," a deeper structured breakdown with grammar notes and
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

      {activeWord && (
        <WordSheet
          state={activeWord}
          articleTitle={text.title}
          onClose={() => setActiveWord(null)}
          onKnow={handleKnow}
          onSave={handleSaveActiveWord}
          inferenceChallenge={activeInference}
          onInferenceAnswer={handleInferenceAnswer}
          onAiRequested={() => markAiSupportUsed("word")}
          onExplainSentence={(sentence) => {
            setActiveWord(null);
            handleSentenceTap(sentence);
          }}
        />
      )}
      {activeSentence && (
        <SentenceSheet
          state={activeSentence}
          articleTitle={text.title}
          onClose={() => setActiveSentence(null)}
          onAiRequested={() => markAiSupportUsed("sentence")}
        />
      )}
      {activePhrase && (
        <PhraseSheet
          state={activePhrase}
          articleTitle={text.title}
          onClose={() => setActivePhrase(null)}
          onSaved={() => {
            recordLearningAction();
            showToast("Saved phrase");
          }}
          onKnown={() => {
            recordLearningAction();
            showToast("Marked phrase as known");
          }}
          onAiRequested={() => markAiSupportUsed("phrase")}
        />
      )}
      {lessonComplete && (
        <LessonCompleteScreen
          level={text.difficulty}
          scoreChange={lessonComplete.scoreChange}
          stats={{
            percentRead: lessonComplete.percentRead,
            wordsTapped: lessonComplete.wordsTapped,
            savedWords: lessonComplete.savedWords,
          }}
          reviewItems={lessonComplete.reviewItems}
          streak={lessonComplete.streak}
          journeyMoment={lessonComplete.journeyMoment}
          isLesson={isStarterLesson}
          onContinue={handleLessonCompleteContinue}
        />
      )}
      <Toast message={toastMessage} />
    </div>
  );
}

function dedupeArticles(articles: ReadingText[]): ReadingText[] {
  const byId = new Map<string, ReadingText>();
  for (const article of articles) byId.set(article.id, article);
  return [...byId.values()];
}

function buildRelatedArticles(current: ReadingText, candidates: ReadingText[], limit = 3): ReadingText[] {
  if (!isStarterText(current)) return findRelatedArticles(current, candidates, limit);

  const starterCandidates = candidates.filter(isStarterText);
  const related = findRelatedArticles(current, starterCandidates, limit);
  if (related.length >= limit) return related;

  const fallback = starterCandidates
    .filter((candidate) => candidate.id !== current.id && !related.some((article) => article.id === candidate.id))
    .sort((a, b) => {
      const categoryMatch = Number(b.category === current.category) - Number(a.category === current.category);
      if (categoryMatch !== 0) return categoryMatch;
      const difficultyMatch = Number(b.difficulty === current.difficulty) - Number(a.difficulty === current.difficulty);
      if (difficultyMatch !== 0) return difficultyMatch;
      return a.title.localeCompare(b.title);
    });

  return [...related, ...fallback].slice(0, limit);
}

function RelatedArticles({ articles }: { articles: ReadingText[] }) {
  return (
    <section className="border-t border-cream-dark pt-4">
      <div className="px-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Read next</h2>
        <p className="mt-0.5 text-xs text-ink-muted">
          More from today&apos;s reading list — a chance to meet some of the same vocabulary again.
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

function HeadlineComparisonCard({ comparison }: { comparison: HeadlineComparison }) {
  const [revealed, setRevealed] = useState(false);
  const neutral = comparison.neutralChoice === "left" ? comparison.left : comparison.right;
  const dramatic = comparison.dramaticChoice === "left" ? comparison.left : comparison.right;
  return (
    <section className="rounded-card border border-cream-dark bg-cream-card p-4 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Compare the headlines</h2>
      <div className="mt-3 grid gap-2">
        {[comparison.left, comparison.right].map((article) => (
          <Link key={article.id} href={`/reader/${article.id}`} className="rounded-2xl bg-cream px-3 py-2 active:bg-cream-dark/60">
            <p className="text-sm font-bold leading-snug text-ink">{article.title}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{article.sourceName ?? "Saved text"}</p>
          </Link>
        ))}
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-ink-muted">
        <p>Which sounds more neutral?</p>
        <p>Which is more dramatic?</p>
        <p>Which verb suggests criticism?</p>
        <p>How does the framing differ?</p>
      </div>
      {revealed ? (
        <div className="mt-3 rounded-2xl bg-cream px-3 py-2 text-xs text-ink-muted">
          <p>
            More neutral: <span className="font-semibold text-ink">{neutral.sourceName ?? neutral.title}</span>
          </p>
          <p>
            More dramatic: <span className="font-semibold text-ink">{dramatic.sourceName ?? dramatic.title}</span>
          </p>
          <p>
            Critical verb: <span className="font-semibold text-ink">{comparison.criticalVerb ?? "none obvious"}</span>
          </p>
          <p className="mt-1">{comparison.framing}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-3 rounded-full bg-cream-dark px-4 py-2 text-xs font-semibold text-ink active:scale-95"
        >
          Reveal framing notes
        </button>
      )}
    </section>
  );
}

function LearningCandidatesSection({
  candidates,
  onSave,
}: {
  candidates: LearningCandidate[];
  onSave: (candidate: LearningCandidate) => void;
}) {
  const [justSavedLemma, setJustSavedLemma] = useState<string | null>(null);
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
    };
  }, []);

  function handleSave(candidate: LearningCandidate) {
    if (candidate.alreadySaved) return;
    setJustSavedLemma(candidate.lemma);
    if (savedTimeout.current) clearTimeout(savedTimeout.current);
    savedTimeout.current = setTimeout(() => setJustSavedLemma(null), 1200);
    onSave(candidate);
  }

  return (
    <section className="rounded-card bg-cream-card p-4 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Words worth learning</h2>
      <p className="mt-0.5 text-xs text-ink-muted">
        Ranked from this article so you do not have to decide which every unfamiliar word deserves review.
      </p>
      <div className="mt-3 space-y-2">
        {candidates.map((candidate) => {
          const justSaved = justSavedLemma === candidate.lemma;
          return (
          <div key={candidate.lemma} className={`rounded-2xl bg-cream px-3 py-2 ${justSaved ? "reward-card-lock-in bg-brand-light/80" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">
                  {candidate.lemma}
                  {candidate.word !== candidate.lemma && <span className="font-medium text-ink-muted"> from {candidate.word}</span>}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">{candidate.translation}</p>
                <p className="mt-1 text-xs font-semibold text-brand">{candidate.reason}</p>
              </div>
              <button
                type="button"
                onClick={() => handleSave(candidate)}
                disabled={candidate.alreadySaved || justSaved}
                className="shrink-0 rounded-full bg-brand px-3 py-1.5 shadow-raised text-xs font-semibold text-white disabled:bg-cream-dark disabled:text-ink-muted"
              >
                {candidate.alreadySaved || justSaved ? "Saved" : "Save"}
              </button>
            </div>
            {candidate.phrase && (
              <p className="mt-1 text-xs text-ink-muted">Appears in phrase: {candidate.phrase}</p>
            )}
          </div>
          );
        })}
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
    <div className="rounded-card bg-cream-card p-4 shadow-card">
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
