"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import LessonScene, { sceneFor } from "@/components/LessonScene";
import { XPProgressBar } from "@/components/GamificationCards";
import type { Difficulty } from "@/types";
import { getProgress } from "@/lib/progress";
import { formatCategory } from "@/lib/format";
import { getSelectedReadingLevel, updateSelectedReadingLevel } from "@/lib/onboarding";
import { useGeneratedDictionary } from "@/lib/dictionary/useGeneratedDictionary";
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

type PathAlign = "left" | "center" | "right";

export default function JourneyMap({ selectedLevel: selectedLevelProp, onLevelChange }: JourneyMapProps = {}) {
  const [, setVersion] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [localLevel, setLocalLevel] = useState<Difficulty>("A2");
  const [openStageIndex, setOpenStageIndex] = useState<number | null>(null);
  useGeneratedDictionary();
  const currentRef = useRef<HTMLLIElement | null>(null);

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
  const visibleCleared = visibleStages.filter((stageProgress) => stageProgress.status === "cleared").length;
  const visibleCompletedTargets = visibleStages.reduce((sum, stageProgress) => sum + Math.min(stageProgress.completedCount, stageProgress.targetCount), 0);
  const visibleTotalTargets = visibleStages.reduce((sum, stageProgress) => sum + stageProgress.targetCount, 0);
  const visibleProgress = visibleTotalTargets === 0 ? 1 : visibleCompletedTargets / visibleTotalTargets;
  const currentStageIsVisible = visibleStages.some((stageProgress) => stageProgress.stage.globalIndex === journey.currentStageIndex);
  const expandedStageIndex = openStageIndex !== null && visibleStages.some((stageProgress) => stageProgress.stage.globalIndex === openStageIndex)
    ? openStageIndex
    : null;

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
    <section className="mb-6">
      <div className="mb-4 overflow-hidden rounded-card bg-cream-card shadow-card">
        <div className={`${bandHeaderTone(visibleBand)} px-5 py-5`}>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-ink-muted">Guided path</p>
              <h2 className="mt-1 text-2xl font-extrabold leading-tight text-ink">{visibleBand} map</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">Change level to revisit earlier routes.</p>
            </div>
            {nextText && (
              <LessonScene
                name={sceneFor(nextText.id, nextText.category)}
                size={84}
                className="lesson-scene-float rounded-[1.25rem] bg-white/40 p-1 shadow-raised"
              />
            )}
          </div>
          <LevelSwitcher selectedLevel={visibleBand} onChange={handleLevelChange} />
        </div>
        <div className="p-5">
          <XPProgressBar value={visibleProgress} label={`${visibleBand} progress`} />
          {nextVisible ? (
            <NextTextCard next={nextVisible} />
          ) : (
            <div className="mt-4 rounded-[1.25rem] bg-cream px-4 py-3">
              <p className="text-sm font-extrabold text-ink">{visibleBand} route complete</p>
              <p className="mt-1 text-xs font-semibold text-ink-muted">Open any unlocked stop below to reread it.</p>
            </div>
          )}
        </div>
      </div>

      <section className="overflow-hidden rounded-card bg-cream-card p-4 shadow-card">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-lg font-extrabold text-ink">{visibleBand} route</h3>
          <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-ink-muted">
            {visibleCleared}/{visibleStages.length}
          </span>
        </div>

        <ol className="relative mx-auto max-w-[28rem] py-3 before:absolute before:bottom-8 before:left-1/2 before:top-10 before:w-1.5 before:-translate-x-1/2 before:rounded-full before:bg-cream-dark/80">
          {visibleStages.map((stageProgress, index) => (
            <StageMapNode
              key={stageProgress.stage.globalIndex}
              stageProgress={stageProgress}
              next={nextVisible}
              skipped={skipped}
              expanded={expandedStageIndex === stageProgress.stage.globalIndex}
              currentRef={stageProgress.status === "current" ? currentRef : undefined}
              pathAlign={mapNodeAlign(index)}
              onToggleStage={handleToggleStage}
              onSkip={handleSkip}
              onJump={handleJump}
            />
          ))}
        </ol>
      </section>
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
    <div className="mt-4 grid grid-cols-4 gap-1 rounded-full bg-cream-card/70 p-1" role="group" aria-label="Reading level">
      {JOURNEY_BANDS.map((level) => (
        <button
          key={level}
          type="button"
          aria-pressed={selectedLevel === level}
          onClick={() => onChange(level)}
          className={`rounded-full px-3 py-2 text-sm font-extrabold active:scale-95 ${
            selectedLevel === level ? "bg-brand text-white shadow-raised" : "text-ink-muted"
          }`}
        >
          {level}
        </button>
      ))}
    </div>
  );
}

