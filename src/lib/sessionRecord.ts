import { pushStore } from "@/lib/supabase/sync";
import type { EstimatedCefr } from "@/lib/difficulty";

/**
 * Longitudinal per-text reading diagnostics — the richer record the old
 * lookupStats.ts (still in place, still read by nothing new) never carried:
 * unique (lemma-deduplicated) lookups alongside raw lookup actions, active
 * reading time, and per-exercise-type practice accuracy. One row per text,
 * replaced on re-completion — same convention as lookupStats.ts/archive.ts.
 *
 * Versioned from day one (schemaVersion) so a future field addition can
 * migrate old rows in readAll() instead of crashing on them. There is no
 * backfill from older stores (lookupStats.ts/archive.ts/gamification.ts):
 * they don't carry enough fields to reconstruct a real SessionRecord, so
 * texts completed before this shipped simply aren't in this store — callers
 * must handle "not enough data yet" rather than inventing history.
 */

export const SESSION_RECORD_SCHEMA_VERSION = 1;
const SESSION_RECORDS_KEY = "lire.sessionRecords.v1";
const MAX_RECORDS = 500;

export type SessionSourceType = "curriculum" | "rss" | "imported";
export type SessionCompletionStatus = "completed" | "abandoned" | "returned";
export type PracticeExerciseType = "reconstruction" | "clozeWord" | "clozePhrase" | "paraphrase" | "inference";

export interface PracticeTypeStats {
  attempted: number;
  correct: number;
}

function emptyPracticeStats(): Record<PracticeExerciseType, PracticeTypeStats> {
  return {
    reconstruction: { attempted: 0, correct: 0 },
    clozeWord: { attempted: 0, correct: 0 },
    clozePhrase: { attempted: 0, correct: 0 },
    paraphrase: { attempted: 0, correct: 0 },
    inference: { attempted: 0, correct: 0 },
  };
}

export interface SessionRecord {
  schemaVersion: number;
  textId: string;
  sourceType: SessionSourceType;
  estimatedLevel: EstimatedCefr;
  wordCount: number;
  /** Every lookup-sheet open, including repeats of the same word within the session. */
  totalLookupActions: number;
  /** Lemma-deduplicated count — looking up the same word five times counts once here. */
  uniqueWordsLookedUp: number;
  lookupsPer100: number;
  uniqueLookupsPer100: number;
  wordsSaved: number;
  wordsUnsure: number;
  wordsKnown: number;
  openedAt: string;
  completedAt: string | null;
  activeReadingTimeMs: number;
  completionStatus: SessionCompletionStatus;
  practice: Record<PracticeExerciseType, PracticeTypeStats>;
  /** A neutral fact, never a penalty — audio is a learning tool. */
  audioUsed: boolean;
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function isPracticeTypeStats(value: unknown): value is PracticeTypeStats {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.attempted === "number" && typeof v.correct === "number";
}

function isSessionRecord(value: unknown): value is SessionRecord {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (
    typeof v.schemaVersion !== "number" ||
    typeof v.textId !== "string" ||
    typeof v.sourceType !== "string" ||
    typeof v.estimatedLevel !== "string" ||
    typeof v.wordCount !== "number" ||
    typeof v.totalLookupActions !== "number" ||
    typeof v.uniqueWordsLookedUp !== "number" ||
    typeof v.lookupsPer100 !== "number" ||
    typeof v.uniqueLookupsPer100 !== "number" ||
    typeof v.wordsSaved !== "number" ||
    typeof v.wordsUnsure !== "number" ||
    typeof v.wordsKnown !== "number" ||
    typeof v.openedAt !== "string" ||
    (v.completedAt !== null && typeof v.completedAt !== "string") ||
    typeof v.activeReadingTimeMs !== "number" ||
    typeof v.completionStatus !== "string" ||
    typeof v.audioUsed !== "boolean" ||
    !v.practice ||
    typeof v.practice !== "object"
  ) {
    return false;
  }
  // Deliberately NOT requiring every practice-kind key to be present here —
  // a record written by an earlier schema (missing a since-added exercise
  // kind, e.g. a hypothetical pre-paraphrase record) is still a valid,
  // usable record; normalizeRecord below backfills any missing kinds with
  // zeroed stats rather than this guard discarding the whole row.
  return true;
}

/** Backfills any missing per-exercise-type practice stats with zeroed values, so a record from an earlier schema version (missing a since-added kind) stays usable instead of being dropped. */
function normalizeRecord(record: SessionRecord): SessionRecord {
  const practice = record.practice as Partial<Record<PracticeExerciseType, PracticeTypeStats>>;
  const kinds: PracticeExerciseType[] = ["reconstruction", "clozeWord", "clozePhrase", "paraphrase", "inference"];
  const normalizedPractice = Object.fromEntries(
    kinds.map((kind) => [kind, isPracticeTypeStats(practice[kind]) ? practice[kind] : { attempted: 0, correct: 0 }])
  ) as Record<PracticeExerciseType, PracticeTypeStats>;
  return { ...record, practice: normalizedPractice };
}

function readAll(): SessionRecord[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(SESSION_RECORDS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter(isSessionRecord).map(normalizeRecord) : [];
  } catch {
    return [];
  }
}

function persist(records: SessionRecord[]): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(SESSION_RECORDS_KEY, JSON.stringify(records));
    void pushStore(SESSION_RECORDS_KEY);
  } catch {
    // A full quota shouldn't break finishing a lesson; these diagnostics are a nicety.
  }
}

