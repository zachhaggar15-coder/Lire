"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArticleSection from "@/components/ArticleSection";
import type { Category, Difficulty, ReadingText } from "@/types";
import type { RssReadingText } from "@/lib/rss/rssToReadingText";
import { rssReadingTextToReadingText } from "@/lib/rss/adaptReadingText";
import { cacheRssTexts } from "@/lib/rss/rssTextCache";
import { pruneStaleRssProgress } from "@/lib/progress";
import { getArchive } from "@/lib/archive";
import { getKnownWords } from "@/lib/knownWords";
import { getCustomTexts } from "@/lib/customTexts";
import { formatCategory } from "@/lib/format";
import { buildTodayNewsWords, type TodayNewsWord } from "@/lib/readingAnalytics";
import { getSelectedReadingLevel } from "@/lib/onboarding";
import { DAILY_BANK_ARTICLE_LIMIT, DAILY_RSS_ARTICLE_LIMIT, getDailyBankTexts, isStarterText } from "@/lib/publicDomainBank";
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
const ARTICLE_CATEGORY_FILTERS = CATEGORY_FILTERS.filter((item) => item.value !== "news-style");

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

function defaultCategoryForMode(mode: Mode): CategoryFilter {
  return mode === "live" ? "news-style" : "all";
}

function isEligibleArticleModeText(text: ReadingText): boolean {
  return text.category !== "news-style";
}

function shouldGateLiveNews(level: Difficulty, completedArticleCount: number, showAnyway: boolean): boolean {
  if (showAnyway) return false;
  return (level === "A1" || level === "A2") && completedArticleCount < 3;
}

