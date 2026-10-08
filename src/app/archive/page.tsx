"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getArchive, estimateTimeSpentMinutes, MAX_ARCHIVE_ENTRIES, type ArchiveEntry } from "@/lib/archive";
import { getSavedWords } from "@/lib/storage";
import { getTextById } from "@/data/texts";
import { getCustomTextById } from "@/lib/customTexts";
import { editorialLevel } from "@/lib/readingLevel";
import { formatCategory, formatDate } from "@/lib/format";
import { getCurrentStreak, getLongestStreak } from "@/lib/habit";
import AppBar from "@/components/AppBar";

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
  /** Snapshot from completion; null on entries recorded before snapshots existed. */
  wordsSaved: number | null;
  /** Active reading minutes; null when not recorded (older entries). */
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

  useEffect(() => {
    const now = new Date();
    const weekAgoMs = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const entries = getArchive();
    const words = getSavedWords();
    const built = entries.map((entry) => ({
      entry,
      wordsSaved: typeof entry.savedWordCount === "number" ? entry.savedWordCount : null,
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
          return (b.wordsSaved ?? -1) - (a.wordsSaved ?? -1);
        case "difficulty":
          return (CEFR_ORDER[historyLevel(b.entry) ?? ""] ?? 0) - (CEFR_ORDER[historyLevel(a.entry) ?? ""] ?? 0);
        case "date":
        default:
          return new Date(b.entry.completedAt).getTime() - new Date(a.entry.completedAt).getTime();
      }
    });
  }, [rows, query, sortKey]);

  return (
    <div className="ligne-screen">
      <AppBar title="Reading history" kicker="Library" backHref="/settings" backLabel="Back to You" />
      <p className="-mt-3 mb-5 text-sm text-ink-muted">Your most recent completed readings (up to {MAX_ARCHIVE_ENTRIES}).</p>

      {summary && (
        <section className="mb-5 rounded-card bg-cream-card p-4 shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Last 7 days</h2>
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
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{stat.label}</p>
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

      {ready && rows.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-ink-muted">No completed articles yet.</p>
          <Link
            href="/"
            className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 shadow-raised text-sm font-semibold text-cream"
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
              aria-label="Search reading history"
              className="w-full rounded-2xl bg-cream-card px-3 py-2 text-sm text-ink shadow-card"
            />
            <div className="flex flex-wrap gap-1.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSortKey(opt.key)}
                  aria-pressed={sortKey === opt.key}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    sortKey === opt.key ? "bg-brand text-cream" : "bg-cream-dark text-ink-muted"
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
                <li key={entry.textId} className="rounded-card bg-cream-card p-4 shadow-card">
                  <p className="font-bold leading-snug text-ink">{entry.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
                    {entry.sourceName && (
                      <span className="rounded-full bg-cream-dark px-2 py-0.5 font-medium text-ink-muted">
                        {entry.sourceName}
                      </span>
                    )}
                    {historyLevel(entry) && (
                      <span className="rounded-full bg-brand-light px-2 py-0.5 font-medium text-brand">
                        {historyLevel(entry)}
                      </span>
                    )}
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
                      100% complete
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                    <span>Completed {formatDate(entry.completedAt)}</span>
                    {minutesSpent !== null ? (
                      <span>· {minutesSpent} min reading</span>
                    ) : entry.minutes ? (
                      <span>· about {entry.minutes} min</span>
                    ) : null}
                    {!!wordsSaved && (
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

/**
 * The reading's assigned level, looked up by id. Earlier builds stored the
 * content estimate here, which is not a level (lib/readingLevel.ts), so the
 * stored value is not shown; news, and readings no longer on this device,
 * show none. The history record itself is left as it was.
 */
function historyLevel(entry: ArchiveEntry): string | null {
  const text = getTextById(entry.textId) ?? getCustomTextById(entry.textId);
  return text ? editorialLevel(text) : null;
}
