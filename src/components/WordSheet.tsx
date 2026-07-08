"use client";

import { useEffect, useState } from "react";
import type { DictionaryLookupResult } from "@/lib/dictionary/types";
import type { WordExplanation } from "@/lib/ai/types";
import type { WordStatus } from "@/types";
import { NO_DICTIONARY_ENTRY } from "@/lib/dictionary/constants";
import { getWordExplanation } from "@/lib/ai/client";

export interface ActiveWordState {
  word: string;
  contextSentence: string;
  /** The sentence just before contextSentence, if any — extra context for the AI explanation. */
  surroundingSentence: string | null;
  lookup: DictionaryLookupResult;
  /** The word's current saved/known status, or null if it's untouched. */
  existingStatus: WordStatus | null;
}

type AiState = "idle" | "loading" | "ready" | "error";

interface WordSheetProps {
  state: ActiveWordState | null;
  articleTitle: string;
  onClose: () => void;
  onKnow: () => void;
  onUnsure: () => void;
  onSave: () => void;
}

const STATUS_LABEL: Record<WordStatus, string> = {
  learning: "Saved — Learning",
  unsure: "Saved — Unsure",
  known: "Marked as known",
};

/**
 * Bottom sheet shown on every word tap: an instant, fully-offline
 * dictionary lookup, plus three explicit actions (this is the whole
 * "learning signal" the app now asks for instead of auto-saving every tap).
 * "Ask AI for nuance" is on-demand only — it never runs unless tapped.
 */
export default function WordSheet({ state, onClose, onKnow, onUnsure, onSave }: WordSheetProps) {
  const [aiState, setAiState] = useState<AiState>("idle");
  const [aiResult, setAiResult] = useState<WordExplanation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const open = state !== null;
  const lookup = state?.lookup;
  const found = lookup?.source === "local";
  const [primary, ...rest] = lookup?.translations ?? [];
  const firstExample = lookup?.examples[0];

  // Reset the AI panel whenever a different word/sentence is shown, so a
  // stale result from the previous word can't leak into this one.
  useEffect(() => {
    setAiState("idle");
    setAiResult(null);
    setAiError(null);
  }, [state?.word, state?.contextSentence]);

  async function handleAskAi() {
    if (!state) return;
    setAiState("loading");
    setAiError(null);
    const result = await getWordExplanation({
      word: state.word,
      lemma: lookup?.lemma ?? null,
      articleSentence: state.contextSentence,
      simpleExampleSentence: firstExample?.fr ?? null,
      surroundingSentence: state.surroundingSentence,
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
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
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
            <h3 className="text-2xl font-bold text-slate-900">{state?.word}</h3>
            {lookup?.lemma && lookup.lemma !== state?.word && (
              <p className="text-xs text-slate-400">from “{lookup.lemma}”</p>
            )}
            {found && (
              <div className="mt-1 flex flex-wrap items-center gap-1">
                {lookup?.partOfSpeech && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                    {lookup.partOfSpeech}
                  </span>
                )}
                {lookup?.gender && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                    {lookup.gender}
                  </span>
                )}
                {lookup?.cefr && (
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                    {lookup.cefr}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 active:scale-95"
          >
            Done
          </button>
        </div>

        {state?.existingStatus && (
          <p className="mt-2 text-xs font-semibold text-emerald-600">
            {STATUS_LABEL[state.existingStatus]}
          </p>
        )}

        <div className="mt-3 space-y-3">
          {found ? (
            <>
              <p className="text-lg text-slate-700">{primary}</p>
              {rest.length > 0 && (
                <p className="text-sm text-slate-500">Also: {rest.join(", ")}</p>
              )}
              {firstExample && (
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Example
                  </p>
                  <p className="mt-1 text-sm italic text-slate-600">{firstExample.fr}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{firstExample.en}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm italic text-slate-400">{NO_DICTIONARY_ENTRY}</p>
          )}
        </div>

        {state?.contextSentence && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Original article context
            </p>
            <p className="mt-1 text-sm italic text-slate-600">“{state.contextSentence}”</p>
          </div>
        )}

        <div className="mt-4">
          {aiState === "idle" && (
            <button
              onClick={handleAskAi}
              className="text-xs font-semibold text-slate-400 underline underline-offset-2"
            >
              Ask AI for nuance
            </button>
          )}
          {aiState === "loading" && (
            <button disabled className="text-xs italic text-slate-400">
              Asking the AI tutor…
            </button>
          )}
          {aiState === "error" && (
            <p className="text-xs text-rose-500">
              {aiError}{" "}
              <button onClick={handleAskAi} className="underline">
                Try again
              </button>
            </p>
          )}
          {aiState === "ready" && aiResult && (
            <div className="rounded-2xl bg-violet-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                AI nuance
              </p>
              <p className="mt-1 text-sm font-semibold text-violet-900">{aiResult.translation}</p>
              <p className="mt-1 text-sm text-violet-900">{aiResult.meaningInContext}</p>
              <div className="mt-2 rounded-xl bg-white/60 p-2">
                <p className="text-sm italic text-violet-800">{aiResult.simpleExampleFr}</p>
                <p className="text-xs text-violet-600">{aiResult.simpleExampleEn}</p>
              </div>
              {aiResult.grammarOrUsageNote && (
                <p className="mt-2 text-xs text-violet-700">{aiResult.grammarOrUsageNote}</p>
              )}
              {aiResult.commonMistake && (
                <p className="mt-1 text-xs text-violet-700">
                  <span className="font-semibold">Common mistake: </span>
                  {aiResult.commonMistake}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <button
            onClick={onKnow}
            className="rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-600 active:scale-95"
          >
            I know this
          </button>
          <button
            onClick={onUnsure}
            className="rounded-2xl bg-amber-100 py-3 text-sm font-semibold text-amber-700 active:scale-95"
          >
            Unsure
          </button>
          <button
            onClick={onSave}
            className="rounded-2xl bg-brand py-3 text-sm font-semibold text-white active:scale-95"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
