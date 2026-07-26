"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import LessonScene, { sceneFor } from "@/components/LessonScene";
import { XPProgressBar } from "@/components/GamificationCards";
import { getProgress } from "@/lib/progress";
import { formatCategory } from "@/lib/format";
import { useGeneratedDictionary } from "@/lib/dictionary/useGeneratedDictionary";
import { buildLadder, getJourneyText, JOURNEY_BANDS, type Stage } from "@/lib/journey/ladder";
import {
  getJourneyState,
  getJourneyStore,
  getNextTextForReader,
  skipJourneyText,
  skipJourneyTexts,
  type NextTextRecommendation,
  type StageProgress,
} from "@/lib/journey/state";

export default function JourneyMap() {
  const [, setVersion] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [openStageIndex, setOpenStageIndex] = useState<number | null>(null);
  useGeneratedDictionary();
  const currentRef = useRef<HTMLLIElement | null>(null);
  const fallbackOptions = { selectedLevel: "A2" as const, progressById: {}, skippedTextIds: [], knownWords: new Set<string>(), feedbackByTextId: {} };

  const journey = mounted ? getJourneyState() : getJourneyState(fallbackOptions);
  const next = mounted ? getNextTextForReader() : getNextTextForReader(fallbackOptions);
  const skipped = mounted ? new Set(getJourneyStore().skippedTextIds) : new Set<string>();
  const ladder = buildLadder();
  const unlockedStageIndexes = journey.stages
    .filter((stageProgress) => stageProgress.status !== "locked")
    .map((stageProgress) => stageProgress.stage.globalIndex);
  const fallbackOpenStageIndex =
    journey.currentStageIndex ?? (unlockedStageIndexes.length > 0 ? unlockedStageIndexes[unlockedStageIndexes.length - 1] : null);
  const activeStageIndex =
    openStageIndex !== null && unlockedStageIndexes.includes(openStageIndex) ? openStageIndex : fallbackOpenStageIndex;
  const activeStageProgress = activeStageIndex === null ? null : journey.stages.find((stage) => stage.stage.globalIndex === activeStageIndex) ?? null;
  const activeStagePosition = activeStageIndex === null ? -1 : unlockedStageIndexes.indexOf(activeStageIndex);
  const previousStageIndex = activeStagePosition > 0 ? unlockedStageIndexes[activeStagePosition - 1] : null;
  const nextStageIndex =
    activeStagePosition >= 0 && activeStagePosition < unlockedStageIndexes.length - 1 ? unlockedStageIndexes[activeStagePosition + 1] : null;
  const nextText = next ? getJourneyText(next.textId) : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = window.setTimeout(() => {
      currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [journey.currentStageIndex, mounted]);

  function refresh() {
    setVersion((value) => value + 1);
  }

  function handleSkip(textId: string) {
    skipJourneyText(textId);
    refresh();
  }

  function handleJump(stage: Stage) {
    const remaining = stage.textIds.filter((id) => getProgress(id).status !== "completed");
    skipJourneyTexts(remaining);
    setOpenStageIndex(stage.globalIndex + 1);
    refresh();
  }

  return (
    <section className="mb-6">
      <div className="mb-4 overflow-hidden rounded-card bg-cream-card shadow-card">
        <div className="bg-brand px-5 py-5 text-white">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-white/75">Journey</p>
              <h2 className="mt-1 text-2xl font-extrabold leading-tight">Continue your French path</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                One guided reading at a time, with the next stop tuned to the words you already know.
              </p>
            </div>
            {nextText && (
              <LessonScene
                name={sceneFor(nextText.id, nextText.category)}
                size={96}
                className="lesson-scene-float rounded-[1.35rem] bg-white/15 p-1 shadow-raised"
              />
            )}
          </div>
        </div>
        <div className="p-5">
          <XPProgressBar value={journey.overallProgress} label="Path progress" />
          {next && <NextTextCard next={next} />}
        {activeStageProgress && (
          <StageNavigator
            activeLabel={activeStageProgress.stage.label}
            canGoBack={previousStageIndex !== null}
            canGoForward={nextStageIndex !== null}
            currentActive={activeStageProgress.stage.globalIndex === journey.currentStageIndex}
            hasCurrent={journey.currentStageIndex !== null}
            onBack={() => {
              if (previousStageIndex !== null) setOpenStageIndex(previousStageIndex);
            }}
            onCurrent={() => setOpenStageIndex(journey.currentStageIndex)}
            onForward={() => {
              if (nextStageIndex !== null) setOpenStageIndex(nextStageIndex);
            }}
          />
        )}
        </div>
      </div>

      <div className="space-y-5">
        {JOURNEY_BANDS.map((band) => {
          const bandStages = journey.stages.filter((stage) => stage.stage.band === band);
          if (bandStages.length === 0) return null;
          const cleared = bandStages.filter((stage) => stage.status === "cleared").length;
          const progress = cleared / bandStages.length;
          return (
            <section key={band} className="overflow-hidden rounded-card bg-cream-card shadow-card">
              <div className={`flex items-start justify-between gap-3 px-4 py-4 ${bandHeaderTone(band)}`}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Band</p>
                  <h3 className="text-xl font-extrabold text-ink">{band} path</h3>
                </div>
                <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-ink">
                  {cleared}/{bandStages.length}
                </span>
              </div>
              <div className="px-4 pt-3">
                <XPProgressBar value={progress} label={`${band} progress`} />
              </div>
              <ol className="relative mt-4 space-y-4 px-4 pb-4 before:absolute before:bottom-8 before:left-[2.375rem] before:top-4 before:w-1 before:rounded-full before:bg-cream-dark">
                {bandStages.map((stageProgress) => (
                  <StageRow
                    key={stageProgress.stage.globalIndex}
                    stageProgress={stageProgress}
                    next={next}
                    skipped={skipped}
                    expanded={activeStageIndex === stageProgress.stage.globalIndex}
                    currentRef={stageProgress.status === "current" ? currentRef : undefined}
                    onSelectStage={setOpenStageIndex}
                    onSkip={handleSkip}
                    onJump={handleJump}
                  />
                ))}
              </ol>
            </section>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs font-semibold text-ink-muted">
        {ladder.texts.length} guided readings across {ladder.stages.length} stages.
      </p>
    </section>
  );
}

function NextTextCard({ next }: { next: NextTextRecommendation }) {
  const text = getJourneyText(next.textId);
  if (!text) return null;
  return (
    <Link
      id="journey-current"
      href={`/reader/${encodeURIComponent(text.id)}`}
      className="mt-4 flex items-center gap-3 overflow-hidden rounded-[1.25rem] bg-brand px-3 py-3 text-white shadow-raised active:scale-[0.99]"
    >
      <LessonScene name={sceneFor(text.id, text.category)} size={64} className="rounded-2xl bg-white/15 p-1" />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold uppercase tracking-wide text-white/75">You are here</span>
        <span className="mt-0.5 block truncate text-base font-extrabold">{text.title}</span>
        <span className="mt-0.5 block text-xs font-semibold text-white/80">{next.reason}</span>
      </span>
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15" aria-hidden="true">
        <ChevronRightIcon className="h-4 w-4" />
      </span>
    </Link>
  );
}

function StageNavigator({
  activeLabel,
  canGoBack,
  canGoForward,
  currentActive,
  hasCurrent,
  onBack,
  onCurrent,
  onForward,
}: {
  activeLabel: string;
  canGoBack: boolean;
  canGoForward: boolean;
  currentActive: boolean;
  hasCurrent: boolean;
  onBack: () => void;
  onCurrent: () => void;
  onForward: () => void;
}) {
  return (
    <div className="mt-4 rounded-2xl bg-cream p-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous unlocked stage"
          disabled={!canGoBack}
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-card text-base font-extrabold text-ink-muted shadow-card active:scale-95 disabled:opacity-40"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={!hasCurrent}
          onClick={onCurrent}
          className={`min-w-0 flex-1 rounded-full px-3 py-2 text-xs font-bold active:scale-95 disabled:opacity-40 ${
            currentActive ? "bg-brand text-white shadow-raised" : "bg-brand-light text-brand"
          }`}
        >
          <span className="block truncate">Current stage</span>
        </button>
        <button
          type="button"
          aria-label="Next unlocked stage"
          disabled={!canGoForward}
          onClick={onForward}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-card text-base font-extrabold text-ink-muted shadow-card active:scale-95 disabled:opacity-40"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 truncate text-center text-xs font-semibold text-ink-muted">{activeLabel}</p>
    </div>
  );
}

function StageRow({
  stageProgress,
  next,
  skipped,
  expanded,
  currentRef,
  onSelectStage,
  onSkip,
  onJump,
}: {
  stageProgress: StageProgress;
  next: NextTextRecommendation | null;
  skipped: Set<string>;
  expanded: boolean;
  currentRef?: RefObject<HTMLLIElement | null>;
  onSelectStage: (stageIndex: number) => void;
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
  const stageTone = current
    ? "border-brand/30 bg-brand-light shadow-card"
    : cleared
      ? expanded
        ? "border-accent-mint bg-cream"
        : "border-transparent bg-cream opacity-80"
      : "border-cream-dark bg-cream-dark/60 opacity-70";

  return (
    <li ref={currentRef} className="relative pl-11">
      <span className="absolute left-0 top-3 z-10">
        <StageStatusIcon
          cleared={cleared}
          current={current}
          locked={locked}
          label={cleared ? "Stage cleared" : locked ? "Stage locked" : current ? "Current stage" : `Stage ${stage.indexInBand + 1}`}
          number={stage.indexInBand + 1}
        />
      </span>
      <div className={`rounded-2xl border px-3 py-3 ${stageTone}`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={locked}
          onClick={() => onSelectStage(stage.globalIndex)}
          className="min-w-0 flex-1 text-left active:scale-[0.99] disabled:cursor-default disabled:active:scale-100"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-extrabold text-ink">{stage.label}</p>
            <p className="shrink-0 text-xs font-bold text-ink-muted">
              {stageProgress.completedCount}/{stageProgress.targetCount}
            </p>
          </div>
        </button>
        <button
          type="button"
          aria-label={locked ? `${stage.label} locked` : expanded ? `Collapse ${stage.label}` : `Open ${stage.label}`}
          disabled={locked}
          onClick={() => onSelectStage(stage.globalIndex)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-card text-sm font-extrabold text-ink-muted shadow-card"
        >
          {locked ? <LockIcon className="h-3.5 w-3.5" /> : expanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
        </button>
      </div>
      <XPProgressBar value={progress} label={stageProgress.optional ? "Optional earlier path" : "Stage progress"} className="mt-2 pr-10" />

      {expanded && !locked && (
        <div className="mt-3 space-y-2">
          {stage.textIds.map((textId) => (
            <TextNode
              key={textId}
              textId={textId}
              next={stageNext?.textId === textId ? stageNext : null}
              skipped={skipped.has(textId)}
              allowSkip={current}
              onSkip={onSkip}
            />
          ))}
          {current && canJump && (
            <button
              type="button"
              onClick={() => onJump(stage)}
              className="w-full rounded-full bg-brand-light px-3 py-2 text-xs font-bold text-brand active:scale-95"
            >
              You&apos;re flying - jump ahead
            </button>
          )}
        </div>
      )}
      </div>
    </li>
  );
}

function TextNode({
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

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${
        next ? "border-brand/20 bg-cream-card shadow-card" : muted ? "border-transparent bg-cream-dark/60 opacity-75" : "border-transparent bg-cream-card/75"
      }`}
    >
      <LessonScene
        name={sceneFor(text.id, text.category)}
        size={52}
        className={next ? "rounded-2xl bg-brand-light/80 p-0.5" : ""}
      />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-bold ${muted ? "text-ink-muted" : "text-ink"}`}>{text.title}</p>
        <p className="mt-0.5 truncate text-xs text-ink-muted">
          {completed
            ? "Completed"
            : skipped
              ? "Skipped"
              : `${formatCategory(text.category)} - ${text.minutes} min${next ? ` - ${Math.round(next.unknownWordRatio * 100)}% new` : ""}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Link
          href={`/reader/${encodeURIComponent(text.id)}`}
          className={`rounded-full px-3 py-1.5 text-xs font-bold active:scale-95 ${
            next ? "bg-brand text-white shadow-raised" : completed ? "bg-accent-mint text-accent-minttext" : "bg-brand-light text-brand"
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
  label,
  number,
}: {
  cleared: boolean;
  current: boolean;
  locked: boolean;
  label: string;
  number: number;
}) {
  const className = cleared
    ? "bg-brand text-white shadow-raised"
    : current
      ? "bg-cream-card text-brand ring-4 ring-brand/20 shadow-raised"
      : locked
        ? "bg-cream-card text-ink-muted ring-1 ring-cream-dark"
        : "bg-cream-card text-ink ring-1 ring-cream-dark shadow-card";

  return (
    <span aria-label={label} className={`flex h-11 w-11 items-center justify-center rounded-full ${className}`}>
      {cleared ? (
        <CheckIcon className="h-5 w-5" />
      ) : locked ? (
        <LockIcon className="h-4 w-4" />
      ) : current ? (
        <MapPinIcon className="h-5 w-5" />
      ) : (
        <span className="text-sm font-extrabold tabular-nums">{number}</span>
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

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
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

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
