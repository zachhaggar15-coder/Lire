import type { Difficulty, TextProgress } from "@/types";
import { getArticleFeedback, type ArticleDifficultyFeedback } from "@/lib/articleFeedback";
import { estimateDifficulty } from "@/lib/difficulty";
import { getKnownWords } from "@/lib/knownWords";
import { getSelectedReadingLevel } from "@/lib/onboarding";
import { getProgress } from "@/lib/progress";
import { pushStore } from "@/lib/supabase/sync";
import {
  buildLadder,
  getJourneyText,
  getLadderText,
  JOURNEY_BANDS,
  type Stage,
} from "@/lib/journey/ladder";

export const JOURNEY_STORE_KEY = "lire.journey.v1";
export const STAGE_CLEAR_RATIO = 0.8;
export const COMFORT_MIN = 0.06;
export const COMFORT_MAX = 0.15;

export type StageStatus = "cleared" | "current" | "locked";

export interface StageProgress {
  stage: Stage;
  completedCount: number;
  skippedCount: number;
  targetCount: number;
  status: StageStatus;
  optional: boolean;
}

export interface JourneyState {
  currentStageIndex: number | null;
  currentBand: Difficulty | null;
  stages: StageProgress[];
  overallProgress: number;
  startStageIndex: number;
}

export interface NextTextRecommendation {
  textId: string;
  reason: string;
  unknownWordRatio: number;
  stageIndex: number;
  canJumpAhead: boolean;
  jumpStageIndex: number | null;
}

export interface JourneyStore {
  lastSeenStageIndex: number | null;
  skippedTextIds: string[];
  bandHoldAckAt?: string | null;
  updatedAt?: string;
}

interface JourneyStateOptions {
  selectedLevel?: Difficulty;
  progressById?: Record<string, Partial<TextProgress>>;
  skippedTextIds?: string[];
  knownWords?: Set<string>;
  feedbackByTextId?: Record<string, ArticleDifficultyFeedback>;
}

const EMPTY_STORE: JourneyStore = { lastSeenStageIndex: null, skippedTextIds: [] };
const UNREAD_PROGRESS: Partial<TextProgress> = { status: "unread" };

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readProgress(textId: string, progressById?: Record<string, Partial<TextProgress>>): Partial<TextProgress> {
  if (progressById) return progressById[textId] ?? UNREAD_PROGRESS;
  return getProgress(textId);
}

function stageTarget(stage: Stage, skippedIds: Set<string>): number {
  const available = stage.textIds.filter((id) => !skippedIds.has(id)).length;
  if (available === 0) return 0;
  return Math.max(1, Math.ceil(available * STAGE_CLEAR_RATIO));
}

function completedInStage(stage: Stage, progressById?: Record<string, Partial<TextProgress>>): number {
  return stage.textIds.filter((id) => readProgress(id, progressById).status === "completed").length;
}

function skippedInStage(stage: Stage, skippedIds: Set<string>): number {
  return stage.textIds.filter((id) => skippedIds.has(id)).length;
}

function isStageCleared(stage: Stage, skippedIds: Set<string>, progressById?: Record<string, Partial<TextProgress>>): boolean {
  return completedInStage(stage, progressById) >= stageTarget(stage, skippedIds);
}

function firstStageIndexForBand(level: Difficulty): number {
  const ladder = buildLadder();
  return Math.max(0, ladder.stages.findIndex((stage) => stage.band === level));
}

function readFeedbackMap(options?: JourneyStateOptions): Record<string, ArticleDifficultyFeedback> {
  if (options?.feedbackByTextId) return options.feedbackByTextId;
  return Object.fromEntries(getArticleFeedback().map((entry) => [entry.textId, entry.feedback]));
}

