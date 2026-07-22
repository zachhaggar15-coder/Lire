"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ContinueReadingBanner from "@/components/ContinueReadingBanner";
import FirstRunOnboarding from "@/components/FirstRunOnboarding";
import { StreakCard, XPProgressBar } from "@/components/GamificationCards";
import { getCurrentStreak, getLongestStreak, getStreakWeek, isActiveToday, type StreakDay } from "@/lib/habit";
import ShortSnippetsBlock from "@/components/ShortSnippetsBlock";
import BetaNotice from "@/components/BetaNotice";
import type { Difficulty } from "@/types";
import { buildProgressSnapshot, type ProgressSnapshot } from "@/lib/gamification";
import { bandNumber, bandProgress, getLevelScore } from "@/lib/levelScore";
import { getKnownWords } from "@/lib/knownWords";
import { getOnboardingState, getSelectedReadingLevel } from "@/lib/onboarding";
import { getReviewStats } from "@/lib/spacedRepetition";
import { getSavedWords } from "@/lib/storage";
import { getSavedPhrases } from "@/lib/phrases";
import { getValidationState } from "@/lib/validation/state";
import { getLessonPathTexts, getLessonUnitProgress, lessonUnitForText } from "@/lib/lessonUnits";
import { subscribeToRecommendationPreferences } from "@/lib/recommendation/preferences";
import { getProgress } from "@/lib/progress";
import LessonScene, { sceneFor } from "@/components/LessonScene";
import { tokenizeParagraphsToSentences } from "@/lib/words";

type NextLesson = {
  id: string;
  category: string;
  href: string;
  title: string;
  detail: string;
  sentenceCount: number;
  level: Difficulty;
  unitTitle: string | null;
  unitGoal: string | null;
  unitOrder: number | null;
  unitProgress: number;
  unitProgressLabel: string | null;
};

export default function HomePage() {
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>("A2");
  const [progressSnapshot, setProgressSnapshot] = useState<ProgressSnapshot | null>(null);
  const [stats, setStats] = useState({
    knownWords: 0,
    savedWords: 0,
    savedPhrases: 0,
    dueReviews: 0,
  });
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [completedArticleCount, setCompletedArticleCount] = useState(0);
  const [nextLesson, setNextLesson] = useState<NextLesson | null>(null);
  const [levelScore, setLevelScore] = useState(0);
  const [streak, setStreak] = useState<{ current: number; longest: number; activeToday: boolean; week: StreakDay[] }>({
    current: 0,
    longest: 0,
    activeToday: false,
    week: [],
  });

  const nextStarterLesson = useCallback((level: Difficulty) => {
    const bank = getLessonPathTexts({ level, category: "all", limit: 20 });
    const text = bank.find((item) => getProgress(item.id).status !== "completed") ?? bank[0];
    if (!text) return null;
    const unit = lessonUnitForText(text);
    const unitProgress = unit ? getLessonUnitProgress(unit) : null;
    return {
      id: text.id,
      category: text.category,
      href: `/reader/${encodeURIComponent(text.id)}`,
      title: text.title,
      detail: `${text.difficulty} - ${text.minutes} min`,
      sentenceCount: tokenizeParagraphsToSentences(text.body).flat().length,
      level: text.difficulty,
      unitTitle: unit?.title ?? null,
      unitGoal: unit?.goal ?? null,
      unitOrder: unit?.order ?? null,
      unitProgress: unitProgress && unitProgress.total > 0 ? unitProgress.completed / unitProgress.total : 0,
      unitProgressLabel: unitProgress ? `${unitProgress.completed}/${unitProgress.total} complete` : null,
    };
  }, []);

  const refreshDashboard = useCallback(() => {
    const onboarding = getOnboardingState();
    const savedWords = getSavedWords();
    const savedPhrases = getSavedPhrases();
    const reviewStats = getReviewStats(savedWords);
    const validation = getValidationState();
    const level = getSelectedReadingLevel();
    setOnboardingComplete(onboarding?.completed === true);
    setSelectedLevel(level);
    setProgressSnapshot(buildProgressSnapshot(savedWords));
    setLevelScore(getLevelScore(level));
    setCompletedArticleCount(validation.completedArticleCount);
    setNextLesson(nextStarterLesson(level));
    setStreak({
      current: getCurrentStreak(),
      longest: getLongestStreak(),
      activeToday: isActiveToday(),
      week: getStreakWeek(),
    });
    setStats({
      knownWords: getKnownWords().length,
      savedWords: savedWords.filter((word) => word.status !== "known").length,
      savedPhrases: savedPhrases.filter((phrase) => phrase.status !== "known").length,
      dueReviews: reviewStats.dueToday + reviewStats.newWords,
    });
  }, [nextStarterLesson]);

  useEffect(() => {
    refreshDashboard();
    return subscribeToRecommendationPreferences(() => refreshDashboard());
  }, [refreshDashboard]);

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
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Lire</h1>
          <p className="mt-1 text-sm text-ink-muted">Set your starting point, then read one short French text.</p>
        </header>
        <FirstRunOnboarding
          variant="focus"
          onComplete={() => {
            refreshDashboard();
            const lesson = nextStarterLesson(getSelectedReadingLevel());
            window.location.assign(lesson?.href ?? "/articles");
          }}
        />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Lire</h1>
          <p className="text-sm text-ink-muted">Today</p>
        </div>
        <Link
          href="/settings"
          className="rounded-full bg-cream-card px-3 py-2 text-xs font-bold text-ink-muted shadow-card active:scale-95"
        >
          {selectedLevel}
        </Link>
      </header>

      <StreakCard streak={streak.current} longest={streak.longest} week={streak.week} activeToday={streak.activeToday} />

      {completedArticleCount < 3 ? (
        <BeginnerHome
          completedArticleCount={completedArticleCount}
          nextLesson={nextLesson}
          selectedLevel={selectedLevel}
          levelScore={levelScore}
          dueReviews={stats.dueReviews}
          savedLearningItems={stats.savedWords + stats.savedPhrases}
          savedPhrases={stats.savedPhrases}
        />
      ) : (
        <>
          <DashboardCard
            progressSnapshot={progressSnapshot}
            selectedLevel={selectedLevel}
            stats={stats}
            nextLesson={nextLesson}
            levelScore={levelScore}
          />
          <ContinueReadingBanner />
          <div className="mb-5">
            <BetaNotice />
          </div>
          <ShortSnippetsBlock />
        </>
      )}
    </div>
  );
}

