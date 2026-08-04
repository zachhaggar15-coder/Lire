"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import type { Difficulty, ReadingText } from "@/types";
import { getProgress } from "@/lib/progress";
import { formatCategory } from "@/lib/format";
import { getSelectedReadingLevel } from "@/lib/onboarding";
import { useGeneratedDictionary } from "@/lib/dictionary/useGeneratedDictionary";
import { getCurrentStreak, isActiveToday } from "@/lib/habit";
import { getGoals, getGoalsProgress } from "@/lib/goals";
import { getJourneyText, JOURNEY_BANDS, NODES_PER_MAP, type Stage } from "@/lib/journey/ladder";
import {
  getJourneyState,
  getJourneyStore,
  getNextTextForReader,
  isMapCelebrated,
  markMapCelebrated,
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
  const [pageState, setPage] = useState(0);
  const [capstoneOpen, setCapstoneOpen] = useState(false);
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
  const pageCount = Math.max(1, Math.ceil(visibleStages.length / NODES_PER_MAP));
  const page = Math.min(Math.max(0, pageState), pageCount - 1);
  const pageStages = visibleStages.slice(page * NODES_PER_MAP, page * NODES_PER_MAP + NODES_PER_MAP);
  const pageCleared = pageStages.filter((stageProgress) => stageProgress.status === "cleared").length;
  const pageCompletedTargets = pageStages.reduce((sum, stageProgress) => sum + Math.min(stageProgress.completedCount, stageProgress.targetCount), 0);
  const pageTotalTargets = pageStages.reduce((sum, stageProgress) => sum + stageProgress.targetCount, 0);
  const pageProgress = pageStages.length === 0 ? 0 : pageTotalTargets === 0 ? 1 : pageCompletedTargets / pageTotalTargets;
  const allPageCleared = pageStages.length > 0 && pageStages.every((stageProgress) => stageProgress.status === "cleared");
  const celebrated = mounted && allPageCleared && isMapCelebrated(visibleBand, page);
  const showPager = mounted && pageCount > 1 && (celebrated || page > 0);
  const currentStageIsVisible = pageStages.some((stageProgress) => stageProgress.stage.globalIndex === journey.currentStageIndex);
  const expandedStageIndex =
    openStageIndex !== null && pageStages.some((stageProgress) => stageProgress.stage.globalIndex === openStageIndex)
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

  // On band change (and once mounted with real progress), open the first map
  // the learner hasn't celebrated yet. That is either the map they're working
  // through, or one they've fully cleared but not yet marked "Complete section"
  // on — so finishing a map's last node never auto-skips its capstone.
  // Deliberately NOT keyed on currentStageIndex.
  useEffect(() => {
    if (!mounted) return;
    setOpenStageIndex(null);
    setCapstoneOpen(false);
    const pages = Math.max(1, Math.ceil(visibleStages.length / NODES_PER_MAP));
    let target = pages - 1;
    for (let p = 0; p < pages; p += 1) {
      if (!isMapCelebrated(visibleBand, p)) {
        target = p;
        break;
      }
    }
    setPage(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleBand, mounted]);

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

  // Switching the band tab only changes what map you're viewing — never the
  // learner's committed reading level. That's a deliberate action taken only
  // on the Settings page, so browsing ahead to a harder/easier band never
  // silently overwrites the level used for recommendations elsewhere.
  function handleLevelChange(level: Difficulty) {
    setLocalLevel(level);
    setOpenStageIndex(null);
    if (onLevelChange) onLevelChange(level);
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
    setOpenStageIndex(pageStages.some((stageProgress) => stageProgress.stage.globalIndex === nextStageIndex) ? nextStageIndex : null);
    refresh();
  }

  function handleCelebrate() {
    markMapCelebrated(visibleBand, page);
    setCapstoneOpen(true);
    refresh();
  }

  function handlePage(delta: number) {
    setOpenStageIndex(null);
    setCapstoneOpen(false);
    setPage((current) => Math.min(Math.max(0, current + delta), pageCount - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
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
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              Ligne {visibleBand}
              {pageCount > 1 && ` · Map ${page + 1} of ${pageCount}`}
            </p>
            <h2 className="mt-1 text-[30px] font-semibold leading-none text-ink">{routeTitle(pageStages.length)}</h2>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-numeral text-[32px] leading-none text-ink">
              {pageCleared}
              <span className="text-ink-faint">/{pageStages.length || 0}</span>
            </p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">Stops clear</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="ligne-progress-track" aria-hidden="true">
            <div className="ligne-progress-fill" style={{ width: `${Math.round(pageProgress * 100)}%` }} />
          </div>
          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">
            Goal today · {Math.min(textsToday, dailyTextGoal)} of {dailyTextGoal} texts
          </p>
        </div>

        <LevelSwitcher selectedLevel={visibleBand} onChange={handleLevelChange} />
      </header>

      {hasVisibleStages ? (
        <>
          <ol className="relative mt-7 pb-4" aria-label={`${visibleBand} lesson route · map ${page + 1}`}>
            <span className="absolute bottom-12 left-[18px] top-5 w-0.5 bg-cream-strong" aria-hidden="true" />
            <span
              className="absolute left-[18px] top-5 w-0.5 bg-brand transition-[height] duration-500 ease-out"
              style={{ height: `calc((100% - 4.25rem) * ${pageProgress})` }}
              aria-hidden="true"
            />
            {pageStages.map((stageProgress, index) => (
              <StageRouteStop
                key={stageProgress.stage.globalIndex}
                stageProgress={stageProgress}
                next={nextVisible}
                skipped={skipped}
                expanded={expandedStageIndex === stageProgress.stage.globalIndex}
                currentRef={stageProgress.status === "current" ? currentRef : undefined}
                isLast={index === pageStages.length - 1}
                bandTone={bandTone}
                enterDelayMs={Math.min(index, 9) * 32}
                onToggleStage={handleToggleStage}
                onSkip={handleSkip}
                onJump={handleJump}
              />
            ))}
            <CompleteSectionNode
              band={visibleBand}
              page={page}
              pageCount={pageCount}
              unlocked={allPageCleared}
              celebrated={celebrated}
              open={capstoneOpen}
              onToggle={() => setCapstoneOpen((value) => !value)}
              onCelebrate={handleCelebrate}
            />
          </ol>

          {showPager && (
            <MapPager
              page={page}
              pageCount={pageCount}
              canBack={page > 0}
              canForward={celebrated && page < pageCount - 1}
              onBack={() => handlePage(-1)}
              onForward={() => handlePage(1)}
            />
          )}
        </>
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
  const nextOrder = stageNext ? stage.textIds.indexOf(stageNext.textId) : -1;
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
                {theme.textIds.map((textId) => {
                  const order = stage.textIds.indexOf(textId);
                  const status = getProgress(textId).status;
                  // Only completed lessons, in-progress ones, previously skipped
                  // ones, and the single recommended next lesson can be opened;
                  // everything further ahead in this node stays locked.
                  const locked =
                    current &&
                    nextOrder >= 0 &&
                    order > nextOrder &&
                    status !== "completed" &&
                    status !== "in-progress" &&
                    !skipped.has(textId);
                  return (
                    <LessonPreviewRow
                      key={textId}
                      textId={textId}
                      next={stageNext?.textId === textId ? stageNext : null}
                      skipped={skipped.has(textId)}
                      locked={locked}
                      allowSkip={current}
                      onSkip={onSkip}
                      bandTone={bandTone}
                    />
                  );
                })}
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
  locked,
  allowSkip,
  onSkip,
  bandTone,
}: {
  textId: string;
  next: NextTextRecommendation | null;
  skipped: boolean;
  locked: boolean;
  allowSkip: boolean;
  onSkip: (textId: string) => void;
  bandTone: BandTone;
}) {
  const text = getJourneyText(textId);
  if (!text) return null;

  const progress = getProgress(textId).status;
  const completed = progress === "completed";
  const reviewableSkipped = skipped && !completed;
  // Only a genuinely completed lesson is a "Review" — a skipped-but-unread lesson
  // (e.g. from "Jump ahead") still just opens the reading for the first time.
  const actionLabel = completed ? "Review" : reviewableSkipped ? "Read" : progress === "in-progress" ? "Continue" : next ? "Read" : "Open";
  const meta = locked ? "Locked · finish the lesson above first" : lessonMeta(text, next, completed, reviewableSkipped);

  return (
    <div className={`border-t border-cream-dark py-3 first:border-t-0 ${locked ? "opacity-55" : ""}`}>
      <div className="flex items-start gap-3">
        {locked ? (
          <LockIcon className="mt-1 h-3 w-3 shrink-0 text-ink-faint" />
        ) : (
          <LessonStatusDot completed={completed} next={!!next} skipped={reviewableSkipped} bandTone={bandTone} />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-french text-[16px] leading-snug text-ink">{text.title}</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-ink-faint">{meta}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 pl-6">
        {locked ? (
          <span className="ligne-pill min-h-9 cursor-default border border-cream-dark bg-cream-sunken text-ink-faint">Locked</span>
        ) : (
          <Link
            href={`/reader/${encodeURIComponent(text.id)}`}
            className={`ligne-pill min-h-9 ${
              next ? "bg-brand text-cream" : completed || reviewableSkipped ? "border border-cream-dark bg-cream-card text-brand" : "border border-cream-dark bg-cream-sunken text-brand"
            }`}
          >
            {actionLabel}
          </Link>
        )}
        {allowSkip && !locked && !next && !completed && !skipped && (
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

function CompleteSectionNode({
  band,
  page,
  pageCount,
  unlocked,
  celebrated,
  open,
  onToggle,
  onCelebrate,
}: {
  band: Difficulty;
  page: number;
  pageCount: number;
  unlocked: boolean;
  celebrated: boolean;
  open: boolean;
  onToggle: () => void;
  onCelebrate: () => void;
}) {
  const hasNext = page < pageCount - 1;

  if (!unlocked) {
    return (
      <li className="relative pl-[34px] pt-1">
        <span aria-hidden="true" className="absolute left-[14px] top-4 h-2.5 w-2.5 rounded-full bg-cream-strong ring-[5px] ring-cream" />
        <div className="rounded-card bg-cream px-1 py-3 opacity-60">
          <p className="font-french text-[18px] leading-tight text-ink">Complete section</p>
          <p className="mt-1 text-[13px] text-ink-muted">Clear every stop on this map to unlock.</p>
        </div>
      </li>
    );
  }

  return (
    <li className="relative pl-[34px] pt-1">
      {celebrated ? (
        <span aria-hidden="true" className="absolute left-[9px] top-5 z-10 flex h-[17px] w-[17px] items-center justify-center rounded-full bg-brand text-cream ring-[5px] ring-cream">
          <CheckIcon className="h-2.5 w-2.5" />
        </span>
      ) : (
        <span aria-hidden="true" className="absolute left-[10px] top-5 z-10 h-[15px] w-[15px] rounded-full border-[4px] border-brand bg-cream ring-[5px] ring-cream" />
      )}

      <button
        type="button"
        aria-expanded={open}
        aria-label={celebrated ? "Section complete" : "Complete this section"}
        onClick={celebrated ? onToggle : onCelebrate}
        className="w-full rounded-card bg-yellow px-5 py-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
      >
        <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-yellow-muted">
          {celebrated ? "Section complete" : "Final stop"}
        </span>
        <span className="mt-2 block font-french text-[22px] leading-tight text-ink">
          {celebrated ? "Section complete!" : "Complete section"}
        </span>
        <span className="mt-1 block text-xs font-semibold text-yellow-muted">
          {celebrated
            ? hasNext
              ? "Tap to revisit your congratulations."
              : "You've finished the final map of this level."
            : "Tap to finish this map and celebrate."}
        </span>
      </button>

      <div
        aria-hidden={!open}
        className={`overflow-hidden transition-[max-height,opacity,margin-top] duration-[380ms] ease-[cubic-bezier(.4,0,.2,1)] ${
          open ? "mt-2 max-h-[640px] opacity-100" : "mt-0 max-h-0 opacity-0"
        }`}
      >
        <div className="rounded-card bg-brand px-5 py-7 text-center text-cream">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-cream/70">
            Ligne {band} · Map {page + 1} of {pageCount}
          </p>
          <p className="mt-3 font-french text-[26px] leading-tight">Congratulations!</p>
          <p className="mt-2 text-sm leading-relaxed text-cream/85">
            You&apos;ve cleared every stop on this map.
            {hasNext ? " Turn the page for a fresh set of themes." : " That was the last map of this level — superb work."}
          </p>
          {hasNext && (
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-cream/70">
              Use “Page forward ›” below to continue
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

function MapPager({
  page,
  pageCount,
  canBack,
  canForward,
  onBack,
  onForward,
}: {
  page: number;
  pageCount: number;
  canBack: boolean;
  canForward: boolean;
  onBack: () => void;
  onForward: () => void;
}) {
  return (
    <div className="mt-1 flex items-center justify-between pb-3">
      <button
        type="button"
        onClick={onBack}
        disabled={!canBack}
        className={`min-h-9 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
          canBack ? "text-ink-muted active:text-brand" : "cursor-default text-ink-faint/40"
        }`}
      >
        ‹ Page back
      </button>
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
        {page + 1} / {pageCount}
      </span>
      <button
        type="button"
        onClick={onForward}
        disabled={!canForward}
        className={`min-h-9 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
          canForward ? "text-ink-muted active:text-brand" : "cursor-default text-ink-faint/40"
        }`}
      >
        Page forward ›
      </button>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
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

