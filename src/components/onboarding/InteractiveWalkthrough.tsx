"use client";

import { useEffect, useMemo, useState } from "react";
import { tokenize, type Token } from "@/lib/words";
import { lookupWord } from "@/lib/dictionary/lookup";
import { saveWord } from "@/lib/storage";
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
import { findContainingPhraseTranslationMatch, type PhraseTranslationMatch } from "@/lib/dictionary/articleTranslation";
import { useModalFocus } from "@/lib/useModalFocus";
import { useDismissibleHistory } from "@/lib/useDismissibleHistory";
import type { SavedWord } from "@/types";

/**
 * A short (1-3 minute), interactive walkthrough that teaches Sorlio by using
 * it, not by reading about it. First use now goes straight to a real lesson;
 * this fuller tutorial remains available from Library for anyone who wants
 * to replay it. Reuses real domain logic throughout (the actual dictionary
 * lookup, the actual saveWord/markWordAsKnown storage functions, the actual
 * cloze-exercise builder, the actual PronounceButton) against a small,
 * purpose-built demo text — not a fake mockup, and not the full Reader
 * component (whose word-tap plumbing carries far more machinery — AI
 * explanations, phrase detection, translation toggles — than a first-run
 * demo needs).
 */

const DEMO_TITLE = "Getting started";
const DEMO_SENTENCES = ["Léa aime le café.", "De temps en temps, Léa lit un livre."];
const DEMO_PHRASE = "De temps en temps";

const STEP_COUNT = 5; // welcome, read+tap, expressions, audio, practice — then the summary

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
  const [activePhrase, setActivePhrase] = useState<PhraseTranslationMatch | null>(null);
  const [coachMarkDismissed, setCoachMarkDismissed] = useState(false);
  const modalRef = useModalFocus<HTMLDivElement>(true, handleSkip);
  useDismissibleHistory(true, handleSkip);

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

  function handleWordAction() {
    if (!activeWord) return;
    saveWord(buildDemoSavedWord(activeWord.token.clean, "learning"));
    setSavedCount((c) => c + 1);
    trackEvent("first_word_saved", { articleId: "onboarding-demo" });
    setActiveWord(null);
  }

  function revealDemoPhrase() {
    const tokens = tokenize(DEMO_SENTENCES[1]);
    const phraseTokenIndex = tokens.findIndex((token) => token.isWord);
    const match = findContainingPhraseTranslationMatch(tokens, phraseTokenIndex);
    setActivePhrase(
      match ?? {
        startIndex: 0,
        endIndex: 6,
        phrase: DEMO_PHRASE.toLowerCase(),
        lemma: DEMO_PHRASE.toLowerCase(),
        translation: "from time to time",
        partOfSpeech: "adverb phrase",
        source: "phrasebank",
      }
    );
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
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Tutorial complete"
        tabIndex={-1}
        className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-cream px-[22px] pb-6 pt-[calc(var(--safe-top)+1rem)]"
      >
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center text-center">
          <p className="ligne-label">All set</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">Nice work — that's how Sorlio works.</h1>
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
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Interactive Sorlio tutorial"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-cream px-[22px] pb-6 pt-[calc(var(--safe-top)+1rem)]"
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button type="button" onClick={() => goToStep(step - 1)} className="min-h-12 rounded-full px-3 text-sm font-semibold text-ink-muted">
              Back
            </button>
          ) : (
            <span />
          )}
          <button type="button" onClick={handleSkip} className="min-h-12 rounded-full px-3 text-sm font-semibold text-ink-muted">
            Skip tutorial
          </button>
        </div>

        {step === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="ligne-label">Let's begin</p>
            <h1 className="mt-2 text-2xl font-extrabold text-ink">Learn Sorlio by reading one tiny bit of French.</h1>
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
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleWordAction}
                    className="w-full rounded-2xl bg-brand py-3 text-sm font-semibold text-white"
                  >
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

        {/* Deliberately still a plain tap. There is no second gesture to teach
            any more: expressions are resolved automatically, so this step
            exists to show that a tap on one word can answer with the whole
            expression — not to train a different interaction. */}
        {step === 2 && (
          <div className="flex-1">
            <p className="ligne-label">Expressions too</p>
            <p className="mt-2 text-sm text-ink-muted">
              Some meanings belong to several words together. Tap any word of one and Sorlio explains the whole expression.
            </p>
            <div className="mt-4 rounded-card border border-cream-dark bg-cream-card p-4 text-lg leading-relaxed text-ink">
              {DEMO_PHRASE.split(" ").map((word, index) => (
                <span key={`${word}-${index}`}>
                  <button
                    type="button"
                    onClick={revealDemoPhrase}
                    className="rounded px-0.5 font-semibold text-ink active:bg-brand/10"
                  >
                    {word}
                  </button>
                  {index < DEMO_PHRASE.split(" ").length - 1 ? " " : ""}
                </span>
              ))}
              <span>, Léa lit un livre.</span>
            </div>
            {!activePhrase ? (
              <div className="mt-3">
                <CoachMark text={`Tap any word in “${DEMO_PHRASE}”.`} />
              </div>
            ) : (
              <div className="mt-3 rounded-card border border-cream-dark bg-cream-card p-4" role="status">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">Meaning here</p>
                <p className="mt-1 text-lg font-bold text-ink">{activePhrase.translation}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  from <span className="font-semibold text-ink">{DEMO_PHRASE.toLowerCase()}</span> — Sorlio recognised the whole
                  expression, not four unrelated words.
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => goToStep(3)}
              disabled={!activePhrase}
              className="ligne-pill mt-4 w-full bg-brand text-cream disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
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
                goToStep(4);
              }}
              className="ligne-pill mt-4 w-full bg-brand text-cream"
            >
              Continue
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1">
            <p className="ligne-label">One quick exercise</p>
            {clozeExercise ? (
              <WalkthroughCloze exercise={clozeExercise} onDone={() => goToStep(5)} />
            ) : (
              <div className="mt-3">
                <p className="text-sm text-ink-muted">Almost done.</p>
                <button type="button" onClick={() => goToStep(5)} className="ligne-pill mt-4 w-full bg-brand text-cream">
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
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [before, after] = exercise.prompt.split("___");
  const correct = selected?.trim().toLowerCase() === exercise.answer.trim().toLowerCase();

  function retry() {
    setSelected(null);
    setChecked(false);
    setAnswerRevealed(false);
  }

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
          {correct ? "Correct." : answerRevealed ? `The answer is "${exercise.answer}".` : "Not quite. Try once more or reveal the answer."}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        {!checked ? (
          <button
            type="button"
            onClick={() => setChecked(true)}
            disabled={!selected}
            className="ligne-pill w-full bg-brand text-cream disabled:opacity-40"
          >
            Check
          </button>
        ) : correct || answerRevealed ? (
          <button type="button" onClick={onDone} className="ligne-pill w-full bg-brand text-cream">
            Continue
          </button>
        ) : (
          <>
            <button type="button" onClick={retry} className="ligne-pill flex-1 border border-cream-dark bg-cream text-ink">
              Try again
            </button>
            <button type="button" onClick={() => setAnswerRevealed(true)} className="ligne-pill flex-1 bg-brand text-cream">
              Reveal answer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
