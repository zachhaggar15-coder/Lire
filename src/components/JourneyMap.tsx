"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import type { Category, Difficulty, ReadingText } from "@/types";
import { getProgress } from "@/lib/progress";
import { formatCategory } from "@/lib/format";
import { getSelectedReadingLevel, updateSelectedReadingLevel } from "@/lib/onboarding";
import { useGeneratedDictionary } from "@/lib/dictionary/useGeneratedDictionary";
import { getCurrentStreak, isActiveToday } from "@/lib/habit";
import { getGoals, getGoalsProgress } from "@/lib/goals";
import { getJourneyText, JOURNEY_BANDS, type Stage } from "@/lib/journey/ladder";
import {
  getJourneyState,
  getJourneyStore,
  getNextTextForReader,
  skipJourneyText,
  skipJourneyTexts,
  type NextTextRecommendation,
  type StageProgress,
} from "@/lib/journey/state";

interface JourneyMapProps {
  selectedLevel?: Difficulty;
  onLevelChange?: (level: Difficulty) => void;
}

interface BandTone {
  soft: string;
  text: string;
  dot: string;
}

const BAND_TONES: Record<Difficulty, BandTone> = {
  A1: { soft: "bg-accent-mint", text: "text-accent-minttext", dot: "bg-accent-minttext" },
  A2: { soft: "bg-accent-sky", text: "text-accent-skytext", dot: "bg-accent-skytext" },
  B1: { soft: "bg-accent-gold", text: "text-accent-goldtext", dot: "bg-accent-goldtext" },
  B2: { soft: "bg-accent-violet", text: "text-accent-violettext", dot: "bg-accent-violettext" },
  C1: { soft: "bg-accent-pink", text: "text-accent-pinktext", dot: "bg-accent-pinktext" },
  C2: { soft: "bg-cream-sunken", text: "text-brand", dot: "bg-brand" },
};

