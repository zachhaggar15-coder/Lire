import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Cross-device sync for the app's localStorage stores. This deliberately
 * mirrors the app's existing stores instead of replacing them: every feature
 * still works instantly offline, while signed-in readers get best-effort
 * backup/restore across devices.
 */

type StoreKind = "list-by-id" | "list-of-strings" | "object" | "record";

export interface SyncedStoreConfig {
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
  // Retired per-CEFR band score. Still synced so a device that has not yet
  // run the migration can convert it to XP; nothing writes to it any more.
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
  { key: "lire.streakGrace.v1", kind: "object" },
  { key: "lire.settings.v1", kind: "object" },
  { key: "lire.goals.v1", kind: "object" },
  { key: "lire.reviewPrefs.v1", kind: "object" },
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
const STORE_METADATA_KEY = "lire.sync.storeMetadata.v1";
const REMOTE_METADATA_PREFIX = "__sync_meta__:";
const SYNC_EVENT = "lire-sync-status";

export interface StoreSyncMetadata {
  updatedAt: string | null;
  clearedAt: string | null;
  tombstones: Record<string, string>;
  itemUpdatedAt: Record<string, string>;
}

type StoredMetadata = Record<string, StoreSyncMetadata>;

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

function timestamp(value: unknown): number {
  if (typeof value !== "string" || !value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function isoTimestamp(value: number): string | null {
  return value > 0 && Number.isFinite(value) ? new Date(value).toISOString() : null;
}

function emptyMetadata(): StoreSyncMetadata {
  return { updatedAt: null, clearedAt: null, tombstones: {}, itemUpdatedAt: {} };
}

function normalizeMetadata(value: unknown): StoreSyncMetadata {
  if (!value || typeof value !== "object") return emptyMetadata();
  const candidate = value as Record<string, unknown>;
  const stringsOnly = (record: unknown): Record<string, string> => {
    if (!record || typeof record !== "object" || Array.isArray(record)) return {};
    return Object.fromEntries(
      Object.entries(record).filter((entry): entry is [string, string] => typeof entry[1] === "string" && timestamp(entry[1]) > 0),
    );
  };
  return {
    updatedAt: typeof candidate.updatedAt === "string" && timestamp(candidate.updatedAt) > 0 ? candidate.updatedAt : null,
    clearedAt: typeof candidate.clearedAt === "string" && timestamp(candidate.clearedAt) > 0 ? candidate.clearedAt : null,
    tombstones: stringsOnly(candidate.tombstones),
    itemUpdatedAt: stringsOnly(candidate.itemUpdatedAt),
  };
}

function readAllMetadata(): StoredMetadata {
  const value = readLocal(STORE_METADATA_KEY);
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([key, metadata]) => [key, normalizeMetadata(metadata)]));
}

function readStoreMetadata(key: string): StoreSyncMetadata {
  return readAllMetadata()[key] ?? emptyMetadata();
}

function writeStoreMetadata(key: string, metadata: StoreSyncMetadata): void {
  if (!hasStorage()) return;
  try {
    const all = readAllMetadata();
    all[key] = normalizeMetadata(metadata);
    window.localStorage.setItem(STORE_METADATA_KEY, JSON.stringify(all));
  } catch {
    // Metadata improves conflict resolution, but a full storage quota must
    // never prevent the underlying learning data from being saved locally.
  }
}

function configForKey(key: string): SyncedStoreConfig | undefined {
  return SYNCED_STORES.find((config) => config.key === key);
}

function entriesForStore(config: SyncedStoreConfig, value: unknown): Map<string, unknown> {
  const entries = new Map<string, unknown>();
  if (config.kind === "list-of-strings" && Array.isArray(value)) {
    for (const item of value) if (typeof item === "string") entries.set(item, item);
  } else if (config.kind === "list-by-id" && config.idField && Array.isArray(value)) {
    for (const item of value) {
      if (!item || typeof item !== "object" || !(config.idField in item)) continue;
      const id = (item as Record<string, unknown>)[config.idField];
      if (typeof id === "string" || typeof id === "number") entries.set(String(id), item);
    }
  } else if (config.kind === "record" && value && typeof value === "object" && !Array.isArray(value)) {
    for (const [id, item] of Object.entries(value)) entries.set(id, item);
  }
  return entries;
}

function markLocalStoreUpdated(key: string, value: unknown): StoreSyncMetadata {
  const now = new Date().toISOString();
  const metadata = readStoreMetadata(key);
  metadata.updatedAt = now;
  const config = configForKey(key);

  if (config && config.kind !== "object") {
    for (const [id, item] of entriesForStore(config, value)) {
      const recordedAt = timestamp(metadata.itemUpdatedAt[id]);
      const naturalAt = itemTimestamp(item);
      const deletedAt = timestamp(metadata.tombstones[id]);
      const clearedAt = timestamp(metadata.clearedAt);
      if (!recordedAt || deletedAt >= recordedAt || clearedAt >= recordedAt) {
        metadata.itemUpdatedAt[id] = now;
        delete metadata.tombstones[id];
      } else if (naturalAt > recordedAt) {
        metadata.itemUpdatedAt[id] = isoTimestamp(naturalAt) ?? now;
      } else if (config.kind === "record" && (!item || typeof item !== "object")) {
        // Primitive record values (the per-level numeric score store is the
        // main example) have no intrinsic updatedAt field. The record write
        // is their only change signal, so advance those fixed keys together.
        metadata.itemUpdatedAt[id] = now;
      }
    }
  }

  writeStoreMetadata(key, metadata);
  return metadata;
}

/** Record a deliberate per-item removal so an older copy on another device cannot resurrect it. */
export function recordStoreDeletion(key: string, id: string): void {
  if (!hasStorage() || !id) return;
  const metadata = readStoreMetadata(key);
  const now = new Date().toISOString();
  metadata.updatedAt = now;
  metadata.tombstones[id] = now;
  delete metadata.itemUpdatedAt[id];
  writeStoreMetadata(key, metadata);
}

/** Record a deliberate whole-store clear, including stores represented by a removed localStorage key. */
export function recordStoreClear(key: string): void {
  if (!hasStorage()) return;
  const metadata = readStoreMetadata(key);
  const now = new Date().toISOString();
  metadata.updatedAt = now;
  metadata.clearedAt = now;
  metadata.tombstones = {};
  metadata.itemUpdatedAt = {};
  writeStoreMetadata(key, metadata);
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

function laterMetadataValue(left: string | null | undefined, right: string | null | undefined): string | null {
  const latest = Math.max(timestamp(left), timestamp(right));
  return isoTimestamp(latest);
}

function mergeMetadata(local: StoreSyncMetadata, remote: StoreSyncMetadata): StoreSyncMetadata {
  const tombstones: Record<string, string> = { ...local.tombstones };
  for (const [id, deletedAt] of Object.entries(remote.tombstones)) {
    tombstones[id] = laterMetadataValue(tombstones[id], deletedAt) ?? deletedAt;
  }

  const itemUpdatedAt: Record<string, string> = { ...local.itemUpdatedAt };
  for (const [id, updatedAt] of Object.entries(remote.itemUpdatedAt)) {
    itemUpdatedAt[id] = laterMetadataValue(itemUpdatedAt[id], updatedAt) ?? updatedAt;
  }

  return {
    updatedAt: laterMetadataValue(local.updatedAt, remote.updatedAt),
    clearedAt: laterMetadataValue(local.clearedAt, remote.clearedAt),
    tombstones,
    itemUpdatedAt,
  };
}

export interface StoreMergeResult {
  value: unknown;
  metadata: StoreSyncMetadata;
}

/**
 * Timestamp-aware merge used by live sync. The older mergeStoreValue export
 * remains as the backwards-compatible, metadata-free merge used by existing
 * tests and old local data.
 */
export function mergeStoreValueWithMetadata(
  config: SyncedStoreConfig,
  local: unknown,
  remote: unknown,
  localMetadataInput?: Partial<StoreSyncMetadata> | null,
  remoteMetadataInput?: Partial<StoreSyncMetadata> | null,
  remoteRowUpdatedAt?: string | null,
): StoreMergeResult {
  const localMetadata = normalizeMetadata(localMetadataInput);
  const remoteMetadata = normalizeMetadata(remoteMetadataInput);
  const metadata = mergeMetadata(localMetadata, remoteMetadata);
  const localStoreAt = Math.max(timestamp(localMetadata.updatedAt), itemTimestamp(local));
  const remoteStoreAt = Math.max(timestamp(remoteMetadata.updatedAt), timestamp(remoteRowUpdatedAt), itemTimestamp(remote));

  if (config.kind === "object") {
    const localClearedAt = timestamp(localMetadata.clearedAt);
    const remoteClearedAt = timestamp(remoteMetadata.clearedAt);
    const usableLocal = localClearedAt >= localStoreAt && localClearedAt > 0 ? null : local;
    const usableRemote = remoteClearedAt >= remoteStoreAt && remoteClearedAt > 0 ? null : remote;

    if (usableLocal == null && usableRemote == null) return { value: null, metadata };
    if (usableRemote == null) return { value: usableLocal, metadata };
    if (usableLocal == null) return { value: usableRemote, metadata };
    if (localStoreAt === 0 && remoteStoreAt === 0) {
      return { value: mergeStoreValue(config, usableLocal, usableRemote), metadata };
    }
    return { value: localStoreAt >= remoteStoreAt ? usableLocal : usableRemote, metadata };
  }

  const localEntries = entriesForStore(config, local);
  const remoteEntries = entriesForStore(config, remote);
  const mergedEntries = new Map<string, unknown>();
  const ids = new Set([...localEntries.keys(), ...remoteEntries.keys()]);
  const clearedAt = Math.max(timestamp(localMetadata.clearedAt), timestamp(remoteMetadata.clearedAt));

  for (const id of ids) {
    const localItem = localEntries.get(id);
    const remoteItem = remoteEntries.get(id);
    const localSpecificAt = localItem === undefined ? 0 : Math.max(timestamp(localMetadata.itemUpdatedAt[id]), itemTimestamp(localItem));
    const remoteSpecificAt = remoteItem === undefined ? 0 : Math.max(timestamp(remoteMetadata.itemUpdatedAt[id]), itemTimestamp(remoteItem));
    const localPresentAt = localItem === undefined ? 0 : localSpecificAt || localStoreAt;
    const remotePresentAt = remoteItem === undefined ? 0 : remoteSpecificAt || remoteStoreAt;
    const deletedAt = Math.max(
      timestamp(localMetadata.tombstones[id]),
      timestamp(remoteMetadata.tombstones[id]),
      clearedAt,
    );
    const presentAt = Math.max(localPresentAt, remotePresentAt);

    if (deletedAt > 0 && deletedAt >= presentAt) continue;

    const chosen = remoteItem !== undefined && remotePresentAt >= localPresentAt ? remoteItem : localItem;
    if (chosen === undefined) continue;
    mergedEntries.set(id, chosen);
    const presenceIso = isoTimestamp(presentAt);
    if (presenceIso) metadata.itemUpdatedAt[id] = presenceIso;
    if (timestamp(metadata.tombstones[id]) < presentAt) delete metadata.tombstones[id];
  }

  let value: unknown;
  if (config.kind === "record") value = Object.fromEntries(mergedEntries);
  else value = [...mergedEntries.values()];
  return { value, metadata };
}

export async function pushStore(key: string, options: { markLocalChange?: boolean } = {}): Promise<boolean> {
  const value = readLocal(key);
  const existingMetadata = readStoreMetadata(key);
  if (value === null && !existingMetadata.clearedAt) return false;
  const metadata = options.markLocalChange === false ? existingMetadata : markLocalStoreUpdated(key, value);
  const config = configForKey(key);
  // The Supabase schema keeps `data` non-null. A deliberate clear of a store
  // represented by a removed localStorage key is therefore mirrored as the
  // empty value for its shape, while clearedAt remains the conflict signal.
  const remoteValue = value ?? (config?.kind === "list-by-id" || config?.kind === "list-of-strings" ? [] : {});

  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return false;

    const logicalUpdatedAt = metadata.updatedAt ?? new Date().toISOString();
    const { error } = await client.from("lire_user_data").upsert(
      [
        { user_id: user.id, store_key: key, data: remoteValue, updated_at: logicalUpdatedAt },
        { user_id: user.id, store_key: `${REMOTE_METADATA_PREFIX}${key}`, data: metadata, updated_at: logicalUpdatedAt },
      ],
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

    const { data: rows, error } = await client.from("lire_user_data").select("store_key, data, updated_at").eq("user_id", user.id);
    if (error || !rows) throw error ?? new Error("No sync rows returned.");

    const remoteByKey = new Map(rows.map((row) => [row.store_key, { data: row.data, updatedAt: row.updated_at }]));

    for (const config of SYNCED_STORES) {
      const local = readLocal(config.key);
      const remoteRow = remoteByKey.get(config.key);
      const remoteMetadataRow = remoteByKey.get(`${REMOTE_METADATA_PREFIX}${config.key}`);
      const merged = mergeStoreValueWithMetadata(
        config,
        local,
        remoteRow?.data ?? null,
        readStoreMetadata(config.key),
        remoteMetadataRow?.data as Partial<StoreSyncMetadata> | null | undefined,
        remoteRow?.updatedAt ?? null,
      );
      writeStoreMetadata(config.key, merged.metadata);
      if (merged.value != null) writeLocal(config.key, merged.value);
      else if (merged.metadata.clearedAt && hasStorage()) window.localStorage.removeItem(config.key);
    }

    await Promise.allSettled(SYNCED_STORES.map((config) => pushStore(config.key, { markLocalChange: false })));
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
