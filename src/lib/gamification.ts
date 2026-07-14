import type { Category, ReadingText, SavedWord } from "@/types";
import type { ArchiveEntry } from "@/lib/archive";
import { pushStore } from "@/lib/supabase/sync";
import { getAllInferenceResults, getAllWordTaps, type StoredInference, type StoredWordTap } from "@/lib/wordLearning";
import { getTranslationBudgetRecords } from "@/lib/readingInsights";
import { tokenize } from "@/lib/words";

export type XpEventType =
  | "article_completed"
  | "comprehension_completed"
  | "mission_completed"
  | "word_review_success"
  | "vocabulary_mastered"
  | "achievement_unlocked"
  | "translation_challenge_completed"
  | "summary_completed"
  | "second_pass_completed";

export type MissionKind =
  | "complete_article"
  | "read_words"
  | "translation_budget"
  | "infer_words"
  | "review_words"
  | "no_full_translation";

export type TranslationChallengeMode = "none" | "relaxed" | "balanced" | "ambitious";
export type MasteryStage = "discovered" | "learning" | "recognised" | "reliable" | "mastered";

export interface XpEvent {
  id: string;
  type: XpEventType;
  relatedId: string;
  xp: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  idempotencyKey: string;
}

export interface ArticleScoreBreakdown {
  completion: number | null;
  comprehension: number | null;
  inference: number | null;
  translationIndependence: number | null;
  summary: number | null;
  total: number;
}

export interface ArticleCompletionRecord {
  id: string;
  articleId: string;
  title: string;
  sourceName: string | null;
  category: Category;
  difficulty: string;
  completedAt: string;
  wordsRead: number;
  readingMinutes: number | null;
  translationsUsed: number;
  fullTranslationUsed: boolean;
  savedWords: number;
  phrasesSaved: number;
  comprehensionCorrect: number;
  comprehensionTotal: number;
  inferenceCorrect: number;
  inferenceAttempts: number;
  summaryCompleted: boolean;
  challengeMode: TranslationChallengeMode;
  challengeBudget: number | null;
  challengeCompleted: boolean | null;
  score: number;
  scoreBreakdown: ArticleScoreBreakdown;
  xpEarned: number;
  levelBefore: number;
  levelAfter: number;
  personalBests: string[];
}

export interface MissionDefinition {
  id: string;
  kind: MissionKind;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  xp: number;
}

export interface MissionStatus extends MissionDefinition {
  date: string;
  progress: number;
  completed: boolean;
  rewarded: boolean;
}

export interface ReaderLevel {
  level: number;
  title: string;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
  recentXp: number;
}

export interface TopicProgress {
  category: Category;
  label: string;
  level: number;
  progress: number;
  articlesCompleted: number;
  averageComprehension: number;
  vocabularyCoverage: number;
  nextMilestone: string;
}

export interface PersonalBest {
  id: string;
  title: string;
  value: string;
  detail: string;
}

