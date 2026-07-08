"use client";

import { useEffect, useState } from "react";
import type { SentenceExplanation } from "@/lib/ai/types";
import { getSentenceExplanation } from "@/lib/ai/client/sentenceExplanation";

type AiState = "idle" | "loading" | "ready" | "error";

interface SentenceSheetProps {
  /** The tapped sentence's French text, or null when the sheet is closed. */
  sentence: string | null;
  /** From Settings — "Enable AI help". When off, "Ask AI to explain" just shows the placeholder message. */
  aiEnabled: boolean;
  onClose: () => void;
}

/**
 * Bottom sheet shown on a sentence tap. There is no automatic translation
 * or explanation here — the app only calls AI when a reader explicitly taps
 * "Ask AI to explain," and only if "Enable AI help" is on in Settings.
 */
export default function SentenceSheet({ sentence, aiEnabled, onClose }: SentenceSheetProps) {
  const [showAiPlaceholder, setShowAiPlaceholder] = useState(false);
  const [aiState, setAiState] = useState<AiState>("idle");
  const [aiResult, setAiResult] = useState<SentenceExplanation | null>(null);
  const open = sentence !== null;

  // Reset whenever a different sentence is shown.
  useEffect(() => {
    setShowAiPlaceholder(false);
    setAiState("idle");
    setAiResult(null);
  }, [sentence]);

  function handleAskAi() {
    if (!aiEnabled) {
      setShowAiPlaceholder(true);
      return;
    }
    if (!sentence) return;
    setAiState("loading");
    getSentenceExplanation(sentence).then((result) => {
      if (result) {
        setAiResult(result);
        setAiState("ready");
      } else {
        setAiState("error");
      }
    });
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-hidden={!open}
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl border-t border-slate-200 bg-white p-5 shadow-2xl transition-transform duration-200 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(1.25rem + var(--safe-bottom))" }}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Sentence</p>
            <p className="mt-1 text-base font-semibold leading-snug text-slate-900">{sentence}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 active:scale-95"
          >
            Done
          </button>
        </div>

        <div className="mt-4">
          {aiState === "idle" && (
            <button
              onClick={handleAskAi}
              className="rounded-full bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 active:scale-95"
            >
              Ask AI to explain
            </button>
          )}
          {showAiPlaceholder && (
            <p className="mt-2 text-sm italic text-slate-400">
              AI explanations are not enabled yet.
            </p>
          )}
          {aiState === "loading" && (
            <p className="mt-2 text-sm italic text-slate-400">Asking the AI tutor…</p>
          )}
          {aiState === "error" && (
            <p className="mt-2 text-sm text-rose-500">
              Couldn&apos;t explain this sentence.{" "}
              <button onClick={handleAskAi} className="underline">
                Try again
              </button>
            </p>
          )}
          {aiState === "ready" && aiResult && (
            <>
              <div className="mt-2 rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  English
                </p>
                <p className="mt-1 text-sm text-slate-700">{aiResult.translation}</p>
              </div>
              {aiResult.explanation && (
                <div className="mt-3 rounded-2xl bg-violet-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                    Explanation
                  </p>
                  <p className="mt-1 text-sm text-violet-900">{aiResult.explanation}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
