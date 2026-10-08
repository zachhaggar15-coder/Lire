import type { Category } from "@/types";
import { notifyStoreChanged } from "@/lib/sync/runtime";
import { localStore } from "@/lib/localData/store";

/**
 * A history of completed articles, snapshotted at completion time. Kept
 * separate from src/lib/progress.ts because progress entries for RSS texts
 * get pruned once they rotate out of the daily selection and go stale
 * (see pruneStaleRssProgress) — the archive is meant to last, so it needs
 * its own copy of the title/source/category rather than relying on being
 * able to look the text back up later.
 */

export interface ArchiveEntry {
  textId: string;
  title: string;
  sourceName: string | null;
  /** ISO timestamp of completion. */
  completedAt: string;
  /** Below this line: added alongside the recommendation engine — optional so older entries still type-check. */
  category?: Category | null;
  /** Estimated CEFR at completion time (src/lib/difficulty.ts), e.g. "B1". */
  cefr?: string | null;
  /** Estimated reading time in minutes. */
  minutes?: number | null;
  /** Count of French word tokens at completion time, used for weekly reports. */
  wordCount?: number | null;
  /** Legacy: when the text was first opened. No longer used for time spent (see activeMinutes). */
  openedAt?: string | null;
  /**
   * Snapshots taken at completion, so history does not change when vocabulary
   * is later edited. Absent on older entries, which then show nothing rather
   * than an invented value.
   */
  /** Whole minutes the reader was actively reading (foreground, interacting). */
  activeMinutes?: number | null;
  savedWordCount?: number | null;
  phraseCount?: number | null;
}

const KEY = "lire.archive.v1";
/**
 * A rolling history: the most recent completions are kept (the page says so).
 * It is a record of reading, not user-authored content.
 */
export const MAX_ARCHIVE_ENTRIES = 500;
const MAX_ENTRIES = MAX_ARCHIVE_ENTRIES;

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getArchive(): ArchiveEntry[] {
  if (!hasStorage()) return [];
  try {
    const raw = localStore.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is ArchiveEntry =>
        !!e &&
        typeof e === "object" &&
        typeof e.textId === "string" &&
        typeof e.title === "string" &&
        typeof e.completedAt === "string"
    );
  } catch {
    return [];
  }
}

function persist(entries: ArchiveEntry[]): void {
  if (!hasStorage()) return;
  localStore.writeItem(KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  notifyStoreChanged(KEY);
}

/** Records (or updates, if completed again) one text's completion. Newest-first on read via getArchive().reverse() by callers. */
export function recordArchiveEntry(entry: ArchiveEntry): void {
  const existing = getArchive().filter((e) => e.textId !== entry.textId);
  persist([...existing, entry]);
}

/**
 * Active reading time in whole minutes, from the reader's foreground/interaction
 * tracker. Under ~30 seconds is not a meaningful reading time (null); otherwise
 * at least 1 minute.
 */
export function activeMinutesFromMs(ms: number | null | undefined): number | null {
  if (!ms || !Number.isFinite(ms) || ms < 30_000) return null;
  return Math.max(1, Math.round(ms / 60_000));
}

/**
 * Time spent on an archived reading: the active minutes recorded at
 * completion, or null. It used to be completedAt − openedAt, so an article
 * opened at 10pm and finished at 8am showed about 600 minutes.
 */
export function estimateTimeSpentMinutes(entry: ArchiveEntry): number | null {
  return typeof entry.activeMinutes === "number" && entry.activeMinutes > 0 ? entry.activeMinutes : null;
}