export interface AchievementStatus {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  progress: number;
  xp: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface PassportStamp {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface MasteryInfo {
  word: SavedWord;
  stage: MasteryStage;
  stageIndex: number;
  contexts: number;
  progress: number;
  advanced: boolean;
}

export interface VocabularyCollection {
  id: string;
  title: string;
  description: string;
  discovered: number;
  total: number;
  mastered: number;
  percent: number;
  nextSuggestion: string;
}

export interface ProgressSnapshot {
  level: ReaderLevel;
  missions: MissionStatus[];
  completions: ArticleCompletionRecord[];
  topicProgress: TopicProgress[];
  personalBests: PersonalBest[];
  achievements: AchievementStatus[];
  passport: PassportStamp[];
  mastery: MasteryInfo[];
  collections: VocabularyCollection[];
  currentStreak: number;
  longestStreak: number;
  weeklyWords: number;
  weeklyComprehensionAverage: number;
  weeklyReviewed: number;
  translationsPer100Words: number;
  activityStrip: { date: string; words: number; completed: boolean }[];
}

const XP_EVENTS_KEY = "lire.gamification.xpEvents.v1";
const COMPLETIONS_KEY = "lire.gamification.articleCompletions.v1";
const ACHIEVEMENTS_KEY = "lire.gamification.achievements.v1";
const PASSPORT_KEY = "lire.gamification.passport.v1";
const MASTERY_KEY = "lire.gamification.mastery.v1";

export const XP_RULES = {
  articleCompleted: 30,
  comprehensionMax: 30,
  missionMin: 20,
  missionMax: 50,
  wordReviewSuccess: 2,
  wordReviewDailyCap: 40,
  vocabularyMastered: 15,
  translationChallengeCompleted: 20,
  summaryCompleted: 15,
  secondPassCompleted: 15,
} as const;

const CATEGORY_LABELS: Record<Category, string> = {
  "news-style": "News",
  sport: "Sport",
  culture: "Culture",
  science: "Science",
  "everyday life": "Life",
};

const LEVEL_TITLES = [
  "French Starter",
  "Careful Reader",
  "Phrase Finder",
  "News Navigator",
  "French Explorer",
  "Context Builder",
  "Nuance Reader",
  "Independent Reader",
  "Advanced Analyst",
  "Fluent Pathfinder",
];

const ACHIEVEMENTS = [
  { id: "first-article", title: "First Article", description: "Complete your first French article.", icon: "I", requirement: 1, xp: 25 },
  { id: "five-articles", title: "Five Articles", description: "Complete five articles.", icon: "V", requirement: 5, xp: 50 },
  { id: "twenty-five-articles", title: "Twenty-Five Articles", description: "Complete twenty-five articles.", icon: "25", requirement: 25, xp: 120 },
  { id: "ten-thousand-words", title: "10,000 Words", description: "Read 10,000 French words.", icon: "10k", requirement: 10000, xp: 150 },
  { id: "first-b2", title: "First B2 Article", description: "Complete a B2 article.", icon: "B2", requirement: 1, xp: 75 },
  { id: "all-topics", title: "Across the Map", description: "Complete articles in every topic.", icon: "5", requirement: 5, xp: 100 },
  { id: "perfect-comprehension", title: "Clear Reading", description: "Earn a perfect comprehension result.", icon: "100", requirement: 1, xp: 60 },
  { id: "master-ten", title: "Ten Mastered Words", description: "Reach mastered stage on ten words.", icon: "M10", requirement: 10, xp: 100 },
  { id: "translation-restraint", title: "Translation Restraint", description: "Finish an article inside a translation budget.", icon: "T", requirement: 1, xp: 40 },
  { id: "three-day-streak", title: "Three-Day Streak", description: "Complete meaningful activity on three consecutive days.", icon: "3", requirement: 3, xp: 50 },
  { id: "seven-day-streak", title: "Seven-Day Streak", description: "Complete meaningful activity on seven consecutive days.", icon: "7", requirement: 7, xp: 100 },
];

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function localDate(date = new Date()): string {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function readArray<T>(key: string, guard: (value: unknown) => value is T): T[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter(guard) : [];
  } catch {
    return [];
  }
}

function persist(key: string, value: unknown): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  void pushStore(key);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function isXpEvent(value: unknown): value is XpEvent {
  return isRecord(value) && typeof value.id === "string" && typeof value.idempotencyKey === "string" && typeof value.xp === "number";
}

function isCompletion(value: unknown): value is ArticleCompletionRecord {
  return isRecord(value) && typeof value.id === "string" && typeof value.articleId === "string" && typeof value.completedAt === "string";
}

interface UnlockRecord {
  id: string;
  unlockedAt: string;
}

function isUnlockRecord(value: unknown): value is UnlockRecord {
  return isRecord(value) && typeof value.id === "string" && typeof value.unlockedAt === "string";
}

export function getXpEvents(): XpEvent[] {
  return readArray(XP_EVENTS_KEY, isXpEvent);
}

export function getArticleCompletions(): ArticleCompletionRecord[] {
  return readArray(COMPLETIONS_KEY, isCompletion);
}

function getUnlockedAchievements(): UnlockRecord[] {
  return readArray(ACHIEVEMENTS_KEY, isUnlockRecord);
}

function getUnlockedPassport(): UnlockRecord[] {
  return readArray(PASSPORT_KEY, isUnlockRecord);
}

function totalXp(events = getXpEvents()): number {
  return events.reduce((sum, event) => sum + event.xp, 0);
}

export function xpNeededForLevel(level: number): number {
  return Math.round(180 + Math.pow(level, 1.38) * 95);
}

export function levelFromXp(xp: number): ReaderLevel {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpNeededForLevel(level)) {
    remaining -= xpNeededForLevel(level);
    level++;
  }
  const nextLevelXp = xpNeededForLevel(level);
  const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentXp = getXpEvents()
    .filter((event) => new Date(event.createdAt).getTime() >= recentCutoff)
    .reduce((sum, event) => sum + event.xp, 0);
  return {
    level,
    title: LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.floor((level - 1) / 2))],
    totalXp: xp,
    currentLevelXp: remaining,
    nextLevelXp,
    progress: nextLevelXp === 0 ? 1 : Math.min(1, remaining / nextLevelXp),
    recentXp,
  };
}

export function addXpEvent(event: Omit<XpEvent, "id" | "createdAt"> & { createdAt?: string }): { events: XpEvent[]; awarded: boolean } {
  const events = getXpEvents();
  if (events.some((existing) => existing.idempotencyKey === event.idempotencyKey)) {
    return { events, awarded: false };
  }
  const createdAt = event.createdAt ?? new Date().toISOString();
  const next = [
    {
      ...event,
      id: `${event.idempotencyKey}::${createdAt}`,
      createdAt,
    },
    ...events,
  ].slice(0, 2000);
  persist(XP_EVENTS_KEY, next);
  return { events: next, awarded: true };
}

