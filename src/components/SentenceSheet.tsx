"use client";

import { useEffect, useState } from "react";
import type { SentenceExplanation } from "@/lib/ai/types";
import { getSentenceExplanation } from "@/lib/ai/client";
import PronounceButton from "@/components/PronounceButton";

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
  onAiRequested?: () => void;
}

/**
 * Bottom sheet shown on a sentence hold/tap. There is no automatic translation
 * or explanation here — the app only calls AI when a reader explicitly taps
 * "Explain sentence."
 */
export default function SentenceSheet({ state, articleTitle, onClose, onAiRequested }: SentenceSheetProps) {
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
    onAiRequested?.();
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
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85vh] max-w-md overflow-y-auto rounded-t-3xl bg-cream-card p-5 shadow-2xl transition-transform duration-200 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(1.25rem + var(--safe-bottom))" }}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-cream-dark" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Sentence</p>
            <p className="mt-1 text-base font-semibold leading-snug text-ink">{state?.sentence}</p>
            {state?.sentence && (
              <div className="mt-2 flex flex-wrap gap-2">
                <PronounceButton text={state.sentence} label="Play sentence" className="bg-cream-dark" />
                <PronounceButton text={state.sentence} label="Play sentence slowly" rate="slow" className="bg-cream-dark" />
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full bg-cream-dark px-4 py-2 text-sm font-semibold text-ink active:scale-95"
          >
            Done
          </button>
        </div>

        <div className="mt-4">
          {aiState === "idle" && (
            <button
              onClick={handleAskAi}
              className="rounded-full bg-cream-dark px-4 py-2.5 text-sm font-semibold text-ink active:scale-95"
            >
              Explain sentence
            </button>
          )}
          {aiState === "loading" && (
            <button
              disabled
              className="rounded-full bg-cream-dark px-4 py-2.5 text-sm font-semibold text-ink-muted"
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
              <div className="mt-2 rounded-2xl bg-cream p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Natural meaning
                </p>
                <p className="mt-1 text-sm text-ink">{aiResult.naturalMeaning ?? aiResult.naturalEnglishTranslation}</p>
              </div>

              <div className="mt-3 rounded-2xl bg-cream p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Literal structure
                </p>
                <p className="mt-1 text-sm text-ink">{aiResult.literalStructure ?? aiResult.structure.literalTranslation}</p>
              </div>

              {aiResult.mainExpression && (
                <div className="mt-3 rounded-2xl bg-cream p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Main expression
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">{aiResult.mainExpression}</p>
                </div>
              )}

              <div className="mt-3 rounded-2xl bg-cream p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Simplified French
                </p>
                <p className="mt-1 text-sm italic text-ink">{aiResult.simplifiedFrench}</p>
                <div className="mt-2">
                  <PronounceButton text={aiResult.simplifiedFrench} label="Play simplified French" className="bg-cream-card" />
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-brand-light p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                  Sentence structure
                </p>
                <dl className="mt-2 space-y-1 text-sm text-ink">
                  <StructureRow label="Subject" value={aiResult.structure.subject} />
                  <StructureRow label="Main verb" value={aiResult.structure.mainVerb} />
                  <StructureRow label="Object" value={aiResult.structure.object ?? ""} />
                  <StructureRow label="Tense" value={aiResult.structure.tense} />
                  <StructureRow label="Literal" value={aiResult.structure.literalTranslation} />
                </dl>
                {aiResult.structure.subordinateClauses.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Subordinate clauses</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-ink">
                      {aiResult.structure.subordinateClauses.map((clause) => (
                        <li key={clause}>{clause}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiResult.structure.pronounReferences.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Pronoun references</p>
                    <ul className="mt-1 space-y-1 text-sm text-ink">
                      {aiResult.structure.pronounReferences.map((reference) => (
                        <li key={`${reference.pronoun}-${reference.refersTo}`}>
                          <span className="font-semibold">{reference.pronoun}</span> = {reference.refersTo}
                          {reference.explanation && <span className="text-ink-muted"> - {reference.explanation}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-3 rounded-2xl bg-cream p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Tone
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">{aiResult.tone.label}</p>
                {aiResult.tone.explanation && (
                  <p className="mt-1 text-sm text-ink-muted">{aiResult.tone.explanation}</p>
                )}
              </div>

              {aiResult.explanation && (
                <div className="mt-3 rounded-2xl bg-brand-light p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                    Explanation
                  </p>
                  <p className="mt-1 text-sm text-ink">{aiResult.explanation}</p>
                </div>
              )}

              {[...(aiResult.relevantGrammar ?? []), ...aiResult.grammarNotes].filter(Boolean).length > 0 && (
                <div className="mt-3 rounded-2xl bg-cream p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Relevant grammar
                  </p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-ink-muted">
                    {[...(aiResult.relevantGrammar ?? []), ...aiResult.grammarNotes].filter(Boolean).map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiResult.whyLiteralTranslationSoundsWrong && (
                <div className="mt-3 rounded-2xl bg-accent-pink p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent-pinktext">
                    Why literal English sounds wrong
                  </p>
                  <p className="mt-1 text-sm text-ink">{aiResult.whyLiteralTranslationSoundsWrong}</p>
                </div>
              )}

              {aiResult.usefulVocabulary.length > 0 && (
                <div className="mt-3 rounded-2xl bg-cream p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Useful vocabulary
                  </p>
                  <ul className="mt-1 space-y-0.5 text-sm text-ink-muted">
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

function StructureRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-brand">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
