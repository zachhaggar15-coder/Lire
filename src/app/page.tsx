"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import FirstRunOnboarding from "@/components/FirstRunOnboarding";
import { StreakFlame } from "@/components/GamificationCards";
import HomeNewsSection from "@/components/HomeNewsSection";
import { getCurrentStreak } from "@/lib/habit";
import ShortSnippetsBlock from "@/components/ShortSnippetsBlock";
import BetaNotice from "@/components/BetaNotice";
import type { Category, Difficulty, ReadingText } from "@/types";
import { getOnboardingState, getSelectedReadingLevel } from "@/lib/onboarding";
import { getReviewStats } from "@/lib/spacedRepetition";
import { getSavedWords } from "@/lib/storage";
import { getCustomTextById } from "@/lib/customTexts";
import { getArchive } from "@/lib/archive";
import { getJourneyState, getNextTextForReader, type StageProgress } from "@/lib/journey/state";
import { getJourneyText, getStageForText } from "@/lib/journey/ladder";
import { getLastOpenedTextId, getProgress } from "@/lib/progress";
import { getCachedRssTextById } from "@/lib/rss/rssTextCache";
import { subscribeToRecommendationPreferences } from "@/lib/recommendation/preferences";
import LessonScene, { sceneFor } from "@/components/LessonScene";

type NextLesson = {
  id: string;
  category: Category;
  href: string;
  title: string;
  level: Difficulty;
  stageLabel: string;
  stageProgress: number;
  stageProgressLabel: string;
  reason: string;
};

type HomeReadingTarget = {
  id: string;
  category: Category;
  title: string;
  stageLabel: string;
  stageProgress: number;
  stageProgressLabel: string;
  buttonLabel: "Continue" | "Start lesson";
};

function readerHref(id: string): string {
  return `/reader/${encodeURIComponent(id)}`;
}

function progressValue(stageProgress: StageProgress | null | undefined): number {
  if (!stageProgress) return 0;
  if (stageProgress.targetCount === 0) return 1;
  return Math.min(1, stageProgress.completedCount / stageProgress.targetCount);
}

function stageProgressLabelFor(stageProgress: StageProgress | null | undefined): string {
  return stageProgress
    ? `${stageProgress.completedCount}/${stageProgress.targetCount} to unlock next stage`
    : "Journey progress";
}

function targetFromLesson(lesson: NextLesson | null): HomeReadingTarget | null {
  if (!lesson) return null;
  return {
    id: lesson.id,
    category: lesson.category,
    title: lesson.title,
    stageLabel: lesson.stageLabel,
    stageProgress: lesson.stageProgress,
    stageProgressLabel: lesson.stageProgressLabel,
    buttonLabel: "Start lesson",
  };
}

function targetFromText(text: ReadingText, selectedLevel: Difficulty): HomeReadingTarget {
  const stage = getStageForText(text.id);
  const journey = getJourneyState({ selectedLevel });
  const stageProgress = stage ? journey.stages.find((item) => item.stage.globalIndex === stage.globalIndex) : null;

  return {
    id: text.id,
    category: text.category,
    title: text.title,
    stageLabel: stageProgress?.stage.label ?? stage?.label ?? "Continue reading",
    stageProgress: progressValue(stageProgress),
    stageProgressLabel: stageProgress ? stageProgressLabelFor(stageProgress) : `${text.difficulty} - ${text.minutes} min`,
    buttonLabel: "Continue",
  };
}

async function resolveInProgressTarget(selectedLevel: Difficulty): Promise<HomeReadingTarget | null> {
  const id = getLastOpenedTextId();
  if (!id || getProgress(id).status !== "in-progress") return null;

  const localText = getCustomTextById(id) ?? getCachedRssTextById(id) ?? getJourneyText(id);
  if (localText) return targetFromText(localText, selectedLevel);

  const { getTextById } = await import("@/data/texts");
  const bundledText = getTextById(id);
  return bundledText ? targetFromText(bundledText, selectedLevel) : null;
}

