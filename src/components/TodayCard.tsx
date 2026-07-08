"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSavedWords } from "@/lib/storage";
import { getAllProgress } from "@/lib/progress";
import { dateKey, getCurrentStreak } from "@/lib/habit";
import { getReviewStats } from "@/lib/spacedRepetition";

interface TodayStats {
  articlesCompletedToday: number;
  wordsSavedToday: number;
  dueReviewsToday: number;
  streak: number;
}

function computeTodayStats(): TodayStats {
  const today = dateKey();
  const words = getSavedWords();
  const wordsSavedToday = words.filter((w) => dateKey(new Date(w.savedAt)) === today).length;

  const progress = getAllProgress();
  const articlesCompletedToday = Object.values(progress).filter(
    (p) => p.completedAt && dateKey(new Date(p.completedAt)) === today
  ).length;

  const reviewStats = getReviewStats(words);

  return {
    articlesCompletedToday,
    wordsSavedToday,
    dueReviewsToday: reviewStats.dueToday + reviewStats.newWords,
    streak: getCurrentStreak(),
  };
}

/**
 * The home page's "Today" card: today's activity counts, current streak,
 * and a single clear next action. Lives entirely client-side (everything
 * it reads is in localStorage), so it renders a loading skeleton until
 * mounted rather than guessing at SSR-safe zeros.
 */
export default function TodayCard() {
  const [stats, setStats] = useState<TodayStats | null>(null);

  useEffect(() => {
    setStats(computeTodayStats());
  }, []);

  if (!stats) {
    return <div className="mb-5 h-32 animate-pulse rounded-3xl bg-cream-dark" />;
  }

  // "Continue reading" gets its own prominent banner above this card (see
  // ContinueReadingBanner.tsx) rather than being repeated here too.
  let action: { label: string; href: string } | null = null;
  let hint: string | null = null;

  if (stats.dueReviewsToday > 0) {
    action = { label: "Review due words", href: "/review" };
  } else if (stats.articlesCompletedToday === 0) {
    hint = "Today's reading is below ↓";
  } else {
    hint = "All caught up for today 🎉";
  }

  return (
    <div className="relative mb-5 rounded-3xl bg-cream-card p-4 shadow-sm">
      {stats.streak > 0 && (
        <span
          className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-extrabold text-white shadow-sm"
          title={`${stats.streak}-day streak`}
        >
          {stats.streak}
        </span>
      )}

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xl font-extrabold text-ink">{stats.articlesCompletedToday}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Read today</p>
        </div>
        <div>
          <p className="text-xl font-extrabold text-ink">{stats.wordsSavedToday}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Saved today</p>
        </div>
        <div>
          <p className="text-xl font-extrabold text-ink">{stats.dueReviewsToday}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Due reviews</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        {action ? (
          <Link
            href={action.href}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white active:scale-95"
          >
            {action.label}
          </Link>
        ) : (
          <p className="text-sm text-ink-muted">{hint}</p>
        )}
        <Link href="/archive" className="text-xs font-semibold text-ink-muted underline underline-offset-2">
          Reading history →
        </Link>
      </div>
    </div>
  );
}
