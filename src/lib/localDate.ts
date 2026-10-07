/**
 * The learner's calendar day, in their own timezone. Streaks, the streak week,
 * streak recovery, daily missions and the daily save limit all use these, so
 * activity at 00:10 counts for the new day and 23:50 for the old one.
 *
 * (`toISOString().slice(0, 10)` is the UTC date: in the UK in summer it filed
 * anything between midnight and 01:00 under the previous day.)
 */
export function localDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** The local calendar day of a stored ISO timestamp. */
export function localDateKeyOf(timestamp: string): string {
  return localDateKey(new Date(timestamp));
}

/** Moves by calendar days (DST-safe: a day is not assumed to be 24 hours). */
export function addLocalDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}
