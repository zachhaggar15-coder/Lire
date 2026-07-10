import type { Category } from "@/types";
import type { InterestProfile } from "@/lib/recommendation/types";
import { getProgress } from "@/lib/progress";
import { dateKey } from "@/lib/habit";
import { pushStore } from "@/lib/supabase/sync";

/**
 * Automatically-learned topic interest profile — no onboarding, no explicit
 * "pick your interests" screen. Every completed article nudges its
 * category up slightly; every article shown but never opened (it rotated
 * out of the daily selection unread) nudges it down slightly. This feeds
 * the recommendation engine's topic-preference signal — see
 * src/lib/recommendation/signals.ts.
 */

const PROFILE_KEY = "lire.interestProfile.v1";
const LAST_SHOWN_KEY = "lire.recommendation.lastShown.v1";

const ALL_CATEGORIES: Category[] = ["news-style", "sport", "culture", "science", "everyday life"];

const COMPLETE_BOOST = 0.12;
const SKIP_PENALTY = 0.05;
const MIN_SCORE = -1;
const MAX_SCORE = 1;

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function clamp(value: number): number {
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, value));
}

function emptyProfile(): InterestProfile {
  const profile = {} as InterestProfile;
  for (const category of ALL_CATEGORIES) profile[category] = 0;
  return profile;
}

export function getInterestProfile(): InterestProfile {
  if (!hasStorage()) return emptyProfile();
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const profile = emptyProfile();
    if (parsed && typeof parsed === "object") {
      for (const category of ALL_CATEGORIES) {
        if (typeof parsed[category] === "number") profile[category] = clamp(parsed[category]);
      }
    }
    return profile;
  } catch {
    return emptyProfile();
  }
}

function persist(profile: InterestProfile): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  void pushStore(PROFILE_KEY);
}

export function nudgeTopicPreference(category: Category, amount: number): void {
  const profile = getInterestProfile();
  profile[category] = clamp(profile[category] + amount);
  persist(profile);
}

/** Call when a reader marks an article completed — see Reader.tsx's handleMarkCompleted. */
export function recordArticleCompleted(category: Category): void {
  nudgeTopicPreference(category, COMPLETE_BOOST);
}

/** Call when an article was shown but never opened before rotating out — see detectAndRecordSkippedArticles below. */
export function recordArticleSkipped(category: Category): void {
  nudgeTopicPreference(category, -SKIP_PENALTY);
}

/** Maps a stored -1..1 interest score to a 0..1 preference score for the ranking engine. */
export function getTopicPreferenceScore(category: Category, profile: InterestProfile = getInterestProfile()): number {
  const raw = profile[category] ?? 0;
  return (raw - MIN_SCORE) / (MAX_SCORE - MIN_SCORE);
}

interface LastShownEntry {
  id: string;
  category: Category;
}

/**
 * Compares today's daily selection against whatever was shown last time,
 * recording a skip for anything that rotated out while still unread — then
 * remembers today's selection for tomorrow's comparison. Call this once
 * per home-page load with the current day's articles; it no-ops if it's
 * already been run for today's date (safe to call on every load).
 */
export function detectAndRecordSkippedArticles(todayItems: LastShownEntry[]): void {
  if (!hasStorage()) return;
  const today = dateKey();

  let stored: { dateKey: string; items: LastShownEntry[] } | null = null;
  try {
    const raw = window.localStorage.getItem(LAST_SHOWN_KEY);
    stored = raw ? JSON.parse(raw) : null;
  } catch {
    stored = null;
  }

  if (stored && stored.dateKey !== today) {
    for (const item of stored.items) {
      if (getProgress(item.id).status === "unread") {
        recordArticleSkipped(item.category);
      }
    }
  }

  if (!stored || stored.dateKey !== today) {
    window.localStorage.setItem(LAST_SHOWN_KEY, JSON.stringify({ dateKey: today, items: todayItems }));
  }
}
