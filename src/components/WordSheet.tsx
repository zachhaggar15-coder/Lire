"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { DictionaryLookupResult } from "@/lib/dictionary/types";
import type { WordExplanation } from "@/lib/ai/types";
import type { WordStatus } from "@/types";
import type { PronounReference } from "@/lib/pronounReferences";
import { NO_DICTIONARY_ENTRY } from "@/lib/dictionary/constants";
import { getWordExplanation } from "@/lib/ai/client";
import { saveCustomDictionaryEntry } from "@/lib/dictionary/custom";
import { recordDictionaryFeedback } from "@/lib/dictionary/feedback";
import { getWordFamily } from "@/lib/dictionary/wordFamily";
import { lookupWord } from "@/lib/dictionary/lookup";
import type { InferenceChallenge } from "@/lib/inference";
import PronounceButton from "@/components/PronounceButton";

export interface ActiveWordState {
  word: string;
  contextSentence: string;
  /** The sentence just before contextSentence, if any — extra context for the AI explanation. */
  surroundingSentence: string | null;
  lookup: DictionaryLookupResult;
  /** The word's current saved/known status, or null if it's untouched. */
  existingStatus: WordStatus | null;
  pronounReference: PronounReference | null;
}

type AiState = "idle" | "loading" | "ready" | "error";

interface WordSheetProps {
  state: ActiveWordState | null;
  articleTitle: string;
  onClose: () => void;
  onKnow: () => void;
  inferenceChallenge?: InferenceChallenge | null;
  onInferenceAnswer?: (word: string, lemma: string | null, correct: boolean) => void;
}

function trustLabel(lookup: DictionaryLookupResult | undefined): string {
  if (!lookup || lookup.source === "missing") return "No local match yet";
  if ((lookup.partOfSpeech ?? "").toLowerCase().includes("proper noun")) return "Proper-noun protection";
  if (lookup.lemma?.includes(" ")) return "Offline phrase bank";
  if (lookup.cefr || lookup.examples.length > 0) return "Curated local dictionary";
  return "Generated local dictionary";
}

const STATUS_LABEL: Record<WordStatus, string> = {
  learning: "Saved — Learning",
  unsure: "Saved — Unsure",
  known: "Marked as known",
};

/**
 * Bottom sheet shown on every word tap: an instant, fully-offline
 * dictionary lookup for the word that the reader has just auto-saved.
 * "Ask AI for nuance" is on-demand only — it never runs unless tapped.
 */
