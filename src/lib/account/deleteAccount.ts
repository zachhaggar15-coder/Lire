import { getSupabaseClient } from "@/lib/supabase/client";
import { forgetDeletedAccount } from "@/lib/localData/session";

/**
 * Client half of account deletion, shared by Settings and /account/delete.
 *
 * The client never sends a user id. The endpoint derives it from the bearer
 * token, so the only account this can ever delete is the one holding the
 * session. See app/api/account/delete/route.ts.
 *
 * Order after the server confirms deletion (see forgetDeletedAccount):
 *   1. the account id is recorded as deleted on this device, which stops any
 *      sync still in flight before it writes anything;
 *   2. the account's local partition — its learning data and sync state on
 *      this device — is erased;
 *   3. the session is removed and the device returns to guest mode.
 * Guest data and any other account's partition are untouched.
 */

export interface AccountDeletionResult {
  ok: boolean;
  error: string | null;
}

export async function deleteAccount(): Promise<AccountDeletionResult> {
  const client = getSupabaseClient();
  const { data } = client ? await client.auth.getSession() : { data: { session: null } };
  const session = data.session;
  if (!session) return { ok: false, error: "You need to be signed in to delete your account." };

  let response: Response;
  try {
    response = await fetch("/api/account/delete", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
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

  // Only past this point is the account actually gone.
  await forgetDeletedAccount(session.user.id);
  return { ok: true, error: null };
}
