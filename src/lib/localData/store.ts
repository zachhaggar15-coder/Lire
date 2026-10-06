import {
  ACTIVE_IDENTITY_KEY,
  DELETED_ACCOUNTS_KEY,
  GUEST,
  identityId,
  initialIdentity,
  isDeletedAccount,
  sameIdentity,
  supabaseSessionKey,
  type Identity,
} from "@/lib/localData/identity";
import { migrateLegacyStorage } from "@/lib/localData/migrateLegacy";

/**
 * Partitioned access to the device's local storage.
 *
 * Every learning store calls `localStore` instead of `window.localStorage`.
 * Keys are mapped into the active identity's partition:
 *
 *   lire.savedWords.v1  →  sorlio.v2:acct.<user id>:lire.savedWords.v1
 *                          sorlio.v2:guest:lire.savedWords.v1
 *
 * The default is "partitioned". Only the short DEVICE_KEYS list below is
 * shared by every identity on the device, and nothing on it describes a
 * person's learning or content.
 *
 * Writes report whether they landed (`writeItem`). The raw `setItem` keeps the
 * throwing behaviour of `Storage.setItem` so code written against the Web
 * Storage API keeps its existing error handling.
 */

export const PARTITION_PREFIX = "sorlio.v2:";

/** Keys that are about the device, not about whoever is using it. */
const DEVICE_KEYS = new Set<string>([
  ACTIVE_IDENTITY_KEY,
  DELETED_ACCOUNTS_KEY,
  "sorlio.storage.schema",
  "sorlio.storage.migration.v2",
  // Service-worker reload guard and Android-wrapper detection are properties
  // of the installation.
  "lire.swAutoReloaded.v1",
  "lire.androidApp.v1",
]);

export function isDeviceKey(key: string): boolean {
  if (DEVICE_KEYS.has(key)) return true;
  const sessionKey = supabaseSessionKey();
  // Supabase owns its own session keys (token, PKCE verifier).
  return !!sessionKey && key.startsWith(sessionKey);
}

export function partitionKey(identity: Identity, key: string): string {
  return `${PARTITION_PREFIX}${identityId(identity)}:${key}`;
}

export function partitionKeyPrefix(identity: Identity): string {
  return `${PARTITION_PREFIX}${identityId(identity)}:`;
}

export type WriteFailure = "unavailable" | "quota" | "stale-identity" | "error";
export type WriteResult = { ok: true } | { ok: false; reason: WriteFailure };

function rawStorage(): Storage | null {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { name?: string; code?: number };
  return e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED" || e.code === 22 || e.code === 1014;
}

// ---------------------------------------------------------------------------
// Active identity (per tab)
// ---------------------------------------------------------------------------

let active: Identity | null = null;
/**
 * Bumped on every identity change in this tab. Async work captures the
 * generation it started in and must not touch the active partition once it
 * has moved on — see `isCurrentGeneration`.
 */
let generation = 0;

export function activeIdentity(): Identity {
  if (!active) {
    const storage = rawStorage();
    if (storage) {
      // Must happen before the first partitioned read. Synchronous, idempotent
      // and resumable — see migrateLegacy.ts.
      migrateLegacyStorage(storage);
      active = initialIdentity(storage);
      // Published for the pre-paint theme script (theme.ts) and other tabs.
      try {
        storage.setItem(ACTIVE_IDENTITY_KEY, identityId(active));
      } catch {
        // Not needed for correctness in this tab.
      }
    } else {
      active = GUEST;
    }
  }
  return active;
}

export function currentGeneration(): number {
  activeIdentity();
  return generation;
}

export function isCurrentGeneration(captured: number): boolean {
  return captured === generation;
}

/**
 * Switches this tab to a different partition. Returns true when the identity
 * actually changed. Callers that render data must reload afterwards (see
 * IdentityController) — components hold the previous partition's data in
 * memory.
 */
export function setActiveIdentity(next: Identity): boolean {
  const previous = activeIdentity();
  const changed = !sameIdentity(previous, next);
  if (changed) {
    active = next;
    generation += 1;
  }
  const storage = rawStorage();
  if (storage) {
    try {
      storage.setItem(ACTIVE_IDENTITY_KEY, identityId(next));
    } catch {
      // The in-memory identity is authoritative for this tab.
    }
  }
  return changed;
}