/** Rate per 100 words, rounded to one decimal place. Zero words → 0, not a division error. */
export function ratePer100Words(count: number, wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.round((count / wordCount) * 100 * 10) / 10;
}

export interface RecordReadingSessionInput {
  textId: string;
  sourceType: SessionSourceType;
  estimatedLevel: EstimatedCefr;
  wordCount: number;
  totalLookupActions: number;
  uniqueWordsLookedUp: number;
  wordsSaved: number;
  wordsUnsure: number;
  wordsKnown: number;
  openedAt: string;
  completedAt: string | null;
  activeReadingTimeMs: number;
  completionStatus: SessionCompletionStatus;
  audioUsed: boolean;
}

/** Records (or replaces) the session diagnostics for a text. Safe to call again on re-completion — preserves any practice stats already recorded for this text. */
export function recordReadingSession(input: RecordReadingSessionInput): void {
  const all = readAll();
  const existing = all.find((r) => r.textId === input.textId);
  const record: SessionRecord = {
    schemaVersion: SESSION_RECORD_SCHEMA_VERSION,
    ...input,
    lookupsPer100: ratePer100Words(input.totalLookupActions, input.wordCount),
    uniqueLookupsPer100: ratePer100Words(input.uniqueWordsLookedUp, input.wordCount),
    practice: existing?.practice ?? emptyPracticeStats(),
  };
  const next = [record, ...all.filter((r) => r.textId !== input.textId)];
  persist(next.slice(0, MAX_RECORDS));
}

/** Merges practice-attempt results into an already-recorded session (practice often happens in a separate visit after reading completion). No-op if the text has no session record yet. */
export function updateSessionPracticeStats(textId: string, kind: PracticeExerciseType, correct: boolean): void {
  const all = readAll();
  const index = all.findIndex((r) => r.textId === textId);
  if (index === -1) return;
  const record = all[index];
  const stats = record.practice[kind];
  const nextRecord: SessionRecord = {
    ...record,
    practice: {
      ...record.practice,
      [kind]: { attempted: stats.attempted + 1, correct: stats.correct + (correct ? 1 : 0) },
    },
  };
  const next = [...all];
  next[index] = nextRecord;
  persist(next);
}

export function getSessionRecords(): SessionRecord[] {
  return readAll();
}

export function getSessionRecordsForLevel(level: EstimatedCefr): SessionRecord[] {
  return readAll().filter((r) => r.estimatedLevel === level);
}
