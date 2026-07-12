import type { Category, Difficulty } from "@/types";
import { nudgeTopicPreference } from "@/lib/recommendation/interests";
import { pushStore } from "@/lib/supabase/sync";
import { saveGoals, type ReadingGoals } from "@/lib/goals";
import { knownWordEstimateForLevel, seedKnownWordsForLevel } from "@/lib/knownWordBootstrap";

export const ONBOARDING_KEY = "lire.onboarding.v1";

export interface OnboardingState {
  completed: boolean;
  level: Difficulty;
  topics: Category[];
  goalPreset?: OnboardingGoal;
  estimatedKnownWords: number;
  seededKnownWords: number;
  updatedAt: string;
}

const DEFAULT_LEVEL: Difficulty = "A2";
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
};

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getOnboardingState(): OnboardingState | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(ONBOARDING_KEY);
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
          : knownWordEstimateForLevel(parsed.level ?? DEFAULT_LEVEL),
      seededKnownWords: typeof parsed.seededKnownWords === "number" ? parsed.seededKnownWords : 0,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export function getOnboardingLevelNumeric(): number | null {
  const state = getOnboardingState();
  return state?.completed ? LEVEL_NUMERIC[state.level] ?? null : null;
}

export function saveOnboarding(
  level: Difficulty,
  topics: Category[],
  goalPreset?: OnboardingGoal,
  options: { seedKnownWords?: boolean } = {}
): OnboardingState {
  const shouldSeedKnownWords = options.seedKnownWords ?? true;
  const seed = shouldSeedKnownWords
    ? seedKnownWordsForLevel(level)
    : {
        estimatedKnownWords: knownWordEstimateForLevel(level),
        seededWords: 0,
      };
  const next: OnboardingState = {
    completed: true,
    level,
    topics,
    goalPreset,
    estimatedKnownWords: seed.estimatedKnownWords,
    seededKnownWords: seed.seededWords,
    updatedAt: new Date().toISOString(),
  };

  if (hasStorage()) {
    window.localStorage.setItem(ONBOARDING_KEY, JSON.stringify(next));
    void pushStore(ONBOARDING_KEY);
  }

  for (const topic of topics) {
    nudgeTopicPreference(topic, 0.35);
  }

  if (goalPreset) saveGoals(GOAL_PRESETS[goalPreset]);

  return next;
}

export function skipOnboarding(): OnboardingState {
  return saveOnboarding(DEFAULT_LEVEL, [], undefined, { seedKnownWords: false });
}
