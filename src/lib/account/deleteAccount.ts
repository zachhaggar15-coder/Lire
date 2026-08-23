import { getAccessToken, signOut } from "@/lib/supabase/auth";

/**
 * Client half of account deletion, shared by Settings and /account/delete.
 *
 * Both surfaces call this rather than each posting to the endpoint themselves,
 * so the order of operations after a successful delete — clear the cached
 * entitlement, clear sync bookkeeping, then end the session — is defined once
 * and cannot drift between them.
 *
 * The client never sends a user id. The endpoint derives it from the bearer
 * token, so the only account this can ever delete is the one holding the
 * session. See app/api/account/delete/route.ts.
 */

/** Local keys that identify *the account*, as opposed to learning progress. */
const ACCOUNT_SCOPED_KEYS = [
  // Cached Play entitlement, stamped with the user id it belongs to.
  "lire.premium.status.v1",
  // Sync bookkeeping: per-store timestamps and tombstones describing what was
  // pushed to this account's rows. Meaningless once the account is gone, and
  // actively misleading if a different account signs in on this device.
  "lire.sync.storeMetadata.v1",
  "lire.sync.lastSuccessAt",
  "lire.sync.lastError",
];

export interface AccountDeletionResult {
  ok: boolean;
  error: string | null;
}

/**
 * Deletes the signed-in account, then returns the device to guest mode.
 *
 * Local learning data is deliberately left in place — see the note on
 * ACCOUNT_SCOPED_KEYS. The reader keeps reading with their words intact; what
 * disappears is the account and everything stored against it in the cloud. The
 * UI says exactly that rather than claiming a full wipe.
 */
export async function deleteAccount(): Promise<AccountDeletionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "You need to be signed in to delete your account." };

  let response: Response;
  try {
    response = await fetch("/api/account/delete", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // A failed request must leave everything exactly as it was: still signed
    // in, nothing cleared, and told plainly that it did not happen.
    return { ok: false, error: "Couldn't reach the server. Your account has not been deleted." };
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: body?.error || "Your account could not be deleted. Please try again." };
  }

  // Only past this point is the account actually gone, so only now is it safe
  // to clear anything locally.
  clearAccountScopedLocalData();
  await signOut();
  return { ok: true, error: null };
}

/** Removes the local traces of an account, leaving learning progress untouched. */
export function clearAccountScopedLocalData(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  for (const key of ACCOUNT_SCOPED_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Best effort: a storage failure here cannot un-delete the account, so
      // there is nothing useful to do but continue.
    }
  }
}

/** Exposed for tests, so the list of account-scoped keys can be asserted. */
export function accountScopedKeys(): string[] {
  return [...ACCOUNT_SCOPED_KEYS];
}
