"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getCurrentUser, onAuthStateChange, sendMagicLink, signOut } from "@/lib/supabase/auth";
import { getSyncStatus, subscribeToSyncStatus, syncNow, type SyncStatus } from "@/lib/supabase/sync";

type SendState = "idle" | "sending" | "sent" | "error";

/**
 * Settings-page card for cross-device sync. Renders nothing at all if
 * Supabase isn't configured (see "Cross-device sync" in the README) —
 * this is a pure enhancement, not a required setup step, so there's no
 * broken/disabled UI to confuse someone who hasn't set it up.
 */
export default function AccountCard() {
  const [configured, setConfigured] = useState(false);
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);
  const [sendState, setSendState] = useState<SendState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ phase: "idle", lastSuccessAt: null, error: null });

  useEffect(() => {
    setConfigured(isSupabaseConfigured());
    getCurrentUser().then((user) => setUserEmail(user?.email ?? null));
    const unsubscribe = onAuthStateChange((user) => setUserEmail(user?.email ?? null));
    const unsubscribeSync = subscribeToSyncStatus(setSyncStatus);
    setSyncStatus(getSyncStatus());
    return () => {
      unsubscribe();
      unsubscribeSync();
    };
  }, []);

  if (!configured || userEmail === undefined) return null;

  async function handleSend() {
    setSendState("sending");
    setError(null);
    const result = await sendMagicLink(email.trim());
    if (result.ok) setSendState("sent");
    else {
      setSendState("error");
      setError(result.error);
    }
  }

  async function handleSignOut() {
    await signOut();
    setUserEmail(null);
    setSendState("idle");
    setEmail("");
  }

  async function handleSyncNow() {
    setSyncStatus((s) => ({ ...s, phase: "syncing", error: null }));
    await syncNow();
  }

  const lastSyncLabel = syncStatus.lastSuccessAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(syncStatus.lastSuccessAt)
      )
    : null;

  return (
    <div className="rounded-card bg-cream-card p-4 shadow-card">
      <p className="font-semibold text-ink">Sync across devices</p>

      {userEmail ? (
        <>
          <p className="mt-0.5 text-sm text-ink-muted">Signed in as {userEmail}.</p>
          <p className="mt-1 text-xs text-ink-muted">
            {syncStatus.phase === "syncing"
              ? "Syncing..."
              : lastSyncLabel
                ? `Last synced ${lastSyncLabel}`
                : "Waiting for first sync."}
          </p>
          {syncStatus.error && <p className="mt-1 text-xs text-rose-600">{syncStatus.error}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleSyncNow}
              disabled={syncStatus.phase === "syncing"}
              className="rounded-full bg-brand px-3 py-1.5 shadow-raised text-sm font-semibold text-white active:scale-95 disabled:opacity-50"
            >
              {syncStatus.phase === "syncing" ? "Syncing..." : "Sync now"}
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-full bg-cream-dark px-3 py-1.5 text-sm font-semibold text-ink-muted active:scale-95"
            >
              Sign out
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-0.5 text-sm text-ink-muted">
            Sign in with an email link to sync saved words, known words, goals, and reading history to this account.
          </p>
          {sendState === "sent" ? (
            <p className="mt-3 text-sm font-semibold text-brand">Check your email for a sign-in link.</p>
          ) : (
            <div className="mt-3 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && email.trim()) handleSend();
                }}
                placeholder="you@example.com"
                className="min-w-0 flex-1 rounded-xl bg-cream px-3 py-2 text-sm text-ink"
              />
              <button
                onClick={handleSend}
                disabled={!email.trim() || sendState === "sending"}
                className="shrink-0 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white active:scale-95 disabled:opacity-50"
              >
                {sendState === "sending" ? "Sending…" : "Send link"}
              </button>
            </div>
          )}
          {sendState === "error" && error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
        </>
      )}
    </div>
  );
}
