import { identityId, initialIdentity, parseIdentityId, type Identity } from "@/lib/localData/identity";
import { isDeviceKey, partitionKey } from "@/lib/localData/store";

/**
 * One-time move from the original global `lire.*` keys into a partition.
 *
 * Rules (decided product behaviour):
 *  - a device with a signed-in Supabase session moves its existing learning
 *    data into THAT account's partition;
 *  - a device with no session moves it into the guest partition.
 *
 * Crash safety. The move happens in recorded phases:
 *   1. write a journal naming the target partition (so a reload mid-way keeps
 *      the same target even if the session changed meanwhile);
 *   2. move each legacy key into the target — copy (never overwriting a key
 *      the partition already has), then remove the original;
 *   3. mark the schema as v2.
 * Re-running any phase is harmless, so a crash or reload at any point simply
 * resumes. No original is removed before its copy exists.
 *
 * Some legacy keys are dropped rather than moved:
 *  - the old whole-store sync bookkeeping (it described "the last account to
 *    sync on this device" with no owner recorded — applying it to anyone is
 *    exactly the cross-account bug being fixed);
 *  - the cached Premium status (always re-fetched from the server);
 *  - retired analytics/research identifiers (analytics were removed).
 */

export const STORAGE_SCHEMA_KEY = "sorlio.storage.schema";
export const MIGRATION_JOURNAL_KEY = "sorlio.storage.migration.v2";
export const CURRENT_STORAGE_SCHEMA = "2";

const DROPPED_LEGACY_KEYS = new Set([
  "lire.sync.storeMetadata.v1",
  "lire.sync.lastSuccessAt",
  "lire.sync.lastError",
  "lire.premium.status.v1",
  "lire.analytics.localEvents.v1",
  "lire.validation.v1",
  "lire.validation.lastPromptAt",
  "lire.validation.adminToken",
  "lire.privacy.analyticsConsent.v1",
]);

export interface LegacyMigrationResult {
  migrated: boolean;
  target: Identity | null;
  copied: number;
  dropped: number;
}

function legacyKeys(storage: Storage): string[] {
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && key.startsWith("lire.") && !isDeviceKey(key)) keys.push(key);
  }
  return keys;
}

export function migrateLegacyStorage(storage: Storage | null = typeof window !== "undefined" ? window.localStorage : null): LegacyMigrationResult {
  const none: LegacyMigrationResult = { migrated: false, target: null, copied: 0, dropped: 0 };
  if (!storage) return none;
  try {
    if (storage.getItem(STORAGE_SCHEMA_KEY) === CURRENT_STORAGE_SCHEMA) return none;

    const keys = legacyKeys(storage);
    if (keys.length === 0) {
      storage.setItem(STORAGE_SCHEMA_KEY, CURRENT_STORAGE_SCHEMA);
      storage.removeItem(MIGRATION_JOURNAL_KEY);
      return none;
    }

    // Phase 1: fix the target once.
    let target = parseIdentityId(storage.getItem(MIGRATION_JOURNAL_KEY));
    if (!target) {
      target = initialIdentity(storage);
      storage.setItem(MIGRATION_JOURNAL_KEY, identityId(target));
    }

    // Phase 2: move key by key. Each original is removed only after its copy
    // exists, so peak usage stays at one extra key (a full copy-then-delete
    // could double a large store past the browser quota). A crash between the
    // copy and the removal leaves both; the resume sees the destination,
    // skips the copy and removes the original.
    let copied = 0;
    let dropped = 0;
    for (const key of keys) {
      if (DROPPED_LEGACY_KEYS.has(key)) {
        storage.removeItem(key);
        dropped += 1;
        continue;
      }
      const destination = partitionKey(target, key);
      if (storage.getItem(destination) === null) {
        const value = storage.getItem(key);
        if (value === null) continue;
        storage.setItem(destination, value);
        copied += 1;
      }
      storage.removeItem(key);
    }

    // Phase 3: mark complete.
    storage.setItem(STORAGE_SCHEMA_KEY, CURRENT_STORAGE_SCHEMA);
    storage.removeItem(MIGRATION_JOURNAL_KEY);
    return { migrated: true, target, copied, dropped };
  } catch {
    // Most likely a full quota during phase 2. The originals are untouched and
    // the journal keeps the target, so the next launch resumes. Until then the
    // app reads the (possibly partial) partition; legacy data is not lost.
    return none;
  }
}
