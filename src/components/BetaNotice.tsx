"use client";

import Link from "next/link";
import { VALIDATION_FEATURES } from "@/lib/validation/config";

export default function BetaNotice() {
  if (!VALIDATION_FEATURES.betaBannerEnabled) return null;
  return (
    <div className="rounded-3xl bg-cream-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">Active beta</p>
          <p className="mt-1 text-sm text-ink-muted">Lire is in active beta. Features may evolve as the reading experience improves.</p>
        </div>
        <Link href="/changelog" className="shrink-0 rounded-full bg-cream-dark px-3 py-2 text-xs font-semibold text-ink-muted active:scale-95">
          What's new
        </Link>
      </div>
    </div>
  );
}