export default function JourneyMap({ selectedLevel: selectedLevelProp, onLevelChange }: JourneyMapProps = {}) {
  const [, setVersion] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [localLevel, setLocalLevel] = useState<Difficulty>("A2");
  const [openStageIndex, setOpenStageIndex] = useState<number | null>(null);
  const currentRef = useRef<HTMLLIElement | null>(null);

  useGeneratedDictionary();

  const selectedLevel = selectedLevelProp ?? localLevel;
  const visibleBand: Difficulty = JOURNEY_BANDS.includes(selectedLevel) ? selectedLevel : "B2";
  const fallbackOptions = {
    selectedLevel: visibleBand,
    progressById: {},
    skippedTextIds: [],
    knownWords: new Set<string>(),
    feedbackByTextId: {},
  };

  const journey = mounted ? getJourneyState({ selectedLevel: visibleBand }) : getJourneyState(fallbackOptions);
  const next = mounted ? getNextTextForReader({ selectedLevel: visibleBand }) : getNextTextForReader(fallbackOptions);
  const skipped = mounted ? new Set(getJourneyStore().skippedTextIds) : new Set<string>();
  const nextText = next ? getJourneyText(next.textId) : null;
  const nextVisible = nextText?.difficulty === visibleBand ? next : null;
  const visibleStages = journey.stages.filter((stageProgress) => stageProgress.stage.band === visibleBand);
  const hasVisibleStages = visibleStages.length > 0;
  const visibleCleared = visibleStages.filter((stageProgress) => stageProgress.status === "cleared").length;
  const visibleCompletedTargets = visibleStages.reduce((sum, stageProgress) => sum + Math.min(stageProgress.completedCount, stageProgress.targetCount), 0);
  const visibleTotalTargets = visibleStages.reduce((sum, stageProgress) => sum + stageProgress.targetCount, 0);
  const visibleProgress = !hasVisibleStages ? 0 : visibleTotalTargets === 0 ? 1 : visibleCompletedTargets / visibleTotalTargets;
  const currentStageIsVisible = visibleStages.some((stageProgress) => stageProgress.stage.globalIndex === journey.currentStageIndex);
  const expandedStageIndex =
    openStageIndex !== null && visibleStages.some((stageProgress) => stageProgress.stage.globalIndex === openStageIndex)
      ? openStageIndex
      : null;
  const streak = mounted ? getCurrentStreak() : 0;
  const todayActive = mounted ? isActiveToday() : false;
  const goals = mounted ? getGoals() : null;
  const goalProgress = mounted ? getGoalsProgress() : null;
  const dailyTextGoal = goals?.articlesPerDay ?? 1;
  const textsToday = goalProgress?.articlesToday ?? 0;
  const bandTone = BAND_TONES[visibleBand];

  useEffect(() => {
    setMounted(true);
    setLocalLevel(getSelectedReadingLevel());
  }, []);

  useEffect(() => {
    setOpenStageIndex(null);
  }, [visibleBand]);

  useEffect(() => {
    if (!mounted || !currentStageIsVisible) return;
    const timer = window.setTimeout(() => {
      currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [currentStageIsVisible, journey.currentStageIndex, mounted, visibleBand]);

  function refresh() {
    setVersion((value) => value + 1);
  }

  function handleLevelChange(level: Difficulty) {
    setLocalLevel(level);
    setOpenStageIndex(null);
    if (onLevelChange) onLevelChange(level);
    else updateSelectedReadingLevel(level);
    refresh();
  }

  function handleToggleStage(stageIndex: number) {
    setOpenStageIndex((current) => (current === stageIndex ? null : stageIndex));
  }

  function handleSkip(textId: string) {
    skipJourneyText(textId);
    refresh();
  }

  function handleJump(stage: Stage) {
    const remaining = stage.textIds.filter((id) => getProgress(id).status !== "completed");
    skipJourneyTexts(remaining);
    const nextStageIndex = stage.globalIndex + 1;
    setOpenStageIndex(visibleStages.some((stageProgress) => stageProgress.stage.globalIndex === nextStageIndex) ? nextStageIndex : null);
    refresh();
  }

  return (
    <section className="bg-cream px-[22px] pb-4 pt-7 text-ink">
      <header>
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">Today</p>
          <div className="flex items-center gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-brand">{streak} day streak</p>
            <span className="flex gap-1" aria-hidden="true">
              <span className={`h-1.5 w-1.5 rounded-full ${todayActive ? "bg-brand" : "bg-cream-strong"}`} />
              <span className="h-1.5 w-1.5 rounded-full bg-cream-strong" />
            </span>
          </div>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">Ligne {visibleBand} · Part one</p>
            <h2 className="mt-1 text-[30px] font-semibold leading-none text-ink">{routeTitle(visibleStages.length)}</h2>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-numeral text-[32px] leading-none text-ink">
              {visibleCleared}
              <span className="text-ink-faint">/{visibleStages.length || 0}</span>
            </p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">Stops clear</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="ligne-progress-track" aria-hidden="true">
            <div className="ligne-progress-fill" style={{ width: `${Math.round(visibleProgress * 100)}%` }} />
          </div>
          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">
            Goal today · {Math.min(textsToday, dailyTextGoal)} of {dailyTextGoal} texts
          </p>
        </div>

        <LevelSwitcher selectedLevel={visibleBand} onChange={handleLevelChange} />
      </header>

      {hasVisibleStages ? (
        <ol className="relative mt-7 pb-4" aria-label={`${visibleBand} lesson route`}>
          <span className="absolute bottom-12 left-[18px] top-5 w-0.5 bg-cream-strong" aria-hidden="true" />
          <span
            className="absolute left-[18px] top-5 w-0.5 bg-brand transition-[height] duration-500 ease-out"
            style={{ height: `calc((100% - 4.25rem) * ${visibleProgress})` }}
            aria-hidden="true"
          />
          {visibleStages.map((stageProgress, index) => (
            <StageRouteStop
              key={stageProgress.stage.globalIndex}
              stageProgress={stageProgress}
              next={nextVisible}
              skipped={skipped}
              expanded={expandedStageIndex === stageProgress.stage.globalIndex}
              currentRef={stageProgress.status === "current" ? currentRef : undefined}
              isLast={index === visibleStages.length - 1}
              bandTone={bandTone}
              enterDelayMs={Math.min(index, 9) * 32}
              onToggleStage={handleToggleStage}
              onSkip={handleSkip}
              onJump={handleJump}
            />
          ))}
          <li className="relative flex gap-6 pl-[34px] pt-1">
            <span aria-hidden="true" className="absolute left-[14px] top-2 h-2.5 w-2.5 rounded-full bg-cream-strong ring-[5px] ring-cream" />
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">End of part one · {visibleBand}</p>
          </li>
        </ol>
      ) : (
        <div className="ligne-card mt-7 px-5 py-6 text-center">
          <p className="text-[17px] font-semibold text-ink">{visibleBand} route coming soon</p>
          <p className="mt-2 text-sm text-ink-muted">The same ten-stop map will appear here when articles are added.</p>
        </div>
      )}
    </section>
  );
}

function LevelSwitcher({
  selectedLevel,
  onChange,
}: {
  selectedLevel: Difficulty;
  onChange: (level: Difficulty) => void;
}) {
  return (
    <div className="mt-5" role="group" aria-label="Choose lesson level">
      <div className="grid grid-cols-3 gap-1.5 rounded-full bg-cream-fill p-1 sm:grid-cols-6">
        {JOURNEY_BANDS.map((level) => (
          <button
            key={level}
            type="button"
            aria-label={`Show ${level} lessons`}
            aria-pressed={selectedLevel === level}
            onClick={() => onChange(level)}
            className={`min-h-11 rounded-full px-3 py-2 text-center text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
              selectedLevel === level ? "bg-brand text-cream" : "text-ink-muted"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}

function StageRouteStop({
  stageProgress,
  next,
  skipped,
  expanded,
  currentRef,
  isLast,
  bandTone,
  enterDelayMs,
  onToggleStage,
  onSkip,
  onJump,
}: {
  stageProgress: StageProgress;
  next: NextTextRecommendation | null;
  skipped: Set<string>;
  expanded: boolean;
  currentRef?: RefObject<HTMLLIElement | null>;
  isLast: boolean;
  bandTone: BandTone;
  enterDelayMs: number;
  onToggleStage: (stageIndex: number) => void;
  onSkip: (textId: string) => void;
  onJump: (stage: Stage) => void;
}) {
  const { stage } = stageProgress;
  const current = stageProgress.status === "current";
  const locked = stageProgress.status === "locked";
  const cleared = stageProgress.status === "cleared";
  const stageNext = current && next?.stageIndex === stage.globalIndex ? next : null;
  const canJump = !!stageNext?.canJumpAhead && stageProgress.completedCount > 0;
  const panelId = `journey-stage-${stage.globalIndex}`;
  const stageCountLabel = `${Math.min(stageProgress.completedCount, stageProgress.targetCount)}/${stageProgress.targetCount || stage.textIds.length}`;
  const subtitle = stageSubtitle(stage);

  return (
    <li
      id={current ? "journey-current" : undefined}
      ref={currentRef}
      className={`journey-map-node-enter relative pl-[34px] ${isLast ? "pb-7" : "pb-4"}`}
      style={{ animationDelay: `${enterDelayMs}ms` }}
    >
      <StageRailNode cleared={cleared} current={current} locked={locked} expanded={expanded} />

      <button
        type="button"
        aria-controls={panelId}
        aria-expanded={expanded}
        aria-label={locked ? `${stage.label} is locked` : expanded ? `Close ${stage.label}` : `Open ${stage.label}`}
        disabled={locked}
        onClick={() => onToggleStage(stage.globalIndex)}
        className={`w-full text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 disabled:cursor-default ${
          current
            ? "rounded-card bg-yellow px-5 py-4 text-yellow-ink"
            : cleared
              ? "rounded-card bg-cream px-1 py-4"
              : locked
                ? "rounded-card bg-cream px-1 py-4 opacity-60"
                : "rounded-card bg-cream px-1 py-4"
        }`}
      >
        {current ? (
          <span className="block">
            <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-yellow-muted">
              Recommended next · {stage.band} · {String(stage.indexInBand + 1).padStart(2, "0")}
            </span>
            <span className="mt-2 block font-french text-[22px] leading-tight text-ink">{stage.label}</span>
            <span className="mt-1 block text-xs font-semibold text-yellow-muted">{subtitle}</span>
            <span className="mt-4 flex items-center justify-between gap-3">
              <FourTicks completed={stageProgress.completedCount} target={stageProgress.targetCount} current />
              <span className="font-mono text-[10px] font-bold tracking-[0.08em] text-yellow-ink">{stageCountLabel}</span>
            </span>
          </span>
        ) : (
          <span className="flex items-start gap-3">
            <span className="min-w-0 flex-1">
              <span className={`block font-french text-[20px] leading-tight ${cleared ? "text-[#5D7A6C]" : "text-ink"}`}>{stage.label}</span>
              <span className={`mt-1 block text-[13px] ${cleared ? "text-ink-faint" : "text-ink-muted"}`}>{subtitle}</span>
            </span>
            <span className="shrink-0 pt-1">
              {cleared ? (
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-brand">Finished</span>
              ) : (
                <FourTicks completed={stageProgress.completedCount} target={stageProgress.targetCount} />
              )}
            </span>
          </span>
        )}
      </button>

      <div
        id={panelId}
        aria-hidden={!expanded || locked}
        className={`relative z-10 overflow-hidden transition-[max-height,opacity,margin-top] duration-[380ms] ease-[cubic-bezier(.4,0,.2,1)] ${
          expanded && !locked ? "mt-2 max-h-[1200px] opacity-100" : "mt-0 max-h-0 opacity-0"
        }`}
      >
        <div className="rounded-card border border-cream-dark bg-cream-card px-4 py-2">
          {stage.themes.map((theme) => (
            <div key={theme.id} className="py-2">
              {stage.themes.length > 1 && (
                <p className="pb-2 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">{theme.title}</p>
              )}
              <div>
                {theme.textIds.map((textId) => (
                  <LessonPreviewRow
                    key={textId}
                    textId={textId}
                    next={stageNext?.textId === textId ? stageNext : null}
                    skipped={skipped.has(textId)}
                    allowSkip={current}
                    onSkip={onSkip}
                    bandTone={bandTone}
                  />
                ))}
              </div>
            </div>
          ))}
          {current && canJump && (
            <button
              type="button"
              onClick={() => onJump(stage)}
              className="ligne-pill mt-2 w-full border border-cream-dark bg-cream-sunken text-brand transition-colors duration-200 active:bg-brand active:text-cream"
            >
              Jump ahead
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function LessonPreviewRow({
  textId,
  next,
  skipped,
  allowSkip,
  onSkip,
  bandTone,
}: {
  textId: string;
  next: NextTextRecommendation | null;
  skipped: boolean;
  allowSkip: boolean;
  onSkip: (textId: string) => void;
  bandTone: BandTone;
}) {
  const text = getJourneyText(textId);
  if (!text) return null;

  const progress = getProgress(textId).status;
  const completed = progress === "completed";
  const reviewableSkipped = skipped && !completed;
  const actionLabel = completed || reviewableSkipped ? "Review" : progress === "in-progress" ? "Continue" : next ? "Read" : "Open";
  const meta = lessonMeta(text, next, completed, reviewableSkipped);

  return (
    <div className="border-t border-cream-dark py-3 first:border-t-0">
      <div className="flex items-start gap-3">
        <LessonStatusDot completed={completed} next={!!next} skipped={reviewableSkipped} bandTone={bandTone} />
        <div className="min-w-0 flex-1">
          <p className="font-french text-[16px] leading-snug text-ink">{text.title}</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-ink-faint">{meta}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 pl-6">
        <Link
          href={`/reader/${encodeURIComponent(text.id)}`}
          className={`ligne-pill min-h-9 ${
            next ? "bg-brand text-cream" : completed || reviewableSkipped ? "border border-cream-dark bg-cream-card text-brand" : "border border-cream-dark bg-cream-sunken text-brand"
          }`}
        >
          {actionLabel}
        </Link>
        {allowSkip && !next && !completed && !skipped && (
          <button
            type="button"
            onClick={() => onSkip(text.id)}
            className="ligne-pill min-h-9 border border-cream-dark bg-cream-card text-ink-muted"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}

function StageRailNode({
  cleared,
  current,
  locked,
  expanded,
}: {
  cleared: boolean;
  current: boolean;
  locked: boolean;
  expanded: boolean;
}) {
  if (cleared) {
    return (
      <span aria-hidden="true" className="absolute left-[9px] top-5 z-10 flex h-[17px] w-[17px] items-center justify-center rounded-full bg-brand text-cream ring-[5px] ring-cream">
        <CheckIcon className="h-2.5 w-2.5" />
      </span>
    );
  }

  if (current) {
    return (
      <span
        aria-hidden="true"
        className={`absolute left-[10px] z-10 h-[15px] w-[15px] rounded-full bg-cream ring-[5px] ring-cream transition-[top] duration-[380ms] ${
          expanded ? "top-6 border-[4px] border-brand" : "top-5 border-[4px] border-brand"
        }`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`absolute left-[14px] top-6 z-10 h-[9px] w-[9px] rounded-full ring-[5px] ring-cream ${
        locked ? "bg-cream-strong" : "bg-[#D9D1BC]"
      }`}
    />
  );
}

function FourTicks({
  completed,
  target,
  current = false,
}: {
  completed: number;
  target: number;
  current?: boolean;
}) {
  const ratio = target <= 0 ? 1 : completed / target;
  const filled = completed > 0 ? Math.max(1, Math.min(4, Math.floor(ratio * 4))) : 0;

  return (
    <span className="flex items-center gap-2" aria-label={`${completed} of ${target} texts completed`}>
      {[0, 1, 2, 3].map((index) => {
        const isFilled = index < filled;
        return (
          <span
            key={index}
            className={`flex h-[19px] w-[19px] items-center justify-center rounded-full ${
              isFilled
                ? "bg-brand text-cream"
                : current
                  ? "border border-[#CBA92F] text-[#C79F1F]"
                  : "border border-[#C9C0A6] text-[#B2A98D]"
            }`}
          >
            <CheckIcon className="h-2.5 w-2.5" />
          </span>
        );
      })}
    </span>
  );
}

function LessonStatusDot({
  completed,
  next,
  skipped,
  bandTone,
}: {
  completed: boolean;
  next: boolean;
  skipped: boolean;
  bandTone: BandTone;
}) {
  const className = completed ? "bg-brand" : next ? "bg-yellow" : skipped ? bandTone.dot : "bg-cream-strong";
  return <span aria-hidden="true" className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${className}`} />;
}

function routeTitle(stopCount: number): string {
  if (stopCount === 10) return "Ten stops";
  if (stopCount === 0) return "Route";
  if (stopCount === 1) return "One stop";
  return `${stopCount} stops`;
}

function stageSubtitle(stage: Stage): string {
  if (stage.themes.length === 1) {
    const textCount = stage.themes[0]?.textIds.length ?? stage.textIds.length;
    return `${textCount} ${textCount === 1 ? "text" : "texts"}`;
  }
  return `${stage.themes.length} themes`;
}

function lessonMeta(text: ReadingText, next: NextTextRecommendation | null, completed: boolean, skipped: boolean): string {
  if (completed) return "Finished";
  if (skipped) return "Skipped · review anytime";
  const pieces = [formatCategory(text.category), `${text.minutes} min`, `${wordCount(text.body)} words`];
  if (next) pieces.push(`${Math.round(next.unknownWordRatio * 100)}% new`);
  return pieces.join(" · ");
}

function wordCount(body: string): number {
  return body.trim().split(/\s+/).filter(Boolean).length;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function dominantCategory(stage: Stage): Category | null {
  const counts = new Map<Category, number>();
  for (const textId of stage.textIds) {
    const text = getJourneyText(textId);
    if (text) counts.set(text.category, (counts.get(text.category) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? null;
}

export function bandHeaderTone(band: Difficulty): string {
  return BAND_TONES[band].soft;
}

export function toneForStage(stage: Stage): BandTone {
  switch (dominantCategory(stage)) {
    case "science":
      return BAND_TONES.A1;
    case "sport":
      return BAND_TONES.A2;
    case "culture":
      return BAND_TONES.C1;
    case "news-style":
      return BAND_TONES.B2;
    default:
      return BAND_TONES.B1;
  }
}
