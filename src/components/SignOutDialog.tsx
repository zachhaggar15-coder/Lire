"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "@/lib/supabase/auth";
import { createSignOutFlow, type SignOutFlowState } from "@/lib/supabase/signOutFlow";
import { useDismissibleHistory } from "@/lib/useDismissibleHistory";
import { useModalFocus } from "@/lib/useModalFocus";

interface SignOutDialogProps {
  onCancel: () => void;
  onSignedOut: () => void;
}

/** A small confirmation boundary: a dismissed or failed sign-out changes nothing. */
export default function SignOutDialog({ onCancel, onSignedOut }: SignOutDialogProps) {
  const [state, setState] = useState<SignOutFlowState>({ working: false, error: null });
  const { working, error } = state;
  // Dismissal (Escape, Android back) is ignored while a sign-out is in flight,
  // so the dialog can't vanish and leave the outcome unreported.
  const dismiss = () => {
    if (!working) onCancel();
  };
  const dialogRef = useModalFocus<HTMLDivElement>(true, dismiss);
  const cancelRef = useRef<HTMLButtonElement>(null);
  useDismissibleHistory(true, dismiss);
  // Start on the safe action so a stray Enter or tap never signs the user out.
  useEffect(() => cancelRef.current?.focus({ preventScroll: true }), []);
  const [confirm] = useState(() => createSignOutFlow(() => signOut(), onSignedOut, setState));

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
          Your saved learning data stays on this device, but account sync and Premium access will be unavailable until you sign in again.
        </p>
        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-rose-600">
            {error}
          </p>
        )}
        <div className="mt-5 grid gap-2">
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={working}
            className="min-h-12 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-cream disabled:opacity-60"
          >
            {working ? "Signing out…" : "Sign out"}
          </button>
          <button
            ref={cancelRef}
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