export function translationBudgetForMode(mode: TranslationChallengeMode, wordsRead: number, unknownRatio: number | null | undefined): number | null {
  if (mode === "none") return null;
  const difficultyBoost = unknownRatio == null ? 1 : unknownRatio > 0.18 ? 1.35 : unknownRatio > 0.1 ? 1.15 : 1;
  const base = Math.max(3, Math.round((wordsRead / 100) * difficultyBoost));
  if (mode === "relaxed") return Math.max(6, Math.round(base * 1.8));
  if (mode === "balanced") return Math.max(4, Math.round(base * 1.2));
  return Math.max(2, Math.round(base * 0.75));
}

export function calculateArticleScore(input: {
  comprehensionCorrect: number;
  comprehensionTotal: number;
  inferenceCorrect: number;
  inferenceAttempts: number;
  translationsUsed: number;
  translationBudget: number | null;
  summaryCompleted: boolean;
}): ArticleScoreBreakdown {
  const parts: Array<{ key: keyof ArticleScoreBreakdown; earned: number; possible: number }> = [
    { key: "completion", earned: 25, possible: 25 },
  ];
  if (input.comprehensionTotal > 0) {
    parts.push({ key: "comprehension", earned: (input.comprehensionCorrect / input.comprehensionTotal) * 35, possible: 35 });
  }
  if (input.inferenceAttempts > 0) {
    parts.push({ key: "inference", earned: (input.inferenceCorrect / input.inferenceAttempts) * 15, possible: 15 });
  }
  if (input.translationBudget !== null) {
    const ratio = input.translationsUsed <= input.translationBudget ? 1 : Math.max(0.35, input.translationBudget / Math.max(1, input.translationsUsed));
    parts.push({ key: "translationIndependence", earned: ratio * 15, possible: 15 });
  }
  parts.push({ key: "summary", earned: input.summaryCompleted ? 10 : 0, possible: 10 });
  const earned = parts.reduce((sum, part) => sum + part.earned, 0);
  const possible = parts.reduce((sum, part) => sum + part.possible, 0);
  const total = possible === 0 ? 0 : Math.round((earned / possible) * 100);
  return {
    completion: parts.find((part) => part.key === "completion")?.earned ?? null,
    comprehension: parts.find((part) => part.key === "comprehension")?.earned ?? null,
    inference: parts.find((part) => part.key === "inference")?.earned ?? null,
    translationIndependence: parts.find((part) => part.key === "translationIndependence")?.earned ?? null,
    summary: parts.find((part) => part.key === "summary")?.earned ?? null,
    total,
  };
}

function articleCompletionXp(wordsRead: number, score: number): number {
  const lengthBonus = Math.min(25, Math.floor(wordsRead / 150) * 5);
  const scoreBonus = score >= 90 ? 20 : score >= 75 ? 12 : score >= 60 ? 6 : 0;
  return XP_RULES.articleCompleted + lengthBonus + scoreBonus;
}

function countWords(text: string): number {
  return tokenize(text).filter((token) => token.isWord).length;
}

function personalBestIds(completion: Omit<ArticleCompletionRecord, "id" | "xpEarned" | "levelBefore" | "levelAfter" | "personalBests">, previous: ArticleCompletionRecord[]): string[] {
  const bests: string[] = [];
  if (completion.wordsRead > Math.max(0, ...previous.map((item) => item.wordsRead))) bests.push("Most words read in one article");
  if (completion.score > Math.max(0, ...previous.map((item) => item.score))) bests.push("Highest article score");
  const completedBudgets = previous.filter((item) => item.challengeCompleted).map((item) => item.translationsUsed);
  if (completion.challengeCompleted && completion.translationsUsed <= Math.min(Infinity, ...completedBudgets)) bests.push("Fewest translations in a challenge");
  if (completion.comprehensionTotal > 0 && completion.comprehensionCorrect === completion.comprehensionTotal) bests.push("Perfect comprehension");
  return bests;
}

