"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ArticleSection from "@/components/ArticleSection";
import ReadingCard from "@/components/ReadingCard";
import TodayCard from "@/components/TodayCard";
import ContinueReadingBanner from "@/components/ContinueReadingBanner";
import ReadingGoalsCard from "@/components/ReadingGoalsCard";
import { texts as hardcodedTexts } from "@/data/texts";
import type { Category, Difficulty, ReadingText } from "@/types";
import type { RssReadingText } from "@/lib/rss/rssToReadingText";
import { rssReadingTextToReadingText } from "@/lib/rss/adaptReadingText";
import { cacheRssTexts } from "@/lib/rss/rssTextCache";
import { pruneStaleRssProgress } from "@/lib/progress";
import { getKnownWords } from "@/lib/knownWords";
import FirstRunOnboarding from "@/components/FirstRunOnboarding";
import {
  buildScorableArticles,
  buildScoringContext,
  buildSections,
  detectAndRecordSkippedArticles,
  rankArticles,
  type RecommendationSections,
  type ScoredArticle,
} from "@/lib/recommendation";
import {
  getHiddenSources,
  getSavedLaterIds,
  subscribeToRecommendationPreferences,
} from "@/lib/recommendation/preferences";

type LoadState = "loading" | "success" | "error";
type CategoryFilter = "all" | Category;
type DifficultyFilter = "all" | Difficulty;

/** How many RSS candidates to pull in for the recommendation engine to choose from — much more than the 5 actually shown, so every section has real options. */
const POOL_LIMIT = 50;
/** Below this many real RSS candidates, hardcoded texts top up the pool. */
const MIN_POOL_SIZE = 5;

/** Only present in non-production responses — see /api/rss-texts/route.ts. */
interface RssDebugInfo {
  feedsSucceeded: number;
  feedsFailed: number;
  itemsRejected: number;
  candidatePoolSize: number;
  candidatePoolBuiltAt: string;
  selectedIds: string[];
  seed: string;
  sourceHealth?: Array<{
    id: string;
    name: string;
    language: string;
    ok: boolean;
    skipped: boolean;
    accepted: number;
    rejected: number;
    reason: string;
  }>;
}

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "news-style", label: "News" },
  { value: "sport", label: "Sport" },
  { value: "culture", label: "Culture" },
  { value: "science", label: "Science" },
  { value: "everyday life", label: "Life" },
];

const DIFFICULTY_FILTERS: { value: DifficultyFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
];

