/**
 * Lightweight daily-activity log, the basis for the home page's streak.
 * Deliberately separate from progress/saved-words/review data: a streak
 * needs one unified "did *something* meaningful today" signal, and this is
 * the cheapest robust way to get it — record today's date key whenever a
 * meaningful action happens (completing an article, saving a word,
 * answering a review), then count consecutive days backward from today.
 */

import { pushStore } from "@/lib/supabase/sync";

const KEY = "lire.activityDates.v1";
/** Keep this bounded — a streak only ever needs to look back a bit further than the longest realistic streak. */
const MAX_STORED_DATES = 400;

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function dateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getActivityDates(): string[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((d): d is string => typeof d === "string") : [];
  } catch {
    return [];
  }
}

function persist(dates: string[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(KEY, JSON.stringify(dates.slice(-MAX_STORED_DATES)));
  void pushStore(KEY);
}

/** Call this from any "meaningful action" (save a word, complete an article, answer a review). Idempotent per day. */
export function recordActivityToday(): void {
  if (!hasStorage()) return;
  const dates = getActivityDates();
  const key = dateKey();
  if (dates[dates.length - 1] === key) return; // already recorded today (dates are appended in order)
  if (dates.includes(key)) return; // defensive, in case of any out-of-order writes
  persist([...dates, key]);
}

/**
 * Consecutive days of activity ending today (or, if today has no activity
 * *yet*, ending yesterday — so the streak doesn't visually reset to 0 the
 * moment a new day starts before the reader has done anything).
 */
export function getCurrentStreak(now: Date = new Date()): number {
  const dates = new Set(getActivityDates());
  const cursor = new Date(now);
  if (!dates.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (dates.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getLongestStreak(): number {
  const sorted = [...new Set(getActivityDates())].sort();
  let longest = 0;
  let current = 0;
  let previous: Date | null = null;

  for (const key of sorted) {
    const date = new Date(`${key}T00:00:00.000Z`);
    if (!Number.isFinite(date.getTime())) continue;

    if (!previous) {
      current = 1;
    } else {
      const diffDays = Math.round((date.getTime() - previous.getTime()) / (24 * 60 * 60 * 1000));
      current = diffDays === 1 ? current + 1 : 1;
    }
    longest = Math.max(longest, current);
    previous = date;
  }

  return longest;
}