export function recordGamifiedArticleCompletion(input: {
  text: ReadingText;
  difficulty: string;
  openedAt: string | null;
  completedAt?: string;
  wordsRead?: number;
  translationsUsed: number;
  fullTranslationUsed: boolean;
  savedWords: number;
  phrasesSaved: number;
  comprehensionCorrect: number;
  comprehensionTotal: number;
  inferenceCorrect: number;
  inferenceAttempts: number;
  summaryCompleted: boolean;
  challengeMode: TranslationChallengeMode;
  challengeBudget: number | null;
}): ArticleCompletionRecord {
  const completedAt = input.completedAt ?? new Date().toISOString();
  const wordsRead = input.wordsRead ?? countWords(input.text.body);
  const challengeCompleted = input.challengeBudget === null ? null : input.translationsUsed <= input.challengeBudget;
  const scoreBreakdown = calculateArticleScore({
    comprehensionCorrect: input.comprehensionCorrect,
    comprehensionTotal: input.comprehensionTotal,
    inferenceCorrect: input.inferenceCorrect,
    inferenceAttempts: input.inferenceAttempts,
    translationsUsed: input.translationsUsed,
    translationBudget: input.challengeBudget,
    summaryCompleted: input.summaryCompleted,
  });
  const previous = getArticleCompletions();
  const levelBefore = levelFromXp(totalXp()).level;
  const baseXp = articleCompletionXp(wordsRead, scoreBreakdown.total);
  let xpEarned = 0;
  const articleXp = addXpEvent({
    type: "article_completed",
    relatedId: input.text.id,
    xp: baseXp,
    metadata: { score: scoreBreakdown.total, wordsRead },
    idempotencyKey: `article_completed:${input.text.id}`,
    createdAt: completedAt,
  });
  if (articleXp.awarded) xpEarned += baseXp;
  if (input.comprehensionTotal > 0) {
    const xp = Math.round((input.comprehensionCorrect / input.comprehensionTotal) * XP_RULES.comprehensionMax);
    if (addXpEvent({ type: "comprehension_completed", relatedId: input.text.id, xp, idempotencyKey: `comprehension:${input.text.id}`, createdAt: completedAt }).awarded) xpEarned += xp;
  }
  if (input.summaryCompleted) {
    if (addXpEvent({ type: "summary_completed", relatedId: input.text.id, xp: XP_RULES.summaryCompleted, idempotencyKey: `summary:${input.text.id}`, createdAt: completedAt }).awarded) {
      xpEarned += XP_RULES.summaryCompleted;
    }
  }
  if (challengeCompleted) {
    if (addXpEvent({ type: "translation_challenge_completed", relatedId: input.text.id, xp: XP_RULES.translationChallengeCompleted, idempotencyKey: `translation_challenge:${input.text.id}`, createdAt: completedAt }).awarded) {
      xpEarned += XP_RULES.translationChallengeCompleted;
    }
  }
  const draft = {
    articleId: input.text.id,
    title: input.text.title,
    sourceName: input.text.sourceName ?? null,
    category: input.text.category,
    difficulty: input.difficulty,
    completedAt,
    wordsRead,
    readingMinutes: input.openedAt ? Math.max(1, Math.round((new Date(completedAt).getTime() - new Date(input.openedAt).getTime()) / 60000)) : input.text.minutes,
    translationsUsed: input.translationsUsed,
    fullTranslationUsed: input.fullTranslationUsed,
    savedWords: input.savedWords,
    phrasesSaved: input.phrasesSaved,
    comprehensionCorrect: input.comprehensionCorrect,
    comprehensionTotal: input.comprehensionTotal,
    inferenceCorrect: input.inferenceCorrect,
    inferenceAttempts: input.inferenceAttempts,
    summaryCompleted: input.summaryCompleted,
    challengeMode: input.challengeMode,
    challengeBudget: input.challengeBudget,
    challengeCompleted,
    score: scoreBreakdown.total,
    scoreBreakdown,
  };
  const personalBests = personalBestIds(draft, previous);
  const completion: ArticleCompletionRecord = {
    ...draft,
    id: input.text.id,
    xpEarned,
    levelBefore,
    levelAfter: levelFromXp(totalXp()).level,
    personalBests,
  };
  persist(COMPLETIONS_KEY, [completion, ...previous.filter((item) => item.articleId !== input.text.id)].slice(0, 500));
  evaluateAndUnlockAchievements();
  unlockPassportStamps();
  return completion;
}

export function recordReviewSuccessXp(word: string): number {
  const today = localDate();
  const todayReviewXp = getXpEvents()
    .filter((event) => event.type === "word_review_success" && event.createdAt.slice(0, 10) === today)
    .reduce((sum, event) => sum + event.xp, 0);
  if (todayReviewXp >= XP_RULES.wordReviewDailyCap) return 0;
  const xp = Math.min(XP_RULES.wordReviewSuccess, XP_RULES.wordReviewDailyCap - todayReviewXp);
  const awarded = addXpEvent({
    type: "word_review_success",
    relatedId: word,
    xp,
    idempotencyKey: `word_review:${today}:${word}:${todayReviewXp}`,
  });
  return awarded.awarded ? xp : 0;
}

export function recordSecondPassXp(articleId: string): number {
  const result = addXpEvent({
    type: "second_pass_completed",
    relatedId: articleId,
    xp: XP_RULES.secondPassCompleted,
    idempotencyKey: `second_pass:${articleId}`,
  });
  return result.awarded ? XP_RULES.secondPassCompleted : 0;
}

