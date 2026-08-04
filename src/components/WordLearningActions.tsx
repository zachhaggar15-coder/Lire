"use client";

import type { WordStatus } from "@/types";

interface WordLearningActionsProps {
  status?: WordStatus | null;
  onKnow: () => void;
  onUnsure: () => void;
  onSave: () => void;
  onUnsave?: () => void;
  showExplanation?: boolean;
}

export default function WordLearningActions({
  status,
  onKnow,
  onUnsure,
  onSave,
  onUnsave,
  showExplanation = true,
}: WordLearningActionsProps) {
  const isSaved = status === "learning" || status === "unsure";

  return (
    <div>
      {showExplanation ? (
        <p className="text-sm leading-6 text-ink-muted sm:text-base">
          <strong className="font-semibold text-ink">Known</strong>{" "}
          means this won&apos;t enter your review queue.{" "}
          <strong className="font-semibold text-ink">Unsure</strong>{" "}
          means you recognise it but want to strengthen recall.{" "}
          <strong className="font-semibold text-ink">Save</strong>{" "}
          means it&apos;s a word you&apos;re currently learning.
        </p>
      ) : null}

      <div className={`${showExplanation ? "mt-4" : ""} grid grid-cols-3 gap-2 sm:gap-3`}>
        <button
          type="button"
          onClick={onKnow}
          disabled={status === "known"}
          className={`min-h-12 rounded-full px-2 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-default sm:px-4 sm:text-base ${
            status === "known" ? "bg-brand text-white" : "bg-cream text-ink hover:bg-cream-dark"
          }`}
        >
          Known
        </button>
        <button
          type="button"
          onClick={onUnsure}
          disabled={status === "unsure" || status === "known"}
          className={`min-h-12 rounded-full px-2 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-default sm:px-4 sm:text-base ${
            status === "unsure" ? "bg-brand text-white" : "bg-cream text-ink hover:bg-cream-dark"
          }`}
        >
          Unsure
        </button>
        <button
          type="button"
          onClick={isSaved ? onUnsave : onSave}
          disabled={status === "known" || (isSaved && !onUnsave)}
          className="min-h-12 rounded-full bg-brand px-2 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark active:scale-[0.98] disabled:cursor-default disabled:opacity-60 sm:px-4 sm:text-base"
        >
          {isSaved ? "Unsave" : "Save"}
        </button>
      </div>
    </div>
  );
}