export function getJourneyStore(): JourneyStore {
  if (!hasStorage()) return { ...EMPTY_STORE };
  try {
    const raw = window.localStorage.getItem(JOURNEY_STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return { ...EMPTY_STORE };
    return {
      lastSeenStageIndex: typeof parsed.lastSeenStageIndex === "number" ? parsed.lastSeenStageIndex : null,
      skippedTextIds: Array.isArray(parsed.skippedTextIds) ? parsed.skippedTextIds.filter((id: unknown): id is string => typeof id === "string") : [],
      bandHoldAckAt: typeof parsed.bandHoldAckAt === "string" ? parsed.bandHoldAckAt : null,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : undefined,
    };
  } catch {
    return { ...EMPTY_STORE };
  }
}

function persistJourneyStore(next: JourneyStore): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(JOURNEY_STORE_KEY, JSON.stringify({ ...next, updatedAt: new Date().toISOString() }));
  void pushStore(JOURNEY_STORE_KEY);
}

export function markJourneyStageSeen(stageIndex: number | null): void {
  const current = getJourneyStore();
  persistJourneyStore({ ...current, lastSeenStageIndex: stageIndex });
}

export function skipJourneyText(textId: string): void {
  const current = getJourneyStore();
  const skipped = new Set(current.skippedTextIds);
  skipped.add(textId);
  persistJourneyStore({ ...current, skippedTextIds: [...skipped] });
}

export function skipJourneyTexts(textIds: string[]): void {
  const current = getJourneyStore();
  const skipped = new Set(current.skippedTextIds);
  textIds.forEach((id) => skipped.add(id));
  persistJourneyStore({ ...current, skippedTextIds: [...skipped] });
}

export function getJourneyState(options: JourneyStateOptions = {}): JourneyState {
  const ladder = buildLadder();
  const selectedLevel = options.selectedLevel ?? getSelectedReadingLevel();
  const guidedLevel = JOURNEY_BANDS.includes(selectedLevel) ? selectedLevel : "B2";
  const startStageIndex = firstStageIndexForBand(guidedLevel);
  const skippedIds = new Set(options.skippedTextIds ?? getJourneyStore().skippedTextIds);

  let currentStageIndex: number | null = null;
  for (const stage of ladder.stages) {
    if (stage.globalIndex < startStageIndex) continue;
    if (!isStageCleared(stage, skippedIds, options.progressById)) {
      currentStageIndex = stage.globalIndex;
      break;
    }
  }

  const stages: StageProgress[] = ladder.stages.map((stage) => {
    const optional = stage.globalIndex < startStageIndex;
    const completedCount = completedInStage(stage, options.progressById);
    const skippedCount = skippedInStage(stage, skippedIds);
    const targetCount = stageTarget(stage, skippedIds);
    const cleared = optional || completedCount >= targetCount;
    const status: StageStatus = cleared ? "cleared" : stage.globalIndex === currentStageIndex ? "current" : "locked";
    return { stage, completedCount, skippedCount, targetCount, status, optional };
  });

  const activeStages = stages.filter((stage) => !stage.optional);
  const completedTargets = activeStages.reduce((sum, stage) => sum + Math.min(stage.completedCount, stage.targetCount), 0);
  const totalTargets = activeStages.reduce((sum, stage) => sum + stage.targetCount, 0);

  return {
    currentStageIndex,
    currentBand: currentStageIndex == null ? null : ladder.stages[currentStageIndex]?.band ?? null,
    stages,
    overallProgress: totalTargets === 0 ? 1 : completedTargets / totalTargets,
    startStageIndex,
  };
}

function recentCompletedTextIds(options: JourneyStateOptions): string[] {
  const ladder = buildLadder();
  return ladder.texts
    .map((entry) => ({ entry, progress: readProgress(entry.id, options.progressById) }))
    .filter((item) => item.progress.status === "completed")
    .sort((a, b) => {
      const bTime = typeof b.progress.completedAt === "string" ? new Date(b.progress.completedAt).getTime() : 0;
      const aTime = typeof a.progress.completedAt === "string" ? new Date(a.progress.completedAt).getTime() : 0;
      if (bTime !== aTime) return bTime - aTime;
      return b.entry.globalStageIndex - a.entry.globalStageIndex;
    })
    .slice(0, 2)
    .map((item) => item.entry.id);
}

