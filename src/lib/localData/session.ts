import { getSupabaseClient } from "@/lib/supabase/client";
import {
  GUEST,
  accountIdentity,
  isDeletedAccount,
  isValidUserId,
  rememberDeletedAccount,
  sameIdentity,
  supabaseSessionKey,
  type Identity,
} from "@/lib/localData/identity";
import { activeIdentity, erasePartition, setActiveIdentity } from "@/lib/localData/store";

/**
 * Identity transitions for this device: sign-in, sign-out, account deletion.
 *
 * Every transition ends in a full page reload. Components hold store data in
 * React state, so after switching partition the only way to guarantee nothing
 * of the previous identity remains on screen (or in memory, or in a pending
 * callback) is to start the page again.
 */

/**
 * Set while this tab is deliberately changing identity (sign-out, deletion),
 * so the auth listener does not start a competing reload.
 */
let transitionInProgress = false;

export function identityTransitionInProgress(): boolean {
  return transitionInProgress;
}

/** Per-tab session keys that describe what the reader was just doing. */
function clearTabSessionState(): void {
  if (typeof window === "undefined") return;
  try {
    const storage = window.sessionStorage;
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      // Cached public news is not personal; everything else (scroll positions,
      // lesson-complete markers, in-progress state) is.
      if (key && (key.startsWith("lire.") || key.startsWith("sorlio.")) && !key.startsWith("lire.rssTexts.")) storage.removeItem(key);
    }
  } catch {
    // Nothing else to do; the reload still resets in-memory state.
  }
}

function reload(path?: string): void {
  if (typeof window === "undefined") return;
  if (path) window.location.replace(path);
  else window.location.reload();
}

/** The identity implied by a Supabase user (or its absence). */
export function identityForUser(userId: string | null | undefined): Identity {
  if (!userId || !isValidUserId(userId) || isDeletedAccount(userId)) return GUEST;
  return accountIdentity(userId);
}

/**
 * Called whenever Supabase reports the session. Switches partition and reloads
 * if the signed-in account differs from the partition this tab is using.
 * Returns true if a reload was started.
 */
export function reconcileIdentity(userId: string | null | undefined): boolean {
  if (transitionInProgress) return false;
  const next = identityForUser(userId);
  if (sameIdentity(activeIdentity(), next)) return false;
  setActiveIdentity(next);
  clearTabSessionState();
  reload();
  return true;
}

/** Another tab changed the active identity: follow it. */
export function followIdentityChangeFromOtherTab(next: Identity | null): void {
  if (!next || sameIdentity(activeIdentity(), next)) return;
  setActiveIdentity(next);
  clearTabSessionState();
  reload();
}

function removeLocalSupabaseSession(): void {
  const key = supabaseSessionKey();
  if (!key || typeof window === "undefined") return;
  for (const suffix of ["", "-code-verifier", "-user"]) {
    try {
      window.localStorage.removeItem(key + suffix);
    } catch {
      // Best effort.
    }
  }
}

export interface SignOutResult {
  ok: boolean;
  /** True if the server could not be told; the device is still signed out. */
  offline: boolean;
}

/**
 * Signs this device out (other devices stay signed in), switches to the guest
 * partition and reloads. The signed-out account's data stays on the device in
 * its own partition — nobody else can see it, and it is there again if the
 * same account signs back in.
 *
 * If the server cannot be reached, the device is signed out anyway: on a
 * shared phone, "Sign out" must work offline. The refresh token simply expires
 * on the server.
 */
export async function signOutThisDevice(): Promise<SignOutResult> {
  transitionInProgress = true;
  const client = getSupabaseClient();
  let offline = false;
  try {
    const result = await client?.auth.signOut({ scope: "local" });
    if (result?.error) offline = true;
  } catch {
    offline = true;
  }
  if (offline) removeLocalSupabaseSession();
  setActiveIdentity(GUEST);
  clearTabSessionState();
  reload("/settings?signedOut=1");
  return { ok: true, offline };
}

/**
 * After the server has deleted the account: make sure nothing on this device
 * can recreate it. Order matters — the deleted marker goes first so any sync
 * still in flight stops before writing, then the partition is erased.
 */
export async function forgetDeletedAccount(userId: string): Promise<void> {
  transitionInProgress = true;
  rememberDeletedAccount(userId);
  if (sameIdentity(activeIdentity(), accountIdentity(userId))) setActiveIdentity(GUEST);
  erasePartition(accountIdentity(userId));
  try {
    await getSupabaseClient()?.auth.signOut({ scope: "local" });
  } catch {
    // The account no longer exists; the server cannot refresh this session.
  }
  removeLocalSupabaseSession();
  clearTabSessionState();
}
