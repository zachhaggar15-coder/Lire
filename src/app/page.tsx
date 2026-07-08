"use client";

import { useEffect, useState } from "react";
import ReadingCard from "@/components/ReadingCard";
import { texts as hardcodedTexts } from "@/data/texts";
import type { Category, Difficulty, ReadingText } from "@/types";
import type { RssReadingText } from "@/lib/rss/rssToReadingText";
import { rssReadingTextToReadingText } from "@/lib/rss/adaptReadingText";
import { cacheRssTexts } from "@/lib/rss/rssTextCache";
import { pruneStaleRssProgress } from "@/lib/progress";

type LoadState = "loading" | "success" | "empty" | "error";
type CategoryFilter = "all" | Category;
type DifficultyFilter = "all" | Difficulty;

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "news-style", label: "News" },
  { value: "sport", label: "Sport" },
  { value: "culture", label: "Culture" },
  { value: "science", label: "Science" },
  { value: "everyday life", label: "Everyday life" },
];

const DIFFICULTY_OPTIONS: { value: DifficultyFilter; label: string }[] = [
  { value: "all", label: "All levels" },
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
];

export default function HomePage() {
  const [rssTexts, setRssTexts] = useState<ReadingText[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/rss-texts");
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);

        const data: { texts: RssReadingText[] } = await res.json();
        if (cancelled) return;

        const mapped = data.texts.map(rssReadingTextToReadingText);
        if (mapped.length === 0) {
          setState("empty");
          return;
        }

        cacheRssTexts(mapped);
        // Drop progress for RSS ids that have rotated out of the feed, so
        // lire.progress.v1 doesn't grow forever as headlines come and go.
        pruneStaleRssProgress(mapped.map((t) => t.id));
        setRssTexts(mapped);
        setState("success");
      } catch {
        if (!cancelled) setState("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const showingRss = state === "success";
  const displayedTexts = showingRss ? rssTexts : hardcodedTexts;
  const filteredTexts = displayedTexts.filter(
    (t) =>
      (categoryFilter === "all" || t.category === categoryFilter) &&
      (difficultyFilter === "all" || t.difficulty === difficultyFilter)
  );

  return (
    <div className="px-4 pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Lire
        </h1>
        <p className="text-sm text-slate-500">
          Read short French texts. Tap words you don&apos;t know.
        </p>
      </header>

      {state === "loading" && (
        <div className="space-y-4" aria-label="Loading articles">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      )}

      {(state === "error" || state === "empty") && (
        <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          Couldn&apos;t load today&apos;s articles — showing saved texts instead.
        </p>
      )}

      {state !== "loading" && (
        <>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
              {showingRss ? "Today's readings" : "Saved readings"}
            </h2>
            <span className="text-xs text-slate-400">
              {filteredTexts.length} {filteredTexts.length === 1 ? "text" : "texts"}
            </span>
          </div>

          <div className="mb-2 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCategoryFilter(opt.value)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                  categoryFilter === opt.value
                    ? "bg-brand text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="mb-4 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDifficultyFilter(opt.value)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  difficultyFilter === opt.value
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {filteredTexts.length === 0 ? (
            <p className="mt-10 text-center text-sm text-slate-400">
              No texts match these filters.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredTexts.map((text) => (
                <ReadingCard key={text.id} text={text} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