export function getDailyMissions(date = localDate()): MissionDefinition[] {
  const seed = [...date].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const pool: MissionDefinition[] = [
    { id: "complete-article", kind: "complete_article", title: "Finish one article", description: "Complete one French article today.", icon: "B", requirement: 1, xp: 30 },
    { id: "read-800", kind: "read_words", title: "Read 800 words", description: "Read 800 French words today.", icon: "W", requirement: 800, xp: 40 },
    { id: "translation-restraint", kind: "translation_budget", title: "Translation restraint", description: "Finish an article inside a translation budget.", icon: "T", requirement: 1, xp: 40 },
    { id: "infer-two", kind: "infer_words", title: "Infer from context", description: "Infer two words correctly before revealing English.", icon: "I", requirement: 2, xp: 35 },
    { id: "review-five", kind: "review_words", title: "Review five words", description: "Review five vocabulary cards.", icon: "R", requirement: 5, xp: 25 },
    { id: "no-full-translation", kind: "no_full_translation", title: "Stay in French", description: "Complete an article without full-article translation.", icon: "F", requirement: 1, xp: 45 },
  ];
  return [pool[seed % pool.length], pool[(seed + 2) % pool.length], pool[(seed + 4) % pool.length]].filter(
    (mission, index, arr) => arr.findIndex((item) => item.id === mission.id) === index
  ).slice(0, 3);
}

function missionProgress(mission: MissionDefinition, date: string, completions: ArticleCompletionRecord[], words: SavedWord[], inferences: StoredInference[]): number {
  const todayCompletions = completions.filter((item) => item.completedAt.slice(0, 10) === date);
  if (mission.kind === "complete_article") return todayCompletions.length;
  if (mission.kind === "read_words") return todayCompletions.reduce((sum, item) => sum + item.wordsRead, 0);
  if (mission.kind === "translation_budget") return todayCompletions.filter((item) => item.challengeCompleted).length;
  if (mission.kind === "infer_words") return inferences.filter((item) => item.correct && item.answeredAt.slice(0, 10) === date).length;
  if (mission.kind === "review_words") return words.filter((word) => word.lastReviewedAt?.slice(0, 10) === date).length;
  if (mission.kind === "no_full_translation") return todayCompletions.filter((item) => !item.fullTranslationUsed).length;
  return 0;
}

export function getMissionStatuses(date = localDate(), words: SavedWord[] = [], inferences: StoredInference[] = getAllInferenceResults()): MissionStatus[] {
  const completions = getArticleCompletions();
  const events = getXpEvents();
  return getDailyMissions(date).map((mission) => {
    const progress = Math.min(mission.requirement, missionProgress(mission, date, completions, words, inferences));
    const completed = progress >= mission.requirement;
    const idempotencyKey = `mission:${date}:${mission.id}`;
    return {
      ...mission,
      date,
      progress,
      completed,
      rewarded: events.some((event) => event.idempotencyKey === idempotencyKey),
    };
  });
}

export function awardCompletedMissions(date = localDate(), words: SavedWord[] = []): { awardedXp: number; completed: MissionStatus[] } {
  let awardedXp = 0;
  const completed: MissionStatus[] = [];
  for (const mission of getMissionStatuses(date, words)) {
    if (!mission.completed || mission.rewarded) continue;
    const result = addXpEvent({
      type: "mission_completed",
      relatedId: mission.id,
      xp: mission.xp,
      metadata: { date, title: mission.title },
      idempotencyKey: `mission:${date}:${mission.id}`,
    });
    if (result.awarded) {
      awardedXp += mission.xp;
      completed.push({ ...mission, rewarded: true });
    }
  }
  return { awardedXp, completed };
}

function completionDays(completions = getArticleCompletions(), events = getXpEvents()): Set<string> {
  const days = new Set(completions.map((item) => item.completedAt.slice(0, 10)));
  for (const event of events) {
    if (event.type === "word_review_success" || event.type === "mission_completed") days.add(event.createdAt.slice(0, 10));
  }
  return days;
}

export function currentStreak(days = completionDays(), today = localDate()): number {
  let streak = 0;
  let date = new Date(`${today}T12:00:00`);
  while (days.has(localDate(date))) {
    streak++;
    date = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  }
  return streak;
}

export function longestStreak(days = completionDays()): number {
  const sorted = [...days].sort();
  let longest = 0;
  let current = 0;
  let previous = "";
  for (const day of sorted) {
    const expected = previous ? localDate(new Date(new Date(`${previous}T12:00:00`).getTime() + 24 * 60 * 60 * 1000)) : "";
    current = previous && expected === day ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = day;
  }
  return longest;
}

function achievementProgress(id: string, completions: ArticleCompletionRecord[], words: SavedWord[], mastery: MasteryInfo[], streak: number): number {
  if (id === "first-article") return completions.length;
  if (id === "five-articles") return completions.length;
  if (id === "twenty-five-articles") return completions.length;
  if (id === "ten-thousand-words") return completions.reduce((sum, item) => sum + item.wordsRead, 0);
  if (id === "first-b2") return completions.some((item) => item.difficulty === "B2") ? 1 : 0;
  if (id === "all-topics") return new Set(completions.map((item) => item.category)).size;
  if (id === "perfect-comprehension") return completions.some((item) => item.comprehensionTotal > 0 && item.comprehensionCorrect === item.comprehensionTotal) ? 1 : 0;
  if (id === "master-ten") return mastery.filter((item) => item.stage === "mastered").length;
  if (id === "translation-restraint") return completions.some((item) => item.challengeCompleted) ? 1 : 0;
  if (id === "three-day-streak") return streak;
  if (id === "seven-day-streak") return streak;
  return words.length;
}

