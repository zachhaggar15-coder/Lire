import { accountIdentity, isDeletedAccount, isValidUserId, rememberDeletedAccount } from "@/lib/localData/identity";
import { PARTITION_PREFIX, activeIdentity, erasePartition } from "@/lib/localData/store";

/**
 * Removes local data belonging to accounts that were deleted on another
 * device or on the web. Runs at most once a day per device, only when online.
 */

const LAST_CHECK_KEY = "sorlio.accountCleanup.lastCheck";
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

/** Account ids that have a partition on this device. */
export function accountPartitionsOnDevice(storage: Storage | null = typeof window !== "undefined" ? window.localStorage : null): string[] {
  if (!storage) return [];
  const ids = new Set<string>();
  const prefix = `${PARTITION_PREFIX}acct.`;
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key?.startsWith(prefix)) continue;
    const id = key.slice(prefix.length, prefix.length + 36);
    if (isValidUserId(id)) ids.add(id.toLowerCase());
  }
  return [...ids];
}

export type CleanupResult = { checked: number; erased: string[]; activeErased: boolean };

export async function cleanUpDeletedAccounts(
  fetchImpl: typeof fetch = fetch,
  storage: Storage | null = typeof window !== "undefined" ? window.localStorage : null,
  now = Date.now(),
): Promise<CleanupResult> {
  const none: CleanupResult = { checked: 0, erased: [], activeErased: false };
  if (!storage) return none;
  const last = Number(storage.getItem(LAST_CHECK_KEY) ?? 0);
  if (Number.isFinite(last) && now - last < CHECK_INTERVAL_MS) return none;

  // Partitions already known to be deleted are erased without asking.
  const ids = accountPartitionsOnDevice(storage);
  const erased: string[] = [];
  for (const id of ids.filter((value) => isDeletedAccount(value))) {
    erasePartition(accountIdentity(id));
    erased.push(id);
  }
  const unknown = ids.filter((id) => !isDeletedAccount(id)).slice(0, 5);
  if (unknown.length === 0) {
    storage.setItem(LAST_CHECK_KEY, String(now));
    return { checked: 0, erased, activeErased: false };
  }

  let missing: string[] = [];
  try {
    const response = await fetchImpl("/api/account/exists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: unknown }),
    });
    if (!response.ok) return { checked: 0, erased, activeErased: false };
    const body = (await response.json()) as { missing?: unknown };
    missing = Array.isArray(body.missing) ? body.missing.filter((id): id is string => typeof id === "string" && unknown.includes(id)) : [];
  } catch {
    return { checked: 0, erased, activeErased: false };
  }

  const active = activeIdentity();
  let activeErased = false;
  for (const id of missing) {
    rememberDeletedAccount(id);
    erasePartition(accountIdentity(id));
    erased.push(id);
    if (active.kind === "account" && active.userId === id) activeErased = true;
  }
  storage.setItem(LAST_CHECK_KEY, String(now));
  return { checked: unknown.length, erased, activeErased };
}
