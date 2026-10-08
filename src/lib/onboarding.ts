import type { Category, Difficulty } from "@/types";
import { nudgeTopicPreference } from "@/lib/recommendation/interests";
import { notifyRecommendationPreferencesChanged } from "@/lib/recommendation/preferences";
import { notifyStoreChanged } from "@/lib/sync/runtime";
import { saveGoals, type ReadingGoals } from "@/lib/goals";
import { vocabularyEstimateForLevel } from "@/lib/vocabulary/levelEstimates";
import { localStore } from "@/lib/localData/store";

export const ONBOARDING_KEY = "lire.onboarding.v1";

export interface OnboardingState {
  completed: boolean;
  level: Difficulty;
  topics: Category[];
  goalPreset?: OnboardingGoal;
  /** Typical vocabulary size for the level — an estimate, see vocabulary/estimatedVocabulary.ts. */
  estimatedKnownWords: number;
  /** Legacy: how many lemmas older builds seeded into lire.knownWords.v1. Nothing seeds now. */
  seededKnownWords: number;
  updatedAt: string;
  /** Whether the interactive walkthrough (tap/save/audio/practice demo) has been finished or explicitly skipped — separate from `completed`, which only covers the level/topic/goal picker. */
  walkthroughCompleted: boolean;
  /** Which walkthrough step to resume at if the app was closed mid-walkthrough. Null once completed/skipped, or if never started. */
  walkthroughStep: number | null;
  /**
   * True only after "Replay the tutorial". First run no longer includes the
   * tour: new learners go from choosing a level straight into a reading, and
   * each interaction is explained the first time it matters.
   */
  walkthroughReplay?: boolean;
}

const DEFAULT_LEVEL: Difficulty = "A1";
export type OnboardingGoal = "light" | "steady" | "serious";

const GOAL_PRESETS: Record<OnboardingGoal, Partial<ReadingGoals>> = {
  light: { minutesPerDay: 5, articlesPerDay: 1, newWordsPerWeek: 5, flashcardsPerDay: 10 },
  steady: { minutesPerDay: 10, articlesPerDay: 1, newWordsPerWeek: 15, flashcardsPerDay: 20 },
  serious: { minutesPerDay: 20, articlesPerDay: 2, newWordsPerWeek: 30, flashcardsPerDay: 35 },
};

const LEVEL_NUMERIC: Record<Difficulty, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getOnboardingState(): OnboardingState | null {
  if (!hasStorage()) return null;
  try {
    const raw = localStore.getItem(ONBOARDING_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      completed: parsed.completed === true,
      level: parsed.level ?? DEFAULT_LEVEL,
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      goalPreset:
        parsed.goalPreset === "light" || parsed.goalPreset === "steady" || parsed.goalPreset === "serious"
          ? parsed.goalPreset
          : undefined,
      estimatedKnownWords:
        typeof parsed.estimatedKnownWords === "number"
          ? parsed.estimatedKnownWords
          : vocabularyEstimateForLevel(parsed.level ?? DEFAULT_LEVEL),
      seededKnownWords: typeof parsed.seededKnownWords === "number" ? parsed.seededKnownWords : 0,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString(),
      walkthroughCompleted: parsed.walkthroughCompleted === true,
      walkthroughStep: typeof parsed.walkthroughStep === "number" ? parsed.walkthroughStep : null,
      walkthroughReplay: parsed.walkthroughReplay === true,
    };
  } catch {
    return null;
  }
}

export function getOnboardingLevelNumeric(): number | null {
  const state = getOnboardingState();
  return state?.completed ? LEVEL_NUMERIC[state.level] ?? null : null;
}

export function getSelectedReadingLevel(): Difficulty {
  return getOnboardingState()?.level ?? DEFAULT_LEVEL;
}

/**
 * Records the starting point. The level informs difficulty and
 * recommendations through an estimate computed from it on demand
 * (vocabulary/estimatedVocabulary.ts); it no longer seeds hundreds or
 * thousands of "known" words, which the reader then treated as words the
 * learner had individually marked.
 */
