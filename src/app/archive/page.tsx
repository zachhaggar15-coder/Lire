"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getArchive, estimateTimeSpentMinutes, type ArchiveEntry } from "@/lib/archive";
import { getSavedWords } from "@/lib/storage";
import { formatDate } from "@/lib/format";

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

export default function ArchivePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");

  useEffect(() => {
    const entries = getArchive();
    const words = getSavedWords();
    const built = entries.map((entry) => ({
      entry,
      wordsSaved: words.filter((w) => w.sourceTextTitle === entry.title).length,
      minutesSpent: estimateTimeSpentMinutes(entry),
    }));
    setRows(built);
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
        ← Today
      </Link>

      <header className="mb-4 mt-2">
        <h1 className="text-2xl font-extrabold text-ink">Reading history</h1>
        <p className="text-sm text-ink-muted">Every article you&apos;ve marked as completed.</p>
      </header>

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
