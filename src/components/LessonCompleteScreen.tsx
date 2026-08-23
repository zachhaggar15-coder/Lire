"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Difficulty } from "@/types";
import {
  type LireLevelChange,
} from "@/lib/progression/lireLevel";
import type { StreakDay } from "@/lib/habit";
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
import { useModalFocus } from "@/lib/useModalFocus";
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
  levelProgress: LireLevelChange;
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
  levelProgress,
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
  // This is the app's most-seen full-screen overlay — it needs the same
  // focus trap / background-inert / Escape-to-leave treatment every
  // BottomSheet already gets, not just the nav-hiding half of it. Escape
  // routes to the same quiet exit as the map action, not the primary CTA,
  // since that's the non-committal way out of a modal.
  const modalRef = useModalFocus<HTMLDivElement>(true, onReturnToMap);
  useEffect(() => {
    triggerHaptic("success");
  }, []);
  // Bar animation: start at the fill before this lesson, then transition to
  // the new one. A second phase handles a level-up (fill to 100%, wrap, fill
  // the remainder of the next level).
  const levelledUp = levelProgress.levelledUp;
  const [barPercent, setBarPercent] = useState(() => levelProgress.before.progress * 100);
  const [wrapped, setWrapped] = useState(false);
  const [displayXp, setDisplayXp] = useState(levelProgress.before.totalXp);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(
      setTimeout(() => {
        if (levelledUp) {
          setBarPercent(100);
          timers.push(
            setTimeout(() => {
              setWrapped(true);
              setBarPercent(0);
              timers.push(setTimeout(() => setBarPercent(levelProgress.after.progress * 100), 60));
            }, 620)
          );
        } else {
          setBarPercent(levelProgress.after.progress * 100);
        }
      }, 350)
    );

    const from = levelProgress.before.totalXp;
    const to = levelProgress.after.totalXp;
    if (to > from) {
      const durationMs = 900;
      const startAt = performance.now() + 350;
      let raf = 0;
      const tick = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - startAt) / durationMs));
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplayXp(Math.round(from + (to - from) * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => {
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
      };
    }
    return () => timers.forEach(clearTimeout);
  }, [levelledUp, levelProgress.after.progress, levelProgress.after.totalXp, levelProgress.before.progress, levelProgress.before.totalXp]);

  const shownLevel = wrapped || !levelledUp ? levelProgress.after : levelProgress.before;

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
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={isLesson ? "Lesson complete" : "Reading complete"}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex min-h-0 flex-col bg-cream"
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-4 pt-[calc(var(--safe-top)+0.75rem)]">
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

        {/* Sorlio Level — accumulated activity, not a proficiency claim. */}
        <div className="lesson-complete-card-enter mt-4 rounded-card border border-cream-dark bg-cream-card p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-extrabold text-ink">
              Sorlio Level {shownLevel.level}
              {levelledUp && wrapped && (
                <span className="ml-1.5 rounded-full bg-brand-light px-1.5 py-0.5 text-xs font-bold text-brand">
                  Level up
                </span>
              )}
            </p>
            <p className="flex items-center gap-1 text-sm font-extrabold text-brand">
              <span className="tabular-nums">{displayXp.toLocaleString()} XP</span>
              {levelProgress.xpAwarded > 0 && (
                <span className="lesson-complete-delta rounded-full bg-brand-light px-1.5 py-0.5 text-xs font-bold text-brand">
                  +{levelProgress.xpAwarded} this lesson
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
          <p className="mt-1 text-right text-[10px] font-semibold text-ink-faint">
            {shownLevel.xpIntoLevel.toLocaleString()} / {shownLevel.xpForNextLevel.toLocaleString()} XP to Level{" "}
            {shownLevel.level + 1}
          </p>
          {levelProgress.xpAwarded === 0 && (
            <p className="mt-2 text-xs text-ink-muted">Already completed earlier — no new XP this time.</p>
          )}

          {/* Reading difficulty is shown separately and deliberately not as a
              progression bar: CEFR describes how hard the French was, and says
              nothing about how far along the reader is. */}
          <div className="mt-4 flex items-center justify-between border-t border-cream-fill pt-3">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">
              Reading difficulty
            </p>
            <p className="text-sm font-extrabold text-ink">{level}</p>
          </div>

          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-semibold text-ink-muted underline decoration-dotted underline-offset-2">
              What counts toward this?
            </summary>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
              Sorlio Level tracks how much reading and practice you complete — finishing texts, comprehension checks,
              practice and review all add XP. It measures activity, not how difficult the French you can read.
              Re-reading something you already finished doesn&apos;t add more.
            </p>
          </details>
        </div>

        {practiceText && practicePlan && lookupRate && (
          <PracticeSection text={practiceText} plan={practicePlan} lookupRate={lookupRate} />
        )}

        </div>
      </div>
      <div
        className="relative z-[60] mx-auto w-full max-w-md shrink-0 border-t border-cream-dark bg-cream-card/95 px-[22px] pt-3 shadow-[0_-8px_24px_rgba(27,25,21,0.08)] backdrop-blur"
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
        {/* A non-lesson completion (no distinct next text queued) falls back
            to the same map/home label for both actions — showing it twice
            is redundant, not a real second choice. */}
        {mapActionLabel !== primaryActionLabel && (
          <button
            type="button"
            onClick={onReturnToMap}
            className="ligne-pill mt-1 min-h-11 w-full bg-transparent text-ink-muted"
          >
            {mapActionLabel}
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