export default function WordSheet({ state, articleTitle, onClose, onKnow, inferenceChallenge, onInferenceAnswer }: WordSheetProps) {
  const [aiState, setAiState] = useState<AiState>("idle");
  const [aiResult, setAiResult] = useState<WordExplanation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [correction, setCorrection] = useState("");
  const [correctionSaved, setCorrectionSaved] = useState(false);
  const [definitionRevealed, setDefinitionRevealed] = useState(true);
  const [sentenceTranslationRevealed, setSentenceTranslationRevealed] = useState(false);
  const [inferenceAnswer, setInferenceAnswer] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartY = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);
  const activePointerId = useRef<number | null>(null);
  const open = state !== null;
  const lookup = state?.lookup;
  const found = lookup?.source === "local";
  const isProperNoun = (lookup?.partOfSpeech ?? "").toLowerCase().includes("proper noun");
  const [primary, ...rest] = lookup?.translations ?? [];
  const firstExample = lookup?.examples[0];
  const wordFamily = state ? getWordFamily(state.lookup.lemma ?? state.word) : null;
  const hasWordFamily =
    !!wordFamily &&
    [
      wordFamily.noun,
      wordFamily.verb,
      wordFamily.adjective,
      wordFamily.adverb,
      wordFamily.commonCollocations,
      wordFamily.opposites,
      wordFamily.relatedExpressions,
    ].some((values) => values.length > 0);

  // Reset the AI panel whenever a different word/sentence is shown, so a
  // stale result from the previous word can't leak into this one.
  useEffect(() => {
    setAiState("idle");
    setAiResult(null);
    setAiError(null);
    setCorrection("");
    setCorrectionSaved(false);
    setDefinitionRevealed(!inferenceChallenge);
    setSentenceTranslationRevealed(false);
    setInferenceAnswer(null);
    setDragOffset(0);
    dragOffsetRef.current = 0;
  }, [state?.word, state?.contextSentence, inferenceChallenge]);

  function handleDragStart(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragStartY.current = event.clientY;
    activePointerId.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleDragMove(event: PointerEvent<HTMLElement>) {
    if (activePointerId.current !== event.pointerId || dragStartY.current === null) return;
    const nextOffset = Math.max(0, event.clientY - dragStartY.current);
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  }

  function handleDragEnd(event: PointerEvent<HTMLElement>) {
    if (activePointerId.current !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const shouldDismiss = dragOffsetRef.current > 95;
    dragStartY.current = null;
    activePointerId.current = null;
    dragOffsetRef.current = 0;
    setDragOffset(0);
    if (shouldDismiss) onClose();
  }

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
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85vh] max-w-md overflow-y-auto rounded-t-3xl bg-accent-pink p-5 shadow-2xl transition-transform ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          paddingBottom: "calc(1.25rem + var(--safe-bottom))",
          transform: open ? `translateY(${dragOffset}px)` : undefined,
          transitionDuration: dragOffset > 0 ? "0ms" : "200ms",
        }}
      >
        <button
          type="button"
          aria-label="Swipe down to close"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          className="mx-auto mb-3 flex h-7 w-24 touch-none items-center justify-center rounded-full active:cursor-grabbing"
        >
          <span className="h-1.5 w-10 rounded-full bg-white/60" />
        </button>

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
                <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-semibold text-accent-pinktext">
                  {trustLabel(lookup)}
                </span>
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

        {isProperNoun && (
          <div className="mt-3 rounded-2xl bg-white/70 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-pinktext">Proper noun protected</p>
            <p className="mt-1 text-sm text-ink-muted">
              This looks like a person, place, organisation, or acronym, so Liree does not add it to your vocabulary cards unless it has wider language value.
            </p>
          </div>
        )}

        {inferenceChallenge && (
          <div className="mt-4 rounded-2xl bg-white/70 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-pinktext">Can you infer it first?</p>
            <p className="mt-1 text-sm text-ink-muted">Try the context before leaning on the direct definition.</p>
            <div className="mt-3 space-y-2">
              {inferenceChallenge.choices.map((choice, index) => {
                const answered = inferenceAnswer !== null;
                const correct = index === inferenceChallenge.answerIndex;
                const selected = inferenceAnswer === index;
                return (
                  <button
                    key={`${inferenceChallenge.word}-${choice}`}
                    type="button"
                    onClick={() => {
                      setInferenceAnswer(index);
                      setDefinitionRevealed(true);
                      onInferenceAnswer?.(inferenceChallenge.word, inferenceChallenge.lemma, correct);
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                      answered && correct
                        ? "bg-emerald-100 text-emerald-800"
                        : answered && selected
                          ? "bg-rose-100 text-rose-800"
                          : "bg-cream text-ink"
                    }`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
            {inferenceChallenge.frenchSynonym && (
              <p className="mt-2 text-xs text-ink-muted">
                French synonym: <span className="font-semibold">{inferenceChallenge.frenchSynonym}</span>
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSentenceTranslationRevealed((value) => !value)}
                className="rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-ink active:scale-95"
              >
                Reveal sentence translation
              </button>
              <button
                type="button"
                onClick={() => setDefinitionRevealed(true)}
                className="rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-ink active:scale-95"
              >
                Reveal direct definition
              </button>
            </div>
            {sentenceTranslationRevealed && (
              <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-sm text-ink">{inferenceChallenge.sentenceTranslation}</p>
            )}
            {inferenceAnswer !== null && (
              <p className={`mt-2 text-xs font-semibold ${inferenceAnswer === inferenceChallenge.answerIndex ? "text-emerald-700" : "text-rose-700"}`}>
                {inferenceAnswer === inferenceChallenge.answerIndex ? "Inferred correctly." : "Good attempt. You checked the context first."}
              </p>
            )}
          </div>
        )}

        <div className="mt-3 space-y-3">
          {!definitionRevealed ? (
            <p className="text-sm italic text-accent-pinktext">Definition hidden until you try or reveal it.</p>
          ) : found ? (
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

        {state?.pronounReference && (
          <div className="mt-4 rounded-2xl bg-brand-light p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
              Reference tracking
            </p>
            <p className="mt-1 text-sm text-ink">
              <span className="font-semibold">{state.pronounReference.pronoun}</span> points back to{" "}
              <span className="rounded bg-white/70 px-1 font-semibold">{state.pronounReference.antecedentText}</span>.
            </p>
            <p className="mt-1 text-xs text-ink-muted">{state.pronounReference.note}</p>
          </div>
        )}

        {wordFamily && hasWordFamily && (
          <div className="mt-4 rounded-2xl bg-white/60 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-pinktext">
                  Word family
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Related forms that help you recognise the same idea in different sentences.
                </p>
              </div>
              {lookup?.lemma && (
                <span className="shrink-0 rounded-full bg-brand-light px-2 py-1 text-[11px] font-semibold text-brand">
                  {lookup.lemma}
                </span>
              )}
            </div>
            <WordFamilyRow label="Noun" values={wordFamily.noun} />
            <WordFamilyRow label="Verb" values={wordFamily.verb} />
            <WordFamilyRow label="Adjective" values={wordFamily.adjective} />
            <WordFamilyRow label="Adverb" values={wordFamily.adverb} />
            <WordFamilyRow label="Collocations" values={wordFamily.commonCollocations} />
            <WordFamilyRow label="Opposites" values={wordFamily.opposites} />
            <WordFamilyRow label="Expressions" values={wordFamily.relatedExpressions} />
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

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={onKnow}
            className="rounded-2xl bg-white/70 py-3 text-sm font-semibold text-ink active:scale-95"
          >
            I know this
          </button>
          <button
            onClick={onClose}
            className="rounded-2xl bg-brand py-3 text-sm font-semibold text-white active:scale-95"
          >
            Keep saved
          </button>
        </div>
      </div>
    </>
  );
}

function WordFamilyRow({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-pinktext">{label}</p>
      <div className="mt-1 grid gap-1.5">
        {values.map((value) => {
          const lookup = getWordFamilyMeaning(value);
          return (
            <div key={value} className="rounded-xl bg-white/60 px-3 py-2 text-sm text-ink">
              <span className="font-semibold">{value}</span>
              {lookup && <span className="text-ink-muted"> - {lookup}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getWordFamilyMeaning(value: string): string | null {
  const lookup = lookupWord(value);
  return lookup.translations[0] ?? null;
}
