"use client";

import Link from "next/link";
import { useAccess } from "@/lib/access/useAccess";
import { FREE_DAILY_NEW_SAVES } from "@/lib/access/features";

/** A quiet pointer to Premium in Settings. Never shown to subscribers. */
export default function PremiumPromoCard() {
  const { ready, tier } = useAccess();
  if (!ready || tier === "premium") return null;

  return (
    <Link href="/premium" className="block rounded-card border border-brand/20 bg-brand-light p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-brand">Sorlio Premium</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            Unlimited word saving (free: {FREE_DAILY_NEW_SAVES} new words a day) and AI explanations when you want them.
          </p>
        </div>
        <span className="ligne-pill shrink-0 bg-brand text-cream">Learn more</span>
      </div>
    </Link>
  );
}
