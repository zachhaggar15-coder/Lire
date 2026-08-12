"use client";

import { useEffect, useState } from "react";
import type { DictionaryLookupResult } from "@/lib/dictionary/types";
import type { ContextualTranslationResult } from "@/lib/dictionary/contextualTranslation";
import type { ResolvedTranslationAlignment } from "@/lib/translationAlignment";
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
import BottomSheet from "@/components/BottomSheet";
import AppIcon from "@/components/AppIcon";

export interface ActiveWordState {
  word: string;
  contextSentence: string;
  /** The sentence just before contextSentence, if any — extra context for the AI explanation. */
  surroundingSentence: string | null;
  lookup: DictionaryLookupResult;
  contextualTranslation: ContextualTranslationResult;
  /** Natural AI article-translation phrase that contains this tapped word, when the article translation is available. */
  naturalTranslation: ResolvedTranslationAlignment | null;
  /** The word's current saved/known status, or null if it's untouched. */
  existingStatus: WordStatus | null;
  pronounReference: PronounReference | null;
}

type AiState = "idle" | "loading" | "ready" | "error";

interface WordSheetProps {
  state: ActiveWordState | null;
  articleTitle: string;
  onClose: () => void;
  /**
   * Adds the word to the review deck. Saving is an explicit choice rather
   * than a side effect of tapping: a tap usually means "what's this?", and
   * auto-saving every curiosity filled the review queue with words the
   * reader never chose to study.
   */
  onSave?: (status: Exclude<WordStatus, "known">) => void;
  onUnsave?: () => void;
  inferenceChallenge?: InferenceChallenge | null;
  onInferenceAnswer?: (word: string, lemma: string | null, correct: boolean) => void;
  onAiRequested?: () => void;
  /**
   * Opens the full explanation for the sentence this word came from. Lives
   * here because the long-press gesture that used to be the only route to it
   * was effectively unreachable — every word swallows the press to show its
   * phrase, so the sentence handler only fired if you happened to press
   * exactly on a space. Tapping a confusing word is the natural moment to ask
   * about its sentence anyway.
   */
  onExplainSentence?: (sentence: string) => void;
}

function trustLabel(lookup: DictionaryLookupResult | undefined): string {
  if (!lookup || lookup.source === "missing") return "No local match yet";
  if ((lookup.partOfSpeech ?? "").toLowerCase().includes("proper noun")) return "Proper-noun protection";
  if (lookup.lemma?.includes(" ")) return "Offline phrase bank";
  if (lookup.cefr || lookup.examples.length > 0) return "Curated local dictionary";
  return "Generated local dictionary";
}

function contextSourceLabel(source: ContextualTranslationResult["source"]): string {
  switch (source) {
    case "phrasebank":
      return "Phrase match";
    case "context-rule":
      return "Sentence context";
    case "proper-noun":
      return "Name protected";
    case "contraction":
      return "Contraction";
    case "pronoun":
      return "Pronoun";
    case "grammar":
      return "Grammar-aware";
    case "missing":
      return "Needs help";
    case "dictionary":
    default:
      return "Dictionary fallback";
  }
}

function confidenceLabel(confidence: ContextualTranslationResult["confidence"]): string {
  if (confidence === "high") return "High confidence";
  if (confidence === "medium") return "Medium confidence";
  return "Low confidence";
}

const STATUS_LABEL: Record<WordStatus, string> = {
  learning: "Saved — Learning",
  unsure: "Saved — Unsure",
  known: "Marked as known",
};

/**
 * Bottom sheet shown on every word tap: an instant, fully-offline
 * dictionary lookup for the word the reader is curious about.
 * "Ask AI for nuance" is on-demand only — it never runs unless tapped.
 */
