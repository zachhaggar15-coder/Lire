"use client";

import { useEffect, useState } from "react";
import type { DictionaryLookupResult } from "@/lib/dictionary/types";
import type { WordExplanation } from "@/lib/ai/types";
import type { WordStatus } from "@/types";
import { NO_DICTIONARY_ENTRY } from "@/lib/dictionary/constants";
import { getWordExplanation } from "@/lib/ai/client";
import { saveCustomDictionaryEntry } from "@/lib/dictionary/custom";
import { recordDictionaryFeedback } from "@/lib/dictionary/feedback";
import PronounceButton from "@/components/PronounceButton";

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
  /**
   * Receives whatever AI explanation this sheet has already fetched (or
   * null if none), so a missing-from-dictionary word saved right after an
   * "Ask AI for nuance" lookup can be backfilled with a real translation
   * instead of "Not translated yet" — see Reader.tsx's saveActiveWord.
   */
  onUnsure: (aiBackfill: WordExplanation | null) => void;
  onSave: (aiBackfill: WordExplanation | null) => void;
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
export default function WordSheet({ state, articleTitle, onClose, onKnow, onUnsure, onSave }: WordSheetProps) {
  const [aiState, setAiState] = useState<AiState>("idle");
  const [aiResult, setAiResult] = useState<WordExplanation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [correction, setCorrection] = useState("");
  const [correctionSaved, setCorrectionSaved] = useState(false);
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
    setCorrection("");
    setCorrectionSaved(false);
  }, [state?.word, state?.contextSentence]);

  function handleSaveCorrection() {
    if (!state || !lookup || !correction.trim()) return;
    const lemma = (lookup.lemma ?? state.word).toLowerCase();
    saveCustomDictionaryEntry({
      lemma,
      forms: lemma !== state.word ? [state.word] : undefined,
      translations: [correction.trim()],
      partOfSpeech: lookup.partOfSpeech ?? undefined,
      gender:
        lookup.gender === "masculine" || lookup.gender === "feminine" || lookup.gender === "both"
          ? lookup.gender
          : undefined,
      examples: [{ fr: state.contextSentence, en: correction.trim() }],
    });
    recordDictionaryFeedback({
      type: found ? "correction" : "missing",
      input: state.word,
      lemma: lookup.lemma,
      previousTranslation: lookup.translations[0] ?? null,
      suggestedTranslation: correction.trim(),
      articleTitle,
      contextSentence: state.contextSentence,
    });
    setCorrectionSaved(true);
  }

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
      articleTitle,
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
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85vh] max-w-md overflow-y-auto rounded-t-3xl bg-accent-pink p-5 shadow-2xl transition-transform duration-200 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(1.25rem + var(--safe-bottom))" }}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/50" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-2xl font-bold text-ink">{state?.word}</h3>
            {lookup?.lemma && lookup.lemma !== state?.word && (
              <p className="text-xs text-accent-pinktext">from “{lookup.lemma}”</p>
            )}
            {found && (
              <div className="mt-1 flex flex-wrap items-center gap-1">
                {lookup?.partOfSpeech && (
                  <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-semibold text-accent-pinktext">
                    {lookup.partOfSpeech}
                  </span>
                )}
                {lookup?.gender && (
                  <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-semibold text-accent-pinktext">
                    {lookup.gender}
                  </span>
                )}
                {lookup?.cefr && (
                  <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">
                    {lookup.cefr}
                  </span>
                )}
              </div>
            )}
            {state?.word && (
              <div className="mt-2 flex flex-wrap gap-2">
                <PronounceButton text={state.word} label={`Play ${state.word}`} />
                <PronounceButton text={state.word} label={`Play ${state.word} slowly`} rate="slow" />
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-ink active:scale-95"
          >
            Done
          </button>
        </div>

        {state?.existingStatus && (
          <p className="mt-2 text-xs font-semibold text-brand">
            {STATUS_LABEL[state.existingStatus]}
          </p>
        )}

        <div className="mt-3 space-y-3">
          {found ? (
            <>
              <p className="text-lg text-ink">{primary}</p>
              {rest.length > 0 && (
                <p className="text-sm text-accent-pinktext">Also: {rest.join(", ")}</p>
              )}
              {firstExample && (
                <div className="rounded-2xl bg-white/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent-pinktext">
                    Example
                  </p>
                  <p className="mt-1 text-sm italic text-ink">{firstExample.fr}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">{firstExample.en}</p>
                  <div className="mt-2">
                    <PronounceButton text={firstExample.fr} label="Play example sentence" className="bg-white" />
                  </div>
                </div>
              )}
            </>
          ) : aiState === "ready" && aiResult ? (
            // The dictionary had nothing, but "Ask AI for nuance" backfilled a
            // real translation — show that in place of "not found" so it
            // reads as resolved rather than contradicting the AI panel below.
            <p className="text-lg text-ink">{aiResult.translation}</p>
          ) : (
            <p className="text-sm italic text-accent-pinktext">{NO_DICTIONARY_ENTRY}</p>
          )}
        </div>

        {state?.contextSentence && (
          <div className="mt-4 rounded-2xl bg-white/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-pinktext">
              Original article context
            </p>
            <p className="mt-1 text-sm italic text-ink">“{state.contextSentence}”</p>
          </div>
        )}

        <div className="mt-4 rounded-2xl bg-white/60 p-3">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-accent-pinktext" htmlFor="word-correction">
            Improve dictionary
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="word-correction"
              type="text"
              value={correction}
              onChange={(event) => {
                setCorrection(event.target.value);
                setCorrectionSaved(false);
              }}
              placeholder="Better English meaning"
              className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
            />
            <button
              type="button"
              onClick={handleSaveCorrection}
              disabled={!correction.trim()}
              className="shrink-0 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
            >
              Save
            </button>
          </div>
          {correctionSaved && (
            <p className="mt-1 text-xs font-semibold text-brand">
              Saved as a local dictionary correction.
            </p>
          )}
        </div>

        <div className="mt-4">
          {aiState === "idle" && (
            <button
              onClick={handleAskAi}
              className="text-xs font-semibold text-accent-pinktext underline underline-offset-2"
            >
              Ask AI for nuance
            </button>
          )}
          {aiState === "loading" && (
            <button disabled className="text-xs italic text-accent-pinktext">
              Asking the AI tutor…
            </button>
          )}
          {aiState === "error" && (
            <p className="text-xs text-rose-700">
              {aiError}{" "}
              <button onClick={handleAskAi} className="underline">
                Try again
              </button>
            </p>
          )}
          {aiState === "ready" && aiResult && (
            <div className="rounded-2xl bg-white/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                AI nuance
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">{aiResult.translation}</p>
              <p className="mt-1 text-sm text-ink">{aiResult.meaningInContext}</p>
              <div className="mt-2 rounded-xl bg-cream p-2">
                <p className="text-sm italic text-ink">{aiResult.simpleExampleFr}</p>
                <p className="text-xs text-ink-muted">{aiResult.simpleExampleEn}</p>
                <div className="mt-2">
                  <PronounceButton text={aiResult.simpleExampleFr} label="Play AI example sentence" className="bg-white" />
                </div>
              </div>
              {aiResult.grammarOrUsageNote && (
                <p className="mt-2 text-xs text-ink-muted">{aiResult.grammarOrUsageNote}</p>
              )}
              {aiResult.commonMistake && (
                <p className="mt-1 text-xs text-ink-muted">
                  <span className="font-semibold">Common mistake: </span>
                  {aiResult.commonMistake}
                </p>
              )}
              {aiResult.whyThisWord && (
                <p className="mt-2 text-xs text-ink-muted">
                  <span className="font-semibold">Why this word here: </span>
                  {aiResult.whyThisWord}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <button
            onClick={onKnow}
            className="rounded-2xl bg-white/70 py-3 text-sm font-semibold text-ink active:scale-95"
          >
            I know this
          </button>
          <button
            onClick={() => onUnsure(aiState === "ready" ? aiResult : null)}
            className="rounded-2xl bg-amber-200 py-3 text-sm font-semibold text-amber-900 active:scale-95"
          >
            Unsure
          </button>
          <button
            onClick={() => onSave(aiState === "ready" ? aiResult : null)}
            className="rounded-2xl bg-brand py-3 text-sm font-semibold text-white active:scale-95"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
