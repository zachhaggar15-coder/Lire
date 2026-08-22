"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  subscribeToAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/privacy/analyticsConsent";

export default function AnalyticsConsentBanner() {
  const [consent, setConsentState] = useState<AnalyticsConsent | null | undefined>(undefined);

  useEffect(() => {
    setConsentState(getAnalyticsConsent());
    return subscribeToAnalyticsConsent(setConsentState);
  }, []);

  if (consent !== null) return null;

  function choose(next: AnalyticsConsent) {
    setAnalyticsConsent(next);
    setConsentState(next);
  }

  return (
    <aside
      aria-label="Optional analytics choice"
      className="fixed inset-x-3 bottom-[calc(5.75rem+var(--safe-bottom))] z-[80] mx-auto max-w-md rounded-card border border-cream-dark bg-cream-card p-4 shadow-raised"
    >
      <p className="font-semibold text-ink">Help improve Lire?</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        You can allow anonymous product analytics and crash diagnostics. Lire works normally if you decline, and you can change this later in Library.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => choose("granted")}
          className="min-h-12 flex-1 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
        >
          Allow optional analytics
        </button>
        <button
          type="button"
          onClick={() => choose("denied")}
          className="min-h-12 flex-1 rounded-full bg-cream-dark px-4 py-2 text-sm font-semibold text-ink"
        >
          Use without analytics
        </button>
      </div>
      <Link href="/privacy" className="mt-3 inline-block text-xs font-semibold text-brand underline underline-offset-2">
        Read the privacy policy
      </Link>
    </aside>
  );
}
