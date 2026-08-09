"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArticleSection from "@/components/ArticleSection";
import JourneyMap from "@/components/JourneyMap";
import type { Category, Difficulty, ReadingText } from "@/types";
import type { RssReadingText } from "@/lib/rss/rssToReadingText";
import { rssReadingTextToReadingText } from "@/lib/rss/adaptReadingText";
import { cacheRssTexts } from "@/lib/rss/rssTextCache";
import { pruneStaleRssProgress } from "@/lib/progress";
import { getKnownWords } from "@/lib/knownWords";
import { getCustomTexts } from "@/lib/customTexts";
import { getSelectedReadingLevel } from "@/lib/onboarding";
import {
  DAILY_BANK_ARTICLE_LIMIT,
  DAILY_RSS_ARTICLE_LIMIT,
  getDailyExtraReadingTexts,
  isStarterText,
} from "@/lib/publicDomainBank";
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
import { trackEvent } from "@/lib/analytics/client";
import { useGeneratedDictionary } from "@/lib/dictionary/useGeneratedDictionary";
import ShortSnippetsBlock from "@/components/ShortSnippetsBlock";

type Mode = "articles" | "live";
type LoadState = "loading" | "success" | "error";
type CategoryFilter = "all" | Category;
type DifficultyFilter = "all" | Difficulty;
type LanguageFilter = "all" | NonNullable<ReadingText["language"]>;

const LIVE_NEWS_SLOW_MS = 7000;
const LIVE_NEWS_TIMEOUT_MS = 30000;

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "news-style", label: "News" },
  { value: "sport", label: "Sport" },
  { value: "culture", label: "Culture" },
  { value: "science", label: "Science" },
  { value: "everyday life", label: "Life" },
];
const ARTICLE_CATEGORY_FILTERS = CATEGORY_FILTERS;