/** Test seam: reset module state. */
export function __resetLocalStoreForTests(identity: Identity | null = null): void {
  active = identity;
  generation = 0;
}

// ---------------------------------------------------------------------------
// Partitioned access
// ---------------------------------------------------------------------------

export interface PartitionedStore {
  readonly identity: Identity;
  getItem(key: string): string | null;
  /** Throws like Storage.setItem on failure. */
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  /** Non-throwing write that reports the outcome. */
  writeItem(key: string, value: string): WriteResult;
  /** Non-throwing remove that reports the outcome. */
  deleteItem(key: string): WriteResult;
  /** Base keys present in this partition. */
  keys(): string[];
}

function resolve(identity: Identity, key: string): string {
  return isDeviceKey(key) ? key : partitionKey(identity, key);
}

function guardDeleted(identity: Identity): boolean {
  return identity.kind === "account" && isDeletedAccount(identity.userId);
}

export function storeFor(identity: Identity): PartitionedStore {
  return {
    identity,
    getItem(key) {
      const storage = rawStorage();
      if (!storage || guardDeleted(identity)) return null;
      return storage.getItem(resolve(identity, key));
    },
    setItem(key, value) {
      const storage = rawStorage();
      if (!storage) throw new Error("Storage unavailable");
      if (guardDeleted(identity)) throw new Error("Account deleted on this device");
      storage.setItem(resolve(identity, key), value);
    },
    removeItem(key) {
      const storage = rawStorage();
      if (!storage) return;
      storage.removeItem(resolve(identity, key));
    },
    writeItem(key, value) {
      const storage = rawStorage();
      if (!storage) return { ok: false, reason: "unavailable" };
      if (guardDeleted(identity)) return { ok: false, reason: "stale-identity" };
      try {
        storage.setItem(resolve(identity, key), value);
        return { ok: true };
      } catch (error) {
        return { ok: false, reason: isQuotaError(error) ? "quota" : "error" };
      }
    },
    deleteItem(key) {
      const storage = rawStorage();
      if (!storage) return { ok: false, reason: "unavailable" };
      try {
        storage.removeItem(resolve(identity, key));
        return { ok: true };
      } catch {
        return { ok: false, reason: "error" };
      }
    },
    keys() {
      const storage = rawStorage();
      if (!storage) return [];
      const prefix = partitionKeyPrefix(identity);
      const out: string[] = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key?.startsWith(prefix)) out.push(key.slice(prefix.length));
      }
      return out;
    },
  };
}

/** The store for whichever identity this tab is currently using. */
export const localStore: PartitionedStore = {
  get identity() {
    return activeIdentity();
  },
  getItem: (key) => storeFor(activeIdentity()).getItem(key),
  setItem: (key, value) => storeFor(activeIdentity()).setItem(key, value),
  removeItem: (key) => storeFor(activeIdentity()).removeItem(key),
  writeItem: (key, value) => storeFor(activeIdentity()).writeItem(key, value),
  deleteItem: (key) => storeFor(activeIdentity()).deleteItem(key),
  keys: () => storeFor(activeIdentity()).keys(),
};

export function hasLocalStorage(): boolean {
  return rawStorage() !== null;
}

/** Reads and parses JSON from the active partition. Unreadable values return the fallback. */
export function readJson<T>(key: string, fallback: T, store: PartitionedStore = localStore): T {
  try {
    const raw = store.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Serialises and writes JSON, reporting whether it landed. */
export function writeJson(key: string, value: unknown, store: PartitionedStore = localStore): WriteResult {
  let serialised: string;
  try {
    serialised = JSON.stringify(value);
  } catch {
    return { ok: false, reason: "error" };
  }
  return store.writeItem(key, serialised);
}

/**
 * Removes every key in an identity's partition. Used after account deletion.
 * Returns the number of keys that could not be removed.
 */
export function erasePartition(identity: Identity): number {
  const storage = rawStorage();
  if (!storage) return 0;
  const prefix = partitionKeyPrefix(identity);
  const doomed: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(prefix)) doomed.push(key);
  }
  let failures = 0;
  for (const key of doomed) {
    try {
      storage.removeItem(key);
    } catch {
      failures += 1;
    }
  }
  return failures;
}
