"use client";

/**
 * A small contextual tooltip shown inline next to the real UI it's
 * explaining — deliberately not a positioned/floating overlay (no
 * coordinate math to get wrong), just a bubble that sits directly beside
 * its target in normal document flow. Dismissible; callers control when it
 * appears (e.g. hidden after the first relevant action) so it never nags.
 */
export default function CoachMark({ text, onDismiss }: { text: string; onDismiss?: () => void }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl bg-brand px-3 py-2 text-sm font-semibold text-cream shadow-raised">
      <span className="mt-0.5 text-cream/80" aria-hidden="true">
        →
      </span>
      <p className="flex-1">{text}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss tip" className="shrink-0 text-cream/70">
          ✕
        </button>
      )}
    </div>
  );
}
