import type { Category, Difficulty } from "@/types";
import { nudgeTopicPreference } from "@/lib/recommendation/interests";
import { pushStore } from "@/lib/supabase/sync";

export const ONBOARDING_KEY = "lire.onboarding.v1";

export interface OnboardingState {
  completed: boolean;
  level: Difficulty;
  topics: Category[];
  updatedAt: string;
}

const DEFAULT_LEVEL: Difficulty = "A2";

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

export function saveOnboarding(level: Difficulty, topics: Category[]): OnboardingState {
  const next: OnboardingState = {
    completed: true,
    level,
    topics,
    updatedAt: new Date().toISOString(),
  };

  if (hasStorage()) {
    window.localStorage.setItem(ONBOARDING_KEY, JSON.stringify(next));
    void pushStore(ONBOARDING_KEY);
  }

  for (const topic of topics) {
    nudgeTopicPreference(topic, 0.35);
  }

  return next;
}

export function skipOnboarding(): OnboardingState {
  return saveOnboarding(DEFAULT_LEVEL, []);
}
