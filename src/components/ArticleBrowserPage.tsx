"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ArticleSection from "@/components/ArticleSection";
import { texts as hardcodedTexts } from "@/data/texts";
import type { Category, Difficulty, ReadingText } from "@/types";
import type { RssReadingText } from "@/lib/rss/rssToReadingText";
import { rssReadingTextToReadingText } from "@/lib/rss/adaptReadingText";
import { cacheRssTexts } from "@/lib/rss/rssTextCache";
import { pruneStaleRssProgress } from "@/lib/progress";
import { getKnownWords } from "@/lib/knownWords";
import { getSavedWords } from "@/lib/storage";
import { getCustomTexts } from "@/lib/customTexts";
import { getAllWordTaps } from "@/lib/wordLearning";
import { buildContextualReviewArticles, buildTodayNewsWords, type ContextualReviewArticle, type TodayNewsWord } from "@/lib/readingAnalytics";
import { getSelectedReadingLevel } from "@/lib/onboarding";
import { DAILY_BANK_ARTICLE_LIMIT, DAILY_RSS_ARTICLE_LIMIT, getDailyBankTexts } from "@/lib/publicDomainBank";
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

type Mode = "articles" | "live";
type LoadState = "loading" | "success";
type CategoryFilter = "all" | Category;
type DifficultyFilter = "all" | Difficulty;
type LanguageFilter = "all" | NonNullable<ReadingText["language"]>;

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

export default function ArticleBrowserPage({ mode }: { mode: Mode }) {
  const [state, setState] = useState<LoadState>("loading");
  const [sections, setSections] = useState<RecommendationSections | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>("A2");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [prefVersion, setPrefVersion] = useState(0);
  const [usedFallback, setUsedFallback] = useState(false);
  const [customArticles, setCustomArticles] = useState<ScoredArticle[]>([]);
  const [savedLaterArticles, setSavedLaterArticles] = useState<ScoredArticle[]>([]);
  const [todayWords, setTodayWords] = useState<TodayNewsWord[]>([]);
  const [contextualReviewArticles, setContextualReviewArticles] = useState<ContextualReviewArticle[]>([]);
  const lastRefreshSent = useRef(0);

  useEffect(() => subscribeToRecommendationPreferences(() => setPrefVersion((version) => version + 1)), []);

  useEffect(() => {
    setSelectedLevel(getSelectedReadingLevel());
  }, [prefVersion]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState("loading");
      try {
        const params = new URLSearchParams({ limit: String(DAILY_RSS_ARTICLE_LIMIT) });
        const forceRefresh = refreshKey > 0 && lastRefreshSent.current !== refreshKey;
        if (categoryFilter !== "all") params.set("category", categoryFilter);
        if (languageFilter !== "all") params.set("language", languageFilter);
        if (forceRefresh) params.set("refresh", "true");

        const res = await fetch(`/api/rss-texts?${params.toString()}`);
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        const data: { texts: RssReadingText[] } = await res.json();
        if (cancelled) return;

        const rssTexts = data.texts.map(rssReadingTextToReadingText);
        cacheRssTexts(rssTexts);
        pruneStaleRssProgress(rssTexts.map((text) => text.id));
        detectAndRecordSkippedArticles(rssTexts.map((text) => ({ id: text.id, category: text.category })));
        buildAndSetSections(rssTexts, rssTexts.length < DAILY_RSS_ARTICLE_LIMIT);
        if (forceRefresh) lastRefreshSent.current = refreshKey;
      } catch {
        if (!cancelled) buildAndSetSections([], true);
      }
    }

    function buildAndSetSections(rssTexts: ReadingText[], fallback: boolean) {
      const bankLevel = difficultyFilter === "all" ? selectedLevel : difficultyFilter;
      const bankTexts = getDailyBankTexts({
        level: bankLevel,
        category: categoryFilter,
        limit: DAILY_BANK_ARTICLE_LIMIT,
      });
      const importedTexts = getCustomTexts();
      const sourcePool = rssTexts.length > 0 ? rssTexts : hardcodedTexts;
      const hiddenSources = new Set(getHiddenSources());
      const knownWords = new Set(getKnownWords());
      const savedWords = getSavedWords();
      const pool = [...importedTexts, ...bankTexts, ...sourcePool].filter(
        (text) => !text.sourceName || !hiddenSources.has(text.sourceName)
      );
      const importedIds = new Set(importedTexts.map((text) => text.id));
      const ranked = rankArticles(buildScorableArticles(pool, knownWords), buildScoringContext()).filter((article) => {
        if (categoryFilter !== "all" && article.text.category !== categoryFilter) return false;
        if (difficultyFilter !== "all" && article.text.difficulty !== difficultyFilter) return false;
        if (languageFilter !== "all" && articleLanguage(article.text) !== languageFilter) return false;
        return true;
      });

      setSections(buildSections(ranked.filter((article) => !importedIds.has(article.text.id))));
      setCustomArticles(ranked.filter((article) => importedIds.has(article.text.id)).slice(0, 8));
      setSavedLaterArticles(ranked.filter((article) => getSavedLaterIds().includes(article.text.id)));
      setTodayWords(buildTodayNewsWords(rssTexts));
      setContextualReviewArticles(buildContextualReviewArticles(ranked.map((article) => article.text), savedWords, getAllWordTaps()));
      setUsedFallback(fallback);
      setState("success");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [categoryFilter, difficultyFilter, languageFilter, refreshKey, prefVersion, selectedLevel]);

  function resetFilters() {
    setCategoryFilter("all");
    setDifficultyFilter("all");
    setLanguageFilter("all");
  }

  const title = mode === "live" ? "Live News" : "Articles";
  const subtitle =
    mode === "live"
      ? "Fresh RSS articles plus repeated words appearing across today's news."
      : "Daily bank articles, imported texts, and personalised recommendations.";

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
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white active:scale-95"
          >
            Refresh
          </button>
        </div>
      </header>

      <FilterPanel
        categoryFilter={categoryFilter}
        difficultyFilter={difficultyFilter}
        languageFilter={languageFilter}
        onCategory={setCategoryFilter}
        onDifficulty={setDifficultyFilter}
        onLanguage={setLanguageFilter}
        onReset={resetFilters}
      />

      {state === "loading" && (
        <div className="space-y-3">
          <div className="h-28 animate-pulse rounded-3xl bg-cream-dark" />
          <div className="h-28 animate-pulse rounded-3xl bg-cream-dark" />
        </div>
      )}

      {state === "success" && usedFallback && (
        <p className="mb-4 rounded-2xl bg-accent-pink px-3 py-2 text-xs font-medium text-accent-pinktext">
          Live RSS is thin right now, so Liree is filling the page from saved and bank texts.
        </p>
      )}

      {state === "success" && sections && (
        mode === "live" ? (
          <LiveNewsContent sections={sections} todayWords={todayWords} />
        ) : (
          <ArticleContent
            sections={sections}
            selectedLevel={selectedLevel}
            difficultyFilter={difficultyFilter}
            customArticles={customArticles}
            savedLaterArticles={savedLaterArticles}
            contextualReviewArticles={contextualReviewArticles}
          />
        )
      )}
    </div>
  );
}

