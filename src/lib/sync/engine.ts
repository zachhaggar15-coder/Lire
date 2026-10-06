import { readJson, writeJson, type PartitionedStore } from "@/lib/localData/store";
import { canonicalJson, contentHash, fromItems, mergeItem, sameContent, toItems, type ItemMap } from "@/lib/sync/items";
import { SYNCED_STORES, configForKey, type SyncedStoreConfig } from "@/lib/sync/stores";

/**
 * The sync engine: reconciles one account's local partition with its server
 * items. Pure apart from the injected store and transport, so it is tested
 * end-to-end against real Postgres (scripts/test-sync-engine.mjs).
 *
 * Model
 *   For every synced item the device remembers the server revision it last
 *   agreed on (its "base") and a hash of the content at that point. A sync is:
 *
 *     1. pull   — fetch server items newer than the device's cursor and fold
 *                 them into local data;
 *     2. push   — diff local data against the bases and send the differences
 *                 as compare-and-swap operations;
 *     3. pull   — pick up anything written while we were pushing.
 *
 *   Nothing here depends on the device clock for correctness.
 *
 * Conflict rules (deterministic)
 *   - Different items never conflict.
 *   - Same item changed on both sides: three-way merge, field by field
 *     (mergeItem). The merged result is pushed against the server revision.
 *   - Deletion wins over a concurrent edit of the same item.
 *   - A stale copy of a deleted item is never re-uploaded: it has a base, and
 *     the server refuses a write whose base is older than the tombstone.
 *   - A brand-new local item with the same id as a deleted one (re-saving a
 *     word after deleting it) is a deliberate re-creation and is allowed —
 *     except during a device's first sync ("import"), where the local copy may
 *     simply predate the deletion.
 *
 * Safety
 *   - Every server call names the account it acts for; the server refuses if
 *     the session belongs to someone else.
 *   - Before touching local data the engine checks `stillCurrent()`: if the
 *     device switched identity or the account was deleted, it stops.
 *   - Local edits made while a sync is in flight are never overwritten: remote
 *     changes are applied as per-item patches only where the local item is
 *     still what the engine originally read.
 *   - The result says honestly what happened. Any refused or failed write
 *     makes the outcome "partial" or "error", never "success".
 */

export const SYNC_STATE_KEY = "sorlio.sync.v2";
const BASE_DATA_LIMIT = 4096;
const PUSH_CHUNK = 200;
const MAX_PUSH_ROUNDS = 4;
const MAX_PULL_PAGES = 200;

export interface RemoteItem {
  store: string;
  id: string;
  rev: number;
  deleted: boolean;
  data: unknown;
}

export interface SaveQuotaInfo {
  day: string;
  used: number;
  limit: number | null;
}

export interface PullResponse {
  items?: RemoteItem[];
  next_rev?: number;
  has_more?: boolean;
  resync_required?: boolean;
  last_rev: number;
  purged_through_rev: number;
  premium?: boolean;
  save_quota?: SaveQuotaInfo;
}

export interface PushOp {
  store: string;
  id: string;
  op: "put" | "delete";
  base_rev: number | null;
  data?: unknown;
  mode: "normal" | "import" | "adopt";
}

export type PushResult =
  | { status: "applied"; rev: number | null }
  | { status: "conflict"; current: { rev: number; deleted: boolean; data: unknown } }
  | { status: "rejected"; reason: string };

export interface PushResponse {
  results: PushResult[];
  last_rev: number;
}

export interface SyncTransport {
  pull(expectedUser: string, afterRev: number, limit: number): Promise<PullResponse>;
  push(expectedUser: string, ops: PushOp[], day: string): Promise<PushResponse>;
}

/** [rev, hash, data?] — compact to keep the state small. */
type BaseEntry = [number, string] | [number, string, unknown];

