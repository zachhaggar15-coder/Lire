import type { ScoredArticle } from "@/lib/recommendation/types";
import { SAVE_FOR_LATER_THRESHOLD } from "@/lib/recommendation/signals";

export interface RecommendationSections {
  /** The level-matched public-domain bank picks for today's stable daily reading set. */
  dailyBank: ScoredArticle[];
  /** The small live RSS/news slice for today's changing world-facing reading. */
  liveNews: ScoredArticle[];
  /** The newest news-style articles, freshest first, excluding already-claimed live lead cards. */
  latestNews: ScoredArticle[];
  /**
   * The News tab's whole content: exactly up to 3 picks a day, real news
   * first (freshest first), only reaching into level-matched reading-bank
   * texts to fill remaining slots on a day live RSS genuinely comes up
   * short. Deterministic per calendar day, same as the rest of the daily
   * selection pipeline.
   */
  dailyThree: ScoredArticle[];
}

const DAILY_BANK_SECTION_SIZE = 8;
const LIVE_NEWS_SECTION_SIZE = 6;
const LATEST_NEWS_SECTION_SIZE = 15;
const DAILY_THREE_SECTION_SIZE = 3;

/**
 * Everything that comes from the offline reading bank rather than a live
 * feed: the public-domain excerpts (pd-) and the beginner texts written for
 * the app (starter-, see data/starterTexts.ts). Both belong in the "daily
 * reading" section; only RSS items are live news. Matching on "pd-" alone
 * quietly routed every starter text into the live-news bucket, which left
 * the Articles tab's daily section empty.
 */
function isReadingBankArticle(article: ScoredArticle): boolean {
  return article.text.id.startsWith("pd-") || article.text.id.startsWith("starter-");
}

function take(list: ScoredArticle[], usedIds: Set<string>, limit: number): ScoredArticle[] {
  const picked: ScoredArticle[] = [];
  for (const article of list) {
    if (picked.length >= limit) break;
    if (usedIds.has(article.text.id)) continue;
    picked.push(article);
    usedIds.add(article.text.id);
  }
  return picked;
}

function newestFirst(a: ScoredArticle, b: ScoredArticle): number {
  return new Date(b.text.publishedAt ?? 0).getTime() - new Date(a.text.publishedAt ?? 0).getTime();
}

/**
 * Splits one ranked pool into the sections active pages still render. Short
 * snippets are deliberately excluded here because the dashboard fetches them
 * through its dedicated snippets-only block.
 */
export function buildSections(ranked: ScoredArticle[]): RecommendationSections {
  const withoutSnippets = ranked.filter((article) => !article.text.isShortSnippet);
  const active = withoutSnippets.filter((article) => article.difficulty.unknownWordRatio <= SAVE_FOR_LATER_THRESHOLD);
  const usedIds = new Set<string>();

  const dailyBank = take(
    withoutSnippets.filter(isReadingBankArticle),
    usedIds,
    DAILY_BANK_SECTION_SIZE
  );

  const liveNews = take(
    [...withoutSnippets].filter((article) => !isReadingBankArticle(article)).sort(newestFirst),
    usedIds,
    LIVE_NEWS_SECTION_SIZE
  );

  const latestNews = take(
    [...active].filter((article) => article.text.category === "news-style").sort(newestFirst),
    usedIds,
    LATEST_NEWS_SECTION_SIZE
  );

  const dailyThreeIds = new Set<string>();
  const dailyThree = take(
    [...withoutSnippets].filter((article) => !isReadingBankArticle(article)).sort(newestFirst),
    dailyThreeIds,
    DAILY_THREE_SECTION_SIZE
  );
  if (dailyThree.length < DAILY_THREE_SECTION_SIZE) {
    // A day RSS genuinely comes up short (see backfillIfShort server-side) —
    // fill the rest from level-matched reading-bank texts, longest first,
    // so the fallback reads as a real "everyday French" article rather than
    // a tiny excerpt.
    dailyThree.push(
      ...take(
        [...withoutSnippets].filter(isReadingBankArticle).sort((a, b) => b.text.minutes - a.text.minutes),
        dailyThreeIds,
        DAILY_THREE_SECTION_SIZE - dailyThree.length
      )
    );
  }

  return { dailyBank, liveNews, latestNews, dailyThree };
}