export default function ArticleBrowserPage({ mode }: { mode: Mode }) {
  const [state, setState] = useState<LoadState>("loading");
  const [sections, setSections] = useState<RecommendationSections | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>("A2");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(() => defaultCategoryForMode(mode));
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
  const [todayWords, setTodayWords] = useState<TodayNewsWord[]>([]);
  const [completedArticleCount, setCompletedArticleCount] = useState(0);
  const [showLiveNewsAnyway, setShowLiveNewsAnyway] = useState(false);
  /** Article difficulty is computed from dictionary lookups, so rescore once full coverage loads. */
  const dictionaryRevision = useGeneratedDictionary();
  const liveNewsGated = mode === "live" && shouldGateLiveNews(selectedLevel, completedArticleCount, showLiveNewsAnyway);

  useEffect(() => subscribeToRecommendationPreferences(() => setPrefVersion((version) => version + 1)), []);

  useEffect(() => {
    trackEvent("content_section_opened", { section: mode });
  }, [mode]);

  useEffect(() => {
    setSelectedLevel(getSelectedReadingLevel());
    setCompletedArticleCount(getArchive().length);
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
      setTodayWords([]);

      if (mode === "live" && liveNewsGated) {
        setRssTexts([]);
        setState("success");
        return;
      }

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
  }, [categoryFilter, languageFilter, liveNewsGated, mode, reloadKey]);

  useEffect(() => {
    if (state === "loading" || state === "error") return;

    function buildAndSetSections(rssTexts: ReadingText[], fallback: boolean) {
      const bankLevel = difficultyFilter === "all" ? selectedLevel : difficultyFilter;
      const bankTexts = getDailyBankTexts({
        level: bankLevel,
        category: categoryFilter,
        limit: mode === "articles" ? DAILY_BANK_ARTICLE_LIMIT * 3 : DAILY_BANK_ARTICLE_LIMIT,
      }).filter((text) => mode !== "articles" || isEligibleArticleModeText(text)).slice(0, DAILY_BANK_ARTICLE_LIMIT);
      const importedTexts = getCustomTexts();
      const hiddenSources = new Set(getHiddenSources());
      const knownWords = new Set(getKnownWords());
      const pool = (mode === "articles" ? [...importedTexts, ...bankTexts] : rssTexts).filter(
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
      setTodayWords(mode === "live" ? buildTodayNewsWords(rssTexts) : []);
      setUsedFallback(fallback);
      setState("success");
    }

    buildAndSetSections(rssTexts, mode === "live" && rssTexts.length < DAILY_RSS_ARTICLE_LIMIT);
  }, [categoryFilter, difficultyFilter, dictionaryRevision, languageFilter, mode, prefVersion, rssTexts, selectedLevel, state]);

  function resetFilters() {
    setCategoryFilter(defaultCategoryForMode(mode));
    setDifficultyFilter("all");
    setLanguageFilter("all");
  }

  const title = mode === "live" ? "Live News" : "Articles";
  const subtitle =
    mode === "live"
      ? "Current French articles for when you want a stretch."
      : "Start with short French readings chosen for practice.";

  return (
    <div className="px-4 pt-6">
      <header className="mb-5">
        <Link href="/" className="text-sm font-semibold text-brand">
          Back to dashboard
        </Link>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
            <p className="text-sm text-ink-muted">{subtitle}</p>
          </div>
        </div>
      </header>

      {liveNewsGated ? (
        <BeginnerNewsGate onContinue={() => setShowLiveNewsAnyway(true)} />
      ) : mode === "live" ? (
        <FilterPanel
          categoryItems={CATEGORY_FILTERS}
          categoryFilter={categoryFilter}
          difficultyFilter={difficultyFilter}
          languageFilter={languageFilter}
          onCategory={setCategoryFilter}
          onDifficulty={setDifficultyFilter}
          onLanguage={setLanguageFilter}
          onReset={resetFilters}
        />
      ) : null}

      {!liveNewsGated && state === "loading" && <ArticleLoadingState slow={isSlowLoading} onRetry={() => setReloadKey((key) => key + 1)} />}

      {!liveNewsGated && state === "error" && (
        <LoadErrorCard
          message={loadError ?? "Articles are unavailable right now."}
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      )}

      {!liveNewsGated && state === "success" && usedFallback && (
        <p className="mb-4 rounded-2xl bg-accent-pink px-3 py-2 text-xs font-medium text-accent-pinktext">
          Live RSS returned fewer articles than usual for these filters.
        </p>
      )}

      {!liveNewsGated && state === "success" && sections && (
        mode === "live" ? (
          <LiveNewsContent sections={sections} todayWords={todayWords} />
        ) : (
          <ArticleContent
            sections={sections}
            selectedLevel={selectedLevel}
            difficultyFilter={difficultyFilter}
            customArticles={customArticles}
            savedLaterArticles={savedLaterArticles}
          />
        )
      )}

      {!liveNewsGated && mode === "articles" && (
        <FilterPanel
          categoryItems={ARTICLE_CATEGORY_FILTERS}
          categoryFilter={categoryFilter}
          difficultyFilter={difficultyFilter}
          languageFilter={languageFilter}
          onCategory={setCategoryFilter}
          onDifficulty={setDifficultyFilter}
          onLanguage={setLanguageFilter}
          onReset={resetFilters}
        />
      )}
    </div>
  );
}

function ArticleLoadingState({ slow, onRetry }: { slow: boolean; onRetry: () => void }) {
  return (
    <div className="space-y-3">
      <div className="h-28 animate-pulse rounded-3xl bg-cream-dark" />
      <div className="h-28 animate-pulse rounded-3xl bg-cream-dark" />
      {slow && (
        <div className="rounded-2xl bg-cream-card px-3 py-2 shadow-sm">
          <p className="text-sm font-semibold text-ink">Still fetching fresh articles.</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-ink-muted">RSS sources can be slow during a refresh.</p>
            <button type="button" onClick={onRetry} className="shrink-0 rounded-full bg-cream-dark px-3 py-1.5 text-xs font-semibold text-ink-muted">
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
    <div className="rounded-3xl bg-cream-card p-5 text-center shadow-sm">
      <p className="text-sm font-bold text-ink">{message}</p>
      <button type="button" onClick={onRetry} className="mt-3 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white active:scale-95">
        Retry
      </button>
    </div>
  );
}

function BeginnerNewsGate({ onContinue }: { onContinue: () => void }) {
  return (
    <section className="rounded-3xl bg-cream-card p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-brand">Stretch area</p>
      <h2 className="mt-1 text-xl font-extrabold leading-tight text-ink">Live news is harder than the starter articles.</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Start with a few short readings first, then come back when tapping words feels comfortable.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/articles" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white active:scale-95">
          Start with articles
        </Link>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-full bg-cream-dark px-4 py-2 text-sm font-semibold text-ink active:scale-95"
        >
          Show news anyway
        </button>
      </div>
    </section>
  );
}

function FilterPanel({
  categoryItems,
  categoryFilter,
  difficultyFilter,
  languageFilter,
  onCategory,
  onDifficulty,
  onLanguage,
  onReset,
}: {
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
    <details className="mb-5 rounded-3xl bg-cream-card p-4 shadow-sm">
      <summary className="cursor-pointer list-none text-sm font-bold uppercase tracking-wide text-ink-muted">
        Filters
      </summary>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={onReset} className="rounded-full bg-cream-dark px-3 py-2 text-xs font-semibold text-ink-muted">
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
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{title}</p>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              value === item.value ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ArticleContent({
  sections,
  selectedLevel,
  difficultyFilter,
  customArticles,
  savedLaterArticles,
}: {
  sections: RecommendationSections;
  selectedLevel: Difficulty;
  difficultyFilter: DifficultyFilter;
  customArticles: ScoredArticle[];
  savedLaterArticles: ScoredArticle[];
}) {
  const level = difficultyFilter === "all" ? selectedLevel : difficultyFilter;
  const orderedArticles = [...sections.dailyBank].sort((a, b) => {
    const starterFirst = Number(isStarterText(b.text)) - Number(isStarterText(a.text));
    if (starterFirst !== 0) return starterFirst;
    return Number(a.text.difficulty !== level) - Number(b.text.difficulty !== level);
  });
  const [featured, ...rest] = orderedArticles;
  const upNext = rest.slice(0, 2);
  const morePractice = rest.slice(2);

  return (
    <>
      {featured && <FeaturedLessonCard article={featured} lessonNumber={1} level={level} />}
      <ArticleSection title="Up Next" subtitle="Two more short lessons when you want to continue." articles={upNext} variant="compact" />
      {morePractice.length > 0 && (
        <details className="mb-6">
          <summary className="cursor-pointer rounded-3xl bg-cream-card p-4 text-sm font-bold uppercase tracking-wide text-ink-muted shadow-sm">
            More practice
          </summary>
          <div className="mt-3">
            <ArticleSection title={`${level} practice bank`} articles={morePractice} variant="compact" />
          </div>
        </details>
      )}
      {customArticles.length > 0 && (
        <ArticleSection title="Imported Texts" subtitle="Your saved French texts." articles={customArticles} variant="compact" />
      )}
      <details className="mb-6 rounded-3xl bg-cream-card p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-bold uppercase tracking-wide text-ink-muted">
          Import your own text
        </summary>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-ink-muted">Paste French from elsewhere and read it with the same help.</p>
          <Link href="/import" className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white active:scale-95">
            Import
          </Link>
        </div>
      </details>
      <ArticleSection title="Saved For Later" subtitle="Read these when you are ready." articles={savedLaterArticles} variant="compact" />
    </>
  );
}

function FeaturedLessonCard({ article, lessonNumber, level }: { article: ScoredArticle; lessonNumber: number; level: Difficulty }) {
  const { text } = article;
  return (
    <section className="mb-5 rounded-3xl bg-cream-card p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-brand">Lesson {lessonNumber}</p>
      <h2 className="mt-1 text-2xl font-extrabold leading-tight text-ink">{text.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        {text.blurbEn ?? text.preview}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-bold text-brand">{text.difficulty}</span>
        <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold capitalize text-ink-muted">{formatCategory(text.category)}</span>
        <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-ink-muted">{text.minutes} min</span>
        {text.difficulty !== level && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">near your level</span>
        )}
      </div>
      <Link
        href={`/reader/${encodeURIComponent(text.id)}`}
        className="mt-5 block rounded-full bg-brand px-5 py-3 text-center text-sm font-bold text-white active:scale-95"
      >
        Start lesson
      </Link>
    </section>
  );
}

function LiveNewsContent({ sections, todayWords }: { sections: RecommendationSections; todayWords: TodayNewsWord[] }) {
  const hasLiveContent = sections.liveNews.length > 0 || sections.latestNews.length > 0 || todayWords.length > 0;

  if (!hasLiveContent) {
    return (
      <div className="rounded-3xl bg-cream-card p-5 text-center shadow-sm">
        <p className="text-sm font-bold text-ink">No live news matches these filters right now.</p>
        <p className="mt-1 text-xs text-ink-muted">Try resetting filters or check back after the next scheduled refresh.</p>
      </div>
    );
  }

  return (
    <>
      <ArticleSection title="Current News" subtitle="Pick one article and use word taps generously." articles={sections.liveNews} variant="cards" />
      <ArticleSection title="More News" subtitle="Freshest first." articles={sections.latestNews} variant="compact" />
      {todayWords.length > 0 && <TodayNewsWordsSection words={todayWords} />}
    </>
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
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-bold text-ink">{word.lemma}</span>
              <span className="rounded-full bg-cream-card px-2 py-0.5 text-xs font-semibold text-ink-muted">
                {word.translation}
              </span>
              <span className="text-xs text-ink-muted">
                {word.articleCount} {word.articleCount === 1 ? "article" : "articles"}
              </span>
            </summary>
            <div className="mt-2 space-y-2 border-t border-cream-dark pt-2">
              {word.examples.map((example) => (
                <Link key={`${word.lemma}-${example.articleId}`} href={`/reader/${example.articleId}`} className="block rounded-xl bg-cream-card px-3 py-2 active:bg-cream-dark/60">
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
