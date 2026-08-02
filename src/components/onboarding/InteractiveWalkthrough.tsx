"use client";

import { useEffect, useMemo, useState } from "react";
import { tokenize, type Token } from "@/lib/words";
import { lookupWord } from "@/lib/dictionary/lookup";
import { saveWord, markWordAsKnown } from "@/lib/storage";
import { defaultSpacedRepetitionFields } from "@/lib/spacedRepetition";
import { NOT_TRANSLATED_YET } from "@/lib/dictionary/constants";
import { buildWordCloze, distractorPoolFromBody, type ClozeExercise } from "@/lib/practice/cloze";
import { ratePer100Words } from "@/lib/sessionRecord";
import { getNextTextForReader } from "@/lib/journey/state";
import { getJourneyText } from "@/lib/journey/ladder";
import { saveWalkthroughStep, completeWalkthrough } from "@/lib/onboarding";
import { trackEvent } from "@/lib/analytics/client";
import PronounceButton from "@/components/PronounceButton";
import CoachMark from "@/components/onboarding/CoachMark";
import type { SavedWord } from "@/types";

/**
 * A short (1-3 minute), interactive walkthrough that teaches Lire by using
 * it, not by reading about it — shown once, right after the level/topic/
 * goal picker (FirstRunOnboarding), before the learner ever reaches the
 * main app. Reuses real domain logic throughout (the actual dictionary
 * lookup, the actual saveWord/markWordAsKnown storage functions, the actual
 * cloze-exercise builder, the actual PronounceButton) against a small,
 * purpose-built demo text — not a fake mockup, and not the full Reader
 * component (whose word-tap plumbing carries far more machinery — AI
 * explanations, phrase detection, translation toggles — than a first-run
 * demo needs).
 */

const DEMO_TITLE = "Getting started";
const DEMO_SENTENCES = ["Léa aime le café.", "Elle lit un livre chaque matin."];

const STEP_COUNT = 4; // welcome, read+tap, audio, practice — then a summary screen (not itself a numbered step)

interface InteractiveWalkthroughProps {
  startStep: number | null;
  onFinish: () => void;
  onSkip: () => void;
}

