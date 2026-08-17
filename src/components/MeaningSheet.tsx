"use client";

import { useEffect, useState } from "react";
import type { ResolvedMeaning } from "@/lib/dictionary/resolveMeaning";
import type { WordExplanation } from "@/lib/ai/types";
import type { WordStatus } from "@/types";
import type { PronounReference } from "@/lib/pronounReferences";
import { getWordExplanation } from "@/lib/ai/client";
import { getWordFamily } from "@/lib/dictionary/wordFamily";
import { lookupWord } from "@/lib/dictionary/lookup";
import {
  recordTranslationReport,
  TRANSLATION_REPORT_REASONS,
  type TranslationReportReason,
} from "@/lib/dictionary/translationReports";
import PronounceButton from "@/components/PronounceButton";
import BottomSheet from "@/components/BottomSheet";
import AppIcon from "@/components/AppIcon";

export interface ActiveMeaningState {
  meaning: ResolvedMeaning;
  /** The sentence just before the context sentence — extra grounding for the AI explanation. */
  surroundingSentence: string | null;
  /** The word's current saved status, or null when untouched. */
  existingStatus: WordStatus | null;
  pronounReference: PronounReference | null;
  /** True while a targeted AI lookup for this tap is still in flight. */
  resolving: boolean;
}

type AiState = "idle" | "loading" | "ready" | "error";

interface MeaningSheetProps {
  state: ActiveMeaningState | null;
  articleTitle: string;
  onClose: () => void;
  /**
   * Adds the word to the review deck. Saving stays an explicit choice: a tap
   * usually means "what's this?", and auto-saving every curiosity filled the
   * review queue with words the reader never chose to study.
   */
  onSave?: () => void;
  onUnsave?: () => void;
  onAiRequested?: () => void;
  onExplainSentence?: (sentence: string) => void;
}

const STATUS_LABEL: Record<WordStatus, string> = {
  learning: "Saved to review",
  unsure: "Saved as unsure",
  known: "Marked as known",
};

/**
 * The single sheet behind every word tap.
 *
 * It answers one question by default — "what does this mean here?" — and puts
 * everything else behind More. This replaces the old WordSheet/PhraseSheet
 * pair, which asked the reader to know in advance whether they wanted a word
 * or a phrase, and then showed three competing translations once they got
 * there. Reading assistance first; studying second, on the saved-word screen.
 */