function FilterPanel({
  categoryFilter,
  difficultyFilter,
  languageFilter,
  onCategory,
  onDifficulty,
  onLanguage,
  onReset,
}: {
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
      <FilterRow title="Topic" items={CATEGORY_FILTERS} value={categoryFilter} onChange={onCategory} />
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
  contextualReviewArticles,
}: {
  sections: RecommendationSections;
  selectedLevel: Difficulty;
  difficultyFilter: DifficultyFilter;
  customArticles: ScoredArticle[];
  savedLaterArticles: ScoredArticle[];
  contextualReviewArticles: ContextualReviewArticle[];
}) {
  const level = difficultyFilter === "all" ? selectedLevel : difficultyFilter;
  return (
    <>
      <ArticleSection title="Today's Bank" subtitle={`8 public-domain readings matched to ${level}.`} articles={sections.dailyBank} variant="rail" />
      {customArticles.length > 0 && (
        <ArticleSection title="Imported Texts" subtitle="Your saved French texts." articles={customArticles} variant="compact" />
      )}
      <section className="mb-6 rounded-3xl bg-cream-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Bring Your Own Text</h2>
            <p className="mt-0.5 text-xs text-ink-muted">Paste French from elsewhere and read it with Liree.</p>
          </div>
          <Link href="/import" className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white active:scale-95">
            Import
          </Link>
        </div>
      </section>
      <ArticleSection title="Good For You" subtitle="Right in your ideal challenge zone." articles={sections.goodForYou} variant="compact" />
      <ArticleSection title="Quick Reads" subtitle="2-4 minutes." articles={sections.quickReads} variant="compact" />
      <ArticleSection title="Stretch Yourself" subtitle="A bit harder than usual." articles={sections.stretchYourself} variant="compact" />
      <ArticleSection title="New Vocabulary" subtitle="Likely to teach several new words." articles={sections.newVocabulary} variant="compact" />
      <ArticleSection title="Short Snippets" subtitle="Quick, shorter texts." articles={sections.shortSnippets} variant="compact" />
      <ArticleSection title="Saved For Later" subtitle="Articles you marked for another session." articles={savedLaterArticles} variant="compact" />
      {contextualReviewArticles.length > 0 && <ContextualReviewSection articles={contextualReviewArticles} />}
    </>
  );
}

function LiveNewsContent({ sections, todayWords }: { sections: RecommendationSections; todayWords: TodayNewsWord[] }) {
  return (
    <>
      <ArticleSection title="Live News" subtitle="Two RSS articles from today's live source pool." articles={sections.liveNews} variant="cards" />
      <ArticleSection title="Latest News" subtitle="Freshest first." articles={sections.latestNews} variant="compact" />
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
            <summary className="cursor-pointer list-none">
              <span className="text-sm font-bold text-ink">{word.lemma}</span>
              <span className="ml-2 text-xs text-ink-muted">
                {word.translation} - {word.articleCount} {word.articleCount === 1 ? "article" : "articles"}
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

function ContextualReviewSection({ articles }: { articles: ContextualReviewArticle[] }) {
  return (
    <section className="mb-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Review through reading</h2>
      <p className="mt-0.5 text-xs text-ink-muted">Articles containing vocabulary due for review.</p>
      <div className="mt-3 space-y-3">
        {articles.map(({ article, dueWords, fragileCount }) => (
          <Link key={article.id} href={`/reader/${article.id}`} className="block rounded-3xl border border-cream-dark bg-cream-card p-4 shadow-sm active:scale-[0.99]">
            <p className="text-sm font-bold leading-snug text-ink">{article.title}</p>
            <p className="mt-1 text-xs text-ink-muted">
              Contains {dueWords.length} due {dueWords.length === 1 ? "word" : "words"}
              {fragileCount > 0 ? ` - ${fragileCount} fragile` : ""}
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
