import type { TextProgress } from "@/types";
import { recordActivityToday } from "@/lib/habit";
import { pushStore } from "@/lib/supabase/sync";

/**
 * localStorage-backed reading progress: per-text status (unread /
 * in-progress / completed) plus which text was opened most recently, so
 * Review can filter to "words from current text".
 */

const PROGRESS_KEY = "lire.progress.v1";
const LAST_OPENED_KEY = "lire.progress.lastOpened";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

const DEFAULT_PROGRESS: TextProgress = {
  status: "unread",
  openedAt: null,
  completedAt: null,
};

function readAll(): Record<string, TextProgress> {
  if (!hasStorage()) return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persist(all: Record<string, TextProgress>): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  void pushStore(PROGRESS_KEY);
}

export function getAllProgress(): Record<string, TextProgress> {
  return readAll();
}

export function getProgress(textId: string): TextProgress {
  return readAll()[textId] ?? DEFAULT_PROGRESS;
}

/**
 * Mark a text as opened: moves "unread" to "in-progress" and records
 * openedAt (first open only). Already "completed" or "in-progress" texts
 * are left as-is. Also records this text as the most recently opened one.
 */
export function markOpened(textId: string): void {
  if (!hasStorage()) return;
  const all = readAll();
  const current = all[textId] ?? DEFAULT_PROGRESS;

  all[textId] =
    current.status === "unread"
      ? { ...current, status: "in-progress", openedAt: new Date().toISOString() }
      : current;

  persist(all);
  window.localStorage.setItem(LAST_OPENED_KEY, textId);
  void pushStore(LAST_OPENED_KEY);
}

/** Mark a text as completed. */
export function markCompleted(textId: string): void {
  if (!hasStorage()) return;
  const all = readAll();
  const current = all[textId] ?? DEFAULT_PROGRESS;
  all[textId] = {
    ...current,
    status: "completed",
    completedAt: new Date().toISOString(),
  };
  persist(all);
  recordActivityToday();
}

/** The id of the most recently opened text, or null if none yet. */
export function getLastOpenedTextId(): string | null {
  if (!hasStorage()) return null;
  return window.localStorage.getItem(LAST_OPENED_KEY);
}

/**
 * RSS ids rotate as feeds refresh, so lire.progress.v1 would otherwise grow
 * forever. Called from the home page after each successful RSS fetch with
 * the ids currently being shown; removes RSS-prefixed progress entries that
 * are both absent from that list AND old (their last-touched timestamp is
 * more than a few days ago). The age check is deliberate: an article can
 * briefly rotate out of the top 5 and back in, and we don't want to lose a
 * reader's in-progress/completed status over that. Hardcoded text ids
 * (never prefixed "rss-") are never touched.
 */
const RSS_ID_PREFIX = "rss-";
const STALE_AFTER_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export function pruneStaleRssProgress(currentRssIds: string[]): void {
  if (!hasStorage()) return;
  const all = readAll();
  const current = new Set(currentRssIds);
  const now = Date.now();
  let changed = false;

  for (const [id, entry] of Object.entries(all)) {
    if (!id.startsWith(RSS_ID_PREFIX) || current.has(id)) continue;

    const lastTouched = entry.completedAt ?? entry.openedAt;
    const age = lastTouched ? now - new Date(lastTouched).getTime() : Infinity;
    if (age > STALE_AFTER_MS) {
      delete all[id];
      changed = true;
    }
  }

  if (changed) persist(all);
}
