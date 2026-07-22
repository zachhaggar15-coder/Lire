import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Cross-device sync for the app's localStorage stores. This deliberately
 * mirrors the app's existing stores instead of replacing them: every feature
 * still works instantly offline, while signed-in readers get best-effort
 * backup/restore across devices.
 */

type StoreKind = "list-by-id" | "list-of-strings" | "object" | "record";

interface SyncedStoreConfig {
  key: string;
  kind: StoreKind;
  idField?: string;
}

const SYNCED_STORES: SyncedStoreConfig[] = [
  { key: "lire.savedWords.v1", kind: "list-by-id", idField: "word" },
  { key: "lire.knownWords.v1", kind: "list-of-strings" },
  { key: "lire.archive.v1", kind: "list-by-id", idField: "textId" },
  { key: "lire.progress.v1", kind: "record" },
  { key: "lire.journey.v1", kind: "object" },
  { key: "lire.levelScore.v1", kind: "record" },
  { key: "lire.progress.lastOpened", kind: "object" },
  { key: "lire.customDictionary.v1", kind: "list-by-id", idField: "lemma" },
  { key: "lire.interestProfile.v1", kind: "object" },
  { key: "lire.recommendation.hiddenSources.v1", kind: "list-of-strings" },
  { key: "lire.recommendation.preferredSources.v1", kind: "list-of-strings" },
  { key: "lire.recommendation.savedLater.v1", kind: "list-of-strings" },
  { key: "lire.onboarding.v1", kind: "object" },
  { key: "lire.rssTexts.offline", kind: "list-by-id", idField: "id" },
  { key: "lire.activityDates.v1", kind: "list-of-strings" },
  { key: "lire.settings.v1", kind: "object" },
  { key: "lire.goals.v1", kind: "object" },
  { key: "lire.savedPhrases.v1", kind: "list-by-id", idField: "phrase" },
  { key: "lire.dictionaryFeedback.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.articleFeedback.v1", kind: "list-by-id", idField: "textId" },
  { key: "lire.comprehensionQuestions.v1", kind: "list-by-id", idField: "textId" },
  { key: "lire.wordTapStats.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.inferredWords.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.translationBudget.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.secondPass.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.gamification.xpEvents.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.gamification.articleCompletions.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.gamification.achievements.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.gamification.passport.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.gamification.mastery.v1", kind: "list-by-id", idField: "word" },
  { key: "lire.grammar.progress.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.grammar.practiceEvents.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.validation.v1", kind: "object" },
];

const LAST_SYNC_AT_KEY = "lire.sync.lastSuccessAt";
const LAST_SYNC_ERROR_KEY = "lire.sync.lastError";
const SYNC_EVENT = "lire-sync-status";

export type SyncPhase = "idle" | "syncing" | "success" | "error";

export interface SyncStatus {
  phase: SyncPhase;
  lastSuccessAt: string | null;
  error: string | null;
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readLocal(key: string): unknown {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: unknown): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
}

export function getSyncStatus(): SyncStatus {
  if (!hasStorage()) return { phase: "idle", lastSuccessAt: null, error: null };
  const error = window.localStorage.getItem(LAST_SYNC_ERROR_KEY);
  return {
    phase: error ? "error" : "idle",
    lastSuccessAt: window.localStorage.getItem(LAST_SYNC_AT_KEY),
    error,
  };
}

function notify(status: SyncStatus): void {
  if (!hasStorage()) return;
  window.dispatchEvent(new CustomEvent<SyncStatus>(SYNC_EVENT, { detail: status }));
}

function setSyncing(): void {
  notify({ ...getSyncStatus(), phase: "syncing", error: null });
}

function setSyncSuccess(): void {
  if (!hasStorage()) return;
  const now = new Date().toISOString();
  window.localStorage.setItem(LAST_SYNC_AT_KEY, now);
  window.localStorage.removeItem(LAST_SYNC_ERROR_KEY);
  notify({ phase: "success", lastSuccessAt: now, error: null });
}

function setSyncError(error: string): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(LAST_SYNC_ERROR_KEY, error);
  notify({ phase: "error", lastSuccessAt: getSyncStatus().lastSuccessAt, error });
}