export function buildMastery(words: SavedWord[], taps: StoredWordTap[] = getAllWordTaps(), inferences: StoredInference[] = getAllInferenceResults()): MasteryInfo[] {
  const previous = readArray<{ word: string; stageIndex: number }>(MASTERY_KEY, (value): value is { word: string; stageIndex: number } => isRecord(value) && typeof value.word === "string" && typeof value.stageIndex === "number");
  const previousMap = new Map(previous.map((item) => [item.word, item.stageIndex]));
  const stages: MasteryStage[] = ["discovered", "learning", "recognised", "reliable", "mastered"];
  const mastery = words.map((word) => {
    const lemma = word.lemma?.toLowerCase();
    const contexts = new Set([
      ...taps.filter((tap) => tap.word === word.word || (!!lemma && tap.lemma?.toLowerCase() === lemma)).map((tap) => tap.articleId),
      word.sourceTextTitle,
    ].filter(Boolean)).size;
    const inferenceWins = inferences.filter((entry) => entry.correct && (entry.word === word.word || (!!lemma && entry.lemma?.toLowerCase() === lemma))).length;
    let stageIndex = 0;
    if ((word.reviewCount ?? 0) > 0 || contexts >= 2) stageIndex = 1;
    if ((word.correctCount ?? 0) >= 1 && contexts >= 2) stageIndex = 2;
    if ((word.correctCount ?? 0) >= 2 && contexts >= 3 && inferenceWins >= 1) stageIndex = 3;
    if ((word.correctCount ?? 0) >= 4 && contexts >= 4 && word.status === "known") stageIndex = 4;
    return {
      word,
      stage: stages[stageIndex],
      stageIndex,
      contexts,
      progress: (stageIndex + 1) / stages.length,
      advanced: stageIndex > (previousMap.get(word.word) ?? -1),
    };
  });
  persist(MASTERY_KEY, mastery.map((item) => ({ word: item.word.word, stageIndex: item.stageIndex })));
  return mastery;
}

export function buildAchievements(words: SavedWord[], mastery = buildMastery(words)): AchievementStatus[] {
  const completions = getArticleCompletions();
  const unlocked = new Map(getUnlockedAchievements().map((item) => [item.id, item.unlockedAt]));
  const streak = currentStreak();
  return ACHIEVEMENTS.map((achievement) => {
    const progress = Math.min(achievement.requirement, achievementProgress(achievement.id, completions, words, mastery, streak));
    const unlockedAt = unlocked.get(achievement.id) ?? null;
    return {
      ...achievement,
      progress,
      unlocked: !!unlockedAt || progress >= achievement.requirement,
      unlockedAt,
    };
  });
}

export function evaluateAndUnlockAchievements(words: SavedWord[] = []): AchievementStatus[] {
  const statuses = buildAchievements(words);
  const unlocked = getUnlockedAchievements();
  const unlockedIds = new Set(unlocked.map((item) => item.id));
  const now = new Date().toISOString();
  const newly = statuses.filter((item) => item.unlocked && !unlockedIds.has(item.id));
  if (newly.length > 0) {
    persist(ACHIEVEMENTS_KEY, [...newly.map((item) => ({ id: item.id, unlockedAt: now })), ...unlocked]);
    for (const achievement of newly) {
      addXpEvent({
        type: "achievement_unlocked",
        relatedId: achievement.id,
        xp: achievement.xp,
        metadata: { title: achievement.title },
        idempotencyKey: `achievement:${achievement.id}`,
        createdAt: now,
      });
    }
  }
  return buildAchievements(words);
}

export function buildTopicProgress(completions = getArticleCompletions()): TopicProgress[] {
  const categories: Category[] = ["news-style", "sport", "culture", "science", "everyday life"];
  return categories.map((category) => {
    const items = completions.filter((item) => item.category === category);
    const articlesCompleted = items.length;
    const words = items.reduce((sum, item) => sum + item.wordsRead, 0);
    const averageComprehension = Math.round(
      (items.reduce((sum, item) => sum + (item.comprehensionTotal ? item.comprehensionCorrect / item.comprehensionTotal : 0), 0) / Math.max(1, items.filter((item) => item.comprehensionTotal > 0).length)) * 100
    );
    const level = Math.max(1, Math.floor(words / 900) + Math.floor(articlesCompleted / 3) + 1);
    const nextWords = level * 900;
    return {
      category,
      label: CATEGORY_LABELS[category],
      level,
      progress: Math.min(1, words / nextWords),
      articlesCompleted,
      averageComprehension: Number.isFinite(averageComprehension) ? averageComprehension : 0,
      vocabularyCoverage: Math.min(98, 72 + articlesCompleted * 4),
      nextMilestone: `${Math.max(0, nextWords - words)} more words in ${CATEGORY_LABELS[category]}`,
    };
  });
}

