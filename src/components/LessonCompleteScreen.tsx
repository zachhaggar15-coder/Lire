"use client";

import { useEffect, useState } from "react";
import type { Difficulty } from "@/types";
import {
  bandNumber,
  bandProgress,
  getLevelScores,
  TAUGHT_LEVELS,
  type LevelScoreChange,
  type LevelScores,
} from "@/lib/levelScore";

interface LessonCompleteScreenProps {
  level: Difficulty;
  scoreChange: LevelScoreChange;
  stats: { percentRead: number; wordsTapped: number; savedWords: number };
  isLesson: boolean;
  onContinue: () => void;
}

/**
 * Full-screen "lesson complete" moment, shown when a reader finishes a text.
 *
 * The bar for the level they just read at animates from its old fill to the
 * new one, and the level's running score counts up. When the added points push
 * the score into a new 100-point band, the bar fills to the end, then wraps and
 * fills the remainder — so crossing a milestone reads as a milestone rather
 * than the bar jumping backwards. "Continue" returns to the article tab.
 */
export default function LessonCompleteScreen({ level, scoreChange, stats, isLesson, onContinue }: LessonCompleteScreenProps) {
  // Snapshot the other levels' scores once, when the screen mounts.
  const [allScores] = useState<LevelScores>(() => getLevelScores());
  const crosses = bandNumber(scoreChange.after) > bandNumber(scoreChange.before);

  // Bar animation: start at the old fill, then transition to the new one. A
  // second phase handles a band crossing (fill to 100%, wrap, fill remainder).
  const [barPercent, setBarPercent] = useState(() => bandProgress(scoreChange.before) * 100);
  const [wrapped, setWrapped] = useState(false);
  const [displayScore, setDisplayScore] = useState(scoreChange.before);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Let the panel settle for a beat, then drive the bar.
    timers.push(
      setTimeout(() => {
        if (crosses) {
          setBarPercent(100);
          timers.push(
            setTimeout(() => {
              setWrapped(true);
              setBarPercent(0);
              // Force a reflow gap before filling the new band.
              timers.push(setTimeout(() => setBarPercent(bandProgress(scoreChange.after) * 100), 60));
            }, 620)
          );
        } else {
          setBarPercent(bandProgress(scoreChange.after) * 100);
        }
      }, 350)
    );

    // Count the score number up in parallel.
    const from = scoreChange.before;
    const to = scoreChange.after;
    if (to > from) {
      const durationMs = 900;
      const startAt = performance.now() + 350;
      let raf = 0;
      const tick = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - startAt) / durationMs));
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplayScore(Math.round(from + (to - from) * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => {
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
      };
    }
    return () => timers.forEach(clearTimeout);
  }, [crosses, scoreChange.after, scoreChange.before]);

  const currentBand = wrapped ? bandNumber(scoreChange.after) : bandNumber(scoreChange.before);

  const statItems = [
    { label: "read", value: `${Math.min(100, Math.max(0, Math.round(stats.percentRead)))}%` },
    { label: stats.wordsTapped === 1 ? "word tapped" : "words tapped", value: stats.wordsTapped },
    { label: stats.savedWords === 1 ? "word saved" : "words saved", value: stats.savedWords },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-cream px-6 py-10">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="lesson-complete-pop text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-light">
            <svg className="h-11 w-11 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-ink">{isLesson ? "Lesson complete!" : "Reading complete!"}</h1>
          <p className="mt-1 text-sm text-ink-muted">Nice work — here&apos;s how this one went.</p>
        </div>

        {/* Headline stats */}
        <div className="mt-7 grid grid-cols-3 gap-3">
          {statItems.map((item, index) => (
            <div
              key={item.label}
              className="lesson-complete-stat rounded-card bg-cream-card p-3 text-center shadow-card"
              style={{ animationDelay: `${180 + index * 90}ms` }}
            >
              <p className="text-2xl font-extrabold tabular-nums text-ink">{item.value}</p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">{item.label}</p>
            </div>
          ))}
        </div>

        {/* The level bar that just moved */}
        <div className="mt-7 rounded-card bg-cream-card p-5 shadow-card">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-extrabold text-ink">
              {level} score
              {currentBand > 1 && <span className="ml-1.5 text-xs font-semibold text-ink-muted">· tier {currentBand}</span>}
            </p>
            <p className="flex items-center gap-1 text-sm font-extrabold text-brand">
              <span className="tabular-nums">{displayScore}</span>
              {scoreChange.delta > 0 && (
                <span className="lesson-complete-delta rounded-full bg-brand-light px-1.5 py-0.5 text-xs font-bold text-brand">
                  +{scoreChange.delta} ↑
                </span>
              )}
            </p>
          </div>
          <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-cream-dark">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-[700ms] ease-out"
              style={{ width: `${barPercent}%` }}
            />
          </div>
          {scoreChange.delta === 0 && (
            <p className="mt-2 text-xs text-ink-muted">Already completed earlier — no new points this time.</p>
          )}
        </div>

        {/* All four levels, so progress is legible at a glance */}
        <div className="mt-4 rounded-card bg-cream-card p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Your levels</p>
          <div className="mt-3 space-y-2.5">
            {TAUGHT_LEVELS.map((lvl) => {
              const score = allScores[lvl] ?? 0;
              const isCurrent = lvl === level;
              // The current level's live total (post-award) drives its row.
              const shownScore = isCurrent ? scoreChange.after : score;
              return (
                <div key={lvl} className="flex items-center gap-3">
                  <span className={`w-7 shrink-0 text-xs font-extrabold ${isCurrent ? "text-brand" : "text-ink-muted"}`}>{lvl}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream-dark">
                    <div
                      className={`h-full rounded-full ${isCurrent ? "bg-brand" : "bg-ink-muted/50"}`}
                      style={{ width: `${bandProgress(shownScore) * 100}%` }}
                    />
                  </div>
                  <span className={`w-8 shrink-0 text-right text-xs font-bold tabular-nums ${isCurrent ? "text-ink" : "text-ink-muted"}`}>
                    {shownScore}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-7 w-full rounded-full bg-brand px-4 py-3.5 text-base font-bold text-white shadow-raised active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