export default function HomePage() {
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>("A2");
  const [stats, setStats] = useState({ dueReviews: 0 });
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [heroTarget, setHeroTarget] = useState<HomeReadingTarget | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [completedReadingCount, setCompletedReadingCount] = useState(0);

  const nextJourneyLesson = useCallback((level: Difficulty) => {
    const journey = getJourneyState({ selectedLevel: level });
    const recommendation = getNextTextForReader({ selectedLevel: level });
    const text = recommendation ? getJourneyText(recommendation.textId) : null;
    if (!recommendation || !text) return null;
    const stageProgress = journey.stages.find((stage) => stage.stage.globalIndex === recommendation.stageIndex);

    return {
      id: text.id,
      category: text.category,
      href: readerHref(text.id),
      title: text.title,
      level: text.difficulty,
      stageLabel: stageProgress?.stage.label ?? `${text.difficulty} path`,
      stageProgress: progressValue(stageProgress),
      stageProgressLabel: stageProgressLabelFor(stageProgress),
      reason: recommendation.reason,
    };
  }, []);

  const refreshDashboard = useCallback(() => {
    const onboarding = getOnboardingState();
    const savedWords = getSavedWords();
    const reviewStats = getReviewStats(savedWords);
    const level = getSelectedReadingLevel();
    const lesson = nextJourneyLesson(level);
    const fallbackTarget = targetFromLesson(lesson);

    setOnboardingComplete(onboarding?.completed === true);
    setSelectedLevel(level);
    setHeroTarget(fallbackTarget);
    setCurrentStreak(getCurrentStreak());
    setCompletedReadingCount(getArchive().length);
    setStats({ dueReviews: reviewStats.dueToday + reviewStats.newWords });

    void resolveInProgressTarget(level).then((target) => {
      setHeroTarget(target ?? fallbackTarget);
    });
  }, [nextJourneyLesson]);

  useEffect(() => {
    refreshDashboard();
    return subscribeToRecommendationPreferences(() => refreshDashboard());
  }, [refreshDashboard]);

  const shouldGateRealWorldContent = (selectedLevel === "A1" || selectedLevel === "A2") && completedReadingCount < 3;

  if (onboardingComplete === null) {
    return (
      <div className="px-4 pt-6">
        <div className="h-10 w-24 animate-pulse rounded-2xl bg-cream-dark" />
        <div className="mt-5 h-72 animate-pulse rounded-card bg-cream-dark" />
      </div>
    );
  }

  if (!onboardingComplete) {
    return (
      <div className="min-h-[100dvh] px-4 pt-6">
        <header className="mb-5">
          <h1 className="text-3xl font-extrabold text-ink">Lire</h1>
          <p className="mt-1 text-sm text-ink-muted">Set your starting point, then read one short French text.</p>
        </header>
        <FirstRunOnboarding
          variant="focus"
          onComplete={() => {
            refreshDashboard();
            window.location.assign("/articles#journey-current");
          }}
        />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ink">Lire</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            aria-label={`${currentStreak} day streak`}
            className="inline-flex items-center gap-1.5 rounded-full bg-cream-card px-3 py-2 text-xs font-bold text-ink-muted shadow-card active:scale-95"
          >
            <StreakFlame active={currentStreak > 0} className="h-4 w-4" />
            <span className="tabular-nums">{currentStreak}</span>
          </Link>
          <Link
            href="/settings"
            className="rounded-full bg-cream-card px-3 py-2 text-xs font-bold text-ink-muted shadow-card active:scale-95"
          >
            {selectedLevel}
          </Link>
        </div>
      </header>

      <div>
        <HomeReadingHero target={heroTarget} selectedLevel={selectedLevel} />
        <ReviewNudge dueReviews={stats.dueReviews} />
        <div className="mt-5 space-y-3">
          {shouldGateRealWorldContent ? (
            <BeginnerRealWorldGate completedCount={completedReadingCount} />
          ) : (
            <>
              <HomeNewsSection />
              <ShortSnippetsBlock />
            </>
          )}
        </div>
      </div>

      <div className="mt-5 pb-6">
        <BetaNotice />
      </div>
    </div>
  );
}

function BeginnerRealWorldGate({ completedCount }: { completedCount: number }) {
  const target = 3;
  const safeCount = Math.max(0, Math.min(target, completedCount));

  return (
    <section className="overflow-hidden rounded-card bg-cream-card shadow-card">
      <div className="flex items-center gap-4 bg-accent-gold p-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-accent-goldtext">Real-world French</p>
          <h2 className="mt-1 text-lg font-extrabold leading-tight text-ink">News unlocks after a few guided lessons.</h2>
        </div>
        <LessonScene name="work" size={76} className="rounded-[1.25rem] bg-white/50 p-1" />
      </div>
      <div className="p-4">
        <p className="text-sm leading-relaxed text-ink-muted">
          Live articles are faster, messier French. Finish three guided readings first so word taps and English help feel automatic.
        </p>
        <StageProgressLine
          value={safeCount / target}
          label={`${safeCount}/${target} guided readings complete`}
          className="mt-4"
        />
        <Link
          href="/articles#journey-current"
          className="mt-4 block rounded-full bg-brand px-5 py-3 text-center text-sm font-bold text-white shadow-raised active:scale-95"
        >
          Continue lessons
        </Link>
      </div>
    </section>
  );
}

function HomeReadingHero({ target, selectedLevel }: { target: HomeReadingTarget | null; selectedLevel: Difficulty }) {
  const title = target?.title ?? "Choose your next French lesson";
  const stage = target?.stageLabel ?? `${selectedLevel} reading path`;
  const href = target?.id ? readerHref(target.id) : "/articles#journey-current";

  return (
    <section className="overflow-hidden rounded-card bg-cream-card shadow-raised">
      <div className="bg-brand p-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-xs font-bold uppercase tracking-wide text-white/75">{stage}</p>
            <h2 className="mt-1.5 line-clamp-3 break-words text-2xl font-extrabold leading-tight">{title}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">{selectedLevel}</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/80">
                {target?.buttonLabel === "Continue" ? "In progress" : "Next lesson"}
              </span>
            </div>
          </div>
          <LessonScene
            name={sceneFor(target?.id ?? "", target?.category)}
            size={108}
            className="lesson-scene-float rounded-[1.5rem] bg-white/15 p-1 shadow-raised"
          />
        </div>
      </div>

      <div className="p-4">
        <StageProgressLine
          value={target?.stageProgress ?? 0}
          label={target?.stageProgressLabel ?? "Journey progress"}
        />

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <Link
            href={href}
            className="block rounded-full bg-brand px-5 py-3 text-center text-sm font-bold text-white shadow-raised active:scale-95"
          >
            {target?.buttonLabel ?? "Start lesson"}
          </Link>
          <Link
            href="/articles#journey-current"
            aria-label="See the full path"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-light text-brand shadow-card active:scale-95"
          >
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function StageProgressLine({ value, label, className = "" }: { value: number; label: string; className?: string }) {
  const percent = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-ink-muted">
        <span className="min-w-0 truncate">{label}</span>
        <span className="shrink-0 tabular-nums">{percent}%</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-dark"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="h-full rounded-full bg-brand transition-[width] duration-700" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ReviewNudge({ dueReviews }: { dueReviews: number }) {
  if (dueReviews <= 0) return null;
  return (
    <Link
      href="/review"
      className="mt-3 inline-flex rounded-full bg-cream-card px-4 py-2 text-sm font-bold text-brand shadow-card active:scale-95"
    >
      Review &middot; {dueReviews} due
    </Link>
  );
}
