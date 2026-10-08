import { getSupabaseClient } from "@/lib/supabase/client";
import { activeIdentity, localStore, readJson, storeFor, writeJson } from "@/lib/localData/store";
import { notifyStoreChanged, syncNow } from "@/lib/sync/runtime";
import { importLegacyStore, removeStoreFromCloud } from "@/lib/sync/transport";

/**
 * Account-level sync preferences (synced, so every device follows them).
 *
 * importedTexts — copy imported texts to the account so they appear on the
 * reader's other devices. OFF by default: imported text can be private
 * (schoolwork, diaries, messages), so it stays on the device unless the
 * reader chooses otherwise.
 */

const KEY = "lire.syncPreferences.v1";
const CUSTOM_TEXTS = "lire.customTexts.v1";

export interface SyncPreferences {
  importedTexts: boolean;
}

export function getSyncPreferences(): SyncPreferences {
  const value = readJson<Partial<SyncPreferences> | null>(KEY, null, localStore);
  return { importedTexts: value?.importedTexts === true };
}

export type PreferenceResult = { ok: true } | { ok: false; error: string };

/**
 * Turning on: records the choice, brings across any imported texts this
 * account had in the old sync format, then syncs.
 * Turning off: records the choice and syncs it (so other devices stop
 * uploading), then deletes the cloud copies. Local copies on every device
 * are kept.
 */
export async function setImportedTextSync(enabled: boolean): Promise<PreferenceResult> {
  const identity = activeIdentity();
  if (identity.kind !== "account") return { ok: false, error: "Sign in to sync imported texts." };
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: "Sync isn't available right now." };

  const written = writeJson(KEY, { ...getSyncPreferences(), importedTexts: enabled }, storeFor(identity));
  if (!written.ok) return { ok: false, error: "This device couldn't save the setting." };
  notifyStoreChanged(KEY);

  if (enabled) {
    await importLegacyStore(client, identity.userId, CUSTOM_TEXTS);
    const outcome = await syncNow();
    return outcome && outcome.status !== "error" ? { ok: true } : { ok: false, error: "The setting is on, but syncing didn't finish. Sorlio will try again." };
  }

  await syncNow();
  const removed = await removeStoreFromCloud(client, identity.userId, CUSTOM_TEXTS);
  return removed
    ? { ok: true }
    : { ok: false, error: "Sync is off, but the copies in your account couldn't be removed yet. Try again when you're online." };
}
