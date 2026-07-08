"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSavedWords } from "@/lib/storage";
import { getAllProgress, getLastOpenedTextId } from "@/lib/progress";
import { dateKey, getCurrentStreak } from "@/lib/habit";
import { getReviewStats } from "@/lib/spacedRepetition";

interface TodayStats {
  articlesCompletedToday: number;
  wordsSavedToday: number;
  dueReviewsToday: number;
  streak: number;
  hasOpenedButNotCompletedToday: boolean;
  lastOpenedTextId: string | null;
}

function computeTodayStats(): TodayStats {
  const today = dateKey();
  const words = getSavedWords();
  const wordsSavedToday = words.filter((w) => dateKey(new Date(w.savedAt)) === today).length;

  const progress = getAllProgress();
  let articlesCompletedToday = 0;
  let hasOpenedButNotCompletedToday = false;
  for (const p of Object.values(progress)) {
    if (p.completedAt && dateKey(new Date(p.completedAt)) === today) {
      articlesCompletedToday++;
    } else if (p.status === "in-progress" && p.openedAt && dateKey(new Date(p.openedAt)) === today) {
      hasOpenedButNotCompletedToday = true;
    }
  }

  const reviewStats = getReviewStats(words);

  return {
    articlesCompletedToday,
    wordsSavedToday,
    dueReviewsToday: reviewStats.dueToday + reviewStats.newWords,
    streak: getCurrentStreak(),
    hasOpenedButNotCompletedToday,
    lastOpenedTextId: getLastOpenedTextId(),
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
    return <div className="mb-5 h-32 animate-pulse rounded-2xl bg-slate-100" />;
  }

  let action: { label: string; href: string } | null = null;
  let hint: string | null = null;

  if (stats.hasOpenedButNotCompletedToday && stats.articlesCompletedToday === 0 && stats.lastOpenedTextId) {
    action = { label: "Continue reading", href: `/reader/${stats.lastOpenedTextId}` };
  } else if (stats.dueReviewsToday > 0) {
    action = { label: "Review due words", href: "/review" };
  } else if (stats.articlesCompletedToday === 0) {
    hint = "Today's reading is below ↓";
  } else {
    hint = "All caught up for today 🎉";
  }

  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Today</h2>
        {stats.streak > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            🔥 {stats.streak}-day streak
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-extrabold text-slate-900">{stats.articlesCompletedToday}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Read today</p>
        </div>
        <div>
          <p className="text-lg font-extrabold text-slate-900">{stats.wordsSavedToday}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Saved today</p>
        </div>
        <div>
          <p className="text-lg font-extrabold text-slate-900">{stats.dueReviewsToday}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Due reviews</p>
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
          <p className="text-sm text-slate-500">{hint}</p>
        )}
        <Link href="/archive" className="text-xs font-semibold text-slate-400 underline underline-offset-2">
          Reading history →
        </Link>
      </div>
    </div>
  );
}
