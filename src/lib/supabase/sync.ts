import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Cross-device sync for the app's localStorage stores. Deliberately a thin
 * "sync the raw localStorage value" layer, not a rewrite of every store
 * module into a Supabase-backed data layer: each store still owns its own
 * reads/writes exactly as before (see storage.ts, knownWords.ts, etc.) —
 * this just mirrors the same JSON blob to a `user_data` table (see the SQL
 * in "Cross-device sync" in the README) under the signed-in user's id,
 * keyed by the same string each store already uses as its localStorage
 * key. That keeps every existing module's logic untouched; sync is opt-in
 * plumbing bolted on at each store's write points.
 *
 * Every function here is best-effort and silently no-ops if Supabase isn't
 * configured or no one is signed in — sync is a pure enhancement, never a
 * requirement for the app to work.
 */

type StoreKind = "list-by-id" | "list-of-strings" | "object";

interface SyncedStoreConfig {
  key: string;
  kind: StoreKind;
  /** For "list-by-id" stores only: the field that uniquely identifies one entry, used to merge two devices' arrays without duplicating or dropping entries. */
  idField?: string;
}

/**
 * Every store synced, and how to merge two copies of it. New stores can be
 * added here without touching the merge logic below.
 */
const SYNCED_STORES: SyncedStoreConfig[] = [
  { key: "lire.savedWords.v1", kind: "list-by-id", idField: "word" },
  { key: "lire.knownWords.v1", kind: "list-of-strings" },
  { key: "lire.archive.v1", kind: "list-by-id", idField: "textId" },
  { key: "lire.activityDates.v1", kind: "list-of-strings" },
  { key: "lire.settings.v1", kind: "object" },
  { key: "lire.goals.v1", kind: "object" },
];

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readLocal(key: string): unknown {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: unknown): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Merges a local and a remote copy of one store — never silently drops an
 * entry that exists on only one side. For list-by-id stores, an entry
 * present on both sides is resolved in the remote's favour (simple "last
 * synced device wins" semantics, not a field-by-field merge); this is a
 * deliberate v1 simplification, not a guarantee of perfect conflict
 * resolution.
 */
function mergeStoreValue(config: SyncedStoreConfig, local: unknown, remote: unknown): unknown {
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
        byId.set((item as Record<string, unknown>)[config.idField], item);
      }
    }
    return [...byId.values()];
  }

  // "object" stores (settings, goals): shallow-merge, remote's fields win —
  // signing in is treated as "restore my preferences," but any field this
  // device has that the remote copy predates isn't dropped.
  if (typeof local === "object" && typeof remote === "object") {
    return { ...(local as object), ...(remote as object) };
  }
  return remote;
}

/** Pushes one store's current localStorage value up, tagged with the signed-in user's id. No-ops silently if not configured/signed in. */
export async function pushStore(key: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return;
    const value = readLocal(key);
    if (value === null) return;
    await client.from("user_data").upsert(
      { user_id: user.id, store_key: key, data: value, updated_at: new Date().toISOString() },
      { onConflict: "user_id,store_key" }
    );
  } catch {
    // Best-effort — a failed push just means this device's latest change
    // hasn't reached the server yet; nothing local is lost, and the next
    // successful push (or the next app load) carries the current value.
  }
}

/**
 * Pulls every synced store from Supabase, merges each with whatever's
 * already in localStorage (see mergeStoreValue), writes the merged result
 * back to localStorage, and pushes it back up too — so both this device
 * and the server end up holding the same, fully-merged data. Call once
 * right after a successful sign-in.
 */
export async function pullAndMergeAllStores(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return;

    const { data: rows, error } = await client.from("user_data").select("store_key, data").eq("user_id", user.id);
    if (error || !rows) return;

    const remoteByKey = new Map(rows.map((row) => [row.store_key, row.data]));

    for (const config of SYNCED_STORES) {
      const local = readLocal(config.key);
      const remote = remoteByKey.get(config.key) ?? null;
      const merged = mergeStoreValue(config, local, remote);
      if (merged != null) writeLocal(config.key, merged);
    }

    // Push the merged results back so the server has the full picture too
    // (otherwise anything only the local device had would stay
    // server-side-stale until its next individual write triggers a push).
    await Promise.allSettled(SYNCED_STORES.map((config) => pushStore(config.key)));
  } catch {
    // Best-effort — if this fails, the device keeps working from whatever
    // was already in localStorage; the next successful sign-in retries.
  }
}
