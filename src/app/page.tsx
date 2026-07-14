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
import { getSavedWords } from "@/lib/storage";
import { getAllWordTaps } from "@/lib/wordLearning";
import {
  buildContextualReviewArticles,
  buildTodayNewsWords,
  type ContextualReviewArticle,
  type TodayNewsWord,
} from "@/lib/readingAnalytics";
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
type LanguageFilter = "all" | NonNullable<ReadingText["language"]>;

/** How many RSS candidates to pull in for the recommendation engine to choose from — much more than the 5 actually shown, so every section has real options. */
const POOL_LIMIT = 50;
/** Below this many real RSS candidates, hardcoded texts top up the pool. */
const MIN_POOL_SIZE = 5;

/** Always present — see /api/rss-texts/route.ts. Cheap enough to send every load, unlike the verbose debug/health payloads below. */
interface FeedHealth {
  feedsSucceeded: number;
  feedsFailed: number;
}

/** Below this many attempted feeds, a bad ratio is just noise (too small a sample to mean anything). */
const MIN_FEEDS_FOR_HEALTH_CHECK = 10;
/** Above this failure fraction, tell the reader why variety might look thin today instead of leaving it unexplained. */
const DEGRADED_FEED_FAILURE_RATIO = 0.3;

function isFeedHealthDegraded(health: FeedHealth | null): boolean {
  if (!health) return false;
  const total = health.feedsSucceeded + health.feedsFailed;
  if (total < MIN_FEEDS_FOR_HEALTH_CHECK) return false;
  return health.feedsFailed / total > DEGRADED_FEED_FAILURE_RATIO;
}

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

const LANGUAGE_FILTERS: { value: LanguageFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "fr", label: "French" },
  { value: "mixed", label: "Mixed" },
  { value: "en", label: "English" },
];

function articleLanguage(text: ReadingText): NonNullable<ReadingText["language"]> {
  return text.language ?? "fr";
}