export function buildCollections(words: SavedWord[], mastery = buildMastery(words)): VocabularyCollection[] {
  const mastered = new Set(mastery.filter((item) => item.stage === "mastered").map((item) => item.word.word));
  const definitions = [
    { id: "connectors", title: "Connectors", total: 30, match: (word: SavedWord) => ["selon", "pourtant", "cependant", "donc", "ainsi"].includes(word.lemma ?? word.word), description: "Words that hold arguments together." },
    { id: "news", title: "News vocabulary", total: 40, match: (word: SavedWord) => ["réforme", "hausse", "baisse", "objectif", "risque", "rapport"].includes(word.lemma ?? word.word), description: "Useful terms for general news." },
    { id: "sport", title: "Sport vocabulary", total: 30, match: (word: SavedWord) => word.sourceTextTitle.toLowerCase().includes("match") || word.partOfSpeech?.includes("sport"), description: "Competition, teams, results and form." },
    { id: "science", title: "Science vocabulary", total: 30, match: (word: SavedWord) => ["étude", "chercheur", "essai", "résultat", "risque"].includes(word.lemma ?? word.word), description: "Research, evidence and discovery." },
    { id: "opinion", title: "Opinion and argument", total: 30, match: (word: SavedWord) => ["critique", "soutenir", "dénoncer", "estimer"].includes(word.lemma ?? word.word), description: "Framing, stance and judgement." },
    { id: "verbs", title: "Common verbs", total: 60, match: (word: SavedWord) => (word.partOfSpeech ?? "").toLowerCase().includes("verb"), description: "High-value verbs across topics." },
    { id: "idioms", title: "Idioms and phrases", total: 25, match: (word: SavedWord) => (word.lemma ?? word.word).includes(" "), description: "Fixed expressions and reusable chunks." },
    { id: "culture", title: "Travel and culture", total: 35, match: (word: SavedWord) => word.sourceTextTitle.toLowerCase().includes("culture") || ["musée", "ville"].includes(word.lemma ?? word.word), description: "Places, culture and everyday movement." },
  ];
  return definitions.map((collection) => {
    const discoveredWords = words.filter(collection.match);
    const masteredCount = discoveredWords.filter((word) => mastered.has(word.word)).length;
    return {
      id: collection.id,
      title: collection.title,
      description: collection.description,
      discovered: discoveredWords.length,
      total: collection.total,
      mastered: masteredCount,
      percent: Math.round((discoveredWords.length / collection.total) * 100),
      nextSuggestion: discoveredWords[0]?.lemma ?? "Read a fresh article in this area",
    };
  });
}

export function buildPersonalBests(completions = getArticleCompletions()): PersonalBest[] {
  const longest = [...completions].sort((a, b) => b.wordsRead - a.wordsRead)[0];
  const bestScore = [...completions].sort((a, b) => b.score - a.score)[0];
  const strongestLevel = [...completions].sort((a, b) => ["A1", "A2", "B1", "B2"].indexOf(b.difficulty) - ["A1", "A2", "B1", "B2"].indexOf(a.difficulty))[0];
  const fewestTranslations = [...completions].filter((item) => item.challengeCompleted).sort((a, b) => a.translationsUsed - b.translationsUsed)[0];
  const dayWords = new Map<string, number>();
  for (const completion of completions) {
    const day = completion.completedAt.slice(0, 10);
    dayWords.set(day, (dayWords.get(day) ?? 0) + completion.wordsRead);
  }
  const mostWords = [...dayWords.entries()].sort((a, b) => b[1] - a[1])[0];
  return [
    { id: "longest", title: "Longest article", value: longest ? `${longest.wordsRead} words` : "No record yet", detail: longest?.title ?? "Complete an article to set this." },
    { id: "highest-level", title: "Highest level article", value: strongestLevel?.difficulty ?? "No record yet", detail: strongestLevel?.title ?? "Try a stretch read." },
    { id: "best-score", title: "Highest article score", value: bestScore ? `${bestScore.score}/100` : "No record yet", detail: bestScore?.title ?? "Finish an article to score it." },
    { id: "fewest-translations", title: "Fewest translations", value: fewestTranslations ? `${fewestTranslations.translationsUsed}` : "No record yet", detail: "Inside a completed challenge." },
    { id: "longest-streak", title: "Longest streak", value: `${longestStreak()} days`, detail: "Meaningful reading activity only." },
    { id: "most-words-day", title: "Most words in a day", value: mostWords ? `${mostWords[1]} words` : "No record yet", detail: mostWords?.[0] ?? "Read today to start." },
  ];
}

