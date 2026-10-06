import { GUEST, type Identity } from "@/lib/localData/identity";
import { readJson, storeFor, writeJson, type PartitionedStore } from "@/lib/localData/store";
import { contentHash, fromItems, mergeItem, toItems } from "@/lib/sync/items";
import { markAdopted } from "@/lib/sync/engine";
import { SYNCED_STORES } from "@/lib/sync/stores";

/**
 * Moving guest data into an account — only ever at the reader's request.
 *
 * After a guest signs in, Sorlio asks once:
 *     "Add this device's learning data to your account?"
 *       [Add to my account]   [Keep separate]
 *
 * "Ask once" is per set of guest data: the decision is stored against a
 * fingerprint of the guest data, so the question comes back only if the guest
 * partition has changed since (the reader used Sorlio signed out again).
 *
 * Adoption is idempotent. Items are merged by id (a word already in the
 * account is merged, not duplicated), the merged result is written to the
 * account partition, and only then are the guest copies removed. A crash or a
 * retry part-way repeats the merge harmlessly.
 */

const DECISION_KEY = "sorlio.guestAdoption.v1";

/** Stores whose contents mean "this person has learning data worth keeping". */
const MEANINGFUL_STORES = [
  "lire.savedWords.v1",
  "lire.knownWords.v1",
  "lire.savedPhrases.v1",
  "lire.archive.v1",
  "lire.customTexts.v1",
  "lire.grammar.progress.v1",
  "lire.gamification.xpEvents.v1",
];

export interface GuestDataSummary {
  hasData: boolean;
  savedWords: number;
  knownWords: number;
  articlesRead: number;
  importedTexts: number;
  fingerprint: string;
}

function countItems(store: PartitionedStore, key: string): number {
  const config = SYNCED_STORES.find((entry) => entry.key === key);
  if (!config) return 0;
  return toItems(config, readJson<unknown>(key, null, store)).size;
}

export function summariseGuestData(guest: PartitionedStore = storeFor(GUEST)): GuestDataSummary {
  const counts = Object.fromEntries(MEANINGFUL_STORES.map((key) => [key, countItems(guest, key)]));
  const fingerprint = contentHash(
    SYNCED_STORES.map((config) => [config.key, readJson<unknown>(config.key, null, guest)]),
  );
  return {
    hasData: Object.values(counts).some((count) => count > 0),
    savedWords: counts["lire.savedWords.v1"],
    knownWords: counts["lire.knownWords.v1"],
    articlesRead: counts["lire.archive.v1"],
    importedTexts: counts["lire.customTexts.v1"],
    fingerprint,
  };
}

interface Decision {
  fingerprint: string;
  choice: "adopted" | "kept-separate";
  at: string;
}

/** Should the adoption question be shown to this account now? */
export function shouldOfferAdoption(account: Identity, guest: PartitionedStore = storeFor(GUEST)): GuestDataSummary | null {
  if (account.kind !== "account") return null;
  const summary = summariseGuestData(guest);
  if (!summary.hasData) return null;
  const decision = readJson<Decision | null>(DECISION_KEY, null, storeFor(account));
  if (decision?.fingerprint === summary.fingerprint) return null;
  return summary;
}

export function recordKeepSeparate(account: Identity, summary: GuestDataSummary): boolean {
  return writeJson(DECISION_KEY, { fingerprint: summary.fingerprint, choice: "kept-separate", at: new Date().toISOString() } satisfies Decision, storeFor(account)).ok;
}

export type AdoptionResult = { ok: true; moved: number } | { ok: false; error: string };

/**
 * Merges the guest partition's synced stores into the account partition, then
 * clears them from the guest partition.
 */
export function adoptGuestData(
  account: Identity,
  stores: { guest?: PartitionedStore; account?: PartitionedStore } = {},
): AdoptionResult {
  if (account.kind !== "account") return { ok: false, error: "Not signed in." };
  const guest = stores.guest ?? storeFor(GUEST);
  const target = stores.account ?? storeFor(account);
  const summary = summariseGuestData(guest);
  const adoptedIds: Record<string, string[]> = {};
  let moved = 0;

  // Phase 1: merge into the account. Nothing is removed yet.
  for (const config of SYNCED_STORES) {
    const guestItems = toItems(config, readJson<unknown>(config.key, null, guest));
    if (guestItems.size === 0) continue;
    const accountValue = readJson<unknown>(config.key, null, target);
    const accountItems = toItems(config, accountValue);
    const order = [...accountItems.keys()];
    const ids: string[] = [];
    for (const [id, item] of guestItems) {
      const existing = accountItems.get(id);
      accountItems.set(id, existing === undefined ? item : mergeItem(undefined, existing, item));
      if (existing === undefined) ids.push(id);
      moved += 1;
    }
    const written = writeJson(config.key, fromItems({ ...config, insertNew: config.insertNew ?? "end" }, accountItems, order), target);
    if (!written.ok) {
      return {
        ok: false,
        error:
          written.reason === "quota"
            ? "This device is out of storage, so the data couldn't be added. Nothing was changed on the guest side."
            : "The data couldn't be added to your account. Nothing was removed.",
      };
    }
    if (ids.length) adoptedIds[config.key] = ids;
  }

  if (!markAdopted(target, adoptedIds)) {
    return { ok: false, error: "The data couldn't be added to your account. Nothing was removed." };
  }

  // Phase 2: record the decision, then remove the guest copies.
  writeJson(DECISION_KEY, { fingerprint: summary.fingerprint, choice: "adopted", at: new Date().toISOString() } satisfies Decision, target);
  for (const config of SYNCED_STORES) guest.deleteItem(config.key);
  return { ok: true, moved };
}
