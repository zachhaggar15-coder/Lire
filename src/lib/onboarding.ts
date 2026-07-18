import type { Category, Difficulty } from "@/types";
import { nudgeTopicPreference } from "@/lib/recommendation/interests";
import { notifyRecommendationPreferencesChanged } from "@/lib/recommendation/preferences";
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
  C1: 5,
  C2: 6,
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

export function getSelectedReadingLevel(): Difficulty {
  return getOnboardingState()?.level ?? DEFAULT_LEVEL;
}

/** Writes back just the seeded-word count once background seeding finishes. */
function recordSeededKnownWords(seededWords: number): void {
  if (!hasStorage()) return;
  const current = getOnboardingState();
  if (!current) return;
  try {
    window.localStorage.setItem(ONBOARDING_KEY, JSON.stringify({ ...current, seededKnownWords: seededWords }));
    void pushStore(ONBOARDING_KEY);
  } catch {
    // The seeded count is informational; known words themselves are already saved.
  }
  // The dashboard rendered its counts before this finished, so it's still
  // showing "0 known". Nudge subscribed screens to re-read.
  notifyRecommendationPreferencesChanged();
}

/**
 * Stays synchronous even though known-word seeding is now async (the broad
 * dictionary it needs is fetched on demand rather than bundled — see
 * data/dictionaries/generated/fr-en-generated.ts). Onboarding finishes
 * immediately and the seeding lands in the background a moment later, which
 * is also the better interaction: "Save start point" shouldn't sit there
 * waiting on a multi-megabyte download before letting anyone read.
 */
export function saveOnboarding(
  level: Difficulty,
  topics: Category[],
  goalPreset?: OnboardingGoal,
  options: { seedKnownWords?: boolean } = {}
): OnboardingState {
  const shouldSeedKnownWords = options.seedKnownWords ?? true;
  const next: OnboardingState = {
    completed: true,
    level,
    topics,
    goalPreset,
    estimatedKnownWords: knownWordEstimateForLevel(level),
    seededKnownWords: 0,
    updatedAt: new Date().toISOString(),
  };

  if (hasStorage()) {
    window.localStorage.setItem(ONBOARDING_KEY, JSON.stringify(next));
    void pushStore(ONBOARDING_KEY);
  }

  if (shouldSeedKnownWords) {
    void seedKnownWordsForLevel(level)
      .then((seed) => recordSeededKnownWords(seed.seededWords))
      .catch(() => {
        // Seeding is an optimisation for recommendations, not a hard requirement.
      });
  }

  for (const topic of topics) {
    nudgeTopicPreference(topic, 0.35);
  }

  if (goalPreset) saveGoals(GOAL_PRESETS[goalPreset]);

  return next;
}

export function updateSelectedReadingLevel(level: Difficulty): OnboardingState {
  const current = getOnboardingState();
  const next: OnboardingState = {
    completed: true,
    level,
    topics: current?.topics ?? [],
    goalPreset: current?.goalPreset,
    estimatedKnownWords: knownWordEstimateForLevel(level),
    seededKnownWords: current?.seededKnownWords ?? 0,
    updatedAt: new Date().toISOString(),
  };

  if (hasStorage()) {
    window.localStorage.setItem(ONBOARDING_KEY, JSON.stringify(next));
    void pushStore(ONBOARDING_KEY);
  }

  return next;
}

export function skipOnboarding(): OnboardingState {
  return saveOnboarding(DEFAULT_LEVEL, [], undefined, { seedKnownWords: false });
}