function BeginnerHome({
  completedArticleCount,
  nextLesson,
  selectedLevel,
  levelScore,
  dueReviews,
  savedLearningItems,
  savedPhrases,
}: {
  completedArticleCount: number;
  nextLesson: NextLesson | null;
  selectedLevel: Difficulty;
  levelScore: number;
  dueReviews: number;
  savedLearningItems: number;
  savedPhrases: number;
}) {
  const step = Math.min(3, completedArticleCount + 1);
  const sentenceGoal = nextLesson?.sentenceCount ?? 6;
  const scoreFill = bandProgress(levelScore);
  return (
    <div className="space-y-4">
      {/* The primary card carries the scene for the lesson it launches, so
          the main screen has a focal point instead of opening on a wall of
          text — and you can see what today's reading is before tapping. */}
      <section className="rounded-card bg-cream-card p-5 shadow-raised">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-brand">Today</p>
            <h2 className="mt-1 text-lg font-extrabold leading-tight text-ink">
              Read {sentenceGoal} simple French {sentenceGoal === 1 ? "sentence" : "sentences"}.
            </h2>
          </div>
          <LessonScene name={sceneFor(nextLesson?.id ?? "", nextLesson?.category)} size={72} />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {nextLesson?.unitOrder ? `Unit ${nextLesson.unitOrder}: ${nextLesson.unitTitle}` : `Lesson ${step}`}:{" "}
          {nextLesson?.title ?? "your next short reading"}
        </p>
        {nextLesson?.unitGoal && (
          <div className="mt-3 rounded-2xl bg-cream px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Current unit</p>
            <p className="mt-1 text-sm font-semibold text-ink">{nextLesson.unitGoal}</p>
            <XPProgressBar value={nextLesson.unitProgress} label={nextLesson.unitProgressLabel ?? "Unit progress"} className="mt-3" />
          </div>
        )}
        <div className="mt-3 grid gap-2 text-xs font-semibold text-ink-muted">
          <TrustNote label={`Written for ${nextLesson?.level ?? selectedLevel} learners`} />
          <TrustNote label={`${selectedLevel} score: ${levelScore} points, tier ${bandNumber(levelScore)}`} />
          <TrustNote label="Your saved words stay on this device" />
          <TrustNote label="AI help is optional" />
        </div>
        <Link
          href={nextLesson?.href ?? "/articles"}
          className="mt-5 block rounded-full bg-brand px-5 py-3 shadow-raised text-center text-sm font-bold text-white active:scale-95"
        >
          {completedArticleCount === 0 ? "Start" : "Continue"}
        </Link>
        <Link href="/settings" className="mt-3 block text-center text-xs font-semibold text-ink-muted underline underline-offset-2">
          Change level
        </Link>
      </section>

      <section className="rounded-card bg-cream-card p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Today&apos;s path</p>
        <div className="mt-3 grid gap-2">
          <BeginnerStep done={completedArticleCount > 0} label={nextLesson?.unitTitle ? `Continue ${nextLesson.unitTitle}` : "Finish one lesson"} />
          <BeginnerStep done={savedLearningItems > 0} label="Save one word or phrase" />
          <BeginnerStep done={completedArticleCount > 1} label="Start the next lesson" />
        </div>
        <XPProgressBar value={scoreFill} label={`${selectedLevel} level score`} className="mt-4" />
      </section>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/articles" className="rounded-2xl bg-cream-card px-3 py-3 text-center text-sm font-bold text-ink shadow-card active:scale-95">
          Lessons
        </Link>
        <Link
          href={dueReviews > 0 ? "/review" : savedPhrases > 0 ? "/phrases" : "/settings"}
          className="rounded-2xl bg-cream-card px-3 py-3 text-center text-sm font-bold text-ink shadow-card active:scale-95"
        >
          {dueReviews > 0 ? "Review words" : savedPhrases > 0 ? "Review phrases" : `${selectedLevel} level`}
        </Link>
      </div>
    </div>
  );
}