const DIFFICULTY_FILTERS: { value: DifficultyFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
  { value: "C2", label: "C2" },
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

function defaultCategoryForMode(): CategoryFilter {
  // Both modes default to "all" — the live-news page used to default to
  // "news-style" only, which silently narrowed the daily pool down to
  // whichever news-specific feeds happened to be healthy that day and made
  // "no live news matches these filters" a common, confusing empty state
  // for something meant to just be a daily bank of texts.
  return "all";
}

function isEligibleArticleModeText(text: ReadingText): boolean {
  return !isStarterText(text);
}

export default function ArticleBrowserPage({ mode }: { mode: Mode }) {
  const [state, setState] = useState<LoadState>("loading");
  const [sections, setSections] = useState<RecommendationSections | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>("A2");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(() => defaultCategoryForMode());
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>("all");
  const [prefVersion, setPrefVersion] = useState(0);
  const [usedFallback, setUsedFallback] = useState(false);
  const [rssTexts, setRssTexts] = useState<ReadingText[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSlowLoading, setIsSlowLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [customArticles, setCustomArticles] = useState<ScoredArticle[]>([]);
  const [savedLaterArticles, setSavedLaterArticles] = useState<ScoredArticle[]>([]);
  const dictionaryRevision = useGeneratedDictionary();

  useEffect(() => subscribeToRecommendationPreferences(() => setPrefVersion((version) => version + 1)), []);

  useEffect(() => {
    trackEvent("content_section_opened", { section: mode });
  }, [mode]);

  useEffect(() => {
    setSelectedLevel(getSelectedReadingLevel());
  }, [prefVersion]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    let slowTimer: ReturnType<typeof setTimeout> | null = null;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

    async function load() {
      setLoadError(null);
      setIsSlowLoading(false);
      setUsedFallback(false);
      setState("loading");
      setSections(null);

      if (mode === "articles") {
        setRssTexts([]);
        setState("success");
        return;
      }

      try {
        slowTimer = setTimeout(() => {
          if (!cancelled) setIsSlowLoading(true);
        }, LIVE_NEWS_SLOW_MS);
        timeoutTimer = setTimeout(() => controller.abort(), LIVE_NEWS_TIMEOUT_MS);
        const params = new URLSearchParams({ limit: String(DAILY_RSS_ARTICLE_LIMIT) });
        if (categoryFilter !== "all") params.set("category", categoryFilter);
        if (languageFilter !== "all") params.set("language", languageFilter);
        params.set("snippets", "exclude");

        const res = await fetch(`/api/rss-texts?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        const data: { texts: RssReadingText[] } = await res.json();
        if (cancelled) return;

        const nextRssTexts = data.texts.map(rssReadingTextToReadingText);
        cacheRssTexts(nextRssTexts);
        pruneStaleRssProgress(nextRssTexts.map((text) => text.id));
        detectAndRecordSkippedArticles(nextRssTexts.map((text) => ({ id: text.id, category: text.category })));
        setRssTexts(nextRssTexts);
        setUsedFallback(nextRssTexts.length < DAILY_RSS_ARTICLE_LIMIT);
        setState("success");
      } catch (error) {
        if (!cancelled) {
          const timedOut = error instanceof DOMException && error.name === "AbortError";
          setRssTexts([]);
          setLoadError(
            timedOut
              ? "Live RSS is taking too long to answer. Try again, or switch filters."
              : "Live RSS is unavailable right now. Try again in a moment."
          );
          setState("error");
        }
      } finally {
        if (slowTimer) clearTimeout(slowTimer);
        if (timeoutTimer) clearTimeout(timeoutTimer);
        if (!cancelled) setIsSlowLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      controller.abort();
      if (slowTimer) clearTimeout(slowTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };
  }, [categoryFilter, languageFilter, mode, reloadKey]);

  useEffect(() => {
    if (state === "loading" || state === "error") return;

    function buildAndSetSections(rssTexts: ReadingText[], fallback: boolean) {
      const bankLevel = difficultyFilter === "all" ? selectedLevel : difficultyFilter;
      const extraReadingTexts =
        mode === "articles"
          ? getDailyExtraReadingTexts({
              level: bankLevel,
              category: categoryFilter,
              limit: DAILY_BANK_ARTICLE_LIMIT,
            })
          : [];
      const importedTexts = getCustomTexts();
      const hiddenSources = new Set(getHiddenSources());
      const knownWords = new Set(getKnownWords());
      const pool = (mode === "articles" ? [...importedTexts, ...extraReadingTexts] : rssTexts).filter(
        (text) => (!text.sourceName || !hiddenSources.has(text.sourceName)) && (mode !== "articles" || isEligibleArticleModeText(text))
      );
      const importedIds = new Set(importedTexts.map((text) => text.id));
      const ranked = rankArticles(buildScorableArticles(pool, knownWords), buildScoringContext()).filter((article) => {
        if (categoryFilter !== "all" && article.text.category !== categoryFilter) return false;
        if (difficultyFilter !== "all" && article.text.difficulty !== difficultyFilter) return false;
        if (languageFilter !== "all" && articleLanguage(article.text) !== languageFilter) return false;
        return true;
      });

      setSections(buildSections(ranked.filter((article) => mode === "live" || !importedIds.has(article.text.id))));
      setCustomArticles(mode === "articles" ? ranked.filter((article) => importedIds.has(article.text.id)).slice(0, 8) : []);
      setSavedLaterArticles(mode === "articles" ? ranked.filter((article) => getSavedLaterIds().includes(article.text.id)) : []);
      setUsedFallback(fallback);
      setState("success");
    }

    buildAndSetSections(rssTexts, mode === "live" && rssTexts.length < DAILY_RSS_ARTICLE_LIMIT);
  }, [categoryFilter, difficultyFilter, dictionaryRevision, languageFilter, mode, prefVersion, rssTexts, selectedLevel, state]);

  function resetFilters() {
    setCategoryFilter(defaultCategoryForMode());
    setDifficultyFilter("all");
    setLanguageFilter("all");
  }

  // Session-local only: switching the map's band tab changes what you're
  // browsing right now, not your committed reading level. That level only
  // ever changes via the Settings page's own explicit "Set reading level"
  // action — otherwise, peeking at a harder/easier band to see what it looks
  // like would silently overwrite the level used for home-page
  // recommendations and defaults elsewhere in the app.
  function changeSelectedLevel(level: Difficulty) {
    setSelectedLevel(level);
  }

  const title = mode === "live" ? "News" : "Lessons";
  const subtitle = mode === "live" ? "Current articles and short snippets for a stretch." : "Follow one guided reading path.";

  return (
    <div className={mode === "articles" ? "bg-cream" : "ligne-screen"}>
      {mode === "live" && (
        <header className="mb-5">
          <Link href="/" className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-brand">
            Back to lessons
          </Link>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <p className="ligne-label">Current French</p>
              <h1 className="mt-1 text-[30px] font-semibold leading-none text-ink">{title}</h1>
              <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>
            </div>
          </div>
        </header>
      )}

      {mode === "articles" && state === "loading" && (
        <div className="px-[22px] pt-7">
          <ArticleLoadingState slow={isSlowLoading} onRetry={() => setReloadKey((key) => key + 1)} />
        </div>
      )}

      {mode === "live" && state === "loading" && <ArticleLoadingState slow={isSlowLoading} onRetry={() => setReloadKey((key) => key + 1)} />}

      {state === "error" && (
        <div className={mode === "articles" ? "px-[22px]" : ""}>
          <LoadErrorCard
            message={loadError ?? (mode === "live" ? "News is unavailable right now." : "Lessons are unavailable right now.")}
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        </div>
      )}

      {state === "success" && usedFallback && (
        <p className="mb-4 rounded-2xl bg-accent-pink px-3 py-2 text-xs font-medium text-accent-pinktext">
          Live RSS returned fewer articles than usual today.
        </p>
      )}

      {state === "success" &&
        sections &&
        (mode === "live" ? (
          <LiveNewsContent sections={sections} />
        ) : (
          <LessonsContent
            sections={sections}
            customArticles={customArticles}
            savedLaterArticles={savedLaterArticles}
            selectedLevel={selectedLevel}
            onLevelChange={changeSelectedLevel}
          />
        ))}

      {mode === "articles" && (
        <div className="px-[22px]">
          <FilterPanel
            summaryLabel="Extra reading filters"
            categoryItems={ARTICLE_CATEGORY_FILTERS}
            categoryFilter={categoryFilter}
            difficultyFilter={difficultyFilter}
            languageFilter={languageFilter}
            onCategory={setCategoryFilter}
            onDifficulty={setDifficultyFilter}
            onLanguage={setLanguageFilter}
            onReset={resetFilters}
          />
        </div>
      )}
    </div>
  );
}

function ArticleLoadingState({ slow, onRetry }: { slow: boolean; onRetry: () => void }) {
  return (
    <div className="space-y-3">
      <div className="h-28 animate-pulse rounded-card bg-cream-fill" />
      <div className="h-28 animate-pulse rounded-card bg-cream-fill" />
      {slow && (
        <div className="ligne-card px-4 py-3">
          <p className="text-sm font-semibold text-ink">Still fetching fresh articles.</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-ink-muted">RSS sources can be slow during a refresh.</p>
            <button type="button" onClick={onRetry} className="ligne-pill shrink-0 bg-cream-fill text-ink-muted">
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="ligne-card p-5 text-center">
      <p className="text-sm font-bold text-ink">{message}</p>
      <button type="button" onClick={onRetry} className="ligne-pill mt-3 bg-brand text-cream">
        Retry
      </button>
    </div>
  );
}

function FilterPanel({
  summaryLabel,
  categoryItems,
  categoryFilter,
  difficultyFilter,
  languageFilter,
  onCategory,
  onDifficulty,
  onLanguage,
  onReset,
}: {
  summaryLabel: string;
  categoryItems: { value: CategoryFilter; label: string }[];
  categoryFilter: CategoryFilter;
  difficultyFilter: DifficultyFilter;
  languageFilter: LanguageFilter;
  onCategory: (value: CategoryFilter) => void;
  onDifficulty: (value: DifficultyFilter) => void;
  onLanguage: (value: LanguageFilter) => void;
  onReset: () => void;
}) {
  return (
    <details className="mb-5 rounded-card border border-cream-dark bg-cream-card p-4">
      <summary className="cursor-pointer list-none font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
        {summaryLabel}
      </summary>
      <p className="mt-2 text-xs text-ink-muted">
        {summaryLabel === "Extra reading filters" ? "Find another extra topic, level, or imported text." : "Adjust the live-news list."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={onReset} className="ligne-pill bg-cream-fill text-ink-muted">
          Reset
        </button>
      </div>
      <FilterRow title="Topic" items={categoryItems} value={categoryFilter} onChange={onCategory} />
      <FilterRow title="Level" items={DIFFICULTY_FILTERS} value={difficultyFilter} onChange={onDifficulty} />
      <FilterRow title="Language" items={LANGUAGE_FILTERS} value={languageFilter} onChange={onLanguage} />
    </details>
  );
}

function FilterRow<T extends string>({
  title,
  items,
  value,
  onChange,
}: {
  title: string;
  items: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="mt-3">
      <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">{title}</p>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              value === item.value ? "bg-brand text-cream" : "bg-cream-fill text-ink-muted"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function LessonsContent({
  sections,
  customArticles,
  savedLaterArticles,
  selectedLevel,
  onLevelChange,
}: {
  sections: RecommendationSections;
  customArticles: ScoredArticle[];
  savedLaterArticles: ScoredArticle[];
  selectedLevel: Difficulty;
  onLevelChange: (level: Difficulty) => void;
}) {
  const hasExtraReading = customArticles.length > 0 || sections.dailyBank.length > 0 || savedLaterArticles.length > 0;

  return (
    <>
      <JourneyMap selectedLevel={selectedLevel} onLevelChange={onLevelChange} />
      <div className="px-[22px]">
        <details className="mb-6 rounded-card border border-cream-dark bg-cream-card p-4">
          <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            Extra reading
          </summary>
          <div className="mt-4">
            {hasExtraReading ? (
              <>
                {customArticles.length > 0 && (
                  <ArticleSection title="Imported Texts" subtitle="Your saved French texts." articles={customArticles} variant="compact" />
                )}
                <ArticleSection
                  title="Classic practice bank"
                  subtitle="Extra readings outside the guided path."
                  articles={sections.dailyBank}
                  variant="compact"
                />
                <ArticleSection title="Saved For Later" subtitle="Read these when you are ready." articles={savedLaterArticles} variant="compact" />
              </>
            ) : (
              <p className="mb-4 rounded-2xl bg-cream-sunken px-3 py-3 text-sm font-semibold text-ink-muted">
                No extra readings match these filters right now.
              </p>
            )}
            <div className="rounded-2xl bg-cream-sunken px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-ink-muted">Paste French from elsewhere and read it with the same help.</p>
                <Link href="/import" className="ligne-pill shrink-0 bg-brand text-cream">
                  Import
                </Link>
              </div>
            </div>
          </div>
        </details>
      </div>
    </>
  );
}

function LiveNewsContent({ sections }: { sections: RecommendationSections }) {
  const hasLiveContent = sections.liveNews.length > 0 || sections.latestNews.length > 0;

  if (!hasLiveContent) {
    return (
      <>
        <div className="ligne-card p-5 text-center">
          <p className="text-sm font-bold text-ink">No live news matches these filters right now.</p>
          <p className="mt-1 text-xs text-ink-muted">Try resetting filters or check back after the next scheduled refresh.</p>
        </div>
        <div className="mt-4">
          <ShortSnippetsBlock defaultOpen />
        </div>
      </>
    );
  }

  return (
    <>
      <ArticleSection title="Current News" subtitle="Fresh articles for real-world French." articles={sections.liveNews} variant="cards" />
      <ShortSnippetsBlock defaultOpen />
      <ArticleSection title="More News" subtitle="Freshest first." articles={sections.latestNews} variant="compact" />
    </>
  );
}
