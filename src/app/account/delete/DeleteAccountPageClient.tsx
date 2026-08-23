"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppBar from "@/components/AppBar";
import DeleteAccountDialog from "@/components/DeleteAccountDialog";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getCurrentUser, onAuthStateChange, signInWithGoogle } from "@/lib/supabase/auth";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";

/**
 * Deletion outside the installed app.
 *
 * Same dialog, same endpoint, same guarantees as Settings — the only thing
 * this page adds is a way to reach them from a browser, for someone who has
 * uninstalled Liree or never had the Android build. Signing in is required
 * because deletion is authorised by the session, never by a submitted id.
 */
export default function DeleteAccountPageClient() {
  const [configured, setConfigured] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const { status: premium } = usePremiumStatus();

  useEffect(() => {
    setConfigured(isSupabaseConfigured());
    getCurrentUser().then((user) => setUserEmail(user?.email ?? null));
    return onAuthStateChange((user) => setUserEmail(user?.email ?? null));
  }, []);

  async function handleSignIn() {
    setSigningIn(true);
    setError(null);
    const result = await signInWithGoogle("/account/delete");
    if (!result.ok) {
      setSigningIn(false);
      setError(result.error);
    }
  }

  return (
    <div className="ligne-screen">
      <AppBar title="Delete account" kicker="Liree account" backHref="/settings" backLabel="Back to settings" />

      {deleted ? (
        <section className="rounded-card border border-cream-dark bg-cream-card p-5 shadow-card">
          <p className="font-semibold text-ink">Your account has been deleted.</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Your Liree account and the learning data synced to it have been removed. Liree still works on this device
            without an account.
          </p>
          <Link href="/" className="ligne-pill mt-4 inline-block bg-brand text-cream">
            Back to Liree
          </Link>
        </section>
      ) : (
        <>
          <section className="rounded-card border border-cream-dark bg-cream-card p-5 shadow-card">
            <p className="font-semibold text-ink">What deleting your account removes</p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-muted">
              <li>Your Liree account itself, and the sign-in that goes with it.</li>
              <li>The learning data synced to that account — saved words, progress, reviews and history.</li>
              <li>Any feedback or research responses submitted while signed in.</li>
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Learning data already stored on a device stays there and keeps working without an account. To remove it
              too, clear Liree&rsquo;s storage or uninstall the app on that device.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              A Premium subscription is billed by Google Play, not by Liree. Deleting your account does not cancel it —
              cancel in Google Play if you no longer want to be billed.
            </p>
          </section>

          <section className="mt-4 rounded-card border border-cream-dark bg-cream-card p-5 shadow-card">
            {!configured ? (
              <p className="text-sm text-ink-muted">Accounts aren&rsquo;t enabled in this build, so there is nothing to delete.</p>
            ) : userEmail === undefined ? (
              <p className="text-sm text-ink-muted">Checking your account…</p>
            ) : userEmail ? (
              <>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">Signed in as</p>
                <p className="text-sm text-ink">{userEmail}</p>
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="mt-4 min-h-12 w-full rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white"
                >
                  Delete account
                </button>
              </>
            ) : (
              <>
                <p className="font-semibold text-ink">Sign in to delete your account</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Deleting an account requires signing in to it, so only its owner can remove it.
                </p>
                <div className="mt-4">
                  <GoogleSignInButton onClick={handleSignIn} disabled={signingIn} busy={signingIn} />
                </div>
              </>
            )}
            {error && (
              <p role="alert" className="mt-3 text-sm text-rose-600">
                {error}
              </p>
            )}
          </section>
        </>
      )}

      {confirming && (
        <DeleteAccountDialog
          email={userEmail ?? null}
          premium={premium}
          onCancel={() => setConfirming(false)}
          onDeleted={() => {
            setConfirming(false);
            setUserEmail(null);
            setDeleted(true);
          }}
        />
      )}
    </div>
  );
}
