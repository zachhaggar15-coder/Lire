"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Difficulty } from "@/types";
import {
  bandNumber,
  bandProgress,
  getLevelScores,
  TAUGHT_LEVELS,
  type LevelScoreChange,
  type LevelScores,
} from "@/lib/levelScore";
import type { StreakDay } from "@/lib/habit";
import { toPercent } from "@/lib/format";
import { StreakWeekStrip } from "@/components/GamificationCards";
import type { ReadingText } from "@/types";
import type { PracticePlan } from "@/lib/practice/session";
import type { LookupRateSummary } from "@/lib/practice/lookupStats";
import PracticeSection from "@/components/practice/PracticeSection";
import ReadingDiagnosticsCard from "@/components/diagnostics/ReadingDiagnosticsCard";
import type { ReadingPerformanceMetrics } from "@/lib/practice/readingPerformance";
import type { BaselineComparison, TrendLabel } from "@/lib/practice/baselineComparison";
import type { DiagnosticMessage } from "@/lib/practice/diagnosticMessaging";
import { useModalPresence } from "@/lib/modalPresence";
import { triggerHaptic } from "@/lib/haptics";

export interface LessonMiniReviewItem {
  kind: "word" | "phrase";
  french: string;
  english: string;
  context: string | null;
  /** Whether this item is currently in the learner's saved review deck. */
  saved: boolean;
}

export interface JourneyMoment {
  kind: "stage" | "band";
  title: string;
  detail: string;
  actionLabel?: string;
}

interface LessonCompleteScreenProps {
  level: Difficulty;
  scoreChange: LevelScoreChange;
  stats: { percentRead: number; wordsTapped: number; savedWords: number };
  reviewItems: LessonMiniReviewItem[];
  /** Toggles an item's saved status from the mini review card. Optional so older call sites / tests aren't forced to wire it. */
  onToggleSave?: (item: LessonMiniReviewItem) => void;
  streak: { count: number; extended: boolean; week: StreakDay[] };
  journeyMoment?: JourneyMoment | null;
  isLesson: boolean;
  /** Label for the main next-step button — destination-specific, e.g. "Read the next text". */
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  /** Quiet secondary action that always returns to the relevant map/overview. */
  mapActionLabel: string;
  onReturnToMap: () => void;
  /** Optional so older call sites / tests aren't forced to wire the practice feature. */
  practiceText?: ReadingText | null;
  practicePlan?: PracticePlan | null;
  lookupRate?: LookupRateSummary | null;
  /** Null when there's no session record yet to derive diagnostics from (shouldn't normally happen — see Reader.tsx's handleMarkCompleted). */
  diagnostics?: {
    performance: ReadingPerformanceMetrics;
    baseline: BaselineComparison;
    message: DiagnosticMessage;
    trend: TrendLabel;
  } | null;
  levelLabel?: string;
}

/**
 * Full-screen "lesson complete" moment, shown when a reader finishes a text.
 *
 * The bar for the level they just read at animates from its old fill to the
 * new one, and the level's running reading-progress count ticks up. When the
 * added points push it into a new 100-point tier, the bar fills to the end,
 * then wraps and fills the remainder — so crossing a milestone reads as a
 * milestone rather than the bar jumping backwards.
 *
 * Two actions at the bottom: a primary, destination-specific next step
 * (read the next text in this section, or the map if nothing is queued up),
 * and a quieter secondary action that always returns to the relevant map.
 */
