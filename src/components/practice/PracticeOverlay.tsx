"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReadingText } from "@/types";
import type { PracticeActivity, PracticePlan } from "@/lib/practice/session";
import { shuffledChipsFor, buildPracticePlan } from "@/lib/practice/session";
import { checkReconstruction, type ReconstructionChip, type SentenceReconstructionExercise } from "@/lib/practice/sentenceReconstruction";
import type { ClozeExercise } from "@/lib/practice/cloze";
import { exerciseGlossFor } from "@/lib/practice/exerciseGloss";
import { markPracticeCompleted } from "@/lib/practice/practiceProgress";
import { allSentencesInText } from "@/lib/practice/textSentences";
import { naturalSentenceTranslation } from "@/lib/practice/sentenceTranslation";
import { buildParaphraseExercise, checkParaphraseAnswer, pickParaphraseCandidateSentence, type ParaphraseExercise, type ParaphraseOption } from "@/lib/practice/paraphrase";
import type { MeaningInferenceExercise } from "@/lib/practice/meaningInference";
import { updateSessionPracticeStats, type PracticeExerciseType } from "@/lib/sessionRecord";
import { useModalFocus } from "@/lib/useModalFocus";
import { useDismissibleHistory } from "@/lib/useDismissibleHistory";
import AppIcon from "@/components/AppIcon";

interface PracticeOverlayProps {
  text: ReadingText;
  plan: PracticePlan;
  onClose: () => void;
  onReturnToMap: () => void;
}

type ActivityResult = "correct" | "incorrect" | null;

function statKindFor(activity: PracticeActivity): PracticeExerciseType {
  if (activity.kind === "reconstruction") return "reconstruction";
  if (activity.kind === "paraphrase") return "paraphrase";
  if (activity.kind === "inference") return "inference";
  return activity.exercise.kind === "word" ? "clozeWord" : "clozePhrase";
}

/**
 * Full-screen "Practice this text" session: walks through the exercises
 * built from the reading just finished, then a brief summary. Regenerating
 * the plan on mount (rather than reusing a stale one) means a repeat
 * practice session pulls different sentences where possible.
 *
 * The reconstruction/cloze activities in `plan` are ready synchronously;
 * a paraphrase activity (LLM-backed, so necessarily async) is fetched here
 * after mount and appended to the list if generation succeeds — this keeps
 * buildPracticePlan itself synchronous and means a slow/failed paraphrase
 * generation never delays or blocks starting practice with what's already
 * ready.
 */
