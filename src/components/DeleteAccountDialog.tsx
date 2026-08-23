"use client";

import { useState } from "react";
import { deleteAccount } from "@/lib/account/deleteAccount";
import { useModalFocus } from "@/lib/useModalFocus";
import { useDismissibleHistory } from "@/lib/useDismissibleHistory";
import type { PremiumStatus } from "@/lib/premium/types";

const PRODUCT_ID = process.env.NEXT_PUBLIC_GOOGLE_PLAY_PREMIUM_PRODUCT_ID || "sorlio_premium_monthly";
const MANAGE_SUBSCRIPTION_URL = `https://play.google.com/store/account/subscriptions?sku=${encodeURIComponent(PRODUCT_ID)}&package=app.sorlio.reader`;

interface DeleteAccountDialogProps {
  email: string | null;
  premium: PremiumStatus;
  onCancel: () => void;
  onDeleted: () => void;
}

/**
 * Confirmation for account deletion, shared by Settings and /account/delete.
 *
 * Two things it is careful about. It never claims more than it does: the
 * account and everything synced to it go, while the words and progress already
 * on this device stay, and it says so rather than offering a comfortable
 * "everything deleted". And when a Play subscription is live it warns first,
 * because Google owns that billing relationship — deleting a Sorlio account does
 * not cancel it, and someone could otherwise keep being charged for an account
 * that no longer exists.
 */
export default function DeleteAccountDialog({ email, premium, onCancel, onDeleted }: DeleteAccountDialogProps) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A live subscription gets its own step first, so the warning cannot be
  // skipped past on the way to the destructive button.
  const hasLiveSubscription = premium.isPremium && (premium.status === "active" || premium.status === "grace_period");
  const [acknowledgedSubscription, setAcknowledgedSubscription] = useState(!hasLiveSubscription);

  const dialogRef = useModalFocus<HTMLDivElement>(true, onCancel);
  useDismissibleHistory(true, onCancel);

  async function handleDelete() {
    setWorking(true);
    setError(null);
    const result = await deleteAccount();
    if (result.ok) {
      onDeleted();
      return;
    }
    // Still signed in, nothing cleared, and told plainly.
    setWorking(false);
    setError(result.error);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        tabIndex={-1}
        className="w-full max-w-md rounded-t-card bg-cream-card p-5 shadow-card sm:rounded-card"
      >
        {!acknowledgedSubscription ? (
          <>
            <h2 id="delete-account-title" className="text-lg font-extrabold text-ink">
              You have a Premium subscription
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Your Premium subscription is billed by Google Play. Deleting your Sorlio account does not cancel it, and
              you may continue to be charged.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Cancel in Google Play first if you no longer want to be billed.
            </p>
            <div className="mt-5 grid gap-2">
              <a
                href={MANAGE_SUBSCRIPTION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-12 rounded-full bg-brand px-5 py-3 text-center text-sm font-semibold text-white"
              >
                Manage subscription
              </a>
              <button
                type="button"
                onClick={() => setAcknowledgedSubscription(true)}
                className="min-h-12 rounded-full bg-cream-dark px-5 py-3 text-sm font-semibold text-ink"
              >
                Continue with account deletion
              </button>
              <button type="button" onClick={onCancel} className="min-h-12 px-5 py-3 text-sm font-semibold text-ink-muted">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="delete-account-title" className="text-lg font-extrabold text-ink">
              Delete your account?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              This permanently deletes your Sorlio account{email ? ` (${email})` : ""} and the learning data synced to
              it. This cannot be undone.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Your saved words and progress stay on this device and Sorlio keeps working without an account. To remove
              them too, clear the app&rsquo;s storage or uninstall it.
            </p>
            {hasLiveSubscription && (
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Your Google Play subscription is not cancelled by this.
              </p>
            )}
            {error && (
              <p role="alert" className="mt-3 text-sm font-semibold text-rose-600">
                {error}
              </p>
            )}
            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={working}
                className="min-h-12 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {working ? "Deleting…" : "Delete account"}
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
          </>
        )}
      </div>
    </div>
  );
}