export default function LessonCompleteScreen({
  level,
  scoreChange,
  stats,
  reviewItems,
  onToggleSave,
  streak,
  journeyMoment,
  isLesson,
  primaryActionLabel,
  onPrimaryAction,
  mapActionLabel,
  onReturnToMap,
  practiceText,
  practicePlan,
  lookupRate,
  diagnostics,
  levelLabel,
}: LessonCompleteScreenProps) {
  useModalPresence(true);
  useEffect(() => {
    triggerHaptic("success");
  }, []);
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

  const percentRead = Math.min(100, Math.max(0, Math.round(stats.percentRead)));
  const statItems = [
    { label: "read", value: `${percentRead}%` },
    { label: stats.wordsTapped === 1 ? "word tapped" : "words tapped", value: stats.wordsTapped },
    { label: stats.savedWords === 1 ? "word saved" : "words saved", value: stats.savedWords },
  ];

  // A truthful, one-line summary of what actually happened — grounded only in
  // data the app really tracks (percent scrolled/read, words saved), never a
  // claim about comprehension or accuracy we haven't measured.
  const achievementLine = (() => {
    if (percentRead >= 100 && stats.savedWords > 0) {
      return `You read the whole text and saved ${stats.savedWords} ${stats.savedWords === 1 ? "word" : "words"}.`;
    }
    if (percentRead >= 100) return "You read the whole text.";
    return `You read ${percentRead}% of the text.`;
  })();

  return createPortal(
    <div className="lesson-complete-screen fixed inset-0 z-50 overflow-y-auto bg-cream px-[22px] pb-[calc(var(--safe-bottom)+9.5rem)] pt-[calc(var(--safe-top)+0.75rem)]">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <div className="lesson-complete-pop">
          <p className="ligne-label">{isLesson ? "Lesson complete" : "Reading complete"}</p>
          <h1 className="mt-1 text-[30px] font-semibold leading-tight text-ink">
            {journeyMoment?.title ?? (isLesson ? "Lesson complete!" : "Reading complete!")}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{journeyMoment?.detail ?? achievementLine}</p>
        </div>

        {journeyMoment && (
          <div className="lesson-complete-card-enter mt-4 rounded-card bg-brand px-4 py-3 text-cream">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-cream/75">
              {journeyMoment.kind === "band" ? "Band complete" : "Stage cleared"}
            </p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-cream/90">{journeyMoment.detail}</p>
          </div>
        )}

        {diagnostics && (
          <ReadingDiagnosticsCard
            className="lesson-complete-card-enter mt-4"
            performance={diagnostics.performance}
            baseline={diagnostics.baseline}
            message={diagnostics.message}
            trend={diagnostics.trend}
            levelLabel={levelLabel}
          />
        )}

        {/* Headline stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {statItems.map((item, index) => (
            <div
              key={item.label}
              className="lesson-complete-stat rounded-card border border-cream-dark bg-cream-card p-3 text-center"
              style={{ animationDelay: `${180 + index * 90}ms` }}
            >
              <p className="font-numeral text-3xl leading-none tabular-nums text-ink">{item.value}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Streak — the Duolingo moment: extending it is a small celebration. */}
        <div className="lesson-complete-card-enter mt-4 rounded-card border border-cream-dark bg-cream-card p-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2">
                <span className="font-numeral text-3xl leading-none text-ink tabular-nums">{streak.count}</span>
                <span className="text-sm font-bold text-ink-muted">day streak</span>
                {streak.extended && (
                  <span className="lesson-complete-delta rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand">
                    {streak.count === 1 ? "Streak started!" : "+1 day"}
                  </span>
                )}
              </p>
              {streak.extended && <p className="mt-0.5 text-xs text-ink-muted">You kept the fire going today.</p>}
            </div>
          </div>
          <StreakWeekStrip week={streak.week} className="mt-4" />
        </div>

        {reviewItems.length > 0 && (
          <div className="lesson-complete-card-enter mt-4 rounded-card bg-cream-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Mini review</p>
                <h2 className="mt-0.5 text-base font-extrabold text-ink">Bring these forward</h2>
              </div>
              <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-bold text-brand">
                {reviewItems.length}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {reviewItems.map((item) => (
                <div key={`${item.kind}-${item.french}`} className="rounded-2xl bg-cream px-3 py-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-ink">{item.french}</p>
                      <p className="mt-0.5 text-xs font-semibold text-ink-muted">{item.english}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleSave?.(item)}
                      disabled={!onToggleSave}
                      aria-pressed={item.saved}
                      aria-label={item.saved ? `Remove ${item.french} from review` : `Save ${item.french} for review`}
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        item.saved ? "bg-brand text-white" : "bg-cream-card text-ink-muted"
                      }`}
                    >
                      {item.saved ? "Remove" : "Add to review"}
                    </button>
                  </div>
                  {item.context && <p className="mt-1 line-clamp-2 text-xs italic leading-relaxed text-ink-muted">{item.context}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* The level bar that just moved */}
        <div className="lesson-complete-card-enter mt-4 rounded-card border border-cream-dark bg-cream-card p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-extrabold text-ink">
              {level} reading progress
              {currentBand > 1 && <span className="ml-1.5 text-xs font-semibold text-ink-muted">· tier {currentBand}</span>}
            </p>
            <p className="flex items-center gap-1 text-sm font-extrabold text-brand">
              <span className="tabular-nums">
                {scoreChange.before} → {displayScore}
              </span>
              {scoreChange.delta > 0 && (
                <span className="lesson-complete-delta rounded-full bg-brand-light px-1.5 py-0.5 text-xs font-bold text-brand">
                  +{scoreChange.delta} this lesson
                </span>
              )}
            </p>
          </div>
          <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-cream-strong">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-[700ms] ease-out"
              style={{ width: `${barPercent}%` }}
            />
          </div>
          <p className="mt-1 text-right text-[10px] font-semibold text-ink-faint">{toPercent(bandProgress(wrapped ? scoreChange.after : scoreChange.before))}/100 to next tier</p>
          {scoreChange.delta === 0 && (
            <p className="mt-2 text-xs text-ink-muted">Already completed earlier — no new points this time.</p>
          )}
          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-semibold text-ink-muted underline decoration-dotted underline-offset-2">
              What counts toward this?
            </summary>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
              Reading progress tracks how much you complete at this level, not accuracy or fluency. Finishing a new
              text adds points; saving words and tapping a word for help add a little more; a perfect comprehension
              check adds a bit extra. Re-reading something you already finished doesn&apos;t add more.
            </p>
          </details>
        </div>

        {/* All four levels, so progress is legible at a glance */}
        <div className="lesson-complete-card-enter mt-4 rounded-card border border-cream-dark bg-cream-card p-4">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">Your levels</p>
          <div className="mt-3 space-y-2.5">
            {TAUGHT_LEVELS.map((lvl) => {
              const score = allScores[lvl] ?? 0;
              const isCurrent = lvl === level;
              // The current level's live total (post-award) drives its row.
              const shownScore = isCurrent ? scoreChange.after : score;
              return (
                <div key={lvl} className="flex items-center gap-3">
                  <span className={`w-7 shrink-0 text-xs font-extrabold ${isCurrent ? "text-brand" : "text-ink-muted"}`}>{lvl}</span>
                  <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-cream-strong">
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

        {practiceText && practicePlan && lookupRate && (
          <PracticeSection text={practiceText} plan={practicePlan} lookupRate={lookupRate} />
        )}

      </div>
      <div
        className="fixed inset-x-0 bottom-0 z-[60] mx-auto w-full max-w-md border-t border-cream-dark bg-cream-card/95 px-[22px] pt-3 shadow-[0_-8px_24px_rgba(27,25,21,0.08)] backdrop-blur"
        style={{ paddingBottom: "calc(0.75rem + var(--safe-bottom))" }}
        role="group"
        aria-label="Completion actions"
      >
        <button
          type="button"
          onClick={onPrimaryAction}
          className="ligne-pill min-h-12 w-full bg-brand text-cream"
        >
          {primaryActionLabel}
        </button>
        <button
          type="button"
          onClick={onReturnToMap}
          className="ligne-pill mt-1 min-h-11 w-full bg-transparent text-ink-muted"
        >
          {mapActionLabel}
        </button>
      </div>
    </div>,
    document.body,
  );
}