export function saveOnboarding(
  level: Difficulty,
  topics: Category[],
  goalPreset?: OnboardingGoal
): OnboardingState {
  const next: OnboardingState = {
    completed: true,
    level,
    topics,
    goalPreset,
    estimatedKnownWords: vocabularyEstimateForLevel(level),
    seededKnownWords: 0,
    updatedAt: new Date().toISOString(),
    walkthroughCompleted: true,
    walkthroughStep: null,
  };

  if (hasStorage()) {
    localStore.setItem(ONBOARDING_KEY, JSON.stringify(next));
    notifyStoreChanged(ONBOARDING_KEY);
    notifyRecommendationPreferencesChanged();
  }

  for (const topic of topics) {
    nudgeTopicPreference(topic, 0.35);
  }

  if (goalPreset) saveGoals(GOAL_PRESETS[goalPreset]);

  return next;
}

/**
 * A daily goal, chosen after the first reading rather than at sign-up (it is
 * offered once on the completion screen and can be declined).
 */
export function setGoalPreset(goal: OnboardingGoal): void {
  const current = getOnboardingState();
  if (!current || !hasStorage()) return;
  localStore.writeItem(ONBOARDING_KEY, JSON.stringify({ ...current, goalPreset: goal, updatedAt: new Date().toISOString() }));
  notifyStoreChanged(ONBOARDING_KEY);
  saveGoals(GOAL_PRESETS[goal]);
}

export function updateSelectedReadingLevel(level: Difficulty): OnboardingState {
  const current = getOnboardingState();
  const next: OnboardingState = {
    completed: true,
    level,
    topics: current?.topics ?? [],
    goalPreset: current?.goalPreset,
    estimatedKnownWords: vocabularyEstimateForLevel(level),
    seededKnownWords: current?.seededKnownWords ?? 0,
    updatedAt: new Date().toISOString(),
    walkthroughCompleted: current?.walkthroughCompleted ?? false,
    walkthroughStep: current?.walkthroughStep ?? null,
  };

  if (hasStorage()) {
    localStore.setItem(ONBOARDING_KEY, JSON.stringify(next));
    notifyStoreChanged(ONBOARDING_KEY);
    notifyRecommendationPreferencesChanged();
  }

  return next;
}

export function skipOnboarding(): OnboardingState {
  return saveOnboarding("A2", []);
}

/** Persists which walkthrough step to resume at — called on every step transition so closing the app mid-walkthrough resumes rather than restarting. Touches only the walkthrough fields. */
export function saveWalkthroughStep(step: number | null): void {
  const current = getOnboardingState();
  if (!current || !hasStorage()) return;
  localStore.writeItem(ONBOARDING_KEY, JSON.stringify({ ...current, walkthroughStep: step, updatedAt: new Date().toISOString() }));
  notifyStoreChanged(ONBOARDING_KEY);
}

/** Marks the walkthrough finished (naturally, or via skip) — never shown again until resetWalkthrough is called. */
export function completeWalkthrough(): void {
  const current = getOnboardingState();
  if (!current || !hasStorage()) return;
  localStore.writeItem(
    ONBOARDING_KEY,
    JSON.stringify({ ...current, walkthroughCompleted: true, walkthroughStep: null, walkthroughReplay: false, updatedAt: new Date().toISOString() })
  );
  notifyStoreChanged(ONBOARDING_KEY);
  notifyRecommendationPreferencesChanged();
}

/**
 * Restarts the tutorial from Settings. Touches ONLY the walkthrough flag —
 * critically, never resets `completed` (the level/topic/goal picker) and
 * never touches any other store (saved words, progress, session history).
 * Restarting the tutorial must never erase learning data.
 */
export function resetWalkthrough(): void {
  const current = getOnboardingState();
  if (!current || !hasStorage()) return;
  localStore.writeItem(
    ONBOARDING_KEY,
    JSON.stringify({ ...current, walkthroughCompleted: false, walkthroughStep: null, walkthroughReplay: true, updatedAt: new Date().toISOString() })
  );
  notifyStoreChanged(ONBOARDING_KEY);
  notifyRecommendationPreferencesChanged();
}
