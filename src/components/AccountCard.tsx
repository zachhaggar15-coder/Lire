"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getCurrentUser, onAuthStateChange, sendMagicLink, signOut } from "@/lib/supabase/auth";

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

  useEffect(() => {
    setConfigured(isSupabaseConfigured());
    getCurrentUser().then((user) => setUserEmail(user?.email ?? null));
    const unsubscribe = onAuthStateChange((user) => setUserEmail(user?.email ?? null));
    return unsubscribe;
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

  return (
    <div className="rounded-3xl bg-cream-card p-4 shadow-sm">
      <p className="font-semibold text-ink">Sync across devices</p>

      {userEmail ? (
        <>
          <p className="mt-0.5 text-sm text-ink-muted">Signed in as {userEmail}.</p>
          <button
            onClick={handleSignOut}
            className="mt-3 rounded-full bg-cream-dark px-3 py-1.5 text-sm font-semibold text-ink-muted active:scale-95"
          >
            Sign out
          </button>
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
