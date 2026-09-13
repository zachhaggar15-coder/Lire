"use client";

import { useEffect, useState } from "react";
import { PLAY_STORE_URL, isAndroidApp } from "@/lib/androidApp";
import { getRatePromptState, isEligibleForRatePrompt, markRatePromptShown, markRated } from "@/lib/ratePrompt";
import { trackEvent } from "@/lib/analytics/client";
import { FeedbackButton } from "@/components/FeedbackModal";

/**
 * "Rate Sorlio" invitation for the lesson-complete screen. Renders nothing
 * unless the learner is in the Android app and qualifies (see lib/ratePrompt.ts).
 * Eligibility is decided once on mount, so the card doesn't vanish mid-view
 * once it records itself as shown.
 */
export default function RateSorlioCard({ source }: { source: string }) {
  const [visible, setVisible] = useState(false);
  const [thanked, setThanked] = useState(false);

  useEffect(() => {
    if (!isEligibleForRatePrompt(getRatePromptState(), isAndroidApp())) return;
    markRatePromptShown();
    setVisible(true);
    trackEvent("rate_prompt_shown", { source });
  }, [source]);

  if (!visible) return null;

  if (thanked) {
    return (
      <div className="rounded-card bg-brand-light p-4 text-sm font-semibold text-brand">Thank you — it really helps Sorlio grow.</div>
    );
  }

  return (
    <section className="rounded-card border border-cream-dark bg-cream-card p-4 text-left">
      <p className="font-semibold text-ink">Finding Sorlio useful?</p>
      <p className="mt-0.5 text-sm text-ink-muted">A quick rating on Google Play helps other French learners find it. Something not right? Tell us instead.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            markRated();
            trackEvent("rate_app_opened", { source });
            setThanked(true);
          }}
          className="ligne-pill bg-brand text-cream"
        >
          Rate on Google Play
        </a>
        <FeedbackButton feature={`rate_prompt_${source}`} label="Send feedback" className="ligne-pill border border-cream-dark bg-cream text-ink" />
      </div>
      <button type="button" onClick={() => setVisible(false)} className="mt-1 w-full text-xs font-semibold text-ink-muted">
        Not now
      </button>
    </section>
  );
}
