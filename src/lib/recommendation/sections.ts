import type { ScoredArticle } from "@/lib/recommendation/types";
import { SAVE_FOR_LATER_THRESHOLD } from "@/lib/recommendation/signals";

export interface RecommendationSections {
  /** The level-matched public-domain bank picks for today's stable daily reading set. */
  dailyBank: ScoredArticle[];
  /** The small live RSS/news slice for today's changing world-facing reading. */
  liveNews: ScoredArticle[];
  /** The newest news-style articles, freshest first, excluding already-claimed live lead cards. */
  latestNews: ScoredArticle[];
}

const DAILY_BANK_SECTION_SIZE = 8;
const LIVE_NEWS_SECTION_SIZE = 2;
const LATEST_NEWS_SECTION_SIZE = 4;

function isPublicDomainBankArticle(article: ScoredArticle): boolean {
  return article.text.id.startsWith("pd-");
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
    withoutSnippets.filter(isPublicDomainBankArticle),
    usedIds,
    DAILY_BANK_SECTION_SIZE
  );

  const liveNews = take(
    [...withoutSnippets].filter((article) => !isPublicDomainBankArticle(article)).sort(newestFirst),
    usedIds,
    LIVE_NEWS_SECTION_SIZE
  );

  const latestNews = take(
    [...active].filter((article) => article.text.category === "news-style").sort(newestFirst),
    usedIds,
    LATEST_NEWS_SECTION_SIZE
  );

  return { dailyBank, liveNews, latestNews };
}
