"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { AppSettings, FontSize, ReadingText, SavedWord, TextStatus, WordStatus } from "@/types";
import { tokenize, tokenizeParagraphsToSentences, type SentenceGroup, type Token } from "@/lib/words";
import { deleteWord, getSavedWords, saveWord } from "@/lib/storage";
import { deletePhrase, getSavedPhrases } from "@/lib/phrases";
import { lookupWord } from "@/lib/dictionary/lookup";
import { useGeneratedDictionary } from "@/lib/dictionary/useGeneratedDictionary";
import {
  cacheDictionarySentenceTranslations,
  translateSentencesWithDictionaryCache,
  type DictionaryArticleTranslationMode,
} from "@/lib/dictionary/articleTranslation";
import { getArticleTranslation, getWordExplanation } from "@/lib/ai/client";
import { getPrecomputedTranslation } from "@/lib/ai/precomputedTranslations";
import type { ArticleTranslationAlignmentSegment } from "@/lib/ai/types";
import { NOT_TRANSLATED_YET } from "@/lib/dictionary/constants";
import { generateFallbackExample } from "@/lib/dictionary/exampleGenerator";
import {
  isMeaningUpgrade,
  resolveMeaning,
  sentenceMeaning,
  shouldEscalateToAi,
  type ResolvedMeaning,
  type SentenceMeaning,
} from "@/lib/dictionary/resolveMeaning";
import { getKnownWords } from "@/lib/knownWords";
import { getProgress, markCompleted, markOpened } from "@/lib/progress";
import { recordArchiveEntry } from "@/lib/archive";
import { defaultSpacedRepetitionFields } from "@/lib/spacedRepetition";
import { estimateDifficulty, type DifficultyEstimate } from "@/lib/difficulty";
import { recordArticleCompleted } from "@/lib/recommendation/interests";
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "@/lib/settings";
import { getCustomTexts } from "@/lib/customTexts";
import { canSpeak, speakFrenchParagraphs, stopSpeaking } from "@/lib/speech";
import { markAudioTipSeen, recordAudioPlayAndCheckTip } from "@/lib/audioTip";
import { getArticleFeedbackForText, saveArticleFeedback, type ArticleDifficultyFeedback } from "@/lib/articleFeedback";
import { getArticleSummary, saveArticleSummary } from "@/lib/articleSummaries";
import { findPronounReference } from "@/lib/pronounReferences";
import { getCachedRssTexts, getOfflineRssTexts } from "@/lib/rss/rssTextCache";
import { isLikelySourceBoilerplateToken } from "@/lib/rss/sourceNoise";
import { rankLearningCandidates, type LearningCandidate, type WordTapRecord } from "@/lib/learningCandidates";
import { getWordTapsForArticle, recordWordTap } from "@/lib/wordLearning";
import { buildHeadlineComparison, countFrenchWords, isProperNounWord, type HeadlineComparison } from "@/lib/readingAnalytics";
import { recordSecondPass, recordTranslationBudgetResult, suggestedTranslationAllowance } from "@/lib/readingInsights";
import { formatCategory, toPercent } from "@/lib/format";
import { trackEvent } from "@/lib/analytics/client";
import { createActiveTimeTracker, type ActiveTimeTracker } from "@/lib/analytics/session";
import { applyReadingSessionToState, isMeaningfulReadingSession } from "@/lib/validation/definitions";
import { getValidationState, saveValidationState, updateValidationState } from "@/lib/validation/state";
import { isStarterText } from "@/lib/publicDomainBank";
import {
  quickChallengeForArticle,
  getTotalXp,
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
import { lireLevelChange, type LireLevelChange } from "@/lib/progression/lireLevel";
import { buildPracticePlan, type PracticePlan } from "@/lib/practice/session";
import { recordLookupStat, summarizeLookupRate, type LookupRateSummary } from "@/lib/practice/lookupStats";
import { getSessionRecords, getSessionRecordsForLevel, recordReadingSession } from "@/lib/sessionRecord";
import { computeReadingPerformance, averagePracticeAccuracy, type ReadingPerformanceMetrics } from "@/lib/practice/readingPerformance";
import { compareToLevelBand, compareToPersonalBaseline, type BaselineComparison, type TrendLabel } from "@/lib/practice/baselineComparison";
import { estimatePersonalChallenge } from "@/lib/practice/personalChallenge";
import { selectDiagnosticMessage, type DiagnosticMessage } from "@/lib/practice/diagnosticMessaging";
import { getCurrentStreak, getStreakWeek, isActiveToday, type StreakDay } from "@/lib/habit";
import { getJourneyState, getNextTextForReader, markJourneyStageSeen, type JourneyState } from "@/lib/journey/state";
import { JOURNEY_BANDS, getJourneyText, getStageForText } from "@/lib/journey/ladder";
import type { JourneyMoment, LessonMiniReviewItem } from "@/components/LessonCompleteScreen";
import MeaningSheet, { type ActiveMeaningState } from "@/components/MeaningSheet";
import SentenceSheet, { type ActiveSentenceState } from "@/components/SentenceSheet";
import { triggerHaptic } from "@/lib/haptics";
import { canLookupWord, canSaveWord, canUseComprehension, type AccessDenialReason } from "@/lib/access/accessModel";
import { useAccess } from "@/lib/access/useAccess";
import AccessPrompt from "@/components/AccessPrompt";
import type { PremiumFeature } from "@/lib/access/limits";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import Toast from "@/components/Toast";
import { CompletionSummary } from "@/components/GamificationCards";
import PostSessionResearchPrompt from "@/components/PostSessionResearchPrompt";
import { AndroidBetaButton } from "@/components/AndroidBetaModal";
import { FeedbackButton } from "@/components/FeedbackModal";
import AppIcon from "@/components/AppIcon";

const READING_HELP_SEEN_KEY = "lire.readingHelpSeen.v1";

/**
 * The lesson-complete celebration screen is only ever needed once a reading
 * session actually finishes, so it's split out of the core reader's bundle
 * (which every article open pays for) rather than imported directly. See the
 * mount effect below that prefetches its chunk during idle time, so it's
 * already warm by the time a session actually completes.
 */
const LessonCompleteScreen = dynamic(() => import("@/components/LessonCompleteScreen"), { ssr: false });

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
  useDocumentTitle(text.title);
  const router = useRouter();
  const isImportedText = text.id.startsWith("custom-");
  const isStarterLesson = isStarterText(text);
  const { context: access, tier, consumeLookup } = useAccess();
  /** Set when an action was blocked, so the reader is told which wall it was. */
  const [blocked, setBlocked] = useState<
    { reason: AccessDenialReason; blocked: "lookup" | PremiumFeature } | null
  >(null);

  // Comprehension is Premium, so the existing suitability flag now also
  // carries entitlement. Everything downstream — question building, the
  // completion summary, scoring — already keys off this one flag.
  const showInterpretationChecks = !isImportedText && !isStarterLesson && canUseComprehension(access).allowed;
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
  const [activeWord, setActiveWord] = useState<ActiveMeaningState | null>(null);
  const [activeSentence, setActiveSentence] = useState<ActiveSentenceState | null>(null);
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
  const [showEnglishTranslation, setShowEnglishTranslation] = useState(false);
  const [translationUses, setTranslationUses] = useState(0);
  const [challengeMode, setChallengeMode] = useState<TranslationChallengeMode>("none");
  const [quickChallengeAnswer, setQuickChallengeAnswer] = useState<string | null>(null);
  const [inferenceStats, setInferenceStats] = useState({ attempted: 0, correct: 0 });
  const [completionResult, setCompletionResult] = useState<ArticleCompletionRecord | null>(null);
  /** When set, the full-screen "lesson complete" celebration is shown over the reader. */
  const [lessonComplete, setLessonComplete] = useState<{
    levelProgress: LireLevelChange;
    percentRead: number;
    wordsTapped: number;
    savedWords: number;
    reviewItems: LessonMiniReviewItem[];
    streak: { count: number; extended: boolean; week: StreakDay[] };
    journeyMoment: JourneyMoment | null;
    nextAction: { label: string; textId: string } | null;
    mapLabel: string;
    /**
     * Computed once here (not recomputed from document.referrer at click
     * time) so it stays accurate even after a round trip through
     * Practice/Listen, whose own page would otherwise become the
     * "referrer" and misdirect this action.
     */
    mapTarget: string;
    practicePlan: PracticePlan;
    lookupRate: LookupRateSummary;
    diagnostics: {
      performance: ReadingPerformanceMetrics;
      baseline: BaselineComparison;
      message: DiagnosticMessage;
      trend: TrendLabel;
    } | null;
  } | null>(null);
  const lessonCompleteNavigating = useRef(false);
  /**
   * Guards against a mount-order race with the sessionStorage mirror below.
   * On mount/text-id-change, the restore effect calls setLessonComplete
   * asynchronously — but the mirror effect (declared after it) still runs
   * once in the same effect-flush, with the *previous* render's (stale)
   * lessonComplete closure, before that state update commits. Without this
   * guard, that stale run sees a falsy lessonComplete and wipes the very
   * sessionStorage entry the restore effect is about to write back,
   * so returning from Practice/Listen would silently lose the celebration
   * screen. Set true right before attempting a restore; consumed (and
   * ignored forever after) by the mirror effect's very next run, which by
   * then reflects the real, restored value.
   */
  const skipNextLessonCompleteMirrorClear = useRef(false);
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
  /** Auto-expanded the very first time anyone opens an article, so the tap/hold gestures below aren't buried behind a collapsed <details> nobody thinks to open. Stays collapsed by default afterwards. */
  const [readingHelpOpen, setReadingHelpOpen] = useState(false);
  /** Shown once, after a few audio plays across the app — see lib/audioTip.ts. */
  const [showAudioTip, setShowAudioTip] = useState(false);
  const articleRef = useRef<HTMLElement | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rewardTimeouts = useRef<number[]>([]);
  const sentenceHoldTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentenceHoldTriggered = useRef(false);
  /**
   * Which tap an in-flight AI meaning lookup belongs to. A reader can tap a
   * second word before the first request returns, and without this the late
   * answer would land in the newly-opened sheet.
   */
  const pendingAiLookupKey = useRef<string | null>(null);
  /** The inputs behind the currently-open sheet, so a late data source can re-resolve the same tap. */
  const lastTap = useRef<{ tokens: Token[]; tokenIndex: number; sentenceText: string } | null>(null);
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
  /** Lemma-deduplicated lookups this session, for sessionRecord.ts's uniqueWordsLookedUp — looking up the same word five times still counts once here, unlike wordLookupCount above. */
  const wordLookupLemmas = useRef<Set<string>>(new Set());
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
  const learningCandidates = useMemo(
    () => rankLearningCandidates(text, knownSet, savedWordsSnapshot, articleTapRecords, 6),
    [articleTapRecords, knownSet, savedWordsSnapshot, text]
  );
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
  // "Part" = one paragraph-sized chunk of the reading. Kept as a single,
  // coherent progress hierarchy: PART x OF y · N sentences, one bar.
  const lessonStepCount = Math.max(1, paragraphs.length);
  const currentLessonStep = Math.min(lessonStep + 1, lessonStepCount);
  const isLastLessonStep = currentLessonStep >= lessonStepCount;
  const lessonProgress = isChunkedStarterLesson ? toPercent(currentLessonStep / lessonStepCount) : 100;
  const lessonStepSentenceCount = isChunkedStarterLesson
    ? visibleParagraphEntries.reduce((total, entry) => total + entry.sentences.length, 0)
    : 0;
  const lessonStepSentenceLabel = `${lessonStepSentenceCount} ${lessonStepSentenceCount === 1 ? "sentence" : "sentences"}`;

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
    try {
      if (window.localStorage.getItem(READING_HELP_SEEN_KEY)) return;
      setReadingHelpOpen(true);
      window.localStorage.setItem(READING_HELP_SEEN_KEY, "1");
    } catch {
      // Best-effort — worst case the hint just doesn't auto-expand.
    }
  }, []);

  // Warms the lesson-complete screen's chunk during idle time so it's
  // already cached by the time a session actually finishes, instead of a
  // visible gap while that chunk downloads right at the celebratory moment.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1000));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => {
      void import("@/components/LessonCompleteScreen");
    });
    return () => cancelIdle(handle);
  }, []);

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
    wordLookupLemmas.current = new Set();
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
        return toPercent(window.scrollY / scrollNeeded);
      }
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      return toPercent(window.scrollY / maxScroll);
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

  /**
   * Re-resolves the open sheet when a slower data source lands — the generated
   * dictionary finishing its fetch, or this article's natural translation
   * arriving.
   *
   * isMeaningUpgrade is what keeps this from being disorienting: a reader
   * looking at a correct, confident answer should never watch it be replaced
   * because another layer finished loading. Only a strictly better result, or
   * an escape from "couldn't determine this", is allowed through.
   */
  useEffect(() => {
    const tap = lastTap.current;
    if (!tap || !activeWord) return;
    const { previous, next } = neighbours(tap.sentenceText);
    const next_ = resolveMeaning({
      tokens: tap.tokens,
      tokenIndex: tap.tokenIndex,
      contextSentence: tap.sentenceText,
      previousSentence: previous,
      nextSentence: next,
      alignments: alignmentsForSentence(tap.sentenceText),
      sentenceTranslation: trustedSentenceTranslation(tap.sentenceText),
    });
    if (!isMeaningUpgrade(activeWord.meaning, next_)) return;
    setActiveWord((current) => (current ? { ...current, meaning: next_ } : current));
    // Deliberately keyed on the arrival of new data, not on activeWord itself:
    // re-running on every sheet state change would fight the AI upgrade path.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictionaryRevision, fluentAlignments]);

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
    lessonCompleteNavigating.current = false;
    // Restores the full-screen completion celebration if the reader tapped
    // into Practice/Listen from it (both are separate routes/pages, which
    // unmount this component entirely) and then came back via their own
    // back button — otherwise they'd land on a plain "completed" reading
    // view instead of where they actually left off. Cleared automatically
    // whenever lessonComplete is set back to null (see the sync effect
    // below), so this never resurfaces once the reader has actually moved
    // on (e.g. via the primary "Continue"/"Return to map" actions).
    skipNextLessonCompleteMirrorClear.current = true;
    try {
      const raw = window.sessionStorage.getItem(`lire.lessonComplete.${text.id}`);
      setLessonComplete(raw ? JSON.parse(raw) : null);
    } catch {
      setLessonComplete(null);
    }
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

  // Single source of truth for the sessionStorage mirror the restore above
  // reads from: persists lessonComplete (including in-place edits, like the
  // mini-review save toggle) whenever it changes, and removes the entry the
  // moment it's set back to null (the reader tapped a real "leave this
  // moment" action) so it never resurfaces later.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `lire.lessonComplete.${text.id}`;
    try {
      if (lessonComplete) {
        window.sessionStorage.setItem(key, JSON.stringify(lessonComplete));
      } else if (skipNextLessonCompleteMirrorClear.current) {
        // This run's lessonComplete is the stale pre-restore value from the
        // effect above's own mount-time flush, not a real "leave this
        // moment" transition — ignore it once, so it can't wipe out the
        // restore that's about to land.
        skipNextLessonCompleteMirrorClear.current = false;
      } else {
        window.sessionStorage.removeItem(key);
      }
    } catch {
      // Best-effort — worst case, returning from Practice/Listen just shows
      // the plain completed view instead of restoring the celebration.
    }
  }, [lessonComplete, text.id]);

  /**
   * Cycles the reader's speaking speed through a fixed set of steps and
   * persists it to settings.speechRate — the same value every "Listen" and
   * pronounce button in the app reads (see speech.ts), so changing it here
   * also applies immediately to the word popup's pronounce buttons and any
   * currently-open listening-practice page, without a separate settings trip.
   */
  function cycleSpeechRate() {
    const steps = [0.75, 0.9, 1, 1.15, 1.3];
    const current = settings.speechRate;
    const closestIndex = steps.reduce(
      (bestIndex, step, i) => (Math.abs(step - current) < Math.abs(steps[bestIndex] - current) ? i : bestIndex),
      0
    );
    const next = steps[(closestIndex + 1) % steps.length];
    const updated = saveSettings({ speechRate: next });
    setSettings(updated);
    // Stop rather than reflow an in-flight utterance at the old rate — the
    // new speed takes effect the next time playback is started.
    if (isSpeakingArticle) {
      stopSpeaking();
      setIsSpeakingArticle(false);
      setActiveAudioParagraph(null);
    }
  }

  function handleToggleListenToArticle() {
    if (isSpeakingArticle) {
      stopSpeaking();
      setIsSpeakingArticle(false);
      setActiveAudioParagraph(null);
      return;
    }
    // During a chunked starter lesson, only one part of the text is on
    // screen at a time — speaking the whole article regardless would race
    // ahead through sentences the reader hasn't reached yet, sounding like
    // the audio doesn't match what's visible. Speak only the visible
    // part(s) instead, same as the per-paragraph play buttons already do.
    const textToSpeak = isChunkedStarterLesson
      ? visibleParagraphEntries.flatMap((entry) => entry.sentences.map((sentence) => sentence.text))
      : [text.title, ...paragraphTexts];
    const started = speakFrenchParagraphs(textToSpeak, "normal", () => {
      setIsSpeakingArticle(false);
      setActiveAudioParagraph(null);
    });
    if (started) {
      setIsSpeakingArticle(true);
      setActiveAudioParagraph(null);
      speechUsedThisSession.current = true;
      recordLearningAction();
      trackEvent("speech_playback_used", { articleId: text.id, scope: "article" });
      trackEvent("full_text_audio_played", { articleId: text.id });
      if (recordAudioPlayAndCheckTip()) setShowAudioTip(true);
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

    // Static curriculum/bank texts never change, so their fluent translation
    // is baked in ahead of time (see scripts/precompute-fluent-translations.mjs)
    // — this is the only branch that ever needs a live AI round trip for RSS
    // or imported articles, which genuinely can't be precomputed.
    const precomputed = await getPrecomputedTranslation(text.id);
    if (precomputed && precomputed.sentences.length === flatSentences.length) {
      setFluentSentences(precomputed.sentences);
      setFluentAlignments(precomputed.alignments ?? new Array(flatSentences.length).fill(null));
      setTranslationError(null);
      setTranslationState("ready");
      return;
    }

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
    trackEvent("audio_played", { scope: "paragraph" });
    if (recordAudioPlayAndCheckTip()) setShowAudioTip(true);
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
    const wasFirstWordEver = getValidationState().firstWordSavedAt == null;
    wordsSavedThisSession.current += 1;
    updateValidationState((state) => ({
      ...state,
      firstWordSavedAt: state.firstWordSavedAt ?? savedAt,
      totalWordsSaved: state.totalWordsSaved + 1,
    }));
    if (wasFirstWordEver) trackEvent("first_word_saved", { articleId: text.id });
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

  function alignmentsForSentence(sentenceText: string): ArticleTranslationAlignmentSegment[] | null {
    const sentenceIndex = flatSentences.indexOf(sentenceText);
    if (sentenceIndex === -1) return null;
    return fluentAlignments?.[sentenceIndex] ?? null;
  }

  /**
   * A trustworthy natural translation of this sentence, or null.
   *
   * Deliberately only the fluent article translation. The offline fallback is
   * a word-by-word dictionary composition — fine as a reading aid beneath the
   * French, where it is labelled as such, but presenting it in the sheet as
   * "what this sentence means" would dress up literal word-salad as a natural
   * translation ("je me suis réveillée tard" → "i me to be wake late").
   */
  function trustedSentenceTranslation(sentenceText: string): SentenceMeaning | null {
    const sentenceIndex = flatSentences.indexOf(sentenceText);
    if (sentenceIndex === -1) return null;
    const fluent = fluentSentences?.[sentenceIndex]?.trim();
    if (!fluent) return null;
    return sentenceMeaning(sentenceText, fluent, "article-translation");
  }

  function statusForWord(clean: string, lemma: string | null | undefined): WordStatus | null {
    const lemmaKey = lemma?.toLowerCase() ?? null;
    const known = knownSet.has(clean) || (!!lemmaKey && knownSet.has(lemmaKey));
    if (known) return "known";
    return lookupWordStatus(wordStatusMap, clean, lemmaKey);
  }

  /**
   * The one thing a tap does: ask what this means here.
   *
   * There is deliberately no second gesture. The reader used to have to know
   * that a tap gave a word and a long press gave its phrase — which meant the
   * app knew "compte" belonged to "se rendre compte" but waited to be asked
   * before saying so. resolveMeaning decides the unit now, so tapping any word
   * of an expression explains the expression.
   */
  function handleWordTap(sentenceText: string, tokens: Token[], index: number) {
    if (rereadMode) return;
    const clean = tokens[index]?.clean;
    if (!clean) return;

    // Checked before any work is done, so a blocked tap costs nothing and the
    // reader sees the prompt rather than a sheet that half-opens.
    const lookupDecision = canLookupWord(access);
    if (!lookupDecision.allowed) {
      setBlocked({ reason: lookupDecision.reason!, blocked: "lookup" });
      return;
    }

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
      setActiveWord(null);
      return;
    }
    const lemma = lookup.lemma?.toLowerCase();
    const existingStatus = statusForWord(clean, lemma);
    const { previous, next } = neighbours(sentenceText);
    const meaning = resolveMeaning({
      tokens,
      tokenIndex: index,
      contextSentence: sentenceText,
      previousSentence: previous,
      nextSentence: next,
      alignments: alignmentsForSentence(sentenceText),
      sentenceTranslation: trustedSentenceTranslation(sentenceText),
      lookup,
    });
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
    const wasFirstLookupEver = wordLookupCount.current === 0;
    wordLookupCount.current += 1;
    wordLookupLemmas.current.add(lemma ?? clean);
    if (wasFirstLookupEver) trackEvent("first_word_lookup", { articleId: text.id });
    trackEvent("word_lookup_opened", {
      articleId: text.id,
      knownBeforeTap: existingStatus === "known",
      dictionarySource: lookup.source,
      meaningSource: meaning.source,
      meaningConfidence: meaning.confidence,
    });

    // Counted here rather than at the top: a source-boilerplate tap returns
    // early above without opening anything, and should not cost an allowance.
    consumeLookup();

    const escalating = shouldEscalateToAi(meaning);
    lastTap.current = { tokens, tokenIndex: index, sentenceText };
    setActiveSentence(null);
    setActiveWord({
      meaning,
      surroundingSentence: previous,
      existingStatus,
      pronounReference,
      resolving: escalating,
    });
    if (escalating) void escalateMeaningToAi(meaning, previous, tokens, index, sentenceText);
  }

  /**
   * Targeted AI lookup for the small number of taps the offline layers cannot
   * settle. Runs only when shouldEscalateToAi says so, so common vocabulary
   * never waits on the network, and the result is cached per word+sentence by
   * the AI client — a second tap on the same word in the same place is free.
   */
  async function escalateMeaningToAi(
    meaning: ResolvedMeaning,
    previousSentence: string | null,
    tokens: Token[],
    tokenIndex: number,
    sentenceText: string
  ) {
    pendingAiLookupKey.current = meaning.cacheKey;
    markAiSupportUsed("word");
    const result = await getWordExplanation({
      word: meaning.tappedText,
      lemma: meaning.lemma,
      articleSentence: meaning.contextSentence,
      simpleExampleSentence: meaning.examples[0]?.fr ?? null,
      surroundingSentence: previousSentence,
      articleTitle: text.title,
      level: "A2/B1 French learner",
    });
    // The reader may have tapped elsewhere while this was in flight.
    if (pendingAiLookupKey.current !== meaning.cacheKey) return;
    pendingAiLookupKey.current = null;

    if (!result.data?.translation) {
      setActiveWord((current) =>
        current?.meaning.cacheKey === meaning.cacheKey ? { ...current, resolving: false } : current
      );
      return;
    }
    const upgraded = resolveMeaning({
      tokens,
      tokenIndex,
      contextSentence: sentenceText,
      previousSentence,
      alignments: alignmentsForSentence(sentenceText),
      sentenceTranslation: trustedSentenceTranslation(sentenceText),
      aiMeaning: { translation: result.data.translation, meaningInContext: result.data.meaningInContext },
    });
    setActiveWord((current) => {
      if (current?.meaning.cacheKey !== meaning.cacheKey) return current;
      return {
        ...current,
        meaning: isMeaningUpgrade(current.meaning, upgraded) ? upgraded : current.meaning,
        resolving: false,
      };
    });
  }

  /**
   * Adds the currently-open word to the review deck. Deliberately separate
   * from handleWordTap: a tap is a lookup, not a commitment to study the
   * word. Auto-saving on every tap meant a reader who was merely curious
   * ended up with a review queue full of words they never chose.
   */
  function handleSaveActiveWord(status: Exclude<WordStatus, "known"> = "learning") {
    if (!activeWord || activeWord.existingStatus) return;
    // Saving is Premium. Existing saved words stay readable — this only stops
    // new ones being added, so nobody's vocabulary is destroyed by the rule
    // changing underneath them.
    const saveDecision = canSaveWord(access);
    if (!saveDecision.allowed) {
      setActiveWord(null);
      setBlocked({ reason: saveDecision.reason!, blocked: "saveWord" });
      return;
    }
    const meaning = activeWord.meaning;
    // Names and places aren't vocabulary worth reviewing. This guard used to
    // sit on the auto-save in handleWordTap; it belongs wherever the save is.
    if (isProperNounWord(meaning.tappedText)) {
      showToast("Names aren't added to review");
      return;
    }
    if (meaning.abstained) {
      showToast("Nothing to save until this word resolves");
      return;
    }
    // The resolved contextual meaning is what the reader actually saw and
    // agreed to save, so it leads the card — a flashcard that disagrees with
    // the sheet it was saved from is worse than no card.
    const { words: nextWords, persisted } = saveWord(
      buildSavedWord(meaning, status)
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
    triggerHaptic("confirm");
    pulseRewardWords("saved", [meaning.tappedText, meaning.lemma]);
    setActiveWord((prev) =>
      prev
        ? {
            ...prev,
            existingStatus: lookupWordStatus(nextStatusMap, prev.meaning.tappedText, prev.meaning.lemma) ?? status,
          }
        : prev
    );
    showToast(status === "unsure" ? "Saved as unsure" : "Saved");
  }

  function handleUnsaveActiveWord() {
    if (!activeWord || activeWord.existingStatus === null || activeWord.existingStatus === "known") return;
    const nextWords = deleteWord(activeWord.meaning.tappedText);
    const nextStatusMap = buildWordStatusMap(nextWords);
    const keys = [activeWord.meaning.tappedText.toLowerCase(), activeWord.meaning.lemma?.toLowerCase()].filter(
      (value): value is string => !!value
    );
    setRecentSavedWords((current) => {
      const next = new Set(current);
      keys.forEach((key) => next.delete(key));
      return next;
    });
    setWordStatusMap(nextStatusMap);
    setSavedWordsSnapshot(nextWords);
    setArticleSavedWordCount(nextWords.filter((saved) => saved.sourceTextTitle === text.title && saved.status !== "known").length);
    setActiveWord((previous) => (previous ? { ...previous, existingStatus: null } : previous));
    showToast("Removed from review");
  }

  function handleSentenceTap(sentenceText: string) {
    if (rereadMode) return;
    const { previous, next } = neighbours(sentenceText);
    recordLearningAction();
    sentenceInteractionCount.current += 1;
    trackEvent("sentence_support_opened", { articleId: text.id });
    setActiveWord(null);
    setActiveSentence({ sentence: sentenceText, previousSentence: previous, nextSentence: next });
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
          saved: true,
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
          saved: true,
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
          saved: false,
        });
      });

    return items.slice(0, 5);
  }

  /**
   * Toggles an item's saved status right from the mini review card. Phrase
   * items on this screen are always already-saved (buildLessonMiniReviewItems
   * only ever surfaces saved phrases), so only the unsave path applies there;
   * word items can go either way since the third source is raw taps that
   * were never saved.
   */
  function handleToggleMiniReviewSave(item: LessonMiniReviewItem) {
    if (item.kind === "phrase") {
      if (!item.saved) return;
      deletePhrase(item.french);
      showToast("Removed from review");
    } else if (item.saved) {
      deleteWord(item.french);
      setWordStatusMap(buildWordStatusMap(getSavedWords()));
      showToast("Removed from review");
    } else {
      const { persisted } = saveWord(
        buildSavedWord(resolveMeaningForWord(item.french, item.context ?? item.french), "learning")
      );
      if (!persisted) {
        showToast("Couldn't save — device storage is full");
        return;
      }
      recordLearningAction();
      setWordStatusMap(buildWordStatusMap(getSavedWords()));
      showToast("Saved for review");
    }
    setLessonComplete((current) =>
      current
        ? {
            ...current,
            reviewItems: current.reviewItems.map((existing) =>
              existing === item ? { ...existing, saved: !existing.saved } : existing
            ),
          }
        : current
    );
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

  /**
   * Resolves a word that wasn't reached through a tap — a learning candidate,
   * or an item on the lesson-complete review card.
   *
   * These paths used to call lookupWord directly and save its first gloss,
   * which is exactly the "first dictionary sense regardless of context"
   * behaviour this work exists to remove. Running the same resolver over the
   * word's own sentence keeps every saved card consistent with what the reader
   * would have been shown had they tapped it.
   */
  function resolveMeaningForWord(word: string, contextSentence: string): ResolvedMeaning {
    const tokens = tokenize(contextSentence);
    const index = tokens.findIndex((token) => token.isWord && token.clean === word.toLowerCase());
    if (index === -1) {
      // The word isn't in the sentence we were handed (or there is no sentence
      // at all): resolve it standing alone rather than against the wrong context.
      const standalone = tokenize(word);
      const standaloneIndex = standalone.findIndex((token) => token.isWord);
      return resolveMeaning({
        tokens: standalone,
        tokenIndex: standaloneIndex === -1 ? 0 : standaloneIndex,
        contextSentence: contextSentence || word,
      });
    }
    return resolveMeaning({ tokens, tokenIndex: index, contextSentence });
  }

  /**
   * Turns a resolved meaning into a review card.
   *
   * The card leads with the contextual meaning the reader actually saw and
   * chose to save, with the remaining dictionary senses behind it. Saving a
   * different answer from the one on screen is how a reader ends up reviewing
   * "compte = account" after Lire told them it meant "to realise".
   *
   * Only a word-scoped meaning may lead. An expression's citation form is kept
   * separately so the study view can say where the word came from without the
   * flashcard front becoming a whole idiom the reader didn't tap.
   */
  function buildSavedWord(meaning: ResolvedMeaning, wordStatus: Exclude<WordStatus, "known">): SavedWord {
    const lookup = lookupWord(meaning.tappedText);
    const missing = meaning.abstained || lookup.source === "missing";
    const firstExample = meaning.examples[0];
    const contextual = meaning.displayEnglish.trim();
    const translations = [contextual, ...lookup.translations].filter(
      (translation, index, values) => translation && values.indexOf(translation) === index
    );
    // A guessed lemma may belong to a different word class than the form the
    // reader tapped, so don't let it pick the example frame or get stored as
    // this word's part of speech.
    const reliablePartOfSpeech = meaning.partOfSpeechUncertain ? null : meaning.partOfSpeech;
    // Deliberately the dictionary's own glosses rather than `translations`,
    // which leads with the context-fitted meaning. The fallback example slots a
    // gloss into a generic frame ("C'est très X."), so a context-fitted phrase
    // produces nonsense — "mouillé" resolved as "was anchored" rendered "It's
    // very was anchored." The dictionary entry matches the frame's word class.
    const fallbackExample = generateFallbackExample({
      word: meaning.tappedText,
      lemma: lookup.lemma,
      partOfSpeech: reliablePartOfSpeech,
      gender: lookup.gender,
      translations: lookup.translations.length > 0 ? lookup.translations : translations,
    });
    return {
      word: meaning.tappedText,
      lemma: meaning.lemma,
      translations,
      primaryTranslation: translations[0] ?? NOT_TRANSLATED_YET,
      partOfSpeech: reliablePartOfSpeech,
      gender: lookup.gender,
      cefr: lookup.cefr,
      frequencyRank: lookup.frequencyRank,
      articleContextSentence: meaning.contextSentence,
      contextualMeaning: contextual || null,
      partOfExpression: meaning.partOfExpression,
      lemmaGloss: meaning.lemmaGloss,
      sentenceTranslation: meaning.sentenceTranslation?.english ?? null,
      exampleSentenceFr: firstExample?.fr ?? meaning.contextSentence,
      exampleSentenceEn: firstExample?.en ?? (contextual || fallbackExample.en),
      sourceTextTitle: text.title,
      savedAt: new Date().toISOString(),
      reviewCount: 0,
      lastReviewedAt: null,
      status: wordStatus,
      missingFromDictionary: missing,
      ...defaultSpacedRepetitionFields(),
    };
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
      // The article's own assigned CEFR band, not the personalized per-reader
      // estimate (`difficulty` state, computed from this reader's known-words
      // set) — completion records feed durable, cross-article stats like
      // "highest level article reached," which need a stable value that
      // means the same thing for every article, not one that can drift with
      // a single reader's vocabulary at the moment they happened to finish it.
      difficulty: text.difficulty,
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

    const wordsTapped = getWordTapsForArticle(text.id).length;
    // The completion screen shows movement on the Lire Level ladder, taken
    // from the XP this completion actually earned. It used to animate a
    // separate per-CEFR band score that nothing else in the app read, so the
    // number being celebrated was not the reader's real progression — and,
    // being labelled "A2 · 63/100 to next tier", it implied that finishing
    // enough texts advances CEFR proficiency.
    const levelProgress = lireLevelChange(getTotalXp(), result.xpEarned);

    // Figure out a destination-specific "what's next" for the primary button,
    // instead of a generic "Continue" that just bounces back to the map.
    // Only meaningful for the guided starter/journey lessons; regular
    // imported articles have no ladder position to advance along.
    //
    // Pass this text's own level, not the reader's globally selected/
    // recommended level — without this, finishing an A1 lesson while your
    // committed level is B1 recommended the next B1 stage (a different,
    // unrelated section) instead of continuing the A1 section actually
    // just read.
    const nextRecommendation = isStarterLesson ? getNextTextForReader({ selectedLevel: text.difficulty }) : null;
    const nextStage = nextRecommendation ? getStageForText(nextRecommendation.textId) : null;
    const currentStage = getStageForText(text.id);
    // Crossing into a new stage names the stage (there's no single "next
    // lesson" to point at yet — the reader is choosing among several).
    // Staying within the same stage names the actual next lesson, both so
    // the button is specific rather than generic and so its destination
    // and visible label can never disagree (both come from nextRecommendation).
    const nextLessonText = nextRecommendation ? getJourneyText(nextRecommendation.textId) : null;
    const nextLessonTitle = nextLessonText?.title ?? null;
    // Shown in the button so a jump to a new stage/level (crossing into a
    // harder or easier band once the current one clears) is visible before
    // tapping, rather than a same-looking "Continue" silently landing
    // somewhere unexpected.
    const nextLessonLevel = nextLessonText?.difficulty ?? nextStage?.band ?? null;
    const nextAction = nextRecommendation
      ? {
          label:
            nextStage && (!currentStage || nextStage.globalIndex !== currentStage.globalIndex)
              ? `Continue ${nextStage.label}${nextLessonLevel ? ` (${nextLessonLevel})` : ""}`
              : nextLessonTitle
                ? `Continue: ${nextLessonTitle}${nextLessonLevel ? ` (${nextLessonLevel})` : ""}`
                : "Read the next text",
          textId: nextRecommendation.textId,
        }
      : null;
    const band = text.difficulty;
    // Only a guided starter/journey lesson was actually opened "from a map" —
    // a News/RSS or imported article has no map to return to, so the label
    // and destination need to say/do something that's actually true for it.
    let mapTarget = isStarterLesson ? "/#journey-current" : "/";
    if (typeof document !== "undefined") {
      try {
        const ref = new URL(document.referrer);
        if (ref.origin === window.location.origin && (ref.pathname === "/" || ref.pathname === "/articles")) mapTarget = "/#journey-current";
        if (ref.origin === window.location.origin && ref.pathname === "/live-news") mapTarget = "/live-news";
      } catch {
        // no usable referrer; keep the default
      }
    }
    const mapLabel = isStarterLesson ? `Return to the ${band} map` : mapTarget === "/live-news" ? "Back to News" : "Back to home";

    // Lookups-per-100-words: a support-use signal, not a comprehension score.
    // wordLookupCount is this session's own count (reset when the article changed),
    // so a re-read's lookups don't get folded into an earlier completion's total.
    const wordTotal = countFrenchWords(text);
    recordLookupStat({
      textId: text.id,
      wordCount: wordTotal,
      lookupEvents: wordLookupCount.current,
      completedAt,
      level: band,
    });
    const lookupRate = summarizeLookupRate(text.id, wordTotal, wordLookupCount.current);
    const practicePlan = buildPracticePlan(text);

    const wordsForThisArticle = getSavedWords().filter((word) => word.sourceTextTitle === text.title);
    recordReadingSession({
      textId: text.id,
      sourceType: isImportedText ? "imported" : text.id.startsWith("rss-") ? "rss" : "curriculum",
      estimatedLevel: difficulty?.cefr ?? text.difficulty,
      wordCount: wordTotal,
      totalLookupActions: wordLookupCount.current,
      uniqueWordsLookedUp: wordLookupLemmas.current.size,
      wordsSaved: wordsForThisArticle.filter((word) => word.status === "learning").length,
      wordsUnsure: wordsForThisArticle.filter((word) => word.status === "unsure").length,
      wordsKnown: wordsForThisArticle.filter((word) => word.status === "known").length,
      openedAt: getProgress(text.id).openedAt ?? completedAt,
      completedAt,
      activeReadingTimeMs: activeTimeTracker.current?.activeMs() ?? 0,
      completionStatus: "completed",
      audioUsed: speechUsedThisSession.current,
    });
    trackEvent("lesson_completed", { articleId: text.id, estimatedLevel: difficulty?.cefr ?? text.difficulty });

    // Diagnostics bundle for the new completion-screen section — reads the
    // record straight back out of sessionRecord.ts so it reflects exactly
    // what was just persisted (including any practice stats merged in from
    // an earlier practice-page visit).
    const estimatedLevel = difficulty?.cefr ?? text.difficulty;
    const allSessionRecords = getSessionRecords();
    const thisSessionRecord = allSessionRecords.find((r) => r.textId === text.id) ?? null;
    const diagnostics = (() => {
      if (!thisSessionRecord) return null;
      const performance = computeReadingPerformance(thisSessionRecord);
      const levelBandHistory = getSessionRecordsForLevel(estimatedLevel);
      const levelBandComparison = compareToLevelBand(thisSessionRecord, levelBandHistory);
      const baseline = levelBandComparison.minimumSampleMet
        ? levelBandComparison
        : compareToPersonalBaseline(thisSessionRecord, allSessionRecords);
      const articleWords = new Set(tokenize(text.body).filter((t) => t.isWord && t.clean).map((t) => t.clean));
      const savedWordSet = new Set(savedWordsSnapshot.map((w) => w.word.toLowerCase()));
      let previouslySavedCount = 0;
      articleWords.forEach((w) => {
        if (savedWordSet.has(w)) previouslySavedCount++;
      });
      const percentPreviouslySaved = articleWords.size > 0 ? previouslySavedCount / articleWords.size : 0;
      const challenge = estimatePersonalChallenge({
        unknownWordRatio: difficulty?.unknownWordRatio ?? 0,
        percentPreviouslySaved,
        recentLookupRateAtLevel: baseline.baselineRate,
        recentPracticeAccuracy: averagePracticeAccuracy(performance),
        recentAbandonRate: null,
      });
      const message = selectDiagnosticMessage({ challenge, performance, baseline });
      return { performance, baseline, message, trend: baseline.trend };
    })();

    setLessonComplete({
      levelProgress,
      // A short lesson that fits on one screen never fires a scroll event, so
      // treat "no scroll recorded" as fully read rather than 0%.
      percentRead: Math.min(100, Math.round(maxProgressPercent.current) || 100),
      wordsTapped,
      savedWords: articleSavedWordCount,
      reviewItems: buildLessonMiniReviewItems(),
      streak: { count: getCurrentStreak(), extended: streakExtendedByThis, week: getStreakWeek() },
      journeyMoment,
      nextAction,
      mapLabel,
      mapTarget,
      practicePlan,
      lookupRate,
      diagnostics,
    });
  }

  // Guards against a double/rapid tap firing two overlapping router.push
  // calls in the same tick (before React re-renders to hide the button) —
  // that race could otherwise leave the router stuck mid-navigation.
  function navigateAndClearLessonComplete(target: string) {
    if (lessonCompleteNavigating.current) return;
    lessonCompleteNavigating.current = true;
    setLessonComplete(null);
    router.push(target);
  }

  function handleLessonCompleteReturnToMap() {
    if (!lessonComplete) return;
    navigateAndClearLessonComplete(lessonComplete.mapTarget);
  }

  function handleLessonCompletePrimaryAction() {
    if (!lessonComplete) return;
    const nextTextId = lessonComplete.nextAction?.textId;
    if (nextTextId) {
      navigateAndClearLessonComplete(`/reader/${encodeURIComponent(nextTextId)}`);
      return;
    }
    // Terminal state (nothing left to read right now) — fall back to the map.
    handleLessonCompleteReturnToMap();
  }

  function handleContinueLesson() {
    setLessonStep((step) => Math.min(step + 1, Math.max(0, paragraphs.length - 1)));
    setActiveWord(null);
    setActiveSentence(null);
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
    // reader-tap-target adds vertical hit area on touch devices without moving
    // the glyphs, so one- and two-letter words (à, y, en, de, ne) are reachable
    // with a thumb. It is padding only — no visible gaps are inserted between
    // words, so the paragraph still sets as ordinary prose.
    const base = "reader-tap-target cursor-pointer rounded px-0.5 py-0.5 transition-colors";
    if (rereadMode) return "reader-tap-target rounded px-0.5 py-0.5";
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
      return `${base} bg-brand-light text-ink underline decoration-brand decoration-2 underline-offset-4 reward-word-save`;
    }

    if (settings.showSavedHighlights) {
      const missingUnderline =
        entry.source === "missing"
          ? " underline decoration-dashed decoration-ink-muted underline-offset-2"
          : "";
      if (wordStatus === "learning") return `${base} bg-brand-light text-ink underline decoration-brand decoration-2 underline-offset-4${missingUnderline}`;
      if (wordStatus === "unsure") return `${base} bg-cream-fill text-ink underline decoration-brand/60 decoration-2 underline-offset-4${missingUnderline}`;
    }

    return `${base} active:bg-brand/10`;
  }

  function handleSaveCandidate(candidate: LearningCandidate) {
    const { words: nextWords, persisted } = saveWord(
      buildSavedWord(resolveMeaningForWord(candidate.word, candidate.contextSentence), "learning")
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
        className={`mt-[-0.35rem] inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          active ? "bg-brand text-cream" : "bg-cream-fill text-ink-muted"
        }`}
      >
        <AppIcon name="volume" className="h-3.5 w-3.5" />
      </button>
    );
  }

  /**
   * Renders a sentence as individually tappable words.
   *
   * Recognised expressions used to be rendered as a single highlighted span,
   * which taught the distinction this work removes: the words inside them
   * weren't separately tappable, and a reader had to notice the highlight to
   * know a phrase was there. Every word is its own target now, and tapping any
   * one of them resolves to the expression when that's the right answer — so
   * "tap anything" holds literally, with no visual vocabulary to learn.
   */
  function renderTokenNodes(sg: SentenceGroup, startIndex = 0, endIndex = sg.tokens.length - 1): ReactNode[] {
    const renderedTokens: ReactNode[] = [];
    for (let ti = startIndex; ti <= endIndex; ti++) {
      const tok = sg.tokens[ti];

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
            onClick={(e) => {
              e.stopPropagation();
              if (rereadMode) return;
              handleWordTap(sg.text, sg.tokens, ti);
            }}
            className={`${wordClassName(tok)} ${!rereadMode && isHighlightedReference(sg.tokens, ti) ? "bg-brand-light ring-2 ring-brand/40" : ""}`}
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

  const headerTone = readerHeaderTone(text.category);

  return (
    <div className="min-h-[var(--vvh,100dvh)] bg-cream px-[22px] pb-[calc(var(--safe-bottom)+1rem)] pt-[calc(var(--safe-top)+1.25rem)]">
      {showProgressBadge && (
        <>
          <div className="pointer-events-none fixed left-1/2 top-0 z-40 h-1 w-full max-w-md -translate-x-1/2 bg-cream-dark/70">
            <div className="h-full bg-brand transition-[width] duration-200" style={{ width: `${scrollProgressPercent}%` }} />
          </div>
          <div
            className="pointer-events-none fixed right-3 z-40 rounded-full border border-cream-dark bg-cream-card/95 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.08em] tabular-nums text-brand backdrop-blur"
            style={{ top: "calc(var(--safe-top) + 0.75rem)" }}
          >
            {scrollProgressPercent}% read
          </div>
        </>
      )}

      {/* Header with back button */}
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleBack}
          className="ligne-pressable -ml-2 flex min-h-12 items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-brand"
        >
          <AppIcon name="back" />
          Back
        </button>
      </div>

      <section className="overflow-hidden rounded-card border border-cream-dark bg-cream-card">
        <div className={`px-4 py-3.5 ${headerTone}`}>
          <div className="min-w-0 flex-1">
            <span className="mb-1.5 inline-block rounded-full bg-cream-card/75 px-2.5 py-1 font-mono text-[11px] font-bold uppercase leading-4 tracking-[0.08em] text-brand">
              {formatCategory(text.category)}
            </span>
            <h1 className="break-words font-french text-[26px] leading-[1.12] text-ink">
              {text.title}
            </h1>
      {/* The stored level, matching the card that led here — see the note in
          ReadingCard. The estimate only ever speaks in the "Reading options"
          note below, where it describes the fit rather than renaming it. */}
            <p className="ligne-meta mt-1.5 text-ink-muted">
              {text.difficulty} - {text.minutes} min
            </p>
          </div>
        </div>
        <div className="p-3.5">
      <div className={`grid gap-2 ${canUseSpeech ? "grid-cols-2" : "grid-cols-1"}`}>
        {canUseSpeech && (
          <button
            type="button"
            onClick={handleToggleListenToArticle}
            className={`ligne-pressable inline-flex min-h-12 w-full items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold ${
              isSpeakingArticle ? "bg-brand text-cream" : "border border-cream-dark bg-cream text-ink"
            }`}
          >
            {isSpeakingArticle ? (
              <>
                <AppIcon name="pause" className="h-4 w-4" />
                Stop listening
              </>
            ) : (
              <>
                <AppIcon name="volume" className="h-4 w-4" />
                Listen to article
              </>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={handleToggleEnglishTranslation}
          disabled={rereadMode}
          className="ligne-pressable inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-cream-dark bg-cream px-3 text-xs font-semibold text-ink disabled:opacity-50"
          aria-pressed={showEnglishTranslation}
        >
          <span
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              showEnglishTranslation ? "bg-brand" : "bg-cream-fill"
            }`}
            aria-hidden="true"
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-cream transition-transform ${
                showEnglishTranslation ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
          {showEnglishTranslation ? "Hide English" : "English help"}
        </button>
      </div>

      <details
        className="mt-2.5 rounded-2xl bg-cream-sunken px-3 py-2 text-xs leading-relaxed text-ink-muted"
        open={readingHelpOpen}
        onToggle={(event) => setReadingHelpOpen(event.currentTarget.open)}
      >
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          Reading options
        </summary>
        <p className="mt-2">
          Tap a word for its meaning. Hold a word for its phrase. For a confusing line, tap a word and choose
          &ldquo;Explain the whole sentence&rdquo;.
        </p>
        {difficulty && (
          <p className="mt-1">
            For you, this one looks {difficulty.label.toLowerCase()} — around{" "}
            {toPercent(difficulty.unknownWordRatio)}% of the words may be new.
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {canUseSpeech && (
            <button
              type="button"
              onClick={cycleSpeechRate}
              aria-label="Change speaking speed"
              className="inline-flex min-h-11 items-center gap-1 rounded-full border border-cream-dark bg-cream-card px-3 text-xs font-semibold text-ink"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14h4l5 5V5l-5 5H4v4Z" />
                <path d="M17 8a5 5 0 0 1 0 8" />
              </svg>
              Speed {settings.speechRate.toFixed(2)}x
            </button>
          )}
          <FeedbackButton
            feature="reader"
            articleId={text.id}
            label="Report a problem"
            className="inline-flex min-h-11 items-center rounded-full border border-cream-dark bg-cream-card px-3.5 text-xs font-semibold text-ink-muted"
          />
        </div>
      </details>

      {showAudioTip && (
        <p className="mt-2 rounded-2xl bg-brand-light px-3 py-2 text-xs text-brand">
          Try listening once before reading the sentence.{" "}
          <button
            type="button"
            onClick={() => {
              markAudioTipSeen();
              setShowAudioTip(false);
            }}
            className="font-semibold underline underline-offset-2"
          >
            Got it
          </button>
        </p>
      )}

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
        </div>
      </section>

      {isChunkedStarterLesson && (
        <section className="mt-4 px-0.5">
          <p className="ligne-meta text-brand">
            Part {currentLessonStep} of {lessonStepCount} · {lessonStepSentenceLabel}
          </p>
          <div
            className="mt-2 h-[3px] overflow-hidden rounded-full bg-cream-strong"
            role="progressbar"
            aria-label={`Reading progress: part ${currentLessonStep} of ${lessonStepCount}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={lessonProgress}
          >
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${lessonProgress}%` }} />
          </div>
        </section>
      )}

      <article
        ref={articleRef}
        className={`no-select mt-5 space-y-6 border-t border-cream-dark/90 pt-5 font-french ${FONT_SIZE_CLASSES[settings.fontSize]} leading-[1.62] text-ink`}
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
        <details className="mt-8 rounded-card border border-cream-dark bg-cream-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <div>
              <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">Practice this article</h2>
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
                <section className="rounded-2xl bg-cream-sunken p-3">
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">Quick challenge</h3>
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
                          className={`rounded-full px-3 py-2 text-xs font-semibold ${
                            answered && correct
                              ? "bg-brand-light text-brand"
                              : selected
                                ? "bg-rose text-rose-ink"
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
                <h3 className="px-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">Tone check</h3>
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
              <div className="rounded-2xl bg-cream-sunken p-3">
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">Summarise it</h3>
                <textarea
                  value={summaryDraft}
                  onChange={(event) => setSummaryDraft(event.target.value)}
                  rows={4}
                  placeholder="Write the article's main point in English or French."
                  className="mt-3 w-full resize-none rounded-2xl border border-cream-dark bg-cream-card px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-4 py-2.5 text-sm font-semibold text-brand">
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
                className="ligne-pill block bg-brand text-cream"
              >
                Finish second pass
              </button>
            )}
            {!rereadMode && !isStarterLesson && (
              <details className="rounded-card border border-cream-dark bg-cream-card p-3 text-left">
                <summary className="cursor-pointer text-center font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                  More options
                </summary>
                <div className="mt-3 rounded-2xl bg-cream-sunken p-3">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">How did this level feel?</p>
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
                        className={`rounded-full px-3 py-2 text-xs font-semibold ${
                          articleFeedback === option.value ? "bg-brand text-cream" : "bg-cream-fill text-ink-muted"
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
                    className="ligne-pill mt-3 block bg-brand text-center text-cream"
                  >
                    Review {articleSavedWordCount} {articleSavedWordCount === 1 ? "word" : "words"} from this article
                  </Link>
                )}
                {!completionResult && (
                  <button
                    type="button"
                    onClick={handleStartSecondPass}
                    className="ligne-pill mt-3 block w-full bg-cream-fill text-ink-muted"
                  >
                    Read again without English
                  </button>
                )}
                <div className="mt-3">
                  <PostSessionResearchPrompt articleId={text.id} />
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <AndroidBetaButton source="article_completion" className="ligne-pill bg-brand text-cream" />
                  <FeedbackButton feature="reader_completion" articleId={text.id} label="Give reader feedback" />
                </div>
              </details>
            )}
          </div>
        ) : isChunkedStarterLesson && !isLastLessonStep ? (
          <button
            onClick={handleContinueLesson}
            className="ligne-pill bg-brand text-cream"
          >
            Continue reading
          </button>
        ) : (
          <button
            onClick={handleMarkCompleted}
            className="ligne-pill bg-brand text-cream"
          >
            {isStarterLesson ? "Finish lesson" : "Finish reading"}
          </button>
        )}
      </div>

      {/* "What to read next" belongs after finishing, not among the exercises. */}
      {status === "completed" && !rereadMode && relatedArticles.length > 0 && (
        <details className="mb-5">
          <summary className="cursor-pointer rounded-card border border-cream-dark bg-cream-card p-4 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            {isStarterLesson ? "More lessons" : "More articles"}
          </summary>
          <div className="mt-3">
            <RelatedArticles articles={relatedArticles} />
          </div>
        </details>
      )}

      {/* RSS-only metadata. */}
      {text.sourceUrl && (
        <div className="mb-6 text-center">
          <a
            href={text.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-ink-muted underline underline-offset-2"
          >
            Original source
          </a>
        </div>
      )}

      <MeaningSheet
          state={activeWord}
          articleTitle={text.title}
          onClose={() => setActiveWord(null)}
          onSave={() => handleSaveActiveWord("learning")}
          onUnsave={handleUnsaveActiveWord}
          onAiRequested={() => markAiSupportUsed("word")}
          onExplainSentence={(sentence) => {
            setActiveWord(null);
            handleSentenceTap(sentence);
          }}
        />
      <SentenceSheet
          state={activeSentence}
          articleTitle={text.title}
          onClose={() => setActiveSentence(null)}
          onAiRequested={() => markAiSupportUsed("sentence")}
        />
      {lessonComplete && (
        <LessonCompleteScreen
          level={text.difficulty}
          levelProgress={lessonComplete.levelProgress}
          stats={{
            percentRead: lessonComplete.percentRead,
            wordsTapped: lessonComplete.wordsTapped,
            savedWords: lessonComplete.savedWords,
          }}
          reviewItems={lessonComplete.reviewItems}
          onToggleSave={handleToggleMiniReviewSave}
          streak={lessonComplete.streak}
          journeyMoment={lessonComplete.journeyMoment}
          isLesson={isStarterLesson}
          primaryActionLabel={lessonComplete.nextAction?.label ?? lessonComplete.mapLabel}
          onPrimaryAction={handleLessonCompletePrimaryAction}
          mapActionLabel={lessonComplete.mapLabel}
          onReturnToMap={handleLessonCompleteReturnToMap}
          practiceText={text}
          practicePlan={lessonComplete.practicePlan}
          lookupRate={lessonComplete.lookupRate}
          diagnostics={lessonComplete.diagnostics}
          levelLabel={text.difficulty}
        />
      )}
      {blocked && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6">
          <div className="w-full max-w-md">
            <AccessPrompt
              reason={blocked.reason}
              blocked={blocked.blocked}
              isGuest={tier === "guest"}
              returnPath={`/reader/${text.id}`}
              onDismiss={() => setBlocked(null)}
            />
          </div>
        </div>
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

function readerHeaderTone(category: ReadingText["category"]): string {
  switch (category) {
    case "news-style":
      return "bg-accent-pink";
    case "sport":
      return "bg-accent-gold";
    case "culture":
      return "bg-accent-violet";
    case "science":
      return "bg-accent-sky";
    case "everyday life":
      return "bg-accent-mint";
  }
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
    <section className="rounded-card border border-cream-dark bg-cream-card p-4">
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
          className="mt-3 rounded-full bg-cream-dark px-4 py-2 text-xs font-semibold text-ink"
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
    <section className="rounded-card border border-cream-dark bg-cream-card p-4">
      <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">Words worth learning</h2>
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
                className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-cream disabled:bg-cream-fill disabled:text-ink-muted"
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
    <div className="rounded-card border border-cream-dark bg-cream-card p-4">
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
              className={`w-full rounded-2xl px-3 py-2 text-left text-sm font-medium ${
                isAnswer
                  ? "bg-brand-light text-brand"
                  : isSelected
                    ? "bg-rose text-rose-ink"
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
