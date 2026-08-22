"use client";

import Link from "next/link";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";

export default function PremiumPromoCard() {
  const { status, loading } = usePremiumStatus();
  if (loading || status.isPremium) return null;

  return (
    <Link
      href="/premium"
      className="block rounded-card border border-brand/20 bg-brand-light p-4 shadow-card"
      aria-label="See Lire Premium"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-brand">Read without limits</p>
          <p className="mt-0.5 text-sm text-ink-muted">Free: one article a day. Premium: unlimited for £3.99/month.</p>
        </div>
        <span className="ligne-pill shrink-0 bg-brand text-cream">Premium</span>
      </div>
    </Link>
  );
}
