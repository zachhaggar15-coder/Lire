"use client";

import { useEffect, useState } from "react";
import type { SentenceExplanation } from "@/lib/ai/types";
import { getSentenceExplanation } from "@/lib/ai/client";

export interface ActiveSentenceState {
  sentence: string;
  previousSentence: string | null;
  nextSentence: string | null;
}

type AiState = "idle" | "loading" | "ready" | "error";

interface SentenceSheetProps {
  /** The tapped sentence (plus its neighbours), or null when the sheet is closed. */
  state: ActiveSentenceState | null;
  articleTitle: string;
  onClose: () => void;
}

/**
 * Bottom sheet shown on a sentence tap. There is no automatic translation or
 * explanation here — the app only calls AI when a reader explicitly taps
 * "Ask AI to explain."
 */
export default function SentenceSheet({ state, articleTitle, onClose }: SentenceSheetProps) {
  const [aiState, setAiState] = useState<AiState>("idle");
  const [aiResult, setAiResult] = useState<SentenceExplanation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const open = state !== null;

  // Reset whenever a different sentence is shown.
  useEffect(() => {
    setAiState("idle");
    setAiResult(null);
    setAiError(null);
  }, [state?.sentence]);

  async function handleAskAi() {
    if (!state) return;
    setAiState("loading");
    setAiError(null);
    const result = await getSentenceExplanation({
      sentence: state.sentence,
      articleTitle,
      previousSentence: state.previousSentence,
      nextSentence: state.nextSentence,
      level: "A2/B1 French learner",
    });
    if (result.data) {
      setAiResult(result.data);
      setAiState("ready");
    } else {
      setAiError(result.error);
      setAiState("error");
    }
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
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85vh] max-w-md overflow-y-auto rounded-t-3xl border-t border-slate-200 bg-white p-5 shadow-2xl transition-transform duration-200 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(1.25rem + var(--safe-bottom))" }}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Sentence</p>
            <p className="mt-1 text-base font-semibold leading-snug text-slate-900">{state?.sentence}</p>
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
          {aiState === "loading" && (
            <button
              disabled
              className="rounded-full bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
            >
              Asking the AI tutor…
            </button>
          )}
          {aiState === "error" && (
            <p className="mt-2 text-sm text-rose-500">
              {aiError}{" "}
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
                <p className="mt-1 text-sm text-slate-700">{aiResult.naturalEnglishTranslation}</p>
              </div>

              <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Simplified French
                </p>
                <p className="mt-1 text-sm italic text-slate-700">{aiResult.simplifiedFrench}</p>
              </div>

              {aiResult.explanation && (
                <div className="mt-3 rounded-2xl bg-violet-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                    Explanation
                  </p>
                  <p className="mt-1 text-sm text-violet-900">{aiResult.explanation}</p>
                </div>
              )}

              {aiResult.grammarNotes.length > 0 && (
                <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Grammar notes
                  </p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-600">
                    {aiResult.grammarNotes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiResult.usefulVocabulary.length > 0 && (
                <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Useful vocabulary
                  </p>
                  <ul className="mt-1 space-y-0.5 text-sm text-slate-600">
                    {aiResult.usefulVocabulary.map((v, i) => (
                      <li key={i}>
                        <span className="font-semibold">{v.word}</span> — {v.meaning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
