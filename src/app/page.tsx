"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ContinueReadingBanner from "@/components/ContinueReadingBanner";
import FirstRunOnboarding from "@/components/FirstRunOnboarding";
import { XPProgressBar } from "@/components/GamificationCards";
import ShortSnippetsBlock from "@/components/ShortSnippetsBlock";
import type { Difficulty } from "@/types";
import { buildProgressSnapshot, awardCompletedMissions, type ProgressSnapshot } from "@/lib/gamification";
import { getKnownWords } from "@/lib/knownWords";
import { getSelectedReadingLevel } from "@/lib/onboarding";
import { getReviewStats } from "@/lib/spacedRepetition";
import { getSavedWords } from "@/lib/storage";
import { subscribeToRecommendationPreferences } from "@/lib/recommendation/preferences";

export default function HomePage() {
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>("A2");
  const [progressSnapshot, setProgressSnapshot] = useState<ProgressSnapshot | null>(null);
  const [rewardNotice, setRewardNotice] = useState<string | null>(null);
  const [stats, setStats] = useState({
    knownWords: 0,
    savedWords: 0,
    dueReviews: 0,
  });

  function refreshDashboard(showRewards = false) {
    const savedWords = getSavedWords();
    const reviewStats = getReviewStats(savedWords);
    const rewards = awardCompletedMissions(undefined, savedWords);
    setSelectedLevel(getSelectedReadingLevel());
    setProgressSnapshot(buildProgressSnapshot(savedWords));
    setStats({
      knownWords: getKnownWords().length,
      savedWords: savedWords.filter((word) => word.status !== "known").length,
      dueReviews: reviewStats.dueToday + reviewStats.newWords,
    });
    if (showRewards && rewards.awardedXp > 0) {
      setRewardNotice(`+${rewards.awardedXp} XP from missions`);
      window.setTimeout(() => setRewardNotice(null), 2200);
    }
  }

  useEffect(() => {
    refreshDashboard(true);
    return subscribeToRecommendationPreferences(() => refreshDashboard());
  }, []);

  return (
    <div className="px-4 pt-6">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Lire</h1>
          <p className="text-sm text-ink-muted">Dashboard</p>
        </div>
        <Link
          href="/settings"
          className="rounded-full bg-cream-card px-3 py-2 text-xs font-bold text-ink-muted shadow-sm active:scale-95"
        >
          {selectedLevel}
        </Link>
      </header>

      {rewardNotice && (
        <div className="mb-4 rounded-2xl bg-brand-light px-3 py-2 text-sm font-semibold text-brand shadow-sm">
          {rewardNotice}
        </div>
      )}

      <DashboardCard progressSnapshot={progressSnapshot} selectedLevel={selectedLevel} stats={stats} />
      <ContinueReadingBanner />
      <ShortSnippetsBlock />
      <FirstRunOnboarding onComplete={() => refreshDashboard()} />
    </div>
  );
}

function DashboardCard({
  progressSnapshot,
  selectedLevel,
  stats,
}: {
  progressSnapshot: ProgressSnapshot | null;
  selectedLevel: Difficulty;
  stats: {
    knownWords: number;
    savedWords: number;
    dueReviews: number;
  };
}) {
  const dueMissions = progressSnapshot?.missions.filter((mission) => !mission.completed).length ?? 0;
  const totalXp = progressSnapshot?.level.totalXp ?? 0;
  const progress = progressSnapshot?.level.progress ?? 0;

  const links = [
    { href: "/articles", label: "Articles", icon: "book", meta: "Daily" },
    { href: "/live-news", label: "News", icon: "news", meta: "Live" },
    { href: "/review", label: "Review", icon: "cards", meta: dueMissions > 0 ? `${dueMissions} tasks` : "Due" },
    { href: "/grammar", label: "Grammar", icon: "grammar", meta: "Verbs" },
    { href: "/words", label: "Words", icon: "bookmark", meta: "Saved" },
    { href: "/settings", label: "Change Level", icon: "level", meta: selectedLevel },
    { href: "/progress", label: "Progress", icon: "chart", meta: `${totalXp.toLocaleString()} XP` },
    { href: "/archive", label: "Articles Read", icon: "archive", meta: "History" },
  ];

  return (
    <section className="mb-5 rounded-3xl bg-cream-card p-4 shadow-sm">
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
        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Today&apos;s plan</p>
        <p className="mt-1 text-sm font-semibold text-ink">
          Pick an article, keep translations low, then review anything due.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Metric label="Known" value={stats.knownWords} />
          <Metric label="Learning" value={stats.savedWords} />
          <Metric label="Due" value={stats.dueReviews} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="min-h-[72px] rounded-2xl bg-cream px-2.5 py-2.5 active:scale-95">
            <div className="flex items-center justify-between gap-2">
              <DashboardIcon kind={item.icon} className="h-5 w-5 text-brand" />
              <span className="truncate rounded-full bg-cream-dark px-1.5 py-0.5 text-[10px] font-bold text-ink-muted">
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
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
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
