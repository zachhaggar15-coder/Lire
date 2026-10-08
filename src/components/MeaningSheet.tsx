"use client";

import { useEffect, useState } from "react";
import type { ResolvedMeaning } from "@/lib/dictionary/resolveMeaning";
import type { WordExplanation } from "@/lib/ai/types";
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
import { canSaveNewWord, canUseAI } from "@/lib/access/accessModel";
import Link from "next/link";
import { useAccess } from "@/lib/access/useAccess";
import { submitFeedback } from "@/lib/feedback/client";
import { REVIEW_CONTROL_LABEL, reviewControlFor } from "@/lib/reviewMembership";

export interface ActiveMeaningState {
  meaning: ResolvedMeaning;
  /** The sentence just before the context sentence — extra grounding for the AI explanation. */
  surroundingSentence: string | null;
  /**
   * Whether this word (or another form of its lemma) has a card in Review.
   * The only state the sheet's review control reflects: it offers exactly
   * "Add to review" or "Remove from review" (see reviewMembership.ts).
   */
  inReview: boolean;
  /** A card exists but is not in Review: adding it back is not a new save. */
  hasCard?: boolean;
  /** The meanings already on the word's card in Review (to offer adding a new one). */
  cardMeanings?: string[];
  pronounReference: PronounReference | null;
  /** True while a targeted AI lookup for this tap is still in flight. */
  resolving: boolean;
  /** The offline answer is uncertain; AI help is worth offering (never run automatically). */
  aiSuggested?: boolean;
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
  /** Adds the meaning shown here to the word's card in Review. */
  onAddMeaning?: (meaning: string) => void;
  onAiRequested?: () => void;
  onExplainSentence?: (sentence: string) => void;
  /** Imported text: its sentences are private and never included in reports. */
  privateText?: boolean;
}

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
  onAddMeaning,
  onAiRequested,
  onExplainSentence,
  privateText = false,
}: MeaningSheetProps) {
  const [aiState, setAiState] = useState<AiState>("idle");
  const [aiResult, setAiResult] = useState<WordExplanation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<TranslationReportReason | null>(null);
  const [reportSuggestion, setReportSuggestion] = useState("");
  const [reportSent, setReportSent] = useState(false);
  // AI runs only when the reader asks, and only for Premium. Free readers see
  // the built-in dictionary answer and are told AI help exists, quietly.
  const { context: access, tier } = useAccess();
  const aiAllowed = canUseAI(access).allowed;
  const saveDecision = canSaveNewWord(access);
  const [reportState, setReportState] = useState<"idle" | "sending" | "error">("idle");
  const [reportError, setReportError] = useState<string | null>(null);
  const [aiReported, setAiReported] = useState(false);

  const open = state !== null;
  const meaning = state?.meaning;
  const saved = state?.inReview === true;
  const meaningHere = meaning && !meaning.abstained ? meaning.displayEnglish.trim() : "";
  const newMeaningHere =
    saved && meaningHere && state?.cardMeanings && !state.cardMeanings.some((m) => m.trim().toLowerCase() === meaningHere.toLowerCase())
      ? meaningHere
      : null;
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
    setReportState("idle");
    setReportError(null);
    setAiReported(false);
  }, [meaning?.cacheKey]);

  async function handleAskAi() {
    if (!meaning || !aiAllowed) return;
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

  async function handleSendReport() {
    if (!meaning || !reportReason) return;
    setReportState("sending");
    setReportError(null);
    const suggestion = reportSuggestion.trim() || null;
    const result = await submitFeedback({
      category: "translation_issue",
      sentiment: "negative",
      page: typeof window !== "undefined" ? window.location.pathname.slice(0, 300) : "/reader",
      feature: `meaning:${meaning.source}`.slice(0, 80),
      affectedTerm: meaning.displayFrench,
      // The sentence helps fix the meaning — but never for imported (private) text.
      comment: [
        `Reason: ${reportReason}`,
        `Shown: ${meaning.displayEnglish}`,
        suggestion ? `Suggested: ${suggestion}` : null,
        privateText ? null : `Sentence: ${meaning.contextSentence}`,
      ]
        .filter(Boolean)
        .join("\n")
        .slice(0, 2000),
    });
    if (!result.ok) {
      setReportState("error");
      setReportError(result.error);
      return;
    }
    recordTranslationReport({
      french: meaning.displayFrench,
      shownEnglish: meaning.displayEnglish,
      shownSource: meaning.source,
      reason: reportReason,
      suggestion,
      contextSentence: privateText ? "" : meaning.contextSentence,
      articleTitle: privateText ? "" : articleTitle,
    });
    setReportState("idle");
    setReportSent(true);
  }

  async function handleReportAi() {
    if (!meaning || !aiResult) return;
    const result = await submitFeedback({
      category: "ai_output_issue",
      sentiment: "negative",
      page: typeof window !== "undefined" ? window.location.pathname.slice(0, 300) : "/reader",
      feature: "ai:explain-word",
      affectedTerm: meaning.displayFrench,
      comment: `AI said: ${aiResult.translation} — ${aiResult.meaningInContext}`.slice(0, 2000),
    });
    setAiReported(result.ok);
    if (!result.ok) setAiError(result.error);
  }

  // Exactly "Add to review" or "Remove from review" for a normal word; a name
  // or place only closes (reviewMembership.ts).
  // A meaning still being worked out (AI in flight) is not "no meaning".
  const noMeaning = !!meaning?.abstained && !state?.resolving;
  const control = reviewControlFor({ inReview: saved, isProperNoun, noMeaning });
  const footer = (
    <button
      onClick={() => (control === "close" ? onClose() : control === "remove" ? onUnsave?.() : onSave?.())}
      aria-pressed={control === "close" ? undefined : saved}
      className={`min-h-12 w-full rounded-2xl py-3 text-sm font-semibold ${
        control === "remove" ? "bg-brand-light text-brand" : "bg-brand text-cream"
      }`}
    >
      {REVIEW_CONTROL_LABEL[control]}
    </button>
  );
  const saveHint =
    control === "add" && !state?.hasCard && tier !== "premium"
      ? saveDecision.allowed
        ? `${(saveDecision.remaining ?? 0) + 1} of 5 free new saves left today`
        : "You've used today's 5 free new saves"
      : null;

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
          <h3 lang="fr" className="font-french text-2xl font-bold leading-tight text-ink">{meaning?.displayFrench}</h3>
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
        <button onClick={onClose} aria-label="Close" className="ligne-icon-button shrink-0 bg-cream-card/70 text-ink">
          <AppIcon name="close" className="h-5 w-5" />
        </button>
      </div>

      {saved && <p className="mt-2 text-xs font-semibold text-brand">In your review</p>}
      {/* One card per word, not per sense: when the word means something new
          here, say so and let the reader keep it. Never "you already know this". */}
      {saved && newMeaningHere && (
        <div className="mt-2 rounded-2xl bg-cream px-3 py-2 text-xs text-ink-muted">
          <p>
            Your card has: <span className="font-semibold text-ink">{state?.cardMeanings?.slice(0, 2).join(", ")}</span>. Here it means:{" "}
            <span className="font-semibold text-ink">{newMeaningHere}</span>.
          </p>
          <button type="button" onClick={() => onAddMeaning?.(newMeaningHere)} className="mt-1 font-semibold text-brand underline underline-offset-2">
            Add this meaning to your card
          </button>
        </div>
      )}
      {control === "close" && noMeaning && !isProperNoun && (
        <p className="mt-2 text-xs text-ink-muted">Words without a meaning here can&rsquo;t be added to review.</p>
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
                Sorlio would rather say nothing than teach you the wrong meaning.
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
            {/* Only for tokens whose English contribution is not a word of its
                own — auxiliaries, clitics, negation particles. Shown here
                rather than under More because without it the gap between this
                word's meaning and the sentence's meaning looks like an error. */}
            {meaning?.grammaticalRole && (
              <p className="mt-1 text-xs text-ink-muted">{meaning.grammaticalRole}</p>
            )}
            {meaning?.confidence === "low" && (
              <p className="mt-1.5 text-xs text-ink-muted">
                Best offline guess — the sentence may be using it differently.
              </p>
            )}
          </>
        )}
      </div>

      {/* The whole sentence, clearly labelled as such. Deliberately below the
          word's own meaning and visually distinct from it: this is the context
          that explains the word, never the answer to what the word means. */}
      {meaning?.sentenceTranslation && (
        <div className="mt-2.5 rounded-2xl bg-cream-card/75 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-pinktext">In this sentence</p>
          <p lang="fr" className="mt-1 font-french text-sm text-ink">{meaning.sentenceTranslation.french}</p>
          <p className="mt-1 text-sm font-semibold text-ink">{meaning.sentenceTranslation.english}</p>
        </div>
      )}

      {saveHint && <p className="mt-2 text-xs text-ink-muted">{saveHint}</p>}

      {/* Where the offline answer isn't trusted, offer AI — it never runs on its own. */}
      {meaning && (meaning.abstained || meaning.confidence === "low" || state?.aiSuggested) && aiState !== "ready" && (
        aiAllowed ? (
          <>
            <button
              onClick={handleAskAi}
              disabled={aiState === "loading"}
              className="mt-2.5 min-h-12 w-full rounded-2xl bg-cream-card/75 py-3 text-sm font-semibold text-ink disabled:opacity-60"
            >
              {aiState === "loading" ? "Working it out…" : "Explain with AI"}
            </button>
            <p className="mt-1 text-[11px] leading-snug text-ink-muted">Sends this sentence to OpenAI to explain the word. AI can make mistakes.</p>
          </>
        ) : (
          <p className="mt-2.5 rounded-2xl bg-cream-card/60 p-3 text-xs leading-relaxed text-ink-muted">
            This is the built-in dictionary&rsquo;s best guess for this sentence.{" "}
            <Link href="/premium" className="font-semibold text-brand underline underline-offset-2">
              AI explanations are part of Premium
            </Link>
            .
          </p>
        )
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
        <div className="mt-2.5 rounded-2xl bg-cream-card/75 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">In context · AI</p>
          <p className="mt-1 text-lg font-bold text-ink">{aiResult.translation}</p>
          <p className="mt-1 text-sm text-ink">{aiResult.meaningInContext}</p>
          <button
            type="button"
            onClick={() => void handleReportAi()}
            disabled={aiReported}
            className="mt-2 min-h-11 text-xs font-semibold text-ink-muted underline underline-offset-2 disabled:no-underline"
          >
            {aiReported ? "Reported — thank you" : "Report this AI answer"}
          </button>
        </div>
      )}

      {/* Everything below is study material, not reading assistance. */}
      <details className="mt-2.5 rounded-2xl bg-cream-card/60 p-2.5">
        <summary className="min-h-12 cursor-pointer list-none py-3 text-sm font-semibold text-accent-pinktext">
          More
        </summary>
        <div className="mt-1 space-y-2.5">
          {meaning && meaning.alternatives.length > 0 && (
            <Panel label="Other meanings">
              <p className="text-sm text-ink">{meaning.alternatives.join(", ")}</p>
            </Panel>
          )}

          {/* The lemma and its dictionary definition. This is where "to have"
              belongs for a tap on "a" — true about avoir, and not the answer to
              what the token is doing in this sentence. */}
          {meaning?.lemma && meaning.lemma !== meaning.displayFrench && (
            <Panel label="Dictionary form">
              <p className="font-french text-sm font-semibold text-ink">
                <span lang="fr">{meaning.lemma}</span>
                {meaning.lemmaGloss && <span className="font-sans font-normal text-ink-muted"> — {meaning.lemmaGloss}</span>}
              </p>
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
              <p lang="fr" className="font-french text-sm italic text-ink">{meaning.examples[0].fr}</p>
              <p className="mt-0.5 text-sm text-ink-muted">{meaning.examples[0].en}</p>
              <div className="mt-2">
                <PronounceButton
                  text={meaning.examples[0].fr}
                  label="Play example sentence"
                  className="bg-cream-card"
                  scope="sentence"
                />
              </div>
            </Panel>
          )}

          {meaning?.contextSentence && (
            <Panel label="This sentence">
              <p lang="fr" className="font-french text-sm italic text-ink">“{meaning.contextSentence}”</p>
            </Panel>
          )}

          {state?.pronounReference && (
            <Panel label="Refers back to">
              <p className="text-sm text-ink">
                <span className="font-semibold">{state.pronounReference.pronoun}</span> points back to{" "}
                <span className="rounded bg-cream-card/70 px-1 font-semibold">{state.pronounReference.antecedentText}</span>.
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

          {aiAllowed && aiState === "idle" && !meaning?.abstained && meaning?.confidence !== "low" && !state?.aiSuggested && (
            <>
              <button
                onClick={handleAskAi}
                className="min-h-12 w-full rounded-2xl bg-cream-card/70 py-3 text-sm font-semibold text-ink"
              >
                Explain with AI
              </button>
              <p className="text-[11px] leading-snug text-ink-muted">Sends this sentence to OpenAI. AI can make mistakes.</p>
            </>
          )}
          {aiState === "ready" && aiResult && (
            <Panel label="Usage notes">
              <div className="rounded-xl bg-cream p-2">
                <p lang="fr" className="font-french text-sm italic text-ink">{aiResult.simpleExampleFr}</p>
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
              className="min-h-12 w-full rounded-2xl bg-cream-card/70 py-3 text-sm font-semibold text-ink"
            >
              Explain the whole sentence
            </button>
          )}

          {/* Consumer feedback, not a dictionary editor. A report is a signal;
              it never changes what this or any future tap displays. */}
          <details className="rounded-2xl bg-cream-card/60 p-2.5">
            <summary className="min-h-12 cursor-pointer list-none py-3 text-xs font-semibold uppercase tracking-wide text-accent-pinktext">
              Report translation
            </summary>
            {reportSent ? (
              <p role="status" className="mt-1 text-sm font-semibold text-brand">Thanks — your report was sent.</p>
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
                        reportReason === option.value ? "bg-brand text-cream" : "bg-cream text-ink"
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
                  className="w-full rounded-xl bg-cream-card px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
                />
                {privateText && (
                  <p className="text-[11px] leading-snug text-ink-muted">This is your imported text, so the sentence itself isn&rsquo;t included in the report.</p>
                )}
                <button
                  type="button"
                  onClick={() => void handleSendReport()}
                  disabled={!reportReason || reportState === "sending"}
                  className="min-h-12 w-full rounded-xl bg-brand py-2 text-sm font-semibold text-cream disabled:opacity-40"
                >
                  {reportState === "sending" ? "Sending…" : "Send report"}
                </button>
                {reportError && (
                  <p role="alert" className="text-xs text-rose-700">
                    {reportError}
                  </p>
                )}
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
    <div className="rounded-2xl bg-cream-card/60 p-2.5">
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
            <div key={value} className="rounded-xl bg-cream-card/60 px-3 py-2 text-sm text-ink">
              <span className="font-semibold">{value}</span>
              {gloss && <span className="text-ink-muted"> — {gloss}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