interface SyncState {
  v: 2;
  cursor: number;
  bootstrapped: boolean;
  base: Record<string, Record<string, BaseEntry>>;
  /** Items the server refused for today's save quota: store → id → day. */
  deferred: Record<string, Record<string, string>>;
  /** Items added from guest data at the reader's request, not yet uploaded. */
  adopted: Record<string, Record<string, 1>>;
  lastSuccessAt: string | null;
  saveQuota: SaveQuotaInfo | null;
  premium: boolean | null;
}

export type SyncStatusKind = "success" | "partial" | "error" | "aborted";

export interface SyncOutcome {
  status: SyncStatusKind;
  pulled: number;
  pushed: number;
  conflicts: number;
  rejected: Record<string, number>;
  /** Plain-language summary for the UI. */
  message: string | null;
  saveQuota: SaveQuotaInfo | null;
  premium: boolean | null;
}

export interface EngineDeps {
  userId: string;
  store: PartitionedStore;
  transport: SyncTransport;
  /** False once the device has switched identity or the account was deleted. */
  stillCurrent(): boolean;
  /** Local calendar date, YYYY-MM-DD. */
  today(): string;
}

function emptyState(): SyncState {
  return { v: 2, cursor: 0, bootstrapped: false, base: {}, deferred: {}, adopted: {}, lastSuccessAt: null, saveQuota: null, premium: null };
}

export function readSyncState(store: PartitionedStore): SyncState {
  const raw = readJson<Partial<SyncState> | null>(SYNC_STATE_KEY, null, store);
  if (!raw || raw.v !== 2 || typeof raw.cursor !== "number") return emptyState();
  return {
    v: 2,
    cursor: Math.max(0, Math.floor(raw.cursor)),
    bootstrapped: raw.bootstrapped === true,
    base: raw.base && typeof raw.base === "object" ? raw.base : {},
    deferred: raw.deferred && typeof raw.deferred === "object" ? raw.deferred : {},
    adopted: raw.adopted && typeof raw.adopted === "object" ? raw.adopted : {},
    lastSuccessAt: typeof raw.lastSuccessAt === "string" ? raw.lastSuccessAt : null,
    saveQuota: raw.saveQuota ?? null,
    premium: typeof raw.premium === "boolean" ? raw.premium : null,
  };
}

function baseEntry(rev: number, data: unknown): BaseEntry {
  const hash = contentHash(data);
  return canonicalJson(data).length <= BASE_DATA_LIMIT ? [rev, hash, data] : [rev, hash];
}

function readStoreValue(store: PartitionedStore, key: string): unknown {
  return readJson<unknown>(key, null, store);
}

/** Which synced stores this account currently syncs (imported texts are opt-in). */
export function enabledStores(store: PartitionedStore): SyncedStoreConfig[] {
  const prefs = readJson<{ importedTexts?: unknown } | null>("lire.syncPreferences.v1", null, store);
  return SYNCED_STORES.filter((config) => !config.optIn || (config.optIn === "importedTexts" && prefs?.importedTexts === true));
}

type Pending = { kind: "set"; value: unknown } | { kind: "delete" };

interface WorkingStore {
  config: SyncedStoreConfig;
  /** Items as read when this sync started (or last committed). */
  snapshot: ItemMap;
  /** Remote-derived changes waiting to be written locally. */
  local: Map<string, Pending>;
  /** Base changes; `null` removes the base. Committed only with their local change. */
  base: Map<string, BaseEntry | null>;
}

const DELETE: Pending = { kind: "delete" };

/**
 * Decides what a remote item means for this device.
 * Returns the local change (if any) and the new base (undefined = unchanged).
 */