export default function PracticeOverlay({ text, plan: initialPlan, onClose, onReturnToMap }: PracticeOverlayProps) {
  const [activities, setActivities] = useState<PracticeActivity[]>(initialPlan.activities);
  const [paraphraseChecked, setParaphraseChecked] = useState(false);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [completedKinds, setCompletedKinds] = useState<string[]>([]);
  const mountedRef = useRef(true);
  /** Guards against React StrictMode's dev-only double-invoke of effects starting two generations (and appending the activity twice) — this must run at most once per overlay instance regardless of how many times the effect body fires. */
  const paraphraseStartedRef = useRef(false);
  const modalRef = useModalFocus<HTMLDivElement>(true, onClose);
  useDismissibleHistory(true, onClose);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (paraphraseStartedRef.current) return;
    paraphraseStartedRef.current = true;
    // Paraphrase generation is explicitly a nice-to-have addition on top of
    // the reconstruction/cloze activities that are already ready and
    // showing — nothing here, sync or async, may ever be allowed to crash
    // the practice session. An uncaught throw inside a passive effect
    // unmounts the whole page (the nearest error boundary takes over), which
    // is a much worse outcome than simply not offering a paraphrase activity
    // this time.
    try {
      const usedIndices = new Set(activities.map((a) => a.exercise.sentenceIndex));
      const candidate = pickParaphraseCandidateSentence(allSentencesInText(text), usedIndices);
      if (!candidate) {
        setParaphraseChecked(true);
        return;
      }
      buildParaphraseExercise(candidate, text.title, `${text.difficulty} French learner`)
        .then((exercise) => {
          if (!mountedRef.current) return;
          if (exercise) setActivities((prev) => [...prev, { kind: "paraphrase", exercise }]);
          setParaphraseChecked(true);
        })
        .catch(() => {
          if (mountedRef.current) setParaphraseChecked(true);
        });
    } catch {
      setParaphraseChecked(true);
    }
    // Deliberately mount-only: this is a one-shot addition per practice session, not something that re-runs as activities change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activity = activities[index];

  function handleActivityDone(kind: string, activityForStats: PracticeActivity, correct: boolean) {
    updateSessionPracticeStats(text.id, statKindFor(activityForStats), correct);
    setCompletedKinds((prev) => [...prev, kind]);
    if (index + 1 < activities.length) {
      setIndex((i) => i + 1);
    } else {
      markPracticeCompleted(text.id);
      setDone(true);
    }
  }

  if (activities.length === 0 && !paraphraseChecked) {
    return (
      <div ref={modalRef} role="dialog" aria-modal="true" aria-label="Preparing text practice" tabIndex={-1} className="fixed inset-0 z-50 flex items-center justify-center bg-cream px-6">
        <p className="text-sm text-ink-muted">Preparing practice…</p>
      </div>
    );
  }

  if (activities.length === 0 && paraphraseChecked) {
    return (
      <div ref={modalRef} role="dialog" aria-modal="true" aria-label="Text practice unavailable" tabIndex={-1} className="fixed inset-0 z-50 flex items-center justify-center bg-cream px-6">
        <div className="max-w-sm text-center">
          <p className="text-lg font-semibold text-ink">Not enough material to practise yet</p>
          <p className="mt-2 text-sm text-ink-muted">This reading is too short for these exercises. Try practising a longer text.</p>
          <button type="button" onClick={onClose} className="ligne-pill mt-5 bg-brand text-cream">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={modalRef} role="dialog" aria-modal="true" aria-label="Practice this text" tabIndex={-1} className="fixed inset-0 z-50 overflow-y-auto bg-cream px-[22px] pb-6 pt-[calc(var(--safe-top)+0.75rem)]">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex items-center justify-between">
          <button type="button" onClick={onClose} aria-label="Close practice" className="ligne-icon-button bg-cream-card text-ink-muted">
            <CloseIcon className="h-4 w-4" />
          </button>
          {!done && (
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-faint">
              Practising {index + 1} of {activities.length}
            </p>
          )}
        </div>

        {!done && activity && (
          <div className="mt-4">
            {activity.kind === "reconstruction" ? (
              <ReconstructionActivity
                key={`recon-${index}`}
                exercise={activity.exercise}
                text={text}
                onDone={(correct) => handleActivityDone("Sentence reconstructed", activity, correct)}
              />
            ) : activity.kind === "cloze" ? (
              <ClozeActivity
                key={`cloze-${index}-${activity.exercise.kind}`}
                exercise={activity.exercise}
                onDone={(correct) => handleActivityDone(activity.exercise.kind === "word" ? "Word completed" : "Phrase completed", activity, correct)}
              />
            ) : activity.kind === "inference" ? (
              <InferenceActivity
                key={`inference-${index}`}
                exercise={activity.exercise}
                onDone={(correct) => handleActivityDone("Meaning inferred", activity, correct)}
              />
            ) : (
              <ParaphraseActivity
                key={`paraphrase-${index}`}
                exercise={activity.exercise}
                onDone={(correct) => handleActivityDone("Paraphrase identified", activity, correct)}
              />
            )}
          </div>
        )}

        {done && <PracticeSummary completedKinds={completedKinds} onReturnToMap={onReturnToMap} />}
      </div>
    </div>
  );
}

function ReconstructionActivity({
  exercise,
  text,
  onDone,
}: {
  exercise: SentenceReconstructionExercise;
  text: ReadingText;
  onDone: (correct: boolean) => void;
}) {
  const shuffled = useMemo(() => shuffledChipsFor(exercise), [exercise]);
  const [bank, setBank] = useState<ReconstructionChip[]>(shuffled);
  const [placed, setPlaced] = useState<ReconstructionChip[]>([]);
  const [result, setResult] = useState<ActivityResult>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [english, setEnglish] = useState<string | null>(null);

  // Fetched only once the sentence is correct. Loading it earlier would put
  // the answer in memory before it is earned, and the whole point of showing
  // the meaning afterwards is that it confirms rather than gives away.
  useEffect(() => {
    if (result !== "correct") return;
    let cancelled = false;
    void naturalSentenceTranslation(text, exercise.sentenceIndex).then((translation) => {
      if (!cancelled) setEnglish(translation);
    });
    return () => {
      cancelled = true;
    };
  }, [result, text, exercise.sentenceIndex]);

  function moveToPlaced(chip: ReconstructionChip) {
    if (result) return;
    setBank((prev) => prev.filter((c) => c.id !== chip.id));
    setPlaced((prev) => [...prev, chip]);
  }

  function moveToBank(chip: ReconstructionChip) {
    if (result) return;
    setPlaced((prev) => prev.filter((c) => c.id !== chip.id));
    setBank((prev) => [...prev, chip]);
  }

  function retry() {
    setBank(shuffledChipsFor(exercise));
    setPlaced([]);
    setResult(null);
    setAnswerRevealed(false);
  }

  function check() {
    const ok = checkReconstruction(exercise, placed.map((c) => c.id));
    setResult(ok ? "correct" : "incorrect");
  }

  function revealAnswer() {
    setPlaced(exercise.chips);
    setBank([]);
    setAnswerRevealed(true);
  }

  return (
    <section className="rounded-card border border-cream-dark bg-cream-card p-4">
      <p className="ligne-label">Sentence reconstruction</p>
      <p className="mt-1 text-sm font-semibold text-ink">Tap the words in the right order.</p>

      <div
        className="mt-4 flex min-h-[3.5rem] flex-wrap gap-2 rounded-2xl border border-dashed border-cream-dark bg-cream p-3"
        aria-label="Your sentence so far"
      >
        {placed.length === 0 && <span className="text-xs text-ink-faint">Tap words below to build the sentence</span>}
        {placed.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => moveToBank(chip)}
            disabled={!!result}
            aria-pressed="true"
            className="rounded-full bg-brand px-3 py-1.5 text-sm font-semibold text-cream disabled:opacity-70"
          >
            {chip.display}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2" aria-label="Word bank">
        {bank.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => moveToPlaced(chip)}
            disabled={!!result}
            aria-pressed="false"
            className="rounded-full border border-cream-dark bg-cream px-3 py-1.5 text-sm font-semibold text-ink disabled:opacity-40"
          >
            {chip.display}
          </button>
        ))}
      </div>

      {result && (
        <div className={`mt-4 rounded-2xl p-3 text-sm ${result === "correct" ? "bg-brand-light text-brand" : "bg-rose text-rose-ink"}`} role="status">
          <p className="font-bold">
            {result === "correct" ? "Correct." : answerRevealed ? "Answer revealed." : "Not quite. Try once more or reveal the answer."}
          </p>
          {(result === "correct" || answerRevealed) && (
            <p className="mt-1 font-french italic">{exercise.canonicalText}</p>
          )}
          {/* Semantic closure: the learner assembled the French, so confirm
              what they built. Only after a correct answer, and only when a
              genuinely natural translation exists. */}
          {result === "correct" && english && <p className="mt-2 not-italic">{english}</p>}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {!result ? (
          <button type="button" onClick={check} disabled={placed.length === 0} className="ligne-pill flex-1 bg-brand text-cream disabled:opacity-40">
            Check
          </button>
        ) : result === "correct" || answerRevealed ? (
          <button type="button" onClick={() => onDone(result === "correct")} className="ligne-pill flex-1 bg-brand text-cream">
            Continue
          </button>
        ) : (
          <>
            <button type="button" onClick={retry} className="ligne-pill flex-1 border border-cream-dark bg-cream text-ink">
              Try again
            </button>
            <button type="button" onClick={revealAnswer} className="ligne-pill flex-1 bg-brand text-cream">
              Reveal answer
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function ClozeActivity({ exercise, onDone }: { exercise: ClozeExercise; onDone: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<ActivityResult>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);

  function choose(option: string) {
    if (result) return;
    setSelected(option);
  }

  function check() {
    if (!selected) return;
    setResult(selected.trim().toLowerCase() === exercise.answer.trim().toLowerCase() ? "correct" : "incorrect");
  }

  function retry() {
    setSelected(null);
    setResult(null);
    setAnswerRevealed(false);
  }

  const [before, after] = exercise.prompt.split("___");

  // Single-word blanks only — a "phrase" blank needs phrase-lookup, not the
  // word dictionary, and showing a wrong/partial gloss would be worse than
  // showing none.
  //
  // Deliberately not lookupWord(...).translations[0]: that reached past the
  // resolver into raw position one of a bulk import, which is how `oignons`
  // was clued as "arse". exerciseGlossFor applies the stricter standard
  // teaching material needs, and returns null rather than guessing — in which
  // case the hint is simply omitted.
  const answerTranslation =
    exercise.kind === "word"
      ? exerciseGlossFor({ french: exercise.answer, sentence: exercise.prompt.replace("___", exercise.answer) })?.english ?? null
      : null;

  return (
    <section className="rounded-card border border-cream-dark bg-cream-card p-4">
      <p className="ligne-label">{exercise.kind === "word" ? "Word completion" : "Phrase completion"}</p>
      <p className="mt-3 text-lg leading-relaxed text-ink">
        {before}
        <span
          aria-label={selected ? `blank, currently filled with ${selected}` : "blank, not yet filled"}
          className="mx-1 inline-block min-w-[4rem] rounded-lg border-b-2 border-brand px-1 text-center font-semibold text-brand"
        >
          {selected ?? "___"}
        </span>
        {after}
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Answer options">
        {exercise.options.map((option) => {
          const selectedOption = selected === option;
          const revealedCorrect = answerRevealed && option.trim().toLowerCase() === exercise.answer.trim().toLowerCase();
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selectedOption}
              onClick={() => choose(option)}
              disabled={!!result}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold disabled:opacity-90 ${
                revealedCorrect
                  ? "border-brand bg-brand-light text-brand"
                  : selectedOption
                    ? "border-brand bg-brand text-cream"
                    : "border-cream-dark bg-cream text-ink"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {result && (
        <div className={`mt-4 rounded-2xl p-3 text-sm ${result === "correct" ? "bg-brand-light text-brand" : "bg-rose text-rose-ink"}`} role="status">
          <p className="font-bold">
            {result === "correct" ? "Correct." : answerRevealed ? `The answer is "${exercise.answer}".` : "Not quite. Try once more or reveal the answer."}
          </p>
          {result === "correct" && answerTranslation && (
            <p className="mt-0.5">
              "{exercise.answer}" — {answerTranslation}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {!result ? (
          <button type="button" onClick={check} disabled={!selected} className="ligne-pill flex-1 bg-brand text-cream disabled:opacity-40">
            Check
          </button>
        ) : result === "correct" || answerRevealed ? (
          <button type="button" onClick={() => onDone(result === "correct")} className="ligne-pill flex-1 bg-brand text-cream">
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
    </section>
  );
}

function ParaphraseActivity({ exercise, onDone }: { exercise: ParaphraseExercise; onDone: (correct: boolean) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [result, setResult] = useState<ActivityResult>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);

  const selectedOption = exercise.options.find((o) => o.id === selectedId) ?? null;
  const correct = selectedId ? checkParaphraseAnswer(exercise, selectedId) : false;

  function choose(option: ParaphraseOption) {
    if (result) return;
    setSelectedId(option.id);
  }

  function check() {
    if (!selectedId) return;
    setResult(correct ? "correct" : "incorrect");
  }

  function retry() {
    setSelectedId(null);
    setResult(null);
    setAnswerRevealed(false);
  }

  return (
    <section className="rounded-card border border-cream-dark bg-cream-card p-4">
      <p className="ligne-label">Closest meaning</p>
      <p className="mt-1 text-sm font-semibold text-ink">Which option means the same thing as this sentence?</p>
      <p className="mt-3 rounded-2xl bg-cream px-3 py-3 text-base italic leading-relaxed text-ink">{exercise.sourceSentence}</p>

      <div className="mt-4 space-y-2" role="radiogroup" aria-label="Paraphrase options">
        {exercise.options.map((option) => {
          const isSelected = selectedId === option.id;
          const showAsCorrect = (result === "correct" || answerRevealed) && option.isCorrect;
          const showAsWrongPick = result === "incorrect" && isSelected && !option.isCorrect;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => choose(option)}
              disabled={!!result}
              className={`w-full rounded-2xl border px-3 py-2.5 text-left text-sm font-semibold disabled:opacity-90 ${
                showAsCorrect
                  ? "border-brand bg-brand-light text-brand"
                  : showAsWrongPick
                    ? "border-rose bg-rose text-rose-ink"
                    : isSelected
                      ? "border-brand bg-brand text-cream"
                      : "border-cream-dark bg-cream text-ink"
              }`}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      {result && (
        <div className={`mt-4 rounded-2xl p-3 text-sm ${correct ? "bg-brand-light text-brand" : "bg-rose text-rose-ink"}`} role="status">
          <p className="font-bold">
            {correct ? "Correct." : answerRevealed ? "Answer revealed." : "Not quite. Try once more or reveal the answer."}
          </p>
          {!correct && answerRevealed && selectedOption?.feedback && <p className="mt-1">{selectedOption.feedback}</p>}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {!result ? (
          <button type="button" onClick={check} disabled={!selectedId} className="ligne-pill flex-1 bg-brand text-cream disabled:opacity-40">
            Check
          </button>
        ) : correct || answerRevealed ? (
          <button type="button" onClick={() => onDone(correct)} className="ligne-pill flex-1 bg-brand text-cream">
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
    </section>
  );
}

/**
 * "What did this word mean here?" — the inference question, in the place it
 * belongs. In the reader it stood between a reader and the help they had just
 * asked for; here they opted into practising, so working it out from context
 * is the exercise rather than a toll.
 */
function InferenceActivity({
  exercise,
  onDone,
}: {
  exercise: MeaningInferenceExercise;
  onDone: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const { challenge } = exercise;
  const answered = selected !== null;
  const correct = selected === challenge.answerIndex;

  return (
    <section className="rounded-card border border-cream-dark bg-cream-card p-4">
      <p className="ligne-label">Meaning from context</p>
      <p className="mt-3 font-french text-lg leading-relaxed text-ink">{exercise.contextSentence}</p>
      <p className="mt-3 text-sm text-ink-muted">
        What does <span className="font-french font-bold text-ink">{challenge.word}</span> mean here?
      </p>

      <div className="mt-4 grid gap-2" role="radiogroup" aria-label="Possible meanings">
        {challenge.choices.map((choice, choiceIndex) => {
          const isAnswer = choiceIndex === challenge.answerIndex;
          const isSelected = selected === choiceIndex;
          return (
            <button
              key={choice}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={answered}
              onClick={() => {
                setSelected(choiceIndex);
                onDone(choiceIndex === challenge.answerIndex);
              }}
              className={`min-h-12 rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                answered && isAnswer
                  ? "bg-emerald-100 text-emerald-800"
                  : answered && isSelected
                    ? "bg-rose-100 text-rose-800"
                    : "bg-cream text-ink"
              }`}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {challenge.frenchSynonym && (
        <p className="mt-3 text-xs text-ink-muted">
          French synonym: <span className="font-french font-semibold text-ink">{challenge.frenchSynonym}</span>
        </p>
      )}
      {answered && (
        <p className={`mt-3 text-sm font-semibold ${correct ? "text-emerald-700" : "text-rose-700"}`}>
          {correct ? "Inferred correctly." : `It means “${challenge.directDefinition}” here.`}
        </p>
      )}
    </section>
  );
}

function PracticeSummary({ completedKinds, onReturnToMap }: { completedKinds: string[]; onReturnToMap: () => void }) {
  return (
    <section className="mt-6 rounded-card border border-cream-dark bg-cream-card p-5 text-center">
      <p className="ligne-label">Text practised</p>
      <p className="mt-1 text-xl font-semibold text-ink">
        {completedKinds.length} {completedKinds.length === 1 ? "activity" : "activities"} completed
      </p>
      <ul className="mt-4 space-y-1.5 text-left text-sm text-ink-muted">
        {completedKinds.map((kind, i) => (
          <li key={`${kind}-${i}`} className="flex items-center gap-2">
            <CheckIcon className="h-3.5 w-3.5 shrink-0 text-brand" />
            {kind}
          </li>
        ))}
      </ul>
      <button type="button" onClick={onReturnToMap} className="ligne-pill mt-5 w-full bg-brand text-cream">
        Return to map
      </button>
    </section>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return <AppIcon name="close" className={className} />;
}

function CheckIcon({ className }: { className?: string }) {
  return <AppIcon name="check" className={className} />;
}

export function buildFreshPracticePlan(text: ReadingText): PracticePlan {
  return buildPracticePlan(text);
}

// Re-export for convenience so callers don't need two import paths.
export type { PracticeActivity };
