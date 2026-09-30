"use client";

import { useAccess } from "@/lib/access/useAccess";

/** A quiet, persistent explanation; temporary access must never look purchased. */
export default function ClosedTestPremiumNotice() {
  const { closedTestPremium, ready } = useAccess();
  if (!ready || !closedTestPremium) return null;

  return (
    <div className="rounded-card border border-brand/20 bg-brand-light p-4">
      <p className="font-semibold text-brand">Closed testing</p>
      <p className="mt-0.5 text-sm text-ink-muted">Premium features are unlocked for testing. This is temporary access, not a subscription.</p>
    </div>
  );
}