function decide(
  local: unknown,
  base: BaseEntry | undefined,
  remote: { rev: number; deleted: boolean; data: unknown },
  bootstrapped: boolean,
): { local?: Pending; base?: BaseEntry | null; conflict?: boolean } {
  if (remote.deleted) {
    if (local === undefined) return { base: null };
    if (!base) return bootstrapped ? {} : { local: DELETE, base: null };
    return { local: DELETE, base: null };
  }
  if (local === undefined) {
    if (!base) return { local: { kind: "set", value: remote.data }, base: baseEntry(remote.rev, remote.data) };
    // Deleted here since the base: deletion wins and is pushed next.
    return {};
  }
  if (sameContent(local, remote.data)) return { base: baseEntry(remote.rev, remote.data) };
  const localChanged = !base || contentHash(local) !== base[1];
  if (!localChanged) return { local: { kind: "set", value: remote.data }, base: baseEntry(remote.rev, remote.data) };
  const merged = mergeItem(base && base.length === 3 ? base[2] : undefined, local, remote.data);
  return { local: { kind: "set", value: merged }, base: baseEntry(remote.rev, remote.data), conflict: true };
}

export async function syncPartition(deps: EngineDeps): Promise<SyncOutcome> {
  const { store, transport, userId } = deps;
  const state = readSyncState(store);
  const enabled = enabledStores(store);
  const enabledKeys = new Set(enabled.map((config) => config.key));
  const working = new Map<string, WorkingStore>();
  const outcome: SyncOutcome = {
    status: "success",
    pulled: 0,
    pushed: 0,
    conflicts: 0,
    rejected: {},
    message: null,
    saveQuota: state.saveQuota,
    premium: state.premium,
  };

  const aborted = (): SyncOutcome => ({ ...outcome, status: "aborted", message: null });

  function workingFor(key: string): WorkingStore | null {
    const config = configForKey(key);
    if (!config || !enabledKeys.has(key)) return null;
    let entry = working.get(key);
    if (!entry) {
      entry = { config, snapshot: toItems(config, readStoreValue(store, key)), local: new Map(), base: new Map() };
      working.set(key, entry);
    }
    return entry;
  }

  function currentBase(key: string, id: string, entry: WorkingStore): BaseEntry | undefined {
    if (entry.base.has(id)) return entry.base.get(id) ?? undefined;
    return state.base[key]?.[id];
  }

  function currentLocal(entry: WorkingStore, id: string): unknown {
    const pending = entry.local.get(id);
    if (pending) return pending.kind === "set" ? pending.value : undefined;
    return entry.snapshot.get(id);
  }

  function applyRemote(item: RemoteItem): void {
    const entry = workingFor(item.store);
    if (!entry) return;
    const result = decide(currentLocal(entry, item.id), currentBase(item.store, item.id, entry), item, state.bootstrapped);
    if (result.local) entry.local.set(item.id, result.local);
    if (result.base !== undefined) entry.base.set(item.id, result.base);
    if (result.conflict) outcome.conflicts += 1;
  }

  /**
   * Writes pending remote changes into local storage as per-item patches over
   * the CURRENT local value, then records the bases that now hold. An item the
   * reader changed since this sync read it is left alone (and its base is not
   * advanced), so the next sync reconciles it rather than losing the edit.
   */
  function commit(): boolean {
    if (!deps.stillCurrent()) return false;
    for (const [key, entry] of working) {
      if (entry.local.size === 0 && entry.base.size === 0) continue;
      const freshValue = readStoreValue(store, key);
      const fresh = toItems(entry.config, freshValue);
      const order = [...fresh.keys()];
      const untouched = (id: string) => sameContent(fresh.get(id), entry.snapshot.get(id));
      const acceptedBase = new Map<string, BaseEntry | null>();
      let changed = false;

      for (const [id, pending] of entry.local) {
        if (!untouched(id)) continue;
        if (pending.kind === "delete") {
          if (fresh.delete(id)) changed = true;
        } else if (!sameContent(fresh.get(id), pending.value)) {
          fresh.set(id, pending.value);
          changed = true;
        }
        if (entry.base.has(id)) acceptedBase.set(id, entry.base.get(id)!);
      }
      for (const [id, base] of entry.base) {
        if (entry.local.has(id)) continue;
        acceptedBase.set(id, base);
      }

      if (changed) {
        const value = fromItems(entry.config, fresh, order);
        const written = value == null ? store.deleteItem(key) : writeJson(key, value, store);
        if (!written.ok) {
          outcome.status = "error";
          outcome.message =
            written.reason === "quota"
              ? "This device is out of storage, so synced changes couldn't be saved here."
              : "Synced changes couldn't be saved on this device.";
          return false;
        }
      }

      const storeBase = (state.base[key] ??= {});
      for (const [id, base] of acceptedBase) {
        if (base) storeBase[id] = base;
        else delete storeBase[id];
      }
      entry.snapshot = fresh;
      entry.local.clear();
      entry.base.clear();
    }
    const saved = writeJson(SYNC_STATE_KEY, state, store);
    if (!saved.ok) {
      outcome.status = "error";
      outcome.message = "This device is out of storage, so sync progress couldn't be recorded.";
      return false;
    }
    return true;
  }

  async function pullAll(): Promise<boolean> {
    let cursor = state.cursor;
    let full = cursor === 0;
    const seen = new Map<string, Set<string>>();
    for (let page = 0; page < MAX_PULL_PAGES; page += 1) {
      const response = await transport.pull(userId, cursor, 1000);
      if (!deps.stillCurrent()) return false;
      if (response.resync_required) {
        if (cursor === 0) throw new Error("Server requested a resync from the beginning.");
        cursor = 0;
        full = true;
        seen.clear();
        continue;
      }
      for (const item of response.items ?? []) {
        if (!enabledKeys.has(item.store)) continue;
        if (full) {
          let ids = seen.get(item.store);
          if (!ids) seen.set(item.store, (ids = new Set()));
          ids.add(item.id);
        }
        applyRemote(item);
        outcome.pulled += 1;
      }
      cursor = Math.max(cursor, response.next_rev ?? cursor);
      if (response.save_quota) outcome.saveQuota = response.save_quota;
      if (typeof response.premium === "boolean") outcome.premium = response.premium;
      if (!response.has_more) break;
    }

    if (full) {
      // A base item absent from a complete listing was deleted and its
      // tombstone has since been purged. Treat it as deleted.
      for (const config of enabled) {
        const ids = seen.get(config.key) ?? new Set<string>();
        for (const id of Object.keys(state.base[config.key] ?? {})) {
          if (!ids.has(id)) applyRemote({ store: config.key, id, rev: 0, deleted: true, data: null });
        }
      }
    }

    state.saveQuota = outcome.saveQuota;
    state.premium = outcome.premium;
    // The cursor only moves once the pulled changes are safely stored locally.
    if (!commit()) return false;
    state.cursor = cursor;
    return commit();
  }

  /** Items the server refused during this run for a reason retrying won't fix. */
  const refused = new Set<string>();
  const refusedKey = (store: string, id: string) => `${store}|${id}`;

  function diff(): PushOp[] {
    const today = deps.today();
    const ops: PushOp[] = [];
    for (const config of enabled) {
      const local = toItems(config, readStoreValue(store, config.key));
      const base = state.base[config.key] ?? {};
      const deferred = state.deferred[config.key] ?? {};
      for (const [id, item] of local) {
        if (deferred[id] === today || refused.has(refusedKey(config.key, id))) continue;
        const entry = base[id];
        if (!entry) {
          const mode = state.adopted[config.key]?.[id] ? "adopt" : state.bootstrapped ? "normal" : "import";
          ops.push({ store: config.key, id, op: "put", base_rev: null, data: item, mode });
        } else if (entry[1] !== contentHash(item)) {
          ops.push({ store: config.key, id, op: "put", base_rev: entry[0], data: item, mode: "normal" });
        }
      }
      for (const id of Object.keys(base)) {
        if (!local.has(id) && !refused.has(refusedKey(config.key, id))) ops.push({ store: config.key, id, op: "delete", base_rev: base[id][0], mode: "normal" });
      }
    }
    return ops;
  }

  async function pushAll(): Promise<boolean> {
    for (let round = 0; round < MAX_PUSH_ROUNDS; round += 1) {
      const ops = diff();
      if (ops.length === 0) return true;
      let conflicts = 0;
      for (let start = 0; start < ops.length; start += PUSH_CHUNK) {
        const chunk = ops.slice(start, start + PUSH_CHUNK);
        const response = await transport.push(userId, chunk, deps.today());
        if (!deps.stillCurrent()) return false;
        if (!response || !Array.isArray(response.results) || response.results.length !== chunk.length) {
          throw new Error("The server returned an unexpected sync response.");
        }
        // Re-read local data: the reader may have edited while we waited.
        working.clear();
        response.results.forEach((result, index) => {
          const op = chunk[index];
          const entry = workingFor(op.store);
          if (!entry) return;
          if (result.status === "applied") {
            outcome.pushed += 1;
            if (op.op === "delete") entry.base.set(op.id, null);
            else if (result.rev != null) entry.base.set(op.id, baseEntry(result.rev, op.data));
            if (state.deferred[op.store]) delete state.deferred[op.store][op.id];
            if (state.adopted[op.store]) delete state.adopted[op.store][op.id];
          } else if (result.status === "conflict") {
            conflicts += 1;
            applyRemote({ store: op.store, id: op.id, ...result.current });
          } else {
            outcome.rejected[result.reason] = (outcome.rejected[result.reason] ?? 0) + 1;
            if (result.reason === "save_quota") (state.deferred[op.store] ??= {})[op.id] = deps.today();
            else refused.add(refusedKey(op.store, op.id));
          }
        });
        if (!commit()) return false;
      }
      if (conflicts === 0) return true;
    }
    // Still conflicting after several rounds: report it rather than loop.
    outcome.status = "partial";
    outcome.message = "Some changes are still being reconciled with your other devices. They're saved here and will sync next time.";
    return true;
  }

  try {
    if (!deps.stillCurrent()) return aborted();
    if (!(await pullAll())) return outcome.status === "error" ? outcome : aborted();
    if (!(await pushAll())) return outcome.status === "error" ? outcome : aborted();
    if (!(await pullAll())) return outcome.status === "error" ? outcome : aborted();

    const rejectedTotal = Object.values(outcome.rejected).reduce((sum, count) => sum + count, 0);
    if (rejectedTotal > 0 && outcome.status === "success") {
      outcome.status = "partial";
      const quotaOnly = Object.keys(outcome.rejected).every((reason) => reason === "save_quota");
      outcome.message = quotaOnly
        ? "Today's free word saves are used up, so some saved words will sync tomorrow. They're kept on this device."
        : "Some items couldn't be synced. They're kept on this device.";
    }
    state.bootstrapped = true;
    if (outcome.status === "success") state.lastSuccessAt = new Date().toISOString();
    if (!commit()) return outcome.status === "error" ? outcome : aborted();
    return outcome;
  } catch (error) {
    if (!deps.stillCurrent()) return aborted();
    return {
      ...outcome,
      status: "error",
      message: errorMessage(error),
    };
  }
}

function errorMessage(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error ?? "");
  if (/identity_mismatch|account_missing|not_authenticated|JWT|401|403/i.test(text)) {
    return "Sync stopped because you're no longer signed in to this account.";
  }
  if (/fetch|network|Failed to fetch|Load failed|timeout/i.test(text)) {
    return "Couldn't reach Sorlio. Your changes are saved on this device and will sync when you're back online.";
  }
  return "Sync didn't finish. Your changes are saved on this device and Sorlio will try again.";
}

/**
 * Records items that were added from guest data at the reader's request, so
 * their first upload is labelled "adopt" (see sorlio_sync_push). Returns false
 * if the marker could not be stored.
 */
export function markAdopted(store: PartitionedStore, items: Record<string, string[]>): boolean {
  const state = readSyncState(store);
  for (const [key, ids] of Object.entries(items)) {
    const marks = (state.adopted[key] ??= {});
    for (const id of ids) marks[id] = 1;
  }
  return writeJson(SYNC_STATE_KEY, state, store).ok;
}
