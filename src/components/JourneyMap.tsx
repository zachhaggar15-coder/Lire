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
  useGeneratedDictionary();
  const currentRef = useRef<HTMLDivElement | null>(null);
  const fallbackOptions = { selectedLevel: "A2" as const, progressById: {}, skippedTextIds: [], knownWords: new Set<string>(), feedbackByTextId: {} };

  const journey = mounted ? getJourneyState() : getJourneyState(fallbackOptions);
  const next = mounted ? getNextTextForReader() : getNextTextForReader(fallbackOptions);
  const skipped = mounted ? new Set(getJourneyStore().skippedTextIds) : new Set<string>();
  const ladder = buildLadder();

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
    refresh();
  }

  return (
    <section className="mb-6">
      <div className="mb-4 rounded-card bg-cream-card p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">Journey</p>
        <h2 className="mt-1 text-2xl font-extrabold leading-tight text-ink">Continue your French path</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          The next reading is chosen from your current stage and tuned to the words you already know.
        </p>
        <XPProgressBar value={journey.overallProgress} label="Path progress" className="mt-4" />
        {next && <NextTextCard next={next} />}
      </div>

      <div className="space-y-5">
        {JOURNEY_BANDS.map((band) => {
          const bandStages = journey.stages.filter((stage) => stage.stage.band === band);
          if (bandStages.length === 0) return null;
          const cleared = bandStages.filter((stage) => stage.status === "cleared").length;
          const progress = cleared / bandStages.length;
          return (
            <section key={band} className="rounded-card bg-cream-card p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Band</p>
                  <h3 className="text-xl font-extrabold text-ink">{band} path</h3>
                </div>
                <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">
                  {cleared}/{bandStages.length}
                </span>
              </div>
              <XPProgressBar value={progress} label={`${band} progress`} className="mt-3" />
              <div className="mt-4 space-y-3">
                {bandStages.map((stageProgress) => (
                  <StageRow
                    key={stageProgress.stage.globalIndex}
                    stageProgress={stageProgress}
                    next={next}
                    skipped={skipped}
                    currentRef={stageProgress.status === "current" ? currentRef : undefined}
                    onSkip={handleSkip}
                    onJump={handleJump}
                  />
                ))}
              </div>
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
      className="mt-4 flex items-center gap-3 rounded-2xl bg-brand px-3 py-3 text-white shadow-raised active:scale-[0.99]"
    >
      <LessonScene name={sceneFor(text.id, text.category)} size={56} />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold uppercase tracking-wide text-white/75">You are here</span>
        <span className="mt-0.5 block truncate text-base font-extrabold">{text.title}</span>
        <span className="mt-0.5 block text-xs font-semibold text-white/80">{next.reason}</span>
      </span>
      <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold">Start</span>
    </Link>
  );
}

function StageRow({
  stageProgress,
  next,
  skipped,
  currentRef,
  onSkip,
  onJump,
}: {
  stageProgress: StageProgress;
  next: NextTextRecommendation | null;
  skipped: Set<string>;
  currentRef?: RefObject<HTMLDivElement | null>;
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

  return (
    <div
      ref={currentRef}
      className={`rounded-2xl px-3 py-3 ${
        current ? "bg-cream ring-2 ring-brand/25" : cleared ? "bg-cream opacity-65" : "bg-cream-dark/55 opacity-65"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
            cleared ? "bg-brand text-white" : current ? "bg-brand-light text-brand" : "bg-cream-card text-ink-muted"
          }`}
        >
          {cleared ? "OK" : locked ? "L" : stage.indexInBand + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-extrabold text-ink">{stage.label}</p>
            <p className="shrink-0 text-xs font-bold text-ink-muted">
              {stageProgress.completedCount}/{stageProgress.targetCount}
            </p>
          </div>
          <XPProgressBar value={progress} label={stageProgress.optional ? "Optional earlier path" : "Stage progress"} className="mt-1" />
        </div>
      </div>

      {current && (
        <div className="mt-3 space-y-2">
          {stage.textIds.map((textId) => (
            <TextNode
              key={textId}
              textId={textId}
              next={stageNext?.textId === textId ? stageNext : null}
              skipped={skipped.has(textId)}
              onSkip={onSkip}
            />
          ))}
          {canJump && (
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
  );
}

function TextNode({
  textId,
  next,
  skipped,
  onSkip,
}: {
  textId: string;
  next: NextTextRecommendation | null;
  skipped: boolean;
  onSkip: (textId: string) => void;
}) {
  const text = getJourneyText(textId);
  if (!text) return null;
  const progress = getProgress(textId).status;
  const completed = progress === "completed";
  const disabled = completed || skipped;

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${
        next ? "bg-cream-card shadow-card" : disabled ? "bg-cream-dark/60 opacity-70" : "bg-cream-card/75"
      }`}
    >
      <LessonScene name={sceneFor(text.id, text.category)} size={44} />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-bold ${disabled ? "text-ink-muted line-through decoration-ink-muted/40" : "text-ink"}`}>
          {text.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-ink-muted">
          {completed
            ? "Completed"
            : skipped
              ? "Skipped"
              : `${formatCategory(text.category)} - ${text.minutes} min${next ? ` - ${Math.round(next.unknownWordRatio * 100)}% new` : ""}`}
        </p>
      </div>
      {completed || skipped ? (
        <span className="shrink-0 rounded-full bg-cream-card px-2.5 py-1 text-xs font-bold text-ink-muted">
          {completed ? "OK" : "Skip"}
        </span>
      ) : (
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href={`/reader/${encodeURIComponent(text.id)}`}
            className={`rounded-full px-3 py-1.5 text-xs font-bold active:scale-95 ${
              next ? "bg-brand text-white shadow-raised" : "bg-brand-light text-brand"
            }`}
          >
            {progress === "in-progress" ? "Continue" : next ? "Start" : "Open"}
          </Link>
          {!next && (
            <button
              type="button"
              onClick={() => onSkip(text.id)}
              className="rounded-full bg-cream-dark px-2.5 py-1.5 text-xs font-bold text-ink-muted active:scale-95"
            >
              Skip
            </button>
          )}
        </div>
      )}
    </div>
  );
}
