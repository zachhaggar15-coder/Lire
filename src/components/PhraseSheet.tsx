"use client";

import { useEffect, useState } from "react";
import { saveCustomDictionaryEntry } from "@/lib/dictionary/custom";
import { recordDictionaryFeedback } from "@/lib/dictionary/feedback";
import { isPhraseSaved, markPhraseKnown, savePhrase } from "@/lib/phrases";

export interface ActivePhraseState {
  phrase: string;
  lemma: string;
  translation: string;
  partOfSpeech: string | null;
  contextSentence: string;
}

interface PhraseSheetProps {
  state: ActivePhraseState | null;
  articleTitle: string;
  onClose: () => void;
  onSaved: () => void;
  onKnown: () => void;
}

export default function PhraseSheet({ state, articleTitle, onClose, onSaved, onKnown }: PhraseSheetProps) {
  const [correction, setCorrection] = useState("");
  const [saved, setSaved] = useState(false);
  const [savedKnown, setSavedKnown] = useState(false);
  const open = state !== null;

  useEffect(() => {
    setCorrection("");
    setSaved(state ? isPhraseSaved(state.phrase) : false);
    setSavedKnown(false);
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

  function handleMarkKnown() {
    if (!state) return;
    if (!saved) handleSavePhrase();
    markPhraseKnown(state.phrase);
    setSavedKnown(true);
    onKnown();
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
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85vh] max-w-md overflow-y-auto rounded-t-3xl bg-brand-light p-5 shadow-2xl transition-transform duration-200 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(1.25rem + var(--safe-bottom))" }}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/70" />

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
            className="shrink-0 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-ink active:scale-95"
          >
            Done
          </button>
        </div>

        <p className="mt-3 text-lg font-semibold text-ink">{state?.translation}</p>
        {state?.partOfSpeech && (
          <span className="mt-2 inline-flex rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-brand">
            {state.partOfSpeech}
          </span>
        )}

        {state?.contextSentence && (
          <div className="mt-4 rounded-2xl bg-white/70 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Article context</p>
            <p className="mt-1 text-sm italic text-ink">"{state.contextSentence}"</p>
          </div>
        )}

        <div className="mt-4 rounded-2xl bg-white/70 p-3">
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
            className="mt-2 rounded-full bg-brand px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
          >
            Save correction
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={handleSavePhrase}
            className="rounded-2xl bg-white/80 py-3 text-sm font-semibold text-ink active:scale-95"
          >
            {saved ? "Saved" : "Save phrase"}
          </button>
          <button
            onClick={handleMarkKnown}
            className="rounded-2xl bg-emerald-100 py-3 text-sm font-semibold text-emerald-700 active:scale-95"
          >
            {savedKnown ? "Known" : "I know this"}
          </button>
        </div>
      </div>
    </>
  );
}
