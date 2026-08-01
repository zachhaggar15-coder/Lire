import { pushStore } from "@/lib/supabase/sync";

/**
 * Per-reading lookup-rate tracking: "how often did you open word help,
 * relative to how much you read". A support-use signal, not a comprehension
 * score — the UI must never claim otherwise.
 *
 * A "lookup event" is a word-help popup opening, counted once per completed
 * reading via the reader's own session counter (wordLookupCount), so repeat
 * taps on the same word within a session do count — each open is a real
 * moment the reader reached for help. "Words read" is the completed text's
 * own French word count. Only completed readings are recorded.
 */

const LOOKUP_STATS_KEY = "lire.lookupStats.v1";
const RECENT_WINDOW = 10;
const MIN_SAMPLE_FOR_AVERAGE = 3;

export interface LookupStatEntry {
  textId: string;
  wordCount: number;
  lookupEvents: number;
  completedAt: string;
  level: string;
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function isEntry(value: unknown): value is LookupStatEntry {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.textId === "string" &&
    typeof v.wordCount === "number" &&
    typeof v.lookupEvents === "number" &&
    typeof v.completedAt === "string" &&
    typeof v.level === "string"
  );
}

function readAll(): LookupStatEntry[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(LOOKUP_STATS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch {
    return [];
  }
}

function persist(entries: LookupStatEntry[]): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(LOOKUP_STATS_KEY, JSON.stringify(entries));
    void pushStore(LOOKUP_STATS_KEY);
  } catch {
    // A full quota shouldn't break finishing a lesson; this stat is a nicety.
  }
}

/** Rate in lookups per 100 words, rounded to one decimal place. Zero words → 0, not a division error. */
export function lookupRatePer100Words(lookupEvents: number, wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.round((lookupEvents / wordCount) * 100 * 10) / 10;
}

/** Records (or replaces) the lookup stat for a completed reading. Safe to call again on re-completion. */
export function recordLookupStat(entry: LookupStatEntry): void {
  const all = readAll().filter((e) => e.textId !== entry.textId);
  all.unshift(entry);
  persist(all.slice(0, 500));
}

export interface LookupRateSummary {
  thisText: number;
  /** null when there isn't yet enough history to show a meaningful average. */
  recentAverage: number | null;
  sampleSize: number;
}

/** This text's rate plus a rolling average over the most recent completed readings (excluding this one). */
export function summarizeLookupRate(textId: string, wordCount: number, lookupEvents: number): LookupRateSummary {
  const thisText = lookupRatePer100Words(lookupEvents, wordCount);
  const history = readAll()
    .filter((e) => e.textId !== textId)
    .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1))
    .slice(0, RECENT_WINDOW);
  if (history.length < MIN_SAMPLE_FOR_AVERAGE) {
    return { thisText, recentAverage: null, sampleSize: history.length };
  }
  const totalEvents = history.reduce((sum, e) => sum + e.lookupEvents, 0);
  const totalWords = history.reduce((sum, e) => sum + e.wordCount, 0);
  return { thisText, recentAverage: lookupRatePer100Words(totalEvents, totalWords), sampleSize: history.length };
}
