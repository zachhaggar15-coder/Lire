import { localStore, readJson, writeJson } from "@/lib/localData/store";

/**
 * Today's count of NEW saved words, per identity partition.
 *
 * For guests this device-local count is the whole limit — accepted as a
 * low-risk limitation rather than fingerprinting anyone. For signed-in free
 * accounts the server enforces the same limit on sync (sorlio_sync_push), and
 * the app uses whichever count is higher.
 */

const KEY = "lire.access.newSaves.v1";

interface Counter {
  dateKey: string;
  count: number;
}

export function localDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function newSavesToday(date = new Date()): number {
  const counter = readJson<Counter | null>(KEY, null, localStore);
  if (!counter || counter.dateKey !== localDateKey(date) || typeof counter.count !== "number") return 0;
  return Math.max(0, Math.floor(counter.count));
}

export function recordNewSave(date = new Date()): number {
  const next = newSavesToday(date) + 1;
  writeJson(KEY, { dateKey: localDateKey(date), count: next } satisfies Counter, localStore);
  return next;
}