export function subscribeToSyncStatus(callback: (status: SyncStatus) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => callback((event as CustomEvent<SyncStatus>).detail);
  window.addEventListener(SYNC_EVENT, handler);
  return () => window.removeEventListener(SYNC_EVENT, handler);
}

/** Exported for direct unit testing (scripts/test-core-logic.mjs) — pure, so no Supabase client is needed to test it. */
export function itemTimestamp(item: unknown): number {
  if (!item || typeof item !== "object") return 0;
  const r = item as Record<string, unknown>;
  const candidates = [r.lastReviewedAt, r.completedAt, r.openedAt, r.savedAt, r.updatedAt, r.publishedAt];
  return Math.max(
    0,
    ...candidates
      .filter((v): v is string => typeof v === "string" && !!v)
      .map((v) => new Date(v).getTime())
      .filter(Number.isFinite)
  );
}

/** Exported for direct unit testing (scripts/test-core-logic.mjs) — pure, so no Supabase client is needed to test it. */
export function mergeStoreValue(config: SyncedStoreConfig, local: unknown, remote: unknown): unknown {
  if (remote == null) return local;
  if (local == null) return remote;

  if (config.kind === "list-of-strings") {
    const localArr = Array.isArray(local) ? local : [];
    const remoteArr = Array.isArray(remote) ? remote : [];
    return [...new Set([...localArr, ...remoteArr])];
  }

  if (config.kind === "list-by-id" && config.idField) {
    const localArr = Array.isArray(local) ? local : [];
    const remoteArr = Array.isArray(remote) ? remote : [];
    const byId = new Map<unknown, unknown>();
    for (const item of localArr) {
      if (item && typeof item === "object" && config.idField in item) {
        byId.set((item as Record<string, unknown>)[config.idField], item);
      }
    }
    for (const item of remoteArr) {
      if (item && typeof item === "object" && config.idField in item) {
        const id = (item as Record<string, unknown>)[config.idField];
        const current = byId.get(id);
        byId.set(id, itemTimestamp(item) >= itemTimestamp(current) ? item : current);
      }
    }
    return [...byId.values()];
  }

  if (config.kind === "record") {
    const out = { ...(local && typeof local === "object" ? local : {}) } as Record<string, unknown>;
    if (remote && typeof remote === "object") {
      for (const [key, value] of Object.entries(remote)) {
        const current = out[key];
        out[key] = itemTimestamp(value) >= itemTimestamp(current) ? value : current;
      }
    }
    return out;
  }

  if (typeof local === "object" && typeof remote === "object") {
    return { ...(local as object), ...(remote as object) };
  }
  return remote;
}

export async function pushStore(key: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return false;

    const value = readLocal(key);
    if (value === null) return false;
    const { error } = await client.from("lire_user_data").upsert(
      { user_id: user.id, store_key: key, data: value, updated_at: new Date().toISOString() },
      { onConflict: "user_id,store_key" }
    );
    if (error) throw error;
    setSyncSuccess();
    return true;
  } catch {
    setSyncError("Sync failed. Local changes are still saved on this device.");
    return false;
  }
}

export async function pullAndMergeAllStores(): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  setSyncing();
  try {
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return false;

    const { data: rows, error } = await client.from("lire_user_data").select("store_key, data").eq("user_id", user.id);
    if (error || !rows) throw error ?? new Error("No sync rows returned.");

    const remoteByKey = new Map(rows.map((row) => [row.store_key, row.data]));

    for (const config of SYNCED_STORES) {
      const local = readLocal(config.key);
      const remote = remoteByKey.get(config.key) ?? null;
      const merged = mergeStoreValue(config, local, remote);
      if (merged != null) writeLocal(config.key, merged);
    }

    await Promise.allSettled(SYNCED_STORES.map((config) => pushStore(config.key)));
    setSyncSuccess();
    return true;
  } catch {
    setSyncError("Sync failed. Check your connection and try again.");
    return false;
  }
}

export async function syncNow(): Promise<boolean> {
  return pullAndMergeAllStores();
}