export default function WordSheet({ state, articleTitle, onClose, onSave, onUnsave, inferenceChallenge, onInferenceAnswer, onAiRequested, onExplainSentence }: WordSheetProps) {
  const [aiState, setAiState] = useState<AiState>("idle");
  const [aiResult, setAiResult] = useState<WordExplanation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [correction, setCorrection] = useState("");
  const [correctionSaved, setCorrectionSaved] = useState(false);
  const [definitionRevealed, setDefinitionRevealed] = useState(true);
  const [sentenceTranslationRevealed, setSentenceTranslationRevealed] = useState(false);
  const [inferenceAnswer, setInferenceAnswer] = useState<number | null>(null);
  const open = state !== null;
  const lookup = state?.lookup;
  const contextual = state?.contextualTranslation;
  const found = lookup?.source === "local";
  // "known" is a separate historical state that this sheet no longer sets; it
  // still counts as saved so the toggle can remove it.
  const saved = state?.existingStatus != null;
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
  }, [state?.word, state?.contextSentence, inferenceChallenge]);

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
    onAiRequested?.();
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

  const footer = isProperNoun ? (
    <button onClick={onClose} className="min-h-12 w-full rounded-2xl bg-brand py-3 text-sm font-semibold text-white">
      Close
    </button>
  ) : (
    <button
      onClick={() => (saved ? onUnsave?.() : onSave?.("learning"))}
      aria-pressed={saved}
      className={`min-h-12 w-full rounded-2xl py-3 text-sm font-semibold ${
        saved ? "bg-brand-light text-brand" : "bg-brand text-white"
      }`}
    >
      {saved ? "Remove from review" : "Add to review"}
    </button>
  );

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel={state ? `Meaning and learning options for ${state.word}` : "Word meaning"}
      footer={footer}
      contentClassName="px-5 pb-3"
    >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-2xl font-bold text-ink">{state?.word}</h3>
            {lookup?.lemma && lookup.lemma !== state?.word && (
              <p className="sr-only">from &ldquo;{lookup.lemma}&rdquo;</p>
            )}
            {found && (
              <div className="sr-only">
                {/* Not shown when the entry came from a lemma guess: the
                    stored part of speech describes the lemma, which can be a
                    different word class from the form the reader tapped. */}
                {lookup?.partOfSpeech && !lookup.partOfSpeechUncertain && (
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
                  <span className="rounded-full bg-brand px-2 py-0.5 shadow-raised text-xs font-semibold text-white">
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
            aria-label="Close"
            className="ligne-icon-button shrink-0 bg-white/70 text-ink"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {state?.existingStatus && (
          <p className="mt-2 text-xs font-semibold text-brand">
            {STATUS_LABEL[state.existingStatus]}
          </p>
        )}

        {isProperNoun && (
          <div className="mt-2 rounded-2xl bg-white/70 p-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-pinktext">Proper noun protected</p>
            <p className="mt-1 text-sm text-ink-muted">
              This looks like a person, place, organisation, or acronym, so Lire does not add it to your vocabulary cards unless it has wider language value.
            </p>
          </div>
        )}

        {inferenceChallenge && (
          <div className="mt-3 rounded-2xl bg-white/70 p-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-pinktext">Can you infer it first?</p>
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
                    className={`min-h-12 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold ${
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
                className="min-h-12 rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-ink"
              >
                Reveal sentence translation
              </button>
              <button
                type="button"
                onClick={() => setDefinitionRevealed(true)}
                className="min-h-12 rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-ink"
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

        <div className="mt-2.5 space-y-2.5">
          {!definitionRevealed ? (
            <p className="text-sm italic text-accent-pinktext">Definition hidden until you try or reveal it.</p>
          ) : (
            <>
              {state?.naturalTranslation && (
                <div className="rounded-2xl bg-brand-light/80 p-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand">Meaning</p>
                    <span className="hidden rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-brand">
                      AI aligned
                    </span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-ink">{state.naturalTranslation.english}</p>
                </div>
              )}

              {contextual && (
                <div className="rounded-2xl bg-white/75 p-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-accent-pinktext">In this sentence</p>
                    <span className="hidden rounded-full bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand">
                      {contextSourceLabel(contextual.source)}
                    </span>
                    <span className="hidden rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-accent-pinktext">
                      {confidenceLabel(contextual.confidence)}
                    </span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-ink">{contextual.contextualTranslation}</p>
                  {contextual.expandedPhrase && (
                    <p className="mt-1 text-xs text-ink-muted">
                      Part of: <span className="font-semibold text-ink">{contextual.expandedPhrase}</span>
                    </p>
                  )}
                </div>
              )}

              {found ? (
                <details className="rounded-2xl bg-white/60 p-2.5">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-accent-pinktext">
                    More meanings
                  </summary>
                  {primary && <p className="mt-1 text-base font-semibold text-ink">{primary}</p>}
                  {rest.length > 0 && (
                    <p className="text-sm text-accent-pinktext">Also: {rest.join(", ")}</p>
                  )}
                  {firstExample && (
                    <div className="mt-2 rounded-xl bg-white/60 p-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent-pinktext">
                        Example
                      </p>
                      <p className="mt-1 text-sm italic text-ink">{firstExample.fr}</p>
                      <p className="mt-0.5 text-sm text-ink-muted">{firstExample.en}</p>
                      <div className="mt-2">
                        <PronounceButton text={firstExample.fr} label="Play example sentence" className="bg-white" scope="sentence" />
                      </div>
                    </div>
                  )}
                </details>
              ) : aiState === "ready" && aiResult ? (
                // The dictionary had nothing, but "Ask AI for nuance" backfilled a
                // real translation — show that in place of "not found" so it
                // reads as resolved rather than contradicting the AI panel below.
                <p className="text-lg text-ink">{aiResult.translation}</p>
              ) : (
                <p className="text-sm italic text-accent-pinktext">{NO_DICTIONARY_ENTRY}</p>
              )}
            </>
          )}
        </div>

        {definitionRevealed && firstExample && !isProperNoun && (
          <div className="mt-2 rounded-2xl bg-white/70 p-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-pinktext">Example</p>
            <p className="mt-1 text-sm italic text-ink">{firstExample.fr}</p>
            <p className="mt-0.5 text-sm text-ink-muted">{firstExample.en}</p>
          </div>
        )}

        <details className="mt-2.5 rounded-2xl bg-white/60 p-2.5">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-accent-pinktext">
            More details
          </summary>
          <div className="mt-2.5 space-y-2.5">

        {state?.contextSentence && (
          <div className="rounded-2xl bg-white/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-pinktext">
              Original article context
            </p>
            <p className="mt-1 text-sm italic text-ink">“{state.contextSentence}”</p>
          </div>
        )}

        {state?.pronounReference && (
          <div className="rounded-2xl bg-brand-light p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
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
          <details className="rounded-2xl bg-white/60 p-3">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-accent-pinktext">
              Word family
            </summary>
            <div className="mt-2 flex items-start justify-between gap-3">
              <div>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Related forms that help you recognise the same idea in different sentences.
                </p>
              </div>
              {lookup?.lemma && (
                <span className="shrink-0 rounded-full bg-brand-light px-2 py-1 text-xs font-semibold text-brand">
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
          </details>
        )}

        <details className="rounded-2xl bg-white/60 p-3">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-accent-pinktext">
            Improve dictionary
          </summary>
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
              className="min-h-12 shrink-0 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
            >
              Save
            </button>
          </div>
          {correctionSaved && (
            <p className="mt-1 text-xs font-semibold text-brand">
              Saved as a local dictionary correction.
            </p>
          )}
        </details>

        <details>
          <summary className="flex min-h-12 cursor-pointer items-center text-xs font-semibold text-accent-pinktext underline underline-offset-2">
            More help
          </summary>
          <div className="mt-2">
          {aiState === "idle" && (
            <button
              onClick={handleAskAi}
              className="min-h-12 text-xs font-semibold text-accent-pinktext underline underline-offset-2"
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
              <button onClick={handleAskAi} className="inline-flex min-h-12 items-center underline">
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
                  <PronounceButton text={aiResult.simpleExampleFr} label="Play AI example sentence" className="bg-white" scope="sentence" />
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
        </details>

        {onExplainSentence && state && (
          <button
            onClick={() => onExplainSentence(state.contextSentence)}
            className="min-h-12 w-full rounded-2xl bg-white/70 py-3 text-sm font-semibold text-ink"
          >
            Explain the whole sentence
          </button>
        )}
          </div>
        </details>
    </BottomSheet>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return <AppIcon name="close" className={className} />;
}

function WordFamilyRow({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent-pinktext">{label}</p>
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
