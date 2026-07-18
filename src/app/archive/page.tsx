"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getArchive, estimateTimeSpentMinutes, type ArchiveEntry } from "@/lib/archive";
import { getSavedWords } from "@/lib/storage";
import { formatCategory, formatDate } from "@/lib/format";
import { getCurrentStreak, getLongestStreak } from "@/lib/habit";
import { getKnownWords } from "@/lib/knownWords";
import { getTranslationBudgetRecords } from "@/lib/readingInsights";
import {
  buildCategoryProficiency,
  buildWeeklyReadingReport,
  type CategoryProficiency,
  type WeeklyReadingReport,
} from "@/lib/readingAnalytics";

type SortKey = "date" | "time" | "words" | "difficulty";

const CEFR_ORDER: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "time", label: "Time spent" },
  { key: "words", label: "Words saved" },
  { key: "difficulty", label: "Difficulty" },
];

interface Row {
  entry: ArchiveEntry;
  wordsSaved: number;
  minutesSpent: number | null;
}

interface ArchiveSummary {
  weekArticles: number;
  weekMinutes: number;
  weekWords: number;
  weekReviews: number;
  currentStreak: number;
  longestStreak: number;
  topCategory: string | null;
}

export default function ArchivePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [summary, setSummary] = useState<ArchiveSummary | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReadingReport | null>(null);
  const [categoryProficiency, setCategoryProficiency] = useState<CategoryProficiency[]>([]);

  useEffect(() => {
    const now = new Date();
    const weekAgoMs = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const entries = getArchive();
    const words = getSavedWords();
    const knownWords = getKnownWords();
    const built = entries.map((entry) => ({
      entry,
      wordsSaved: words.filter((w) => w.sourceTextTitle === entry.title).length,
      minutesSpent: estimateTimeSpentMinutes(entry),
    }));
    const weekRows = built.filter(({ entry }) => new Date(entry.completedAt).getTime() >= weekAgoMs);
    const categoryCounts = new Map<string, number>();
    for (const { entry } of weekRows) {
      if (!entry.category) continue;
      categoryCounts.set(entry.category, (categoryCounts.get(entry.category) ?? 0) + 1);
    }
    const topCategory = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    setRows(built);
    setSummary({
      weekArticles: weekRows.length,
      weekMinutes: Math.round(
        weekRows.reduce((sum, row) => sum + (row.minutesSpent ?? row.entry.minutes ?? 0), 0)
      ),
      weekWords: weekRows.reduce(
        (sum, row) => sum + (typeof row.entry.wordCount === "number" ? row.entry.wordCount : Math.max(120, (row.entry.minutes ?? 2) * 170)),
        0
      ),
      weekReviews: words.filter((w) => w.lastReviewedAt && new Date(w.lastReviewedAt).getTime() >= weekAgoMs).length,
      currentStreak: getCurrentStreak(now),
      longestStreak: getLongestStreak(),
      topCategory: topCategory ? formatCategory(topCategory) : null,
    });
    setWeeklyReport(buildWeeklyReadingReport(entries, words, knownWords, getTranslationBudgetRecords(), now));
    setCategoryProficiency(buildCategoryProficiency(entries, knownWords));
    setReady(true);
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? rows.filter(
          ({ entry }) =>
            entry.title.toLowerCase().includes(q) || (entry.sourceName ?? "").toLowerCase().includes(q)
        )
      : rows;

    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "time":
          return (b.minutesSpent ?? -1) - (a.minutesSpent ?? -1);
        case "words":
          return b.wordsSaved - a.wordsSaved;
        case "difficulty":
          return (CEFR_ORDER[b.entry.cefr ?? ""] ?? 0) - (CEFR_ORDER[a.entry.cefr ?? ""] ?? 0);
        case "date":
        default:
          return new Date(b.entry.completedAt).getTime() - new Date(a.entry.completedAt).getTime();
      }
    });
  }, [rows, query, sortKey]);

  return (
    <div className="px-4 pt-6">
      <Link href="/" className="text-sm font-semibold text-brand">
        Back to home
      </Link>

      <header className="mb-4 mt-2">
        <h1 className="text-2xl font-extrabold text-ink">Articles read</h1>
        <p className="text-sm text-ink-muted">Every article you&apos;ve marked as completed.</p>
      </header>

      {summary && (
        <section className="mb-5 rounded-3xl bg-cream-card p-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Last 7 days</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Articles", value: summary.weekArticles },
              { label: "Minutes", value: summary.weekMinutes },
              { label: "Words", value: summary.weekWords },
              { label: "Reviews", value: summary.weekReviews },
              { label: "Streak", value: summary.currentStreak },
              { label: "Best", value: summary.longestStreak },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-cream p-2.5">
                <p className="text-lg font-extrabold text-ink">{stat.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{stat.label}</p>
              </div>
            ))}
          </div>
          {summary.topCategory && (
            <p className="mt-3 text-xs text-ink-muted">
              Most-read topic this week: <span className="font-semibold text-ink">{summary.topCategory}</span>
            </p>
          )}
        </section>
      )}

      {weeklyReport && (
        <section className="mb-5 rounded-3xl bg-cream-card p-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">This week</h2>
          <div className="mt-3 space-y-2 text-sm text-ink">
            <p>{weeklyReport.articlesCompleted} articles completed</p>
            <p>{weeklyReport.frenchWordsRead.toLocaleString()} French words read</p>
            <p>
              Vocabulary coverage increased from {weeklyReport.coverageStart}% to {weeklyReport.coverageEnd}%
            </p>
            <p>{weeklyReport.movedToStable} words moved to stable</p>
            <p>Most difficult area: {weeklyReport.mostDifficultArea ?? "not enough data yet"}</p>
            <p>Strongest topic: {weeklyReport.strongestTopic ?? "not enough data yet"}</p>
            <p>Next focus: {weeklyReport.nextFocus ?? "complete one article to unlock a useful suggestion"}</p>
            {weeklyReport.translationBudgetTotal > 0 && (
              <p>
                Translation budget met on {weeklyReport.translationBudgetMet}/{weeklyReport.translationBudgetTotal} completed articles
              </p>
            )}
          </div>
        </section>
      )}

      {categoryProficiency.length > 0 && (
        <section className="mb-5 rounded-3xl bg-cream-card p-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Topic proficiency</h2>
          <div className="mt-3 space-y-2">
            {categoryProficiency.map((item) => (
              <div key={item.category} className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-ink">{item.label}</p>
                  <p className="text-xs text-ink-muted">{item.articles} completed - {item.coverage}% coverage</p>
                </div>
                <span className="rounded-full bg-brand-light px-3 py-1 text-sm font-bold text-brand">{item.cefr}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {ready && rows.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-ink-muted">No completed articles yet.</p>
          <Link
            href="/"
            className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white active:scale-95"
          >
            Start reading
          </Link>
        </div>
      )}

      {ready && rows.length > 0 && (
        <>
          <div className="mb-4 space-y-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or source…"
              className="w-full rounded-2xl bg-cream-card px-3 py-2 text-sm text-ink shadow-sm"
            />
            <div className="flex flex-wrap gap-1.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortKey(opt.key)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    sortKey === opt.key ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="mt-10 text-center text-sm text-ink-muted">No matches for &quot;{query}&quot;.</p>
          ) : (
            <ul className="space-y-3">
              {visible.map(({ entry, wordsSaved, minutesSpent }) => (
                <li key={entry.textId} className="rounded-3xl bg-cream-card p-4 shadow-sm">
                  <p className="font-bold leading-snug text-ink">{entry.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
                    {entry.sourceName && (
                      <span className="rounded-full bg-cream-dark px-2 py-0.5 font-medium text-ink-muted">
                        {entry.sourceName}
                      </span>
                    )}
                    {entry.cefr && (
                      <span className="rounded-full bg-brand-light px-2 py-0.5 font-medium text-brand">
                        {entry.cefr}
                      </span>
                    )}
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
                      100% complete
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                    <span>Completed {formatDate(entry.completedAt)}</span>
                    {minutesSpent !== null && <span>· {minutesSpent} min spent</span>}
                    {wordsSaved > 0 && (
                      <span>
                        · {wordsSaved} {wordsSaved === 1 ? "word" : "words"} saved
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
