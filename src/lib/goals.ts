import { getSavedWords } from "@/lib/storage";
import { getArchive, estimateTimeSpentMinutes } from "@/lib/archive";
import { dateKey } from "@/lib/habit";

/**
 * Simple, localStorage-only reading goals — no Supabase, no accounts. Each
 * goal is optional (null = "not set"); progress is always computed fresh
 * from existing data sources (saved words, archive, review results) rather
 * than tracked separately, so there's nothing extra to keep in sync.
 */
export interface ReadingGoals {
  minutesPerDay: number | null;
  articlesPerDay: number | null;
  newWordsPerWeek: number | null;
  flashcardsPerDay: number | null;
}

export const DEFAULT_GOALS: ReadingGoals = {
  minutesPerDay: 5,
  articlesPerDay: 1,
  newWordsPerWeek: 10,
  flashcardsPerDay: 20,
};

const KEY = "lire.goals.v1";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getGoals(): ReadingGoals {
  if (!hasStorage()) return DEFAULT_GOALS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_GOALS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_GOALS, ...parsed };
  } catch {
    return DEFAULT_GOALS;
  }
}

export function saveGoals(patch: Partial<ReadingGoals>): ReadingGoals {
  const next = { ...getGoals(), ...patch };
  if (hasStorage()) window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export interface GoalsProgress {
  minutesToday: number;
  articlesToday: number;
  newWordsThisWeek: number;
  flashcardsToday: number;
}

/** Computes today's/this-week's progress against each goal from existing data — nothing is tracked specially for this. */
export function getGoalsProgress(now: Date = new Date()): GoalsProgress {
  const today = dateKey(now);
  const weekAgoMs = now.getTime() - 7 * 24 * 60 * 60 * 1000;

  const archive = getArchive();
  const completedToday = archive.filter((entry) => dateKey(new Date(entry.completedAt)) === today);
  const minutesToday = completedToday.reduce((sum, entry) => sum + (estimateTimeSpentMinutes(entry) ?? entry.minutes ?? 0), 0);

  const words = getSavedWords();
  const newWordsThisWeek = words.filter((w) => new Date(w.savedAt).getTime() >= weekAgoMs).length;
  const flashcardsToday = words.filter((w) => w.lastReviewedAt && dateKey(new Date(w.lastReviewedAt)) === today).length;

  return {
    minutesToday: Math.round(minutesToday),
    articlesToday: completedToday.length,
    newWordsThisWeek,
    flashcardsToday,
  };
}
