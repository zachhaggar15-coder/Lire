"use client";

import { useState } from "react";
import { signOut } from "@/lib/supabase/auth";
import { useDismissibleHistory } from "@/lib/useDismissibleHistory";
import { useModalFocus } from "@/lib/useModalFocus";

interface SignOutDialogProps {
  onCancel: () => void;
  onSignedOut: () => void;
}

/** A small confirmation boundary: a dismissed or failed sign-out changes nothing. */
export default function SignOutDialog({ onCancel, onSignedOut }: SignOutDialogProps) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useModalFocus<HTMLDivElement>(true, onCancel);
  useDismissibleHistory(true, onCancel);

  async function handleSignOut() {
    if (working) return;
    setWorking(true);
    setError(null);
    const result = await signOut();
    if (result.ok) {
      onSignedOut();
      return;
    }
    setWorking(false);
    setError(result.error ?? "Couldn't sign out. Please try again.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-out-title"
        tabIndex={-1}
        className="w-full max-w-md rounded-t-card bg-cream-card p-5 shadow-card sm:rounded-card"
      >
        <h2 id="sign-out-title" className="text-lg font-extrabold text-ink">
          Sign out?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Your saved learning data stays on this device, but sync and Premium access will be unavailable until you sign in again.
        </p>
        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-rose-600">
            {error}
          </p>
        )}
        <div className="mt-5 grid gap-2">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={working}
            className="min-h-12 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-cream disabled:opacity-60"
          >
            {working ? "Signing out…" : "Sign out"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={working}
            className="min-h-12 rounded-full bg-cream-dark px-5 py-3 text-sm font-semibold text-ink disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