function TrustNote({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-cream px-3 py-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand">
        OK
      </span>
      <span>{label}</span>
    </div>
  );
}

function BeginnerStep({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-cream px-3 py-2">
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"}`}>
        {done ? "OK" : ""}
      </span>
      <p className="text-sm font-semibold text-ink">{label}</p>
    </div>
  );
}

function DashboardCard({
  progressSnapshot,
  selectedLevel,
  stats,
  nextLesson,
  levelScore,
}: {
  progressSnapshot: ProgressSnapshot | null;
  selectedLevel: Difficulty;
  stats: {
    knownWords: number;
    savedWords: number;
    dueReviews: number;
  };
  nextLesson: NextLesson | null;
  levelScore: number;
}) {
  const dueMissions = progressSnapshot?.missions.filter((mission) => !mission.completed).length ?? 0;
  const totalXp = progressSnapshot?.level.totalXp ?? 0;
  const progress = progressSnapshot?.level.progress ?? 0;
  const levelScoreProgress = bandProgress(levelScore);

  const links = [
    { href: "/articles", label: "Lessons", icon: "book", meta: "Path" },
    { href: "/live-news", label: "News", icon: "news", meta: "Stretch" },
    { href: "/review", label: "Review", icon: "cards", meta: dueMissions > 0 ? `${dueMissions} tasks` : "Due" },
    { href: "/grammar", label: "Grammar", icon: "grammar", meta: "Verbs" },
    { href: "/words", label: "Words", icon: "bookmark", meta: "Saved" },
    { href: "/settings", label: "Change Level", icon: "level", meta: selectedLevel },
    { href: "/progress", label: "Progress", icon: "chart", meta: `${totalXp.toLocaleString()} XP` },
    { href: "/archive", label: "Lessons Read", icon: "archive", meta: "History" },
  ];

  return (
    <section className="mb-5 rounded-card bg-cream-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Reading level</p>
          <h2 className="mt-0.5 truncate text-lg font-extrabold text-ink">{selectedLevel} reading bank</h2>
        </div>
        <Link
          href="/settings"
          className="shrink-0 rounded-full bg-brand-light px-3 py-1 text-sm font-bold text-brand active:scale-95"
        >
          {selectedLevel}
        </Link>
      </div>

      <XPProgressBar value={progress} label={`${totalXp.toLocaleString()} XP`} className="mt-3" />

      <div className="mt-4 rounded-2xl bg-cream px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Today&apos;s win</p>
        <p className="mt-1 text-sm font-semibold text-ink">
          {nextLesson ? `${nextLesson.unitTitle ?? "Next lesson"}: ${nextLesson.title}` : "Start a lesson, save what matters, then review anything due."}
        </p>
        {nextLesson?.unitProgressLabel && (
          <XPProgressBar value={nextLesson.unitProgress} label={nextLesson.unitProgressLabel} className="mt-3" />
        )}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Metric label="Saved" value={stats.savedWords} />
          <Metric label={`${selectedLevel} score`} value={levelScore} />
          <Metric label="Due" value={stats.dueReviews} />
        </div>
        <XPProgressBar value={levelScoreProgress} label={`Tier ${bandNumber(levelScore)} progress`} className="mt-3" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="min-h-[72px] rounded-2xl bg-cream px-2.5 py-2.5 active:scale-95">
            <div className="flex items-center justify-between gap-2">
              <DashboardIcon kind={item.icon} className="h-5 w-5 text-brand" />
              <span className="truncate rounded-full bg-cream-dark px-1.5 py-0.5 text-xs font-bold text-ink-muted">
                {item.meta}
              </span>
            </div>
            <span className="mt-2 block truncate text-sm font-bold text-ink">{item.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-cream-card px-2 py-2">
      <p className="text-base font-extrabold text-ink">{value.toLocaleString()}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
    </div>
  );
}

function DashboardIcon({ kind, className }: { kind: string; className?: string }) {
  if (kind === "chart") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <path d="M4 19V5" />
        <path d="M8 19v-6" />
        <path d="M12 19V9" />
        <path d="M16 19v-9" />
        <path d="M20 19V4" />
      </svg>
    );
  }
  if (kind === "cards") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="6" width="14" height="12" rx="2" />
        <path d="M8 3h9a2 2 0 0 1 2 2v11" />
      </svg>
    );
  }
  if (kind === "level") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7z" />
        <path d="M9 13h6" />
        <path d="M12 10v6" />
      </svg>
    );
  }
  if (kind === "archive") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M4 7h16" />
        <rect x="5" y="7" width="14" height="13" rx="2" />
        <path d="M9 11h6" />
      </svg>
    );
  }
  if (kind === "bookmark") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
      </svg>
    );
  }
  if (kind === "grammar" || kind === "book") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M5 4h9a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4z" />
        <path d="M9 8h5" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h10" />
    </svg>
  );
}
