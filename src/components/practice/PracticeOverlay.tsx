"use client";

import { useMemo, useState } from "react";
import type { ReadingText } from "@/types";
import type { PracticeActivity, PracticePlan } from "@/lib/practice/session";
import { shuffledChipsFor, buildPracticePlan } from "@/lib/practice/session";
import { checkReconstruction, type ReconstructionChip, type SentenceReconstructionExercise } from "@/lib/practice/sentenceReconstruction";
import type { ClozeExercise } from "@/lib/practice/cloze";
import { markPracticeCompleted } from "@/lib/practice/practiceProgress";

interface PracticeOverlayProps {
  text: ReadingText;
  plan: PracticePlan;
  onClose: () => void;
}

type ActivityResult = "correct" | "incorrect" | null;

/**
 * Full-screen "Practice this text" session: walks through up to three short
 * exercises built from the reading just finished, then a brief summary.
 * Regenerating the plan on mount (rather than reusing a stale one) means a
 * repeat practice session pulls different sentences where possible.
 */
export default function PracticeOverlay({ text, plan: initialPlan, onClose }: PracticeOverlayProps) {
  const [plan] = useState<PracticePlan>(initialPlan);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [completedKinds, setCompletedKinds] = useState<string[]>([]);

  const activity = plan.activities[index];

  function handleActivityDone(kind: string) {
    setCompletedKinds((prev) => [...prev, kind]);
    if (index + 1 < plan.activities.length) {
      setIndex((i) => i + 1);
    } else {
      markPracticeCompleted(text.id);
      setDone(true);
    }
  }

  if (plan.activities.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream px-6">
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cream px-[22px] pb-6 pt-[calc(var(--safe-top)+0.75rem)]">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex items-center justify-between">
          <button type="button" onClick={onClose} aria-label="Close practice" className="rounded-full bg-cream-card p-2 text-ink-muted">
            <CloseIcon className="h-4 w-4" />
          </button>
          {!done && (
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-faint">
              Practising {index + 1} of {plan.activities.length}
            </p>
          )}
        </div>

        {!done && activity && (
          <div className="mt-4">
            {activity.kind === "reconstruction" ? (
              <ReconstructionActivity key={`recon-${index}`} exercise={activity.exercise} onDone={() => handleActivityDone("Sentence reconstructed")} />
            ) : (
              <ClozeActivity
                key={`cloze-${index}-${activity.exercise.kind}`}
                exercise={activity.exercise}
                onDone={() => handleActivityDone(activity.exercise.kind === "word" ? "Word completed" : "Phrase completed")}
              />
            )}
          </div>
        )}

        {done && <PracticeSummary completedKinds={completedKinds} onClose={onClose} />}
      </div>
    </div>
  );
}

function ReconstructionActivity({ exercise, onDone }: { exercise: SentenceReconstructionExercise; onDone: () => void }) {
  const shuffled = useMemo(() => shuffledChipsFor(exercise), [exercise]);
  const [bank, setBank] = useState<ReconstructionChip[]>(shuffled);
  const [placed, setPlaced] = useState<ReconstructionChip[]>([]);
  const [result, setResult] = useState<ActivityResult>(null);

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
  }

  function check() {
    const ok = checkReconstruction(exercise, placed.map((c) => c.id));
    setResult(ok ? "correct" : "incorrect");
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
            className="rounded-full bg-brand px-3 py-1.5 text-sm font-semibold text-cream active:scale-95 disabled:opacity-70"
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
            className="rounded-full border border-cream-dark bg-cream px-3 py-1.5 text-sm font-semibold text-ink active:scale-95 disabled:opacity-40"
          >
            {chip.display}
          </button>
        ))}
      </div>

      {result && (
        <div className={`mt-4 rounded-2xl p-3 text-sm ${result === "correct" ? "bg-brand-light text-brand" : "bg-rose text-rose-ink"}`} role="status">
          <p className="font-bold">{result === "correct" ? "Correct." : "Not quite."}</p>
          <p className="mt-1 italic">{exercise.canonicalText}</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {!result ? (
          <button type="button" onClick={check} disabled={placed.length === 0} className="ligne-pill flex-1 bg-brand text-cream disabled:opacity-40">
            Check
          </button>
        ) : result === "correct" ? (
          <button type="button" onClick={onDone} className="ligne-pill flex-1 bg-brand text-cream">
            Continue
          </button>
        ) : (
          <>
            <button type="button" onClick={retry} className="ligne-pill flex-1 border border-cream-dark bg-cream text-ink">
              Try again
            </button>
            <button type="button" onClick={onDone} className="ligne-pill flex-1 bg-brand text-cream">
              Continue
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function ClozeActivity({ exercise, onDone }: { exercise: ClozeExercise; onDone: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<ActivityResult>(null);

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
  }

  const [before, after] = exercise.prompt.split("___");

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
        {exercise.options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected === option}
            onClick={() => choose(option)}
            disabled={!!result}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold active:scale-95 disabled:opacity-60 ${
              selected === option ? "border-brand bg-brand text-cream" : "border-cream-dark bg-cream text-ink"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {result && (
        <div className={`mt-4 rounded-2xl p-3 text-sm ${result === "correct" ? "bg-brand-light text-brand" : "bg-rose text-rose-ink"}`} role="status">
          <p className="font-bold">{result === "correct" ? "Correct." : `Not quite — the answer is "${exercise.answer}".`}</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {!result ? (
          <button type="button" onClick={check} disabled={!selected} className="ligne-pill flex-1 bg-brand text-cream disabled:opacity-40">
            Check
          </button>
        ) : result === "correct" ? (
          <button type="button" onClick={onDone} className="ligne-pill flex-1 bg-brand text-cream">
            Continue
          </button>
        ) : (
          <>
            <button type="button" onClick={retry} className="ligne-pill flex-1 border border-cream-dark bg-cream text-ink">
              Try again
            </button>
            <button type="button" onClick={onDone} className="ligne-pill flex-1 bg-brand text-cream">
              Continue
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function PracticeSummary({ completedKinds, onClose }: { completedKinds: string[]; onClose: () => void }) {
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
      <button type="button" onClick={onClose} className="ligne-pill mt-5 w-full bg-brand text-cream">
        Return to lesson summary
      </button>
    </section>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function buildFreshPracticePlan(text: ReadingText): PracticePlan {
  return buildPracticePlan(text);
}

// Re-export for convenience so callers don't need two import paths.
export type { PracticeActivity };
