/**
 * A history of completed articles, snapshotted at completion time. Kept
 * separate from src/lib/progress.ts because progress entries for RSS texts
 * get pruned once they rotate out of the daily selection and go stale
 * (see pruneStaleRssProgress) — the archive is meant to last, so it needs
 * its own copy of the title/source rather than relying on being able to
 * look the text back up later.
 */

export interface ArchiveEntry {
  textId: string;
  title: string;
  sourceName: string | null;
  /** ISO timestamp of completion. */
  completedAt: string;
}

const KEY = "lire.archive.v1";
/** Bounded so this can't grow forever for a very long-running install. */
const MAX_ENTRIES = 500;

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getArchive(): ArchiveEntry[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
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
  window.localStorage.setItem(KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
}

/** Records (or updates, if completed again) one text's completion. Newest-first on read via getArchive().reverse() by callers. */
export function recordArchiveEntry(entry: ArchiveEntry): void {
  const existing = getArchive().filter((e) => e.textId !== entry.textId);
  persist([...existing, entry]);
}