function paceSignal(options: JourneyStateOptions): "flying" | "hold" | "normal" {
  const feedback = readFeedbackMap(options);
  const knownWords = options.knownWords ?? new Set(getKnownWords());
  const recent = recentCompletedTextIds(options);
  if (recent.length < 2) return "normal";

  const allTooEasy = recent.every((id) => feedback[id] === "too-easy");
  const anyHard = recent.some((id) => feedback[id] === "hard");
  const estimates = recent
    .map(getJourneyText)
    .filter((text): text is NonNullable<ReturnType<typeof getJourneyText>> => text !== null)
    .map((text) => estimateDifficulty(text.body, knownWords));
  const highCoverage = estimates.length === recent.length && estimates.every((estimate) => estimate.dictionaryCoverage > 0.94);
  const lowCoverage = estimates.some((estimate) => estimate.dictionaryCoverage < 0.8);

  if (anyHard || lowCoverage) return "hold";
  if (allTooEasy || highCoverage) return "flying";
  return "normal";
}

export function getNextTextForReader(options: JourneyStateOptions = {}): NextTextRecommendation | null {
  const ladder = buildLadder();
  const state = getJourneyState(options);
  if (state.currentStageIndex == null) return null;

  const stage = ladder.stages[state.currentStageIndex];
  const skippedIds = new Set(options.skippedTextIds ?? getJourneyStore().skippedTextIds);
  const knownWords = options.knownWords ?? new Set(getKnownWords());
  const pace = paceSignal(options);

  const candidates = stage.textIds
    .filter((id) => readProgress(id, options.progressById).status !== "completed" && !skippedIds.has(id))
    .map((id) => {
      const text = getJourneyText(id);
      const ladderText = getLadderText(id);
      const estimate = text ? estimateDifficulty(text.body, knownWords) : null;
      return {
        id,
        estimate,
        intrinsicDifficulty: ladderText?.intrinsicDifficulty ?? 0,
        order: stage.textIds.indexOf(id),
      };
    })
    .filter((candidate) => candidate.estimate !== null);

  if (candidates.length === 0) return null;

  const comfortMiddle = (COMFORT_MIN + COMFORT_MAX) / 2;
  const comfortCandidates = candidates.filter(
    (candidate) => candidate.estimate!.unknownWordRatio >= COMFORT_MIN && candidate.estimate!.unknownWordRatio <= COMFORT_MAX
  );

  const ordered =
    pace === "hold"
      ? [...candidates].sort((a, b) => a.estimate!.unknownWordRatio - b.estimate!.unknownWordRatio || a.order - b.order)
      : [...(comfortCandidates.length > 0 ? comfortCandidates : candidates)].sort(
          (a, b) =>
            Math.abs(a.estimate!.unknownWordRatio - comfortMiddle) - Math.abs(b.estimate!.unknownWordRatio - comfortMiddle) ||
            a.order - b.order
        );

  const picked = ordered[0];
  const nextStage = ladder.stages[state.currentStageIndex + 1] ?? null;
  const currentProgress = state.stages.find((stageProgress) => stageProgress.stage.globalIndex === state.currentStageIndex);
  const canJumpAhead = pace === "flying" && nextStage !== null && (currentProgress?.completedCount ?? 0) > 0;
  let reason = "a good stretch for you";
  if (pace === "hold") reason = "easing back a little";
  else if (canJumpAhead) reason = "you are flying - jump ahead is open";
  else if (picked.estimate!.unknownWordRatio < COMFORT_MIN) reason = "comfortable practice";
  else if (picked.estimate!.unknownWordRatio > COMFORT_MAX) reason = "the gentlest stretch here";

  return {
    textId: picked.id,
    reason,
    unknownWordRatio: picked.estimate!.unknownWordRatio,
    stageIndex: state.currentStageIndex,
    canJumpAhead,
    jumpStageIndex: canJumpAhead ? nextStage.globalIndex : null,
  };
}
