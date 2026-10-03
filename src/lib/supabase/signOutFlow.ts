import type { AuthResult } from "@/lib/supabase/auth";

/**
 * The state machine behind the Sign out confirmation, kept out of the
 * component so its guarantees can be tested directly: a second press while a
 * sign-out is in flight does nothing, success is reported exactly once, and a
 * failure leaves the dialog open with a retryable error.
 */

export interface SignOutFlowState {
  working: boolean;
  error: string | null;
}

export function createSignOutFlow(
  signOutFn: () => Promise<AuthResult>,
  onSignedOut: () => void,
  onState: (state: SignOutFlowState) => void,
) {
  let working = false;
  return async function confirm(): Promise<void> {
    if (working) return;
    working = true;
    onState({ working: true, error: null });
    let result: AuthResult;
    try {
      result = await signOutFn();
    } catch {
      result = { ok: false, error: null };
    }
    if (result.ok) {
      onSignedOut();
      return;
    }
    working = false;
    onState({ working: false, error: result.error ?? "Couldn't sign out. Please try again." });
  };
}
