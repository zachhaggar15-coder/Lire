"use client";

import { useState } from "react";
import type { ReadingText } from "@/types";
import type { PracticePlan } from "@/lib/practice/session";
import type { LookupRateSummary } from "@/lib/practice/lookupStats";
import { isPracticeCompleted } from "@/lib/practice/practiceProgress";
import PracticeOverlay from "@/components/practice/PracticeOverlay";
import ListeningPractice from "@/components/practice/ListeningPractice";

interface PracticeSectionProps {
  text: ReadingText;
  plan: PracticePlan;
  lookupRate: LookupRateSummary;
}

/**
 * Optional "Practice this text" card shown on the lesson-completion screen.
 * Never blocks moving on to the next reading — it's an extension of the
 * reading just finished, not a second mandatory lesson.
 */
export default function PracticeSection({ text, plan, lookupRate }: PracticeSectionProps) {
  const [mode, setMode] = useState<"closed" | "practice" | "listening">("closed");
  const [completed, setCompleted] = useState(() => isPracticeCompleted(text.id));

  const hasExercises = plan.activities.length > 0;
  const hasListening = plan.listeningAvailable;

  if (!hasExercises && !hasListening && plan.grammarNotes.length === 0) return null;

  return (
    <>
      <div className="lesson-complete-card-enter mt-4 rounded-card border border-cream-dark bg-cream-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="ligne-label">Practice this text</p>
            <p className="mt-1 text-sm text-ink-muted">Revisit the language from this reading. About 2-3 minutes.</p>
          </div>
          {completed && (
            <span className="shrink-0 rounded-full bg-brand-light px-2.5 py-1 text-xs font-bold text-brand">Done</span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {hasExercises && (
            <button
              type="button"
              onClick={() => setMode("practice")}
              className="ligne-pill flex-1 bg-brand py-2.5 text-sm text-cream"
            >
              {completed ? "Practice again" : "Practice the text"}
            </button>
          )}
          {hasListening && (
            <button
              type="button"
              onClick={() => setMode("listening")}
              className="ligne-pill flex-1 border border-cream-dark bg-cream py-2.5 text-sm text-ink"
            >
              Listen without text
            </button>
          )}
        </div>

        {plan.grammarNotes.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-cream-dark pt-3">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-ink-faint">Grammar in this text</p>
            {plan.grammarNotes.map((note) => (
              <details key={note.title} className="rounded-2xl bg-cream p-3">
                <summary className="cursor-pointer text-sm font-semibold text-ink">{note.title}</summary>
                <p className="mt-2 text-xs italic leading-relaxed text-ink-muted">
                  {note.sourceSentence.split(note.highlight).map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && <mark className="rounded bg-brand-light px-0.5 text-ink not-italic">{note.highlight}</mark>}
                    </span>
                  ))}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">{note.explanation}</p>
                {note.compare && <p className="mt-1.5 text-xs font-semibold text-ink-muted">{note.compare}</p>}
              </details>
            ))}
          </div>
        )}

        <div className="mt-4 border-t border-cream-dark pt-3">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-ink-faint">This text</p>
          <p className="mt-1 text-sm font-semibold text-ink">{lookupRate.thisText} lookups per 100 words</p>
          {lookupRate.recentAverage !== null ? (
            <p className="mt-0.5 text-xs text-ink-muted">
              Recent average: {lookupRate.recentAverage} per 100 words (last {lookupRate.sampleSize} readings)
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-ink-muted">Complete a few more readings to see your recent average.</p>
          )}
          <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
            How often you opened word help while reading. It describes support use, not comprehension.
          </p>
        </div>
      </div>

      {mode === "practice" && (
        <PracticeOverlay
          text={text}
          plan={plan}
          onClose={() => {
            setCompleted(isPracticeCompleted(text.id));
            setMode("closed");
          }}
        />
      )}
      {mode === "listening" && <ListeningPractice text={text} onClose={() => setMode("closed")} />}
    </>
  );
}