export function unlockPassportStamps(): PassportStamp[] {
  const completions = getArticleCompletions();
  const unlocked = getUnlockedPassport();
  const existing = new Set(unlocked.map((item) => item.id));
  const totalWords = completions.reduce((sum, item) => sum + item.wordsRead, 0);
  const stamps = [
    { id: "first-science", title: "First Science Article", description: "Complete a science article.", icon: "Sc", condition: completions.some((item) => item.category === "science") },
    { id: "first-b2-passport", title: "First B2 Article", description: "Complete an advanced article.", icon: "B2", condition: completions.some((item) => item.difficulty === "B2") },
    { id: "five-sources", title: "Five Sources", description: "Read across five different publications.", icon: "5S", condition: new Set(completions.map((item) => item.sourceName ?? item.title.split(" - ")[0])).size >= 5 },
    { id: "without-english", title: "Without English", description: "Complete an article without full translation.", icon: "Fr", condition: completions.some((item) => !item.fullTranslationUsed) },
    { id: "ten-k-passport", title: "10,000 Words", description: "Read 10,000 French words.", icon: "10k", condition: totalWords >= 10000 },
    { id: "all-topics-passport", title: "All Topics Explored", description: "Complete at least one article in every topic.", icon: "Map", condition: new Set(completions.map((item) => item.category)).size >= 5 },
  ];
  const now = new Date().toISOString();
  const newly = stamps.filter((stamp) => stamp.condition && !existing.has(stamp.id)).map((stamp) => ({ id: stamp.id, unlockedAt: now }));
  if (newly.length > 0) persist(PASSPORT_KEY, [...newly, ...unlocked]);
  const unlockedMap = new Map(getUnlockedPassport().map((item) => [item.id, item.unlockedAt]));
  return stamps.map((stamp) => ({
    id: stamp.id,
    title: stamp.title,
    description: stamp.description,
    icon: stamp.icon,
    unlocked: unlockedMap.has(stamp.id),
    unlockedAt: unlockedMap.get(stamp.id) ?? null,
  }));
}

export function buildActivityStrip(completions = getArticleCompletions()): { date: string; words: number; completed: boolean }[] {
  const out: { date: string; words: number; completed: boolean }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = localDate(new Date(now.getTime() - i * 24 * 60 * 60 * 1000));
    const items = completions.filter((completion) => completion.completedAt.slice(0, 10) === date);
    out.push({ date, words: items.reduce((sum, item) => sum + item.wordsRead, 0), completed: items.length > 0 });
  }
  return out;
}

export function buildProgressSnapshot(words: SavedWord[], archive: ArchiveEntry[] = []): ProgressSnapshot {
  const completions = getArticleCompletions();
  const events = getXpEvents();
  const mastery = buildMastery(words);
  const achievements = evaluateAndUnlockAchievements(words);
  const passport = unlockPassportStamps();
  const activityStrip = buildActivityStrip(completions);
  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekly = completions.filter((item) => new Date(item.completedAt).getTime() >= weekStart);
  const weeklyWords = weekly.reduce((sum, item) => sum + item.wordsRead, 0);
  const weeklyComprehensionAverage = Math.round(
    (weekly.reduce((sum, item) => sum + (item.comprehensionTotal ? item.comprehensionCorrect / item.comprehensionTotal : 0), 0) / Math.max(1, weekly.filter((item) => item.comprehensionTotal > 0).length)) * 100
  );
  const weeklyReviewed = words.filter((word) => word.lastReviewedAt && new Date(word.lastReviewedAt).getTime() >= weekStart).length;
  const translationsPer100Words = weeklyWords === 0 ? 0 : Math.round((weekly.reduce((sum, item) => sum + item.translationsUsed, 0) / weeklyWords) * 1000) / 10;
  void archive;
  return {
    level: levelFromXp(totalXp(events)),
    missions: getMissionStatuses(localDate(), words),
    completions,
    topicProgress: buildTopicProgress(completions),
    personalBests: buildPersonalBests(completions),
    achievements,
    passport,
    mastery,
    collections: buildCollections(words, mastery),
    currentStreak: currentStreak(),
    longestStreak: longestStreak(),
    weeklyWords,
    weeklyComprehensionAverage,
    weeklyReviewed,
    translationsPer100Words,
    activityStrip,
  };
}

export function quickChallengeForArticle(text: ReadingText): { prompt: string; choices: string[]; answer: string } {
  const choices = ["News", "Sport", "Culture", "Science", "Life"];
  const answer = CATEGORY_LABELS[text.category];
  return {
    prompt: "Before reading, what topic does this headline suggest?",
    choices,
    answer,
  };
}

export function readingWordsFromText(text: ReadingText): number {
  return countWords(text.body);
}

export function translationRecordsForToday(): number {
  return getTranslationBudgetRecords().filter((record) => record.completedAt.slice(0, 10) === localDate()).length;
}

export function clearGamificationStores(): void {
  persist(XP_EVENTS_KEY, []);
  persist(COMPLETIONS_KEY, []);
  persist(ACHIEVEMENTS_KEY, []);
  persist(PASSPORT_KEY, []);
  persist(MASTERY_KEY, []);
}
