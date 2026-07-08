"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArticleSection from "@/components/ArticleSection";
import ReadingCard from "@/components/ReadingCard";
import TodayCard from "@/components/TodayCard";
import ContinueReadingBanner from "@/components/ContinueReadingBanner";
import ReadingGoalsCard from "@/components/ReadingGoalsCard";
import { texts as hardcodedTexts } from "@/data/texts";
import type { ReadingText } from "@/types";
import type { RssReadingText } from "@/lib/rss/rssToReadingText";
import { rssReadingTextToReadingText } from "@/lib/rss/adaptReadingText";
import { cacheRssTexts } from "@/lib/rss/rssTextCache";
import { pruneStaleRssProgress } from "@/lib/progress";
import { getKnownWords } from "@/lib/knownWords";
import {
  buildScorableArticles,
  buildScoringContext,
  buildSections,
  detectAndRecordSkippedArticles,
  rankArticles,
  type RecommendationSections,
} from "@/lib/recommendation";

type LoadState = "loading" | "success" | "error";

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
}

export default function HomePage() {
  const [state, setState] = useState<LoadState>("loading");
  const [sections, setSections] = useState<RecommendationSections | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [debug, setDebug] = useState<RssDebugInfo | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/rss-texts?limit=${POOL_LIMIT}`);
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

        const usingFallback = rssTexts.length < MIN_POOL_SIZE;
        const pool: ReadingText[] = usingFallback
          ? [...rssTexts, ...hardcodedTexts.slice(0, MIN_POOL_SIZE - rssTexts.length)]
          : rssTexts;

        const knownWords = new Set(getKnownWords());
        const scorable = buildScorableArticles(pool, knownWords);
        const context = buildScoringContext();
        const ranked = rankArticles(scorable, context);

        setSections(buildSections(ranked));
        setUsedFallback(usingFallback);
        setDebug(data.debug ?? null);
        setState("success");
      } catch {
        if (!cancelled) {
          // Total failure (network error, etc.) — fall back to an
          // all-hardcoded, unranked-but-still-sectioned pool so the page
          // never shows nothing.
          const knownWords = new Set(getKnownWords());
          const scorable = buildScorableArticles(hardcodedTexts, knownWords);
          const ranked = rankArticles(scorable, buildScoringContext());
          setSections(buildSections(ranked));
          setUsedFallback(true);
          setState("success");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

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

      {state === "success" && sections && (
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
            </details>
          )}
        </>
      )}
    </div>
  );
}
