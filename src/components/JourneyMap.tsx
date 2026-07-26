"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import LessonScene, { sceneFor } from "@/components/LessonScene";
import { XPProgressBar } from "@/components/GamificationCards";
import type { Category, Difficulty } from "@/types";
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
type MapToneName = "mint" | "sky" | "gold" | "violet" | "pink";

const BAND_HEADER_TONES: Record<Difficulty, string> = {
  A1: "bg-accent-mint",
  A2: "bg-accent-sky",
  B1: "bg-accent-gold",
  B2: "bg-accent-violet",
  C1: "bg-accent-pink",
  C2: "bg-gradient-to-br from-accent-sky via-accent-mint to-accent-violet",
};

interface MapTone {
  name: MapToneName;
  node: string;
  text: string;
  connector: string;
  panel: string;
  panelBorder: string;
  row: string;
  rowNext: string;
  badge: string;
}

const MUTED_CONNECTOR = "bg-cream-dark/80";

const MAP_TONES: Record<MapToneName, MapTone> = {
  mint: {
    name: "mint",
    node: "bg-accent-mint text-accent-minttext",
    text: "text-accent-minttext",
    connector: "bg-accent-minttext/65",
    panel: "bg-accent-mint/30",
    panelBorder: "border-accent-mint",
    row: "bg-accent-mint/25",
    rowNext: "bg-accent-mint/60",
    badge: "bg-accent-mint text-accent-minttext",
  },
  sky: {
    name: "sky",
    node: "bg-accent-sky text-accent-skytext",
    text: "text-accent-skytext",
    connector: "bg-accent-skytext/62",
    panel: "bg-accent-sky/30",
    panelBorder: "border-accent-sky",
    row: "bg-accent-sky/25",
    rowNext: "bg-accent-sky/60",
    badge: "bg-accent-sky text-accent-skytext",
  },
  gold: {
    name: "gold",
    node: "bg-accent-gold text-accent-goldtext",
    text: "text-accent-goldtext",
    connector: "bg-accent-goldtext/62",
    panel: "bg-accent-gold/30",
    panelBorder: "border-accent-gold",
    row: "bg-accent-gold/25",
    rowNext: "bg-accent-gold/60",
    badge: "bg-accent-gold text-accent-goldtext",
  },
  violet: {
    name: "violet",
    node: "bg-accent-violet text-accent-violettext",
    text: "text-accent-violettext",
    connector: "bg-accent-violettext/62",
    panel: "bg-accent-violet/30",
    panelBorder: "border-accent-violet",
    row: "bg-accent-violet/25",
    rowNext: "bg-accent-violet/60",
    badge: "bg-accent-violet text-accent-violettext",
  },
  pink: {
    name: "pink",
    node: "bg-accent-pink text-accent-pinktext",
    text: "text-accent-pinktext",
    connector: "bg-accent-pinktext/62",
    panel: "bg-accent-pink/30",
    panelBorder: "border-accent-pink",
    row: "bg-accent-pink/25",
    rowNext: "bg-accent-pink/60",
    badge: "bg-accent-pink text-accent-pinktext",
  },
};

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
  const hasVisibleStages = visibleStages.length > 0;
  const visibleCleared = visibleStages.filter((stageProgress) => stageProgress.status === "cleared").length;
  const visibleCompletedTargets = visibleStages.reduce((sum, stageProgress) => sum + Math.min(stageProgress.completedCount, stageProgress.targetCount), 0);
  const visibleTotalTargets = visibleStages.reduce((sum, stageProgress) => sum + stageProgress.targetCount, 0);
  const visibleProgress = !hasVisibleStages ? 0 : visibleTotalTargets === 0 ? 1 : visibleCompletedTargets / visibleTotalTargets;
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
          ) : !hasVisibleStages ? (
            <div className="mt-4 rounded-[1.25rem] bg-cream px-4 py-3">
              <p className="text-sm font-extrabold text-ink">{visibleBand} route coming soon</p>
              <p className="mt-1 text-xs font-semibold text-ink-muted">New guided articles will appear here when they are added.</p>
            </div>
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

        {hasVisibleStages ? (
          <ol className="relative mx-auto max-w-[28rem] py-3 before:absolute before:bottom-8 before:left-1/2 before:top-10 before:w-1.5 before:-translate-x-1/2 before:rounded-full before:bg-cream-dark/80">
            {visibleStages.map((stageProgress, index) => {
              const tone = toneForStage(stageProgress.stage);
              return (
                <StageMapNode
                  key={stageProgress.stage.globalIndex}
                  stageProgress={stageProgress}
                  next={nextVisible}
                  skipped={skipped}
                  expanded={expandedStageIndex === stageProgress.stage.globalIndex}
                  currentRef={stageProgress.status === "current" ? currentRef : undefined}
                  pathAlign={mapNodeAlign(index)}
                  tone={tone}
                  hasNextStage={index < visibleStages.length - 1}
                  enterDelayMs={Math.min(index, 9) * 36}
                  onToggleStage={handleToggleStage}
                  onSkip={handleSkip}
                  onJump={handleJump}
                />
              );
            })}
          </ol>
        ) : (
          <div className="mt-4 rounded-[1.25rem] bg-cream px-4 py-5 text-center">
            <p className="text-sm font-extrabold text-ink">No {visibleBand} map stops yet</p>
            <p className="mt-1 text-xs font-semibold text-ink-muted">The colour trail and route stages will apply automatically when this level is added.</p>
          </div>
        )}
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
    <div className="mt-4" role="group" aria-label="Choose map level">
      <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-cream-card/70 p-1 sm:grid-cols-6">
        {JOURNEY_BANDS.map((level) => (
          <button
            key={level}
            type="button"
            aria-label={`Show ${level} map`}
            aria-pressed={selectedLevel === level}
            onClick={() => onChange(level)}
            className={`min-h-10 rounded-full px-3 py-2 text-center text-sm font-extrabold transition-[background-color,color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-card active:scale-95 ${
              selectedLevel === level ? "bg-brand text-white shadow-raised" : "text-ink-muted"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}

function NextTextCard({ next }: { next: NextTextRecommendation }) {
  const text = getJourneyText(next.textId);
  if (!text) return null;
  return (
    <Link
      href={`/reader/${encodeURIComponent(text.id)}`}
      className="journey-next-glow mt-4 flex items-center gap-3 rounded-[1.25rem] bg-brand px-4 py-3 text-white transition-transform duration-200 ease-out active:scale-[0.99]"
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
  tone,
  hasNextStage,
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
  pathAlign: PathAlign;
  tone: MapTone;
  hasNextStage: boolean;
  enterDelayMs: number;
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
  const reached = cleared || current;
  const nodeClass = current
    ? "journey-next-glow ring-4 ring-brand/30"
    : cleared
      ? "opacity-95"
      : locked
        ? "opacity-60"
        : "";

  return (
    <li
      id={current ? "journey-current" : undefined}
      ref={currentRef}
      className="journey-map-node-enter relative pb-8"
      style={{ animationDelay: `${enterDelayMs}ms` }}
    >
      {hasNextStage && (
        <span
          aria-hidden="true"
          className={`absolute bottom-0 left-1/2 top-8 z-0 w-1.5 -translate-x-1/2 rounded-full ${cleared ? tone.connector : "bg-transparent"}`}
        />
      )}
      <span aria-hidden="true" className={`absolute top-8 z-0 h-1.5 rounded-full ${reached ? tone.connector : MUTED_CONNECTOR} ${pathStemClass(pathAlign)}`} />
      <div className={`relative z-10 flex ${pathAlignClass(pathAlign)}`}>
        <div className="w-[10rem] text-center">
          <button
            type="button"
            aria-controls={panelId}
            aria-expanded={expanded}
            aria-label={locked ? `${stage.label} locked` : expanded ? `Close ${stage.label}` : `Open ${stage.label}`}
            disabled={locked}
            onClick={() => onToggleStage(stage.globalIndex)}
            className={`mx-auto block rounded-full transition-[box-shadow,opacity,transform] duration-200 ease-out active:scale-95 disabled:cursor-default disabled:active:scale-100 ${nodeClass}`}
          >
            <StageStatusIcon
              cleared={cleared}
              current={current}
              locked={locked}
              number={stage.indexInBand + 1}
              tone={tone}
            />
          </button>
          <p className={`mt-2 min-h-[2.25rem] break-words text-sm font-extrabold leading-tight ${locked ? "text-ink-muted" : reached ? tone.text : "text-ink"}`}>
            {stage.label}
          </p>
          <p className="mt-1 text-xs font-bold text-ink-muted">
            {stageProgress.completedCount}/{stageProgress.targetCount}
            {stage.themes.length > 1 ? ` - ${stage.themes.length} themes` : ""}
          </p>
        </div>
      </div>

      {expanded && !locked && (
        <div id={panelId} className={`journey-stage-panel-enter relative z-20 mt-3 rounded-[1.25rem] border p-3 shadow-card ${tone.panelBorder} ${tone.panel}`}>
          <XPProgressBar value={progress} label="Progress" className="mb-3" />
          <div className="space-y-3">
            {stage.themes.map((theme) => (
              <div key={theme.id}>
                {stage.themes.length > 1 && (
                  <p className="mb-2 rounded-full bg-cream-card/70 px-3 py-1 text-xs font-extrabold text-ink-muted">
                    {theme.title}
                  </p>
                )}
                <div className="space-y-2">
                  {theme.textIds.map((textId) => (
                    <LessonPreviewRow
                      key={textId}
                      textId={textId}
                      next={stageNext?.textId === textId ? stageNext : null}
                      skipped={skipped.has(textId)}
                      allowSkip={current}
                      onSkip={onSkip}
                      tone={tone}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {current && canJump && (
            <button
              type="button"
              onClick={() => onJump(stage)}
              className="mt-3 w-full rounded-full bg-brand-light px-3 py-2 text-xs font-bold text-brand transition-transform duration-150 ease-out active:scale-95"
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
  tone,
}: {
  textId: string;
  next: NextTextRecommendation | null;
  skipped: boolean;
  allowSkip: boolean;
  onSkip: (textId: string) => void;
  tone: MapTone;
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
      className={`rounded-2xl px-3 py-3 transition-[background-color,box-shadow,opacity,transform] duration-200 ease-out ${
        next ? `${tone.rowNext} shadow-card` : muted ? "bg-cream-dark/70 opacity-75" : tone.row
      }`}
    >
      <div className="flex items-start gap-3">
        <LessonStatusDot completed={completed} next={!!next} muted={muted} tone={tone} />
        <div className="min-w-0 flex-1">
          <p className={`break-words text-sm font-bold leading-snug ${muted ? "text-ink-muted" : "text-ink"}`}>{text.title}</p>
          <p className="mt-1 text-xs font-semibold text-ink-muted">{statusLabel}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 pl-6">
        <Link
          href={`/reader/${encodeURIComponent(text.id)}`}
          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-95 ${
            next ? "bg-brand text-white shadow-raised" : completed ? tone.badge : "bg-cream-card text-brand shadow-card"
          }`}
        >
          {completed ? "Review" : progress === "in-progress" ? "Continue" : next ? "Start" : "Open"}
        </Link>
        {allowSkip && !next && !completed && !skipped && (
          <button
            type="button"
            onClick={() => onSkip(text.id)}
            className="rounded-full bg-cream-dark px-2.5 py-1.5 text-xs font-bold text-ink-muted transition-transform duration-150 ease-out active:scale-95"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}

function LessonStatusDot({ completed, next, muted, tone }: { completed: boolean; next: boolean; muted: boolean; tone: MapTone }) {
  const className = completed
    ? tone.connector
    : next
      ? "bg-accent-gold"
      : muted
        ? "bg-ink-muted/40"
        : "bg-cream-dark";
  return <span aria-hidden="true" className={`mt-1 h-3 w-3 shrink-0 rounded-full ${className}`} />;
}

function toneForStage(stage: Stage): MapTone {
  const label = stage.label.toLowerCase();
  if (/(money|value|consumer|budget|price|credit|debt|spend|cost|argent|prix)/.test(label)) return MAP_TONES.gold;
  if (/(travel|trip|train|tourism|transport|journey|voyage|city|cities|housing|ville|logement)/.test(label)) return MAP_TONES.sky;
  if (/(technology|media|learning|language|work|career|attention|justice|thought|information|school|education|digital|ai)/.test(label)) return MAP_TONES.violet;
  if (/(food|culture|art|music|history|tradition|relationship|social|generation|volunteer|memory|story|meal)/.test(label)) return MAP_TONES.pink;
  if (/(health|science|environment|nature|body|climate|wildlife|medicine|mind|water|energy)/.test(label)) return MAP_TONES.mint;

  switch (dominantCategory(stage)) {
    case "science":
      return MAP_TONES.mint;
    case "sport":
      return MAP_TONES.sky;
    case "culture":
      return MAP_TONES.pink;
    case "news-style":
      return MAP_TONES.violet;
    default:
      return MAP_TONES.mint;
  }
}

function dominantCategory(stage: Stage): Category | null {
  const counts = new Map<Category, number>();
  for (const textId of stage.textIds) {
    const text = getJourneyText(textId);
    if (text) counts.set(text.category, (counts.get(text.category) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? null;
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

function bandHeaderTone(band: Difficulty): string {
  return BAND_HEADER_TONES[band];
}

function StageStatusIcon({
  cleared,
  current,
  locked,
  number,
  tone,
}: {
  cleared: boolean;
  current: boolean;
  locked: boolean;
  number: number;
  tone: MapTone;
}) {
  const className = cleared
    ? `${tone.node} shadow-raised`
    : current
      ? "bg-cream-card text-brand shadow-raised"
      : locked
        ? "bg-cream-card text-ink-muted ring-1 ring-cream-dark"
        : `${tone.panel} ${tone.text} ring-1 ring-cream-dark shadow-card`;

  return (
    <span aria-hidden="true" className={`flex h-16 w-16 items-center justify-center rounded-full transition-[background-color,color,box-shadow,transform] duration-200 ease-out ${className}`}>
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
