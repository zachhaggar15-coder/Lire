import { notifyStoreChanged } from "@/lib/sync/runtime";
import { localStore } from "@/lib/localData/store";

/** Which texts have had their "Practice this text" session completed at least once. Repeatable — this just tracks whether the "completed" badge should show. */

const PRACTICE_KEY = "lire.practiceCompleted.v1";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readAll(): string[] {
  if (!hasStorage()) return [];
  try {
    const raw = localStore.getItem(PRACTICE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function persist(ids: string[]): void {
  if (!hasStorage()) return;
  try {
    localStore.setItem(PRACTICE_KEY, JSON.stringify(ids));
    notifyStoreChanged(PRACTICE_KEY);
  } catch {
    // non-critical
  }
}

export function isPracticeCompleted(textId: string): boolean {
  return readAll().includes(textId);
}

export function markPracticeCompleted(textId: string): void {
  const all = readAll();
  if (all.includes(textId)) return;
  persist([textId, ...all].slice(0, 1000));
}

/** Which of the three listening-practice / practice states apply. Kept separate from the
 * original reading-completion state, per spec — practising never un-completes a reading. */
const LISTENING_KEY = "lire.listeningPracticeCompleted.v1";

export function isListeningPracticeCompleted(textId: string): boolean {
  if (!hasStorage()) return false;
  try {
    const raw = localStore.getItem(LISTENING_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.includes(textId);
  } catch {
    return false;
  }
}

export function markListeningPracticeCompleted(textId: string): void {
  if (!hasStorage()) return;
  try {
    const raw = localStore.getItem(LISTENING_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const ids: string[] = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
    if (ids.includes(textId)) return;
    localStore.setItem(LISTENING_KEY, JSON.stringify([textId, ...ids].slice(0, 1000)));
    notifyStoreChanged(LISTENING_KEY);
  } catch {
    // non-critical
  }
}
