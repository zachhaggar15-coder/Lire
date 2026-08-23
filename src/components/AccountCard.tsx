"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getCurrentUser, onAuthStateChange, signInWithGoogle, signOut } from "@/lib/supabase/auth";
import { getSyncStatus, subscribeToSyncStatus, syncNow, type SyncStatus } from "@/lib/supabase/sync";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";
import DeleteAccountDialog from "@/components/DeleteAccountDialog";
import GoogleSignInButton from "@/components/GoogleSignInButton";

/**
 * Settings card for cross-device sync and the account behind it.
 *
 * Renders nothing when Supabase isn't configured (see "Cross-device sync" in
 * the README) — sync is a pure enhancement, so there is no broken or disabled
 * UI for someone who hasn't set it up.
 *
 * Signing in is optional and framed by what it gets you rather than as a
 * gate: Sorlio works fully as a guest, and this exists so words and progress
 * survive a new phone.
 */
export default function AccountCard() {
  const [configured, setConfigured] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ phase: "idle", lastSuccessAt: null, error: null });
  const { status: premium } = usePremiumStatus();

  useEffect(() => {
    setConfigured(isSupabaseConfigured());
    getCurrentUser().then((user) => setUserEmail(user?.email ?? null));
    // Only the email is tracked here. The merge that carries a guest's
    // progress up to the account is done app-wide by AuthSync, so starting
    // another one here would have two merges racing on the same stores.
    const unsubscribe = onAuthStateChange((user) => setUserEmail(user?.email ?? null));
    const unsubscribeSync = subscribeToSyncStatus(setSyncStatus);
    setSyncStatus(getSyncStatus());
    return () => {
      unsubscribe();
      unsubscribeSync();
    };
  }, []);

  if (!configured || userEmail === undefined) return null;

  async function handleSignIn() {
    setSigningIn(true);
    setError(null);
    const result = await signInWithGoogle("/settings");
    if (!result.ok) {
      // Cancelling at Google simply returns here with no session and no error,
      // so there is nothing to clear and nothing to report.
      setSigningIn(false);
      setError(result.error);
    }
  }

  async function handleSignOut() {
    await signOut();
    setUserEmail(null);
  }

  const lastSyncLabel = syncStatus.lastSuccessAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(syncStatus.lastSuccessAt)
      )
    : null;

  return (
    <div className="rounded-card bg-cream-card p-4 shadow-card">
      {userEmail ? (
        <>
          <p className="font-semibold text-ink">Account</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">Signed in as</p>
          <p className="text-sm text-ink">{userEmail}</p>
          <p className="mt-2 text-xs text-ink-muted">
            {syncStatus.phase === "syncing"
              ? "Syncing…"
              : lastSyncLabel
                ? `Your progress is synced. Last synced ${lastSyncLabel}`
                : "Your progress will sync shortly."}
          </p>
          {syncStatus.error && <p className="mt-1 text-xs text-rose-600">{syncStatus.error}</p>}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => void syncNow()}
              disabled={syncStatus.phase === "syncing"}
              className="min-h-12 rounded-full bg-brand px-4 py-2 shadow-raised text-sm font-semibold text-white disabled:opacity-50"
            >
              {syncStatus.phase === "syncing" ? "Syncing…" : "Sync now"}
            </button>
            <button
              onClick={handleSignOut}
              className="min-h-12 rounded-full bg-cream-dark px-4 py-2 text-sm font-semibold text-ink-muted"
            >
              Sign out
            </button>
          </div>

          {/* Kept below a divider and styled destructively so it reads as a
              different class of action from the two above it. */}
          <div className="mt-4 border-t border-cream-fill pt-3">
            <button
              onClick={() => setConfirmingDelete(true)}
              className="min-h-12 text-sm font-semibold text-rose-600 underline underline-offset-2"
            >
              Delete account
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="font-semibold text-ink">Sync your progress</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            Keep your saved words, reviews and progress available across devices. Sorlio works without an account —
            signing in only adds sync and lets you restore Premium.
          </p>
          <div className="mt-3">
            <GoogleSignInButton onClick={handleSignIn} disabled={signingIn} busy={signingIn} />
          </div>
          {error && (
            <p role="alert" className="mt-2 text-xs text-rose-600">
              {error}
            </p>
          )}
        </>
      )}

      {confirmingDelete && (
        <DeleteAccountDialog
          email={userEmail}
          premium={premium}
          onCancel={() => setConfirmingDelete(false)}
          onDeleted={() => {
            setConfirmingDelete(false);
            setUserEmail(null);
          }}
        />
      )}
    </div>
  );
}
