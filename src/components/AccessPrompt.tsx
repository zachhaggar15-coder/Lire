"use client";

import { useId, useRef } from "react";
import Link from "next/link";
import ModalDialog from "@/components/ModalDialog";
import { FEATURES, FREE_DAILY_NEW_SAVES, type Feature } from "@/lib/access/features";
import type { AccessDenialReason } from "@/lib/access/accessModel";

/**
 * Shown when something is outside the free tier.
 *
 * Deliberately calm: it says what happened, what still works for free, and
 * what Premium would add. No countdowns, no urgency, no guilt. "Not now" is a
 * full-size button that is focused first, and Escape / back / tapping outside
 * all dismiss it. The bottom navigation hides while it is open (ModalDialog),
 * so the dismiss button can never be covered.
 */
interface AccessPromptProps {
  reason: AccessDenialReason;
  feature: Feature;
  isGuest: boolean;
  onDismiss: () => void;
}

function copyFor(reason: AccessDenialReason, feature: Feature): { title: string; body: string } {
  if (reason === "daily-save-limit") {
    return {
      title: `You've saved ${FREE_DAILY_NEW_SAVES} new words today`,
      body: "That's today's free limit for new words — it resets tomorrow. You can still review every word you've saved, keep reading and look up any word. Premium lets you save as many words as you like.",
    };
  }
  const label = FEATURES[feature].label;
  if (feature === "aiTranslation") {
    return {
      title: "Natural AI translation is part of Premium",
      body: "The built-in translation still works for every sentence. Premium adds natural, context-aware AI translation of news and texts you import.",
    };
  }
  if (feature === "aiPractice") {
    return {
      title: "AI practice is part of Premium",
      body: "All the other practice exercises are free. Premium adds AI-generated paraphrase practice.",
    };
  }
  return {
    title: "AI help is part of Premium",
    body: `The built-in dictionary still works for every word. Premium adds ${label.charAt(0).toLowerCase()}${label.slice(1)}.`,
  };
}

export default function AccessPrompt({ reason, feature, isGuest, onDismiss }: AccessPromptProps) {
  const titleId = useId();
  const bodyId = useId();
  const dismissRef = useRef<HTMLButtonElement>(null);
  const copy = copyFor(reason, feature);

  return (
    <ModalDialog titleId={titleId} describedById={bodyId} onDismiss={onDismiss} initialFocusRef={dismissRef}>
      <h2 id={titleId} className="text-lg font-extrabold text-ink">
        {copy.title}
      </h2>
      <p id={bodyId} className="mt-2 text-sm leading-relaxed text-ink-muted">
        {copy.body}
      </p>
      {isGuest && (
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Premium is linked to a Google sign-in so it works on all your devices.
        </p>
      )}
      <div className="mt-5 grid gap-2">
        <button
          ref={dismissRef}
          type="button"
          onClick={onDismiss}
          className="min-h-12 rounded-full bg-cream-dark px-5 py-3 text-sm font-semibold text-ink"
        >
          Not now
        </button>
        <Link href="/premium" className="min-h-12 rounded-full bg-brand px-5 py-3 text-center text-sm font-semibold text-cream">
          About Premium
        </Link>
      </div>
    </ModalDialog>
  );
}