export default function MeaningSheet({
  state,
  articleTitle,
  onClose,
  onSave,
  onUnsave,
  onAiRequested,
  onExplainSentence,
}: MeaningSheetProps) {
  const [aiState, setAiState] = useState<AiState>("idle");
  const [aiResult, setAiResult] = useState<WordExplanation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<TranslationReportReason | null>(null);
  const [reportSuggestion, setReportSuggestion] = useState("");
  const [reportSent, setReportSent] = useState(false);

  const open = state !== null;
  const meaning = state?.meaning;
  const saved = state?.existingStatus != null;
  const isProperNoun = (meaning?.partOfSpeech ?? "").toLowerCase().includes("proper noun");

  const wordFamily = meaning ? getWordFamily(meaning.lemma ?? meaning.tappedText) : null;
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

  // Reset every per-tap panel when a different word or sentence is shown, so a
  // previous word's AI answer or half-written report can't leak into this one.
  useEffect(() => {
    setAiState("idle");
    setAiResult(null);
    setAiError(null);
    setReportReason(null);
    setReportSuggestion("");
    setReportSent(false);
  }, [meaning?.cacheKey]);

  async function handleAskAi() {
    if (!meaning) return;
    onAiRequested?.();
    setAiState("loading");
    setAiError(null);
    const result = await getWordExplanation({
      word: meaning.tappedText,
      lemma: meaning.lemma,
      articleSentence: meaning.contextSentence,
      simpleExampleSentence: meaning.examples[0]?.fr ?? null,
      surroundingSentence: state?.surroundingSentence ?? null,
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

  function handleSendReport() {
    if (!meaning || !reportReason) return;
    recordTranslationReport({
      french: meaning.displayFrench,
      shownEnglish: meaning.displayEnglish,
      shownSource: meaning.source,
      reason: reportReason,
      suggestion: reportSuggestion.trim() || null,
      contextSentence: meaning.contextSentence,
      articleTitle,
    });
    setReportSent(true);
  }

  const footer = isProperNoun ? (
    <button onClick={onClose} className="min-h-12 w-full rounded-2xl bg-brand py-3 text-sm font-semibold text-white">
      Close
    </button>
  ) : (
    <button
      onClick={() => (saved ? onUnsave?.() : onSave?.())}
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
      ariaLabel={meaning ? `Meaning of ${meaning.displayFrench}` : "Word meaning"}
      footer={footer}
      contentClassName="px-5 pb-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-french text-2xl font-bold leading-tight text-ink">{meaning?.displayFrench}</h3>
          {/* Only when the reader tapped something smaller than the unit being
              explained — tapping "compte" inside "se rendre compte". */}
          {meaning?.partOfExpression && (
            <p className="mt-1 text-xs text-ink-muted">
              You tapped <span className="font-semibold text-ink">{meaning.tappedText}</span>
            </p>
          )}
          {meaning?.displayFrench && (
            <div className="mt-2 flex flex-wrap gap-2">
              <PronounceButton text={meaning.displayFrench} label={`Play ${meaning.displayFrench}`} />
              <PronounceButton text={meaning.displayFrench} label={`Play ${meaning.displayFrench} slowly`} rate="slow" />
            </div>
          )}
        </div>
        <button onClick={onClose} aria-label="Close" className="ligne-icon-button shrink-0 bg-white/70 text-ink">
          <AppIcon name="close" className="h-5 w-5" />
        </button>
      </div>

      {state?.existingStatus && (
        <p className="mt-2 text-xs font-semibold text-brand">{STATUS_LABEL[state.existingStatus]}</p>
      )}

      {/* The one authoritative answer. */}
      <div className="mt-3 rounded-2xl bg-brand-light/80 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Meaning here</p>
        {meaning?.abstained ? (
          <>
            <p className="mt-1 text-base font-semibold text-ink">
              {state?.resolving ? "Working out this word…" : "Couldn't confidently determine the meaning here."}
            </p>
            {!state?.resolving && (
              <p className="mt-1 text-xs text-ink-muted">
                Lire would rather say nothing than teach you the wrong meaning.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="mt-1 text-lg font-bold text-ink">{meaning?.displayEnglish}</p>
            {meaning?.partOfExpression && (
              <p className="mt-1 text-xs text-ink-muted">
                from <span className="font-semibold text-ink">{meaning.partOfExpression}</span>
              </p>
            )}
            {meaning?.confidence === "low" && (
              <p className="mt-1.5 text-xs text-ink-muted">
                Best offline guess — the sentence may be using it differently.
              </p>
            )}
          </>
        )}
      </div>

      {/* Escalation for the two states where the local answer isn't trusted. */}
      {meaning && (meaning.abstained || meaning.confidence === "low") && aiState !== "ready" && (
        <button
          onClick={handleAskAi}
          disabled={aiState === "loading"}
          className="mt-2.5 min-h-12 w-full rounded-2xl bg-white/75 py-3 text-sm font-semibold text-ink disabled:opacity-60"
        >
          {aiState === "loading" ? "Working it out…" : "Explain in context"}
        </button>
      )}
      {aiState === "error" && (
        <p className="mt-2 text-xs text-rose-700">
          {aiError}{" "}
          <button onClick={handleAskAi} className="underline">
            Try again
          </button>
        </p>
      )}
      {aiState === "ready" && aiResult && (
        <div className="mt-2.5 rounded-2xl bg-white/75 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">In context</p>
          <p className="mt-1 text-lg font-bold text-ink">{aiResult.translation}</p>
          <p className="mt-1 text-sm text-ink">{aiResult.meaningInContext}</p>
        </div>
      )}

      {/* Everything below is study material, not reading assistance. */}
      <details className="mt-2.5 rounded-2xl bg-white/60 p-2.5">
        <summary className="min-h-12 cursor-pointer list-none py-3 text-sm font-semibold text-accent-pinktext">
          More
        </summary>
        <div className="mt-1 space-y-2.5">
          {meaning && meaning.alternatives.length > 0 && (
            <Panel label="Other meanings">
              <p className="text-sm text-ink">{meaning.alternatives.join(", ")}</p>
            </Panel>
          )}

          {meaning?.lemma && meaning.lemma !== meaning.displayFrench && (
            <Panel label="Dictionary form">
              <p className="text-sm font-semibold text-ink">{meaning.lemma}</p>
            </Panel>
          )}

          {meaning?.partOfSpeech && !meaning.partOfSpeechUncertain && (
            <Panel label="Grammar">
              <p className="text-sm text-ink">{meaning.partOfSpeech}</p>
              {meaning.grammar && <GrammarDetail grammar={meaning.grammar} />}
            </Panel>
          )}

          {/* The dictionary example lives here and only here. It used to render
              both inside "More meanings" and again in its own section. */}
          {meaning?.examples[0] && (
            <Panel label="Example">
              <p className="font-french text-sm italic text-ink">{meaning.examples[0].fr}</p>
              <p className="mt-0.5 text-sm text-ink-muted">{meaning.examples[0].en}</p>
              <div className="mt-2">
                <PronounceButton
                  text={meaning.examples[0].fr}
                  label="Play example sentence"
                  className="bg-white"
                  scope="sentence"
                />
              </div>
            </Panel>
          )}

          {meaning?.contextSentence && (
            <Panel label="This sentence">
              <p className="font-french text-sm italic text-ink">“{meaning.contextSentence}”</p>
            </Panel>
          )}

          {state?.pronounReference && (
            <Panel label="Refers back to">
              <p className="text-sm text-ink">
                <span className="font-semibold">{state.pronounReference.pronoun}</span> points back to{" "}
                <span className="rounded bg-white/70 px-1 font-semibold">{state.pronounReference.antecedentText}</span>.
              </p>
              <p className="mt-1 text-xs text-ink-muted">{state.pronounReference.note}</p>
            </Panel>
          )}

          {meaning?.explanation && (
            <Panel label="Why this reading">
              <p className="text-sm text-ink-muted">{meaning.explanation}</p>
            </Panel>
          )}

          {wordFamily && hasWordFamily && (
            <Panel label="Word family">
              <WordFamilyRow label="Noun" values={wordFamily.noun} />
              <WordFamilyRow label="Verb" values={wordFamily.verb} />
              <WordFamilyRow label="Adjective" values={wordFamily.adjective} />
              <WordFamilyRow label="Adverb" values={wordFamily.adverb} />
              <WordFamilyRow label="Collocations" values={wordFamily.commonCollocations} />
              <WordFamilyRow label="Opposites" values={wordFamily.opposites} />
              <WordFamilyRow label="Expressions" values={wordFamily.relatedExpressions} />
            </Panel>
          )}

          {aiState === "idle" && !meaning?.abstained && meaning?.confidence !== "low" && (
            <button
              onClick={handleAskAi}
              className="min-h-12 w-full rounded-2xl bg-white/70 py-3 text-sm font-semibold text-ink"
            >
              Explain in context
            </button>
          )}
          {aiState === "ready" && aiResult && (
            <Panel label="Usage notes">
              <div className="rounded-xl bg-cream p-2">
                <p className="font-french text-sm italic text-ink">{aiResult.simpleExampleFr}</p>
                <p className="text-xs text-ink-muted">{aiResult.simpleExampleEn}</p>
              </div>
              {aiResult.grammarOrUsageNote && <p className="mt-2 text-xs text-ink-muted">{aiResult.grammarOrUsageNote}</p>}
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
            </Panel>
          )}

          {onExplainSentence && meaning && (
            <button
              onClick={() => onExplainSentence(meaning.contextSentence)}
              className="min-h-12 w-full rounded-2xl bg-white/70 py-3 text-sm font-semibold text-ink"
            >
              Explain the whole sentence
            </button>
          )}

          {/* Consumer feedback, not a dictionary editor. A report is a signal;
              it never changes what this or any future tap displays. */}
          <details className="rounded-2xl bg-white/60 p-2.5">
            <summary className="min-h-12 cursor-pointer list-none py-3 text-xs font-semibold uppercase tracking-wide text-accent-pinktext">
              Report translation
            </summary>
            {reportSent ? (
              <p className="mt-1 text-sm font-semibold text-brand">Thanks — that helps us fix it.</p>
            ) : (
              <div className="mt-1 space-y-2">
                <p className="text-xs text-ink-muted">What&rsquo;s wrong with this meaning?</p>
                <div className="grid gap-1.5">
                  {TRANSLATION_REPORT_REASONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setReportReason(option.value)}
                      aria-pressed={reportReason === option.value}
                      className={`min-h-12 rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                        reportReason === option.value ? "bg-brand text-white" : "bg-cream text-ink"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={reportSuggestion}
                  onChange={(event) => setReportSuggestion(event.target.value)}
                  placeholder="What should it say? (optional)"
                  aria-label="Suggested meaning"
                  className="w-full rounded-xl bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
                />
                <button
                  type="button"
                  onClick={handleSendReport}
                  disabled={!reportReason}
                  className="min-h-12 w-full rounded-xl bg-brand py-2 text-sm font-semibold text-white disabled:opacity-40"
                >
                  Send report
                </button>
              </div>
            )}
          </details>
        </div>
      </details>
    </BottomSheet>
  );
}

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/60 p-2.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent-pinktext">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function GrammarDetail({ grammar }: { grammar: NonNullable<ResolvedMeaning["grammar"]> }) {
  const parts = [grammar.form, grammar.tense, grammar.mood, grammar.person, grammar.number, grammar.gender].filter(
    (value): value is string => !!value
  );
  if (parts.length === 0 && !grammar.negated && !grammar.note) return null;
  return (
    <>
      {parts.length > 0 && <p className="mt-0.5 text-xs text-ink-muted">{parts.join(" · ")}</p>}
      {grammar.negated && <p className="mt-0.5 text-xs text-ink-muted">Negated in this sentence.</p>}
      {grammar.note && <p className="mt-0.5 text-xs text-ink-muted">{grammar.note}</p>}
    </>
  );
}

function WordFamilyRow({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div className="mt-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent-pinktext">{label}</p>
      <div className="mt-1 grid gap-1.5">
        {values.map((value) => {
          const gloss = lookupWord(value).translations[0] ?? null;
          return (
            <div key={value} className="rounded-xl bg-white/60 px-3 py-2 text-sm text-ink">
              <span className="font-semibold">{value}</span>
              {gloss && <span className="text-ink-muted"> — {gloss}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