export default function InteractiveWalkthrough({ startStep, onFinish, onSkip }: InteractiveWalkthroughProps) {
  const [step, setStep] = useState(() => Math.min(Math.max(startStep ?? 0, 0), STEP_COUNT));
  const [showSummary, setShowSummary] = useState(() => (startStep ?? 0) >= STEP_COUNT);
  const [tapCount, setTapCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [activeWord, setActiveWord] = useState<{ token: Token; lookup: ReturnType<typeof lookupWord> } | null>(null);
  const [coachMarkDismissed, setCoachMarkDismissed] = useState(false);

  useEffect(() => {
    if (step === 0) trackEvent("onboarding_started", { surface: "walkthrough" });
  }, [step]);

  function goToStep(next: number) {
    setStep(next);
    if (next >= STEP_COUNT) {
      setShowSummary(true);
      saveWalkthroughStep(null);
    } else {
      saveWalkthroughStep(next);
    }
  }

  function handleTapWord(token: Token) {
    setTapCount((c) => c + 1);
    setCoachMarkDismissed(true);
    setActiveWord({ token, lookup: lookupWord(token.clean) });
  }

  function buildDemoSavedWord(word: string, status: Exclude<SavedWord["status"], "known">): SavedWord {
    const lookup = lookupWord(word);
    const translations = lookup.translations.length > 0 ? lookup.translations : [];
    return {
      word,
      lemma: lookup.lemma,
      translations,
      primaryTranslation: translations[0] ?? NOT_TRANSLATED_YET,
      partOfSpeech: lookup.partOfSpeechUncertain ? null : lookup.partOfSpeech,
      gender: lookup.gender,
      cefr: lookup.cefr,
      frequencyRank: lookup.frequencyRank,
      articleContextSentence: DEMO_SENTENCES.find((s) => s.toLowerCase().includes(word)) ?? DEMO_SENTENCES[0],
      exampleSentenceFr: lookup.examples[0]?.fr ?? DEMO_SENTENCES[0],
      exampleSentenceEn: lookup.examples[0]?.en ?? "",
      sourceTextTitle: DEMO_TITLE,
      savedAt: new Date().toISOString(),
      reviewCount: 0,
      lastReviewedAt: null,
      status,
      missingFromDictionary: lookup.source === "missing",
      ...defaultSpacedRepetitionFields(),
    };
  }

  function handleWordAction(action: "known" | "unsure" | "save") {
    if (!activeWord) return;
    const word = activeWord.token.clean;
    if (action === "known") {
      const { persisted } = saveWord(buildDemoSavedWord(word, "learning"));
      if (persisted) markWordAsKnown(word);
    } else {
      saveWord(buildDemoSavedWord(word, action === "unsure" ? "unsure" : "learning"));
    }
    setSavedCount((c) => c + 1);
    trackEvent("first_word_saved", { articleId: "onboarding-demo" });
    setActiveWord(null);
  }

  const clozeExercise = useMemo<ClozeExercise | null>(() => {
    const sentenceTokens = tokenize(DEMO_SENTENCES[1]);
    const sentence = { index: 1, text: DEMO_SENTENCES[1], tokens: sentenceTokens };
    const pool = distractorPoolFromBody(DEMO_SENTENCES.join(" "), 1, [
      { index: 0, text: DEMO_SENTENCES[0], tokens: tokenize(DEMO_SENTENCES[0]) },
      sentence,
    ]);
    return buildWordCloze(sentence, pool);
  }, []);

  const wordsRead = useMemo(() => tokenize(DEMO_SENTENCES.join(" ")).filter((t) => t.isWord).length, []);

  function handleSkip() {
    trackEvent("onboarding_skipped", { atStep: step });
    completeWalkthrough();
    onSkip();
  }

  function handleFinish() {
    completeWalkthrough();
    onFinish();
  }

  const nextLessonLabel = useMemo(() => {
    try {
      const recommendation = getNextTextForReader();
      if (!recommendation) return null;
      const text = getJourneyText(recommendation.textId);
      return text?.title ?? null;
    } catch {
      return null;
    }
  }, []);

  if (showSummary) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-cream px-[22px] pb-6 pt-[calc(var(--safe-top)+1rem)]">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center text-center">
          <p className="ligne-label">All set</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">Nice work — that's how Lire works.</h1>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              ["Words read", wordsRead],
              ["Lookups", tapCount],
              ["Lookups / 100 words", ratePer100Words(tapCount, wordsRead)],
              ["Words saved", savedCount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-card border border-cream-dark bg-cream-card p-3">
                <p className="text-2xl font-extrabold tabular-nums text-ink">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink-muted">
            {nextLessonLabel ? `Your first lesson is ready: ${nextLessonLabel}.` : "Your first lesson is ready whenever you are."}
          </p>
          <button type="button" onClick={handleFinish} className="ligne-pill mt-6 w-full bg-brand text-cream">
            Continue to my lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-cream px-[22px] pb-6 pt-[calc(var(--safe-top)+1rem)]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button type="button" onClick={() => goToStep(step - 1)} className="text-sm font-semibold text-ink-muted">
              Back
            </button>
          ) : (
            <span />
          )}
          <button type="button" onClick={handleSkip} className="text-sm font-semibold text-ink-muted">
            Skip tutorial
          </button>
        </div>

        {step === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="ligne-label">Let's begin</p>
            <h1 className="mt-2 text-2xl font-extrabold text-ink">Learn Lire by reading one tiny bit of French.</h1>
            <p className="mt-3 max-w-xs text-sm text-ink-muted">Takes about a minute. Tap through a few words, hear them spoken, then try one quick exercise.</p>
            <button type="button" onClick={() => goToStep(1)} className="ligne-pill mt-6 bg-brand text-cream">
              Start
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="flex-1">
            <p className="ligne-label">Tap a word</p>
            <div className="mt-3 rounded-card border border-cream-dark bg-cream-card p-4 text-lg leading-relaxed text-ink">
              {DEMO_SENTENCES.map((sentence, sIndex) => (
                <p key={sentence} className={sIndex > 0 ? "mt-2" : ""}>
                  {tokenize(sentence).map((token, tIndex) =>
                    token.isWord ? (
                      <button
                        key={`${sIndex}-${tIndex}`}
                        type="button"
                        onClick={() => handleTapWord(token)}
                        className="rounded px-0.5 underline decoration-dotted decoration-2 underline-offset-4 active:bg-brand-light"
                      >
                        {token.text}
                      </button>
                    ) : (
                      <span key={`${sIndex}-${tIndex}`}>{token.text}</span>
                    )
                  )}
                </p>
              ))}
            </div>

            {!coachMarkDismissed && (
              <div className="mt-3">
                <CoachMark text="Tap a word to see its meaning." />
              </div>
            )}

            {activeWord && (
              <div className="mt-3 rounded-card border border-cream-dark bg-cream-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">Meaning</p>
                <p className="mt-1 text-xl font-bold text-ink">{activeWord.lookup.translations[0] ?? "Not in the dictionary"}</p>
                <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                  <span className="font-semibold text-ink">Known</span> means this won&apos;t enter your review queue. <span className="font-semibold text-ink">Unsure</span> means you recognise it but want to
                  strengthen recall. <span className="font-semibold text-ink">Save</span> means it&apos;s a word you&apos;re currently learning.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => handleWordAction("known")} className="rounded-full bg-cream px-2 py-2 text-xs font-semibold text-ink active:scale-95">
                    Known
                  </button>
                  <button type="button" onClick={() => handleWordAction("unsure")} className="rounded-full bg-cream px-2 py-2 text-xs font-semibold text-ink active:scale-95">
                    Unsure
                  </button>
                  <button type="button" onClick={() => handleWordAction("save")} className="rounded-full bg-brand px-2 py-2 text-xs font-semibold text-cream active:scale-95">
                    Save
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                trackEvent("intro_text_completed", {});
                goToStep(2);
              }}
              className="ligne-pill mt-4 w-full bg-brand text-cream"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1">
            <p className="ligne-label">Listen</p>
            <p className="mt-2 text-sm text-ink-muted">Audio connects the written French with how it actually sounds. Try it below.</p>
            <div className="mt-4 rounded-card border border-cream-dark bg-cream-card p-4">
              <p className="text-lg text-ink">{DEMO_SENTENCES[0]}</p>
              <div className="mt-3">
                <PronounceButton text={DEMO_SENTENCES[0]} label="Play sentence" scope="sentence" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                trackEvent("audio_played", { scope: "onboarding" });
                goToStep(3);
              }}
              className="ligne-pill mt-4 w-full bg-brand text-cream"
            >
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1">
            <p className="ligne-label">One quick exercise</p>
            {clozeExercise ? (
              <WalkthroughCloze exercise={clozeExercise} onDone={() => goToStep(4)} />
            ) : (
              <div className="mt-3">
                <p className="text-sm text-ink-muted">Almost done.</p>
                <button type="button" onClick={() => goToStep(4)} className="ligne-pill mt-4 w-full bg-brand text-cream">
                  Continue
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WalkthroughCloze({ exercise, onDone }: { exercise: ClozeExercise; onDone: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [before, after] = exercise.prompt.split("___");
  const correct = selected?.trim().toLowerCase() === exercise.answer.trim().toLowerCase();

  return (
    <div className="mt-3 rounded-card border border-cream-dark bg-cream-card p-4">
      <p className="text-lg leading-relaxed text-ink">
        {before}
        <span className="mx-1 inline-block min-w-[4rem] rounded-lg border-b-2 border-brand px-1 text-center font-semibold text-brand">{selected ?? "___"}</span>
        {after}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {exercise.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => !checked && setSelected(option)}
            disabled={checked}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold disabled:opacity-60 ${
              selected === option ? "border-brand bg-brand text-cream" : "border-cream-dark bg-cream text-ink"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {checked && (
        <p className={`mt-3 text-sm font-bold ${correct ? "text-brand" : "text-ink-muted"}`}>
          {correct ? "Correct." : `The answer is "${exercise.answer}".`}
        </p>
      )}
      <button
        type="button"
        onClick={() => (checked ? onDone() : setChecked(true))}
        disabled={!selected}
        className="ligne-pill mt-4 w-full bg-brand text-cream disabled:opacity-40"
      >
        {checked ? "Continue" : "Check"}
      </button>
    </div>
  );
}
