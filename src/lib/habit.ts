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
const GRACE_KEY = "lire.streakGrace.v1";
/** Keep this bounded — a streak only ever needs to look back a bit further than the longest realistic streak. */
const MAX_STORED_DATES = 400;

interface StreakGraceRecord {
  weekKey: string;
  recoveredDateKey: string;
  usedAt: string;
}

export interface StreakGraceStatus {
  available: boolean;
  usedThisWeek: boolean;
  eligibleDateKey: string;
  recoveredDateKey: string | null;
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function dateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function weekKey(date: Date = new Date()): string {
  const mondayOffset = (date.getDay() + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - mondayOffset);
  return dateKey(monday);
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

function getGraceRecord(): StreakGraceRecord | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(GRACE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as Partial<StreakGraceRecord>;
    if (
      typeof record.weekKey !== "string" ||
      typeof record.recoveredDateKey !== "string" ||
      typeof record.usedAt !== "string"
    ) {
      return null;
    }
    return {
      weekKey: record.weekKey,
      recoveredDateKey: record.recoveredDateKey,
      usedAt: record.usedAt,
    };
  } catch {
    return null;
  }
}

function persistGraceRecord(record: StreakGraceRecord): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(GRACE_KEY, JSON.stringify(record));
  void pushStore(GRACE_KEY);
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

/** Has a meaningful action already been recorded for today? Drives the "you've read today" state of the streak flame. */
export function isActiveToday(now: Date = new Date()): boolean {
  return new Set(getActivityDates()).has(dateKey(now));
}

export function getStreakGraceStatus(now: Date = new Date()): StreakGraceStatus {
  const dates = new Set(getActivityDates());
  const currentWeekKey = weekKey(now);
  const graceRecord = getGraceRecord();
  const usedThisWeek = graceRecord?.weekKey === currentWeekKey;
  const eligibleDateKey = dateKey(addDays(now, -1));
  const bridgeFromDateKey = dateKey(addDays(now, -2));
  const canBridgeOneMissedDay = dates.has(bridgeFromDateKey) && !dates.has(eligibleDateKey);

  return {
    available: !usedThisWeek && canBridgeOneMissedDay,
    usedThisWeek,
    eligibleDateKey,
    recoveredDateKey: usedThisWeek && graceRecord ? graceRecord.recoveredDateKey : null,
  };
}

export function applyStreakGraceDay(now: Date = new Date()): boolean {
  if (!hasStorage()) return false;
  const status = getStreakGraceStatus(now);
  if (!status.available) return false;

  const dates = [...new Set([...getActivityDates(), status.eligibleDateKey])].sort();
  persist(dates);
  persistGraceRecord({
    weekKey: weekKey(now),
    recoveredDateKey: status.eligibleDateKey,
    usedAt: now.toISOString(),
  });
  return true;
}

export interface StreakDay {
  dateKey: string;
  /** Single-letter weekday label (Mon-first), e.g. "M", "T", "W". */
  weekdayLabel: string;
  active: boolean;
  isToday: boolean;
  isFuture: boolean;
}

/**
 * The seven days of the current week (Monday-first), each flagged with whether
 * it had activity — the row of day circles under the streak flame, the way
 * Duolingo shows the week at a glance. Keyed to the same activity log the
 * streak count uses, so the flames and the number never disagree.
 */
export function getStreakWeek(now: Date = new Date()): StreakDay[] {
  const active = new Set(getActivityDates());
  const todayKey = dateKey(now);
  const mondayOffset = (now.getDay() + 6) % 7; // getDay(): 0 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);

  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const week: StreakDay[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const key = dateKey(day);
    week.push({
      dateKey: key,
      weekdayLabel: labels[i],
      active: active.has(key),
      isToday: key === todayKey,
      isFuture: key > todayKey,
    });
  }
  return week;
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