export default function HomePage() {
  const [state, setState] = useState<LoadState>("loading");
  const [sections, setSections] = useState<RecommendationSections | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [debug, setDebug] = useState<RssDebugInfo | null>(null);
  const [feedHealth, setFeedHealth] = useState<FeedHealth | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [prefVersion, setPrefVersion] = useState(0);
  const [savedLaterArticles, setSavedLaterArticles] = useState<ScoredArticle[]>([]);
  const [todayWords, setTodayWords] = useState<TodayNewsWord[]>([]);
  const [contextualReviewArticles, setContextualReviewArticles] = useState<ContextualReviewArticle[]>([]);
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
        if (languageFilter !== "all") params.set("language", languageFilter);
        if (forceRefresh) params.set("refresh", "true");

        const res = await fetch(`/api/rss-texts?${params.toString()}`);
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);

        const data: {
          texts: RssReadingText[];
          fewerThanRequested?: boolean;
          debug?: RssDebugInfo;
          feedHealth?: FeedHealth;
        } = await res.json();
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
        const savedWords = getSavedWords();
        const wordTaps = getAllWordTaps();
        const scorable = buildScorableArticles(pool, knownWords);
        const context = buildScoringContext();
        const ranked = rankArticles(scorable, context);
        const savedIds = new Set(getSavedLaterIds());
        const filtered = ranked.filter((article) => {
          if (categoryFilter !== "all" && article.text.category !== categoryFilter) return false;
          if (difficultyFilter !== "all" && article.difficulty.cefr !== difficultyFilter) return false;
          if (languageFilter !== "all" && articleLanguage(article.text) !== languageFilter) return false;
          return true;
        });

        setSections(buildSections(filtered));
        setSavedLaterArticles(ranked.filter((article) => savedIds.has(article.text.id)));
        setTodayWords(buildTodayNewsWords(pool));
        setContextualReviewArticles(buildContextualReviewArticles(ranked.map((article) => article.text), savedWords, wordTaps));
        setUsedFallback(usingFallback);
        setDebug(data.debug ?? null);
        setFeedHealth(data.feedHealth ?? null);
        if (forceRefresh) lastRefreshSent.current = refreshKey;
        setState("success");
      } catch {
        if (!cancelled) {
          // Total failure (network error, etc.) — fall back to an
          // all-hardcoded, unranked-but-still-sectioned pool so the page
          // never shows nothing.
          const knownWords = new Set(getKnownWords());
          const savedWords = getSavedWords();
          const wordTaps = getAllWordTaps();
          const scorable = buildScorableArticles(
            hardcodedTexts.filter((text) => !text.sourceName || !getHiddenSources().includes(text.sourceName)),
            knownWords
          );
          const ranked = rankArticles(scorable, buildScoringContext()).filter((article) => {
            if (categoryFilter !== "all" && article.text.category !== categoryFilter) return false;
            if (difficultyFilter !== "all" && article.difficulty.cefr !== difficultyFilter) return false;
            if (languageFilter !== "all" && articleLanguage(article.text) !== languageFilter) return false;
            return true;
          });
          setSections(buildSections(ranked));
          setSavedLaterArticles(ranked.filter((article) => getSavedLaterIds().includes(article.text.id)));
          setTodayWords(buildTodayNewsWords(ranked.map((article) => article.text)));
          setContextualReviewArticles(buildContextualReviewArticles(ranked.map((article) => article.text), savedWords, wordTaps));
          setUsedFallback(true);
          setFeedHealth(null);
          setState("success");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [categoryFilter, difficultyFilter, languageFilter, refreshKey, prefVersion]);

  const hasArticles =
    !!sections &&
    !!(
      sections.todaysRecommendation ||
      sections.goodForYou.length ||
      sections.quickReads.length ||
      sections.stretchYourself.length ||
      sections.newVocabulary.length ||
      sections.latestNews.length ||
      sections.shortSnippets.length ||
      sections.saveForLater.length ||
      savedLaterArticles.length
    );

  function resetFilters() {
    setCategoryFilter("all");
    setDifficultyFilter("all");
    setLanguageFilter("all");
  }

  const activeFilterLabels = [
    categoryFilter !== "all" ? categoryFilter : null,
    difficultyFilter !== "all" ? difficultyFilter : null,
    languageFilter !== "all" ? LANGUAGE_FILTERS.find((filter) => filter.value === languageFilter)?.label ?? languageFilter : null,
  ].filter(Boolean);

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
      {state === "success" && todayWords.length > 0 && (
        <TodayNewsWordsSection words={todayWords} />
      )}
      {state === "success" && contextualReviewArticles.length > 0 && (
        <ContextualReviewSection articles={contextualReviewArticles} />
      )}

      <details
        className="mb-5 rounded-3xl bg-cream-card p-4 shadow-sm"
        open={categoryFilter !== "all" || difficultyFilter !== "all" || languageFilter !== "all"}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Filters</h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              {activeFilterLabels.length === 0
                ? "Topic, level, language, or refresh the RSS pool."
                : `${activeFilterLabels.join(" · ")} active`}
            </p>
          </div>
          <svg className="h-4 w-4 shrink-0 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </summary>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setRefreshKey((key) => key + 1)}
            className="shrink-0 rounded-full bg-brand px-3 py-2 text-xs font-semibold text-white active:scale-95"
          >
            Refresh
          </button>
          {(categoryFilter !== "all" || difficultyFilter !== "all" || languageFilter !== "all") && (
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

        <div className="mt-2">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Language</p>
          <div className="flex flex-wrap gap-1">
            {LANGUAGE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setLanguageFilter(filter.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  languageFilter === filter.value ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </details>

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

      {state === "success" && isFeedHealthDegraded(feedHealth) && (
        <p className="mb-4 rounded-2xl bg-accent-pink px-3 py-2 text-xs font-medium text-accent-pinktext">
          Several news sources are unreachable right now, so today's picks may be thinner than usual.{" "}
          <Link href="/sources" className="underline underline-offset-2">
            Check source status
          </Link>
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
                  score={sections.todaysRecommendation.score}
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
          <ArticleSection
            title="Short Snippets"
            subtitle="Quick, shorter texts — great for a few spare minutes."
            articles={sections.shortSnippets}
          />
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
                    score={article.score}
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
          <p className="mt-1 text-xs text-ink-muted">Try another topic, level, or language.</p>
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

function TodayNewsWordsSection({ words }: { words: TodayNewsWord[] }) {
  return (
    <section className="mb-5 rounded-3xl bg-cream-card p-4 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Words appearing across today&apos;s news</h2>
      <p className="mt-0.5 text-xs text-ink-muted">Open examples from different sources before choosing an article.</p>
      <div className="mt-3 space-y-2">
        {words.map((word) => (
          <details key={word.lemma} className="rounded-2xl bg-cream px-3 py-2">
            <summary className="cursor-pointer list-none">
              <span className="text-sm font-bold text-ink">{word.lemma}</span>
              <span className="ml-2 text-xs text-ink-muted">
                {word.translation} - {word.articleCount} {word.articleCount === 1 ? "article" : "articles"}
              </span>
            </summary>
            <div className="mt-2 space-y-2 border-t border-cream-dark pt-2">
              {word.examples.map((example) => (
                <Link
                  key={`${word.lemma}-${example.articleId}`}
                  href={`/reader/${example.articleId}`}
                  className="block rounded-xl bg-cream-card px-3 py-2 active:bg-cream-dark/60"
                >
                  <p className="text-xs font-semibold text-ink">{example.title}</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">{example.sourceName ?? "Saved text"}</p>
                  <p className="mt-1 line-clamp-2 text-xs italic text-ink-muted">{example.sentence}</p>
                </Link>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function ContextualReviewSection({ articles }: { articles: ContextualReviewArticle[] }) {
  return (
    <section className="mb-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Review through reading</h2>
      <p className="mt-0.5 text-xs text-ink-muted">Articles containing vocabulary due for review.</p>
      <div className="mt-3 space-y-3">
        {articles.map(({ article, dueWords, fragileCount, emergingCount }) => (
          <Link
            key={article.id}
            href={`/reader/${article.id}`}
            className="block rounded-3xl border border-cream-dark bg-cream-card p-4 shadow-sm active:scale-[0.99]"
          >
            <p className="text-sm font-bold leading-snug text-ink">{article.title}</p>
            <p className="mt-1 text-xs text-ink-muted">
              Contains {dueWords.length} due {dueWords.length === 1 ? "word" : "words"}
              {fragileCount > 0 ? ` - ${fragileCount} fragile` : ""}
              {emergingCount > 0 ? ` - ${emergingCount} emerging` : ""}
            </p>
            <p className="mt-2 text-xs font-semibold text-brand">
              {dueWords.slice(0, 5).map((word) => word.lemma ?? word.word).join(" - ")}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
