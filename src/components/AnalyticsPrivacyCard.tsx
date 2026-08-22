"use client";

import { useEffect, useState } from "react";
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  subscribeToAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/privacy/analyticsConsent";

export default function AnalyticsPrivacyCard() {
  const [consent, setConsentState] = useState<AnalyticsConsent | null>(null);

  useEffect(() => {
    setConsentState(getAnalyticsConsent());
    return subscribeToAnalyticsConsent(setConsentState);
  }, []);

  function choose(next: AnalyticsConsent) {
    setAnalyticsConsent(next);
    setConsentState(next);
  }

  return (
    <div className="rounded-card border border-cream-dark bg-cream-card p-4">
      <p className="font-semibold text-ink">Optional analytics</p>
      <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
        {consent === "granted"
          ? "Anonymous product analytics and client crash diagnostics are allowed."
          : consent === "denied"
            ? "Optional analytics and client crash diagnostics are off."
            : "You have not made a choice yet."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => choose("granted")}
          aria-pressed={consent === "granted"}
          className={`rounded-full px-3.5 py-2 text-xs font-semibold ${consent === "granted" ? "bg-brand text-white" : "bg-cream-dark text-ink"}`}
        >
          Allow
        </button>
        <button
          type="button"
          onClick={() => choose("denied")}
          aria-pressed={consent === "denied"}
          className={`rounded-full px-3.5 py-2 text-xs font-semibold ${consent === "denied" ? "bg-brand text-white" : "bg-cream-dark text-ink"}`}
        >
          Turn off and clear identifiers
        </button>
      </div>
    </div>
  );
}