function NextTextCard({ next }: { next: NextTextRecommendation }) {
  const text = getJourneyText(next.textId);
  if (!text) return null;
  return (
    <Link
      href={`/reader/${encodeURIComponent(text.id)}`}
      className="mt-4 flex items-center gap-3 rounded-[1.25rem] bg-brand px-4 py-3 text-white shadow-raised active:scale-[0.99]"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold uppercase text-white/75">Next stop</span>
        <span className="mt-0.5 block text-base font-extrabold leading-snug">{text.title}</span>
        <span className="mt-0.5 block text-xs font-semibold text-white/80">{next.reason}</span>
      </span>
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15" aria-hidden="true">
        <ChevronRightIcon className="h-4 w-4" />
      </span>
    </Link>
  );
}

function StageMapNode({
  stageProgress,
  next,
  skipped,
  expanded,
  currentRef,
  pathAlign,
  onToggleStage,
  onSkip,
  onJump,
}: {
  stageProgress: StageProgress;
  next: NextTextRecommendation | null;
  skipped: Set<string>;
  expanded: boolean;
  currentRef?: RefObject<HTMLLIElement | null>;
  pathAlign: PathAlign;
  onToggleStage: (stageIndex: number) => void;
  onSkip: (textId: string) => void;
  onJump: (stage: Stage) => void;
}) {
  const { stage } = stageProgress;
  const current = stageProgress.status === "current";
  const locked = stageProgress.status === "locked";
  const cleared = stageProgress.status === "cleared";
  const progress = stageProgress.targetCount === 0 ? 1 : stageProgress.completedCount / stageProgress.targetCount;
  const stageNext = current && next?.stageIndex === stage.globalIndex ? next : null;
  const canJump = !!stageNext?.canJumpAhead && stageProgress.completedCount > 0;
  const panelId = `journey-stage-${stage.globalIndex}`;
  const nodeClass = current
    ? "ring-4 ring-brand/20"
    : cleared
      ? "opacity-95"
      : locked
        ? "opacity-60"
        : "";

  return (
    <li id={current ? "journey-current" : undefined} ref={currentRef} className="relative pb-8">
      <span aria-hidden="true" className={`absolute top-8 z-0 h-1.5 rounded-full bg-cream-dark/80 ${pathStemClass(pathAlign)}`} />
      <div className={`relative z-10 flex ${pathAlignClass(pathAlign)}`}>
        <div className="w-[10rem] text-center">
          <button
            type="button"
            aria-controls={panelId}
            aria-expanded={expanded}
            aria-label={locked ? `${stage.label} locked` : expanded ? `Close ${stage.label}` : `Open ${stage.label}`}
            disabled={locked}
            onClick={() => onToggleStage(stage.globalIndex)}
            className={`mx-auto block rounded-full active:scale-95 disabled:cursor-default disabled:active:scale-100 ${nodeClass}`}
          >
            <StageStatusIcon
              cleared={cleared}
              current={current}
              locked={locked}
              number={stage.indexInBand + 1}
            />
          </button>
          <p className={`mt-2 min-h-[2.25rem] break-words text-sm font-extrabold leading-tight ${locked ? "text-ink-muted" : "text-ink"}`}>
            {stage.label}
          </p>
          <p className="mt-1 text-xs font-bold text-ink-muted">
            {stageProgress.completedCount}/{stageProgress.targetCount}
          </p>
        </div>
      </div>

      {expanded && !locked && (
        <div id={panelId} className="relative z-20 mt-3 rounded-[1.25rem] border border-cream-dark bg-cream-card p-3 shadow-card">
          <XPProgressBar value={progress} label="Progress" className="mb-3" />
          <div className="space-y-2">
            {stage.textIds.map((textId) => (
              <LessonPreviewRow
                key={textId}
                textId={textId}
                next={stageNext?.textId === textId ? stageNext : null}
                skipped={skipped.has(textId)}
                allowSkip={current}
                onSkip={onSkip}
              />
            ))}
          </div>
          {current && canJump && (
            <button
              type="button"
              onClick={() => onJump(stage)}
              className="mt-3 w-full rounded-full bg-brand-light px-3 py-2 text-xs font-bold text-brand active:scale-95"
            >
              Jump ahead
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function LessonPreviewRow({
  textId,
  next,
  skipped,
  allowSkip,
  onSkip,
}: {
  textId: string;
  next: NextTextRecommendation | null;
  skipped: boolean;
  allowSkip: boolean;
  onSkip: (textId: string) => void;
}) {
  const text = getJourneyText(textId);
  if (!text) return null;
  const progress = getProgress(textId).status;
  const completed = progress === "completed";
  const muted = skipped && !completed;
  const statusLabel = completed
    ? "Completed"
    : skipped
      ? "Skipped"
      : `${formatCategory(text.category)} - ${text.minutes} min${next ? ` - ${Math.round(next.unknownWordRatio * 100)}% new` : ""}`;

  return (
    <div
      className={`rounded-2xl px-3 py-3 ${
        next ? "bg-brand-light shadow-card" : muted ? "bg-cream-dark/70 opacity-75" : "bg-cream"
      }`}
    >
      <div className="flex items-start gap-3">
        <LessonStatusDot completed={completed} next={!!next} muted={muted} />
        <div className="min-w-0 flex-1">
          <p className={`break-words text-sm font-bold leading-snug ${muted ? "text-ink-muted" : "text-ink"}`}>{text.title}</p>
          <p className="mt-1 text-xs font-semibold text-ink-muted">{statusLabel}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 pl-6">
        <Link
          href={`/reader/${encodeURIComponent(text.id)}`}
          className={`rounded-full px-3 py-1.5 text-xs font-bold active:scale-95 ${
            next ? "bg-brand text-white shadow-raised" : completed ? "bg-accent-mint text-accent-minttext" : "bg-cream-card text-brand shadow-card"
          }`}
        >
          {completed ? "Review" : progress === "in-progress" ? "Continue" : next ? "Start" : "Open"}
        </Link>
        {allowSkip && !next && !completed && !skipped && (
          <button
            type="button"
            onClick={() => onSkip(text.id)}
            className="rounded-full bg-cream-dark px-2.5 py-1.5 text-xs font-bold text-ink-muted active:scale-95"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}

function LessonStatusDot({ completed, next, muted }: { completed: boolean; next: boolean; muted: boolean }) {
  const className = completed
    ? "bg-brand"
    : next
      ? "bg-accent-gold"
      : muted
        ? "bg-ink-muted/40"
        : "bg-cream-dark";
  return <span aria-hidden="true" className={`mt-1 h-3 w-3 shrink-0 rounded-full ${className}`} />;
}

function mapNodeAlign(index: number): PathAlign {
  const pattern: PathAlign[] = ["left", "center", "right", "center"];
  return pattern[index % pattern.length];
}

function pathAlignClass(align: PathAlign): string {
  if (align === "left") return "justify-start";
  if (align === "right") return "justify-end";
  return "justify-center";
}

function pathStemClass(align: PathAlign): string {
  if (align === "left") return "left-[4.75rem] right-1/2";
  if (align === "right") return "left-1/2 right-[4.75rem]";
  return "hidden";
}

function bandHeaderTone(band: string): string {
  switch (band) {
    case "A1":
      return "bg-accent-mint";
    case "A2":
      return "bg-accent-sky";
    case "B1":
      return "bg-accent-gold";
    case "B2":
      return "bg-accent-violet";
    default:
      return "bg-accent-pink";
  }
}

function StageStatusIcon({
  cleared,
  current,
  locked,
  number,
}: {
  cleared: boolean;
  current: boolean;
  locked: boolean;
  number: number;
}) {
  const className = cleared
    ? "bg-brand text-white shadow-raised"
    : current
      ? "bg-cream-card text-brand shadow-raised"
      : locked
        ? "bg-cream-card text-ink-muted ring-1 ring-cream-dark"
        : "bg-cream-card text-ink ring-1 ring-cream-dark shadow-card";

  return (
    <span aria-hidden="true" className={`flex h-16 w-16 items-center justify-center rounded-full ${className}`}>
      {cleared ? (
        <CheckIcon className="h-7 w-7" />
      ) : locked ? (
        <LockIcon className="h-5 w-5" />
      ) : current ? (
        <MapPinIcon className="h-7 w-7" />
      ) : (
        <span className="text-lg font-extrabold tabular-nums">{number}</span>
      )}
    </span>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