export default function HomePage() {
  const [state, setState] = useState<LoadState>("loading");
  const [sections, setSections] = useState<RecommendationSections | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [debug, setDebug] = useState<RssDebugInfo | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [prefVersion, setPrefVersion] = useState(0);
  const [savedLaterArticles, setSavedLaterArticles] = useState<ScoredArticle[]>([]);
  const lastRefreshSent = useRef(0);

  useEffect(() => subscribeToRecommendationPreferences(() => setPrefVersion((version) => version + 1)), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setState("loading");
        const params = new URLSearchParams({ limit: String(POOL_LIMIT) });
        const forceRefresh = refreshKey > 0 && lastRefreshSent.current !== refreshKey;
        if (categoryFilter !== "all") params.set("category", categoryFilter);
        if (forceRefresh) params.set("refresh", "true");

        const res = await fetch(`/api/rss-texts?${params.toString()}`);
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);

        const data: { texts: RssReadingText[]; fewerThanRequested?: boolean; debug?: RssDebugInfo } =
          await res.json();
        if (cancelled) return;

        const rssTexts = data.texts.map(rssReadingTextToReadingText);
        cacheRssTexts(rssTexts);
        // Drop progress for RSS ids that have rotated out of the pool, so
        // lire.progress.v1 doesn't grow forever.
        pruneStaleRssProgress(rssTexts.map((t) => t.id));
        // Automatically learns topic interests from what got shown but
        // never opened yesterday — see src/lib/recommendation/interests.ts.
        detectAndRecordSkippedArticles(rssTexts.map((t) => ({ id: t.id, category: t.category })));

        const hiddenSources = new Set(getHiddenSources());
        const usingFallback = rssTexts.length < MIN_POOL_SIZE;
        const pool: ReadingText[] = (usingFallback
          ? [...rssTexts, ...hardcodedTexts.slice(0, MIN_POOL_SIZE - rssTexts.length)]
          : rssTexts
        ).filter((text) => !text.sourceName || !hiddenSources.has(text.sourceName));

        const knownWords = new Set(getKnownWords());
        const scorable = buildScorableArticles(pool, knownWords);
        const context = buildScoringContext();
        const ranked = rankArticles(scorable, context);
        const savedIds = new Set(getSavedLaterIds());
        const filtered = ranked.filter((article) => {
          if (categoryFilter !== "all" && article.text.category !== categoryFilter) return false;
          if (difficultyFilter !== "all" && article.difficulty.cefr !== difficultyFilter) return false;
          return true;
        });

        setSections(buildSections(filtered));
        setSavedLaterArticles(ranked.filter((article) => savedIds.has(article.text.id)));
        setUsedFallback(usingFallback);
        setDebug(data.debug ?? null);
        if (forceRefresh) lastRefreshSent.current = refreshKey;
        setState("success");
      } catch {
        if (!cancelled) {
          // Total failure (network error, etc.) — fall back to an
          // all-hardcoded, unranked-but-still-sectioned pool so the page
          // never shows nothing.
          const knownWords = new Set(getKnownWords());
          const scorable = buildScorableArticles(
            hardcodedTexts.filter((text) => !text.sourceName || !getHiddenSources().includes(text.sourceName)),
            knownWords
          );
          const ranked = rankArticles(scorable, buildScoringContext()).filter((article) => {
            if (categoryFilter !== "all" && article.text.category !== categoryFilter) return false;
            if (difficultyFilter !== "all" && article.difficulty.cefr !== difficultyFilter) return false;
            return true;
          });
          setSections(buildSections(ranked));
          setSavedLaterArticles(ranked.filter((article) => getSavedLaterIds().includes(article.text.id)));
          setUsedFallback(true);
          setState("success");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [categoryFilter, difficultyFilter, refreshKey, prefVersion]);

  const hasArticles =
    !!sections &&
    !!(
      sections.todaysRecommendation ||
      sections.goodForYou.length ||
      sections.quickReads.length ||
      sections.stretchYourself.length ||
      sections.newVocabulary.length ||
      sections.latestNews.length ||
      sections.saveForLater.length ||
      savedLaterArticles.length
    );

  function resetFilters() {
    setCategoryFilter("all");
    setDifficultyFilter("all");
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Lire</h1>
        <p className="text-sm text-ink-muted">
          Read short French texts. Tap words you don&apos;t know.
        </p>
      </header>

      <ContinueReadingBanner />
      <TodayCard />
      <ReadingGoalsCard />
      <FirstRunOnboarding onComplete={() => setPrefVersion((version) => version + 1)} />

      <section className="mb-5 rounded-3xl bg-cream-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Tune today's shelf</h2>
            <p className="mt-0.5 text-xs text-ink-muted">Filter articles or refresh the RSS pool.</p>
          </div>
          <button
            onClick={() => setRefreshKey((key) => key + 1)}
            className="shrink-0 rounded-full bg-brand px-3 py-2 text-xs font-semibold text-white active:scale-95"
          >
            Refresh
          </button>
          {(categoryFilter !== "all" || difficultyFilter !== "all") && (
            <button
              onClick={resetFilters}
              className="shrink-0 rounded-full bg-cream-dark px-3 py-2 text-xs font-semibold text-ink-muted active:scale-95"
            >
              Reset
            </button>
          )}
        </div>

        <div className="mt-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Topic</p>
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {CATEGORY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setCategoryFilter(filter.value)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  categoryFilter === filter.value ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Level</p>
          <div className="flex flex-wrap gap-1">
            {DIFFICULTY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setDifficultyFilter(filter.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  difficultyFilter === filter.value ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {state === "loading" && (
        <div className="space-y-4" aria-label="Loading articles">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-cream-dark" />
          ))}
        </div>
      )}

      {state === "error" && (
        <p className="mb-4 rounded-2xl bg-accent-pink px-3 py-2 text-xs font-medium text-accent-pinktext">
          Couldn&apos;t load today&apos;s articles — showing saved texts instead.
        </p>
      )}

      {state === "success" && usedFallback && (
        <p className="mb-4 rounded-2xl bg-accent-pink px-3 py-2 text-xs font-medium text-accent-pinktext">
          Some RSS articles were skipped because they were too short or not in
          French — showing saved texts to fill the rest.
        </p>
      )}

      {state === "success" && sections && hasArticles && (
        <>
          {sections.todaysRecommendation && (
            <section className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">
                Today&apos;s Recommendation
              </h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                The single best match for you right now.
              </p>
              <div className="mt-3">
                <ReadingCard
                  text={sections.todaysRecommendation.text}
                  difficulty={sections.todaysRecommendation.difficulty}
                  starRating={sections.todaysRecommendation.starRating}
                />
              </div>
            </section>
          )}

          <ArticleSection
            title="Good For You"
            subtitle="Right in your ideal challenge zone."
            articles={sections.goodForYou}
          />
          <ArticleSection title="Quick Reads" subtitle="2-4 minutes." articles={sections.quickReads} />
          <ArticleSection
            title="Stretch Yourself"
            subtitle="A bit harder than usual."
            articles={sections.stretchYourself}
          />
          <ArticleSection
            title="New Vocabulary"
            subtitle="Likely to teach you several new words."
            articles={sections.newVocabulary}
          />
          <ArticleSection title="Latest News" subtitle="Freshest first." articles={sections.latestNews} />
          <ArticleSection title="Saved For Later" subtitle="Articles you marked for another session." articles={savedLaterArticles} />

          {sections.saveForLater.length > 0 && (
            <details className="mb-6 rounded-3xl border border-dashed border-cream-dark p-3">
              <summary className="cursor-pointer text-sm font-semibold text-ink-muted">
                Save for later ({sections.saveForLater.length}) — above your level for today
              </summary>
              <div className="mt-3 space-y-4">
                {sections.saveForLater.map((article) => (
                  <ReadingCard
                    key={article.text.id}
                    text={article.text}
                    difficulty={article.difficulty}
                    starRating={article.starRating}
                  />
                ))}
              </div>
            </details>
          )}

          <p className="mb-2 text-center text-xs text-ink-muted">
            <Link href="/archive" className="underline underline-offset-2">
              View reading history
            </Link>
          </p>

          {process.env.NODE_ENV !== "production" && debug && (
            <details className="mt-2 rounded-2xl bg-cream-dark p-3 text-xs text-ink-muted">
              <summary className="cursor-pointer font-semibold text-ink-muted">
                Debug: RSS selection (dev only)
              </summary>
              <ul className="mt-2 space-y-0.5">
                <li>Feeds succeeded: {debug.feedsSucceeded}</li>
                <li>Feeds failed: {debug.feedsFailed}</li>
                <li>Items rejected (language/quality): {debug.itemsRejected}</li>
                <li>Candidate pool size: {debug.candidatePoolSize}</li>
                <li>Pool built at: {debug.candidatePoolBuiltAt}</li>
                <li>Seed: {debug.seed}</li>
              </ul>
              {debug.sourceHealth && (
                <div className="mt-3 border-t border-ink-muted/20 pt-2">
                  <p className="font-semibold text-ink-muted">
                    Source health: {debug.sourceHealth.filter((s) => !s.skipped).length} attempted,{" "}
                    {debug.sourceHealth.filter((s) => s.accepted > 0).length} yielded articles
                  </p>
                  <ul className="mt-2 space-y-1">
                    {debug.sourceHealth
                      .filter((source) => !source.skipped && (!source.ok || source.accepted === 0 || source.rejected > 0))
                      .slice(0, 12)
                      .map((source) => (
                        <li key={source.id} className="rounded-xl bg-cream/60 px-2 py-1">
                          <span className="font-semibold text-ink">{source.name}</span>
                          {" - "}
                          {source.accepted} accepted, {source.rejected} rejected
                          {" - "}
                          {source.reason}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </details>
          )}
        </>
      )}

      {state === "success" && sections && !hasArticles && (
        <div className="rounded-3xl bg-cream-card p-5 text-center shadow-sm">
          <p className="text-sm font-semibold text-ink">No articles match those filters.</p>
          <p className="mt-1 text-xs text-ink-muted">Try another topic or level.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white active:scale-95"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
