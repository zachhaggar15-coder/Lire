"use client";

import { useEffect, useState } from "react";
import type { WordExplanation } from "@/lib/ai/types";
import { getWordExplanation } from "@/lib/ai/client";
import { saveCustomDictionaryEntry } from "@/lib/dictionary/custom";
import { recordDictionaryFeedback } from "@/lib/dictionary/feedback";
import { deletePhrase, isPhraseSaved, savePhrase } from "@/lib/phrases";
import BottomSheet from "@/components/BottomSheet";

export interface ActivePhraseState {
  phrase: string;
  lemma: string;
  translation: string;
  partOfSpeech: string | null;
  contextSentence: string;
  source?: "phrasebank" | "composed" | "natural";
}

interface PhraseSheetProps {
  state: ActivePhraseState | null;
  articleTitle: string;
  onClose: () => void;
  onSaved: () => void;
  onUnsaved: () => void;
  onAiRequested?: () => void;
}

export default function PhraseSheet({ state, articleTitle, onClose, onSaved, onUnsaved, onAiRequested }: PhraseSheetProps) {
  const [correction, setCorrection] = useState("");
  const [saved, setSaved] = useState(false);
  const [aiState, setAiState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [aiResult, setAiResult] = useState<WordExplanation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const open = state !== null;

  useEffect(() => {
    setCorrection("");
    setSaved(state ? isPhraseSaved(state.phrase) : false);
    setAiState("idle");
    setAiResult(null);
    setAiError(null);
  }, [state?.phrase, state]);

  function handleSavePhrase() {
    if (!state) return;
    savePhrase({
      phrase: state.phrase,
      lemma: state.lemma,
      translation: correction.trim() || state.translation,
      partOfSpeech: state.partOfSpeech,
      contextSentence: state.contextSentence,
      sourceTextTitle: articleTitle,
    });
    setSaved(true);
    onSaved();
  }

  function handleUnsavePhrase() {
    if (!state) return;
    deletePhrase(state.phrase);
    setSaved(false);
    onUnsaved();
  }

  function handleSaveCorrection() {
    if (!state || !correction.trim()) return;
    saveCustomDictionaryEntry({
      lemma: state.lemma,
      forms: state.lemma !== state.phrase ? [state.phrase] : undefined,
      translations: [correction.trim()],
      partOfSpeech: state.partOfSpeech ?? undefined,
      examples: [{ fr: state.contextSentence, en: correction.trim() }],
    });
    recordDictionaryFeedback({
      type: "phrase",
      input: state.phrase,
      lemma: state.lemma,
      previousTranslation: state.translation,
      suggestedTranslation: correction.trim(),
      articleTitle,
      contextSentence: state.contextSentence,
    });
    handleSavePhrase();
  }

  async function handleAskAi() {
    if (!state) return;
    onAiRequested?.();
    setAiState("loading");
    setAiError(null);
    const result = await getWordExplanation({
      word: state.phrase,
      lemma: state.lemma,
      articleSentence: state.contextSentence,
      simpleExampleSentence: null,
      surroundingSentence: null,
      articleTitle,
      level: "A2/B1 French learner",
    });
    if (result.data) {
      setAiResult(result.data);
      setAiState("ready");
      return;
    }
    setAiError(result.error);
    setAiState("error");
  }

  const footer = (
    <button
      onClick={() => (saved ? handleUnsavePhrase() : handleSavePhrase())}
      aria-pressed={saved}
      className={`min-h-12 w-full rounded-2xl py-3 text-sm font-semibold active:scale-[0.98] ${
        saved ? "bg-cream text-brand" : "bg-brand text-white"
      }`}
    >
      {saved ? "Saved" : "Save"}
    </button>
  );

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel={state ? `Phrase meaning for ${state.phrase}` : "Phrase meaning"}
      footer={footer}
      surfaceClassName="bg-brand-light"
      footerClassName="border-white/40 bg-brand-light"
      handleClassName="bg-white/70"
      contentClassName="px-5 pb-4"
    >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Phrase</p>
            <h3 className="mt-1 text-2xl font-bold text-ink">{state?.phrase}</h3>
            {state?.lemma && state.lemma !== state.phrase && (
              <p className="text-xs text-ink-muted">from "{state.lemma}"</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ligne-icon-button shrink-0 bg-white/70 text-ink"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 rounded-2xl bg-white/75 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Meaning</p>
          <p className="mt-1 text-lg font-bold text-ink">{state?.translation}</p>
        </div>
        {state?.partOfSpeech && (
          <span className="mt-2 inline-flex rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-brand">
            {state.partOfSpeech}
          </span>
        )}
        {state?.source && (
          <p className="mt-2 text-xs text-ink-muted">
            {state.source === "phrasebank"
              ? "Matched from the offline phrasebank."
              : state.source === "natural"
                ? "Taken from this sentence's natural English translation."
                : "Composed offline from nearby words — this article's natural translation isn't loaded yet, so this may read literally. Try turning on English help for a more natural meaning, or use AI below."}
          </p>
        )}

        {state?.contextSentence && (
          <div className="mt-4 rounded-2xl bg-white/70 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Article context</p>
            <p className="mt-1 text-sm italic text-ink">"{state.contextSentence}"</p>
          </div>
        )}

        <details className="mt-4 rounded-2xl bg-white/70 p-3">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-ink-muted">
            More details
          </summary>
          <div className="mt-3 space-y-3">
            <div className="rounded-2xl bg-white/70 p-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted" htmlFor="phrase-correction">
                Better translation
              </label>
              <input
                id="phrase-correction"
                type="text"
                value={correction}
                onChange={(event) => setCorrection(event.target.value)}
                placeholder="Type a clearer English phrase"
                className="mt-2 w-full rounded-xl bg-cream px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
              />
              <button
                type="button"
                onClick={handleSaveCorrection}
                disabled={!correction.trim()}
                className="mt-2 min-h-12 rounded-full bg-brand px-3 py-2 shadow-raised text-xs font-semibold text-white disabled:opacity-40"
              >
                Save correction
              </button>
            </div>

            <div className="rounded-2xl bg-white/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Last-resort nuance</p>
                  <p className="mt-1 text-sm text-ink-muted">Use this only if the offline phrase meaning is not enough.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAskAi}
                  disabled={!state || aiState === "loading"}
                  className="min-h-12 shrink-0 rounded-full bg-brand px-3 py-2 shadow-raised text-xs font-semibold text-white disabled:opacity-50"
                >
                  {aiState === "loading" ? "Asking..." : "Ask AI"}
                </button>
              </div>
              {aiState === "ready" && aiResult && (
                <div className="mt-3 space-y-2 text-sm text-ink">
                  <p className="font-semibold">{aiResult.translation}</p>
                  <p>{aiResult.meaningInContext}</p>
                  {aiResult.grammarOrUsageNote && <p className="text-ink-muted">{aiResult.grammarOrUsageNote}</p>}
                </div>
              )}
              {aiState === "error" && aiError && (
                <p className="mt-3 text-sm font-semibold text-rose-700">{aiError}</p>
              )}
            </div>
          </div>
        </details>
    </BottomSheet>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
