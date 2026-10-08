import { isApprovedRssSource, rssSources, type RssSource } from "@/data/rssSources";
import { getDailyExtraReadingTexts } from "@/lib/publicDomainBank";
import { attachEnglishBlurbs } from "@/lib/rss/articleBlurbs";
import { parseRssFeed } from "@/lib/rss/parseRss";
import {
  isPublishedWithinFreshnessWindow,
  itemToRssReadingText,
  type RssReadingText,
} from "@/lib/rss/rssToReadingText";
import { previousDateKey, todayKey } from "@/lib/rss/seededShuffle";
import { areNearDuplicateTitles } from "@/lib/rss/titleSimilarity";
import type { Category, ReadingText } from "@/types";

const FEED_REVALIDATE_SECONDS = 900;
const FEED_TIMEOUT_MS = 8000;
const DEFAULT_MAX_PER_SOURCE = 8;

export const CANDIDATE_POOL_MAX_AGE_MS = 30 * 60 * 60 * 1000;
export const LIVE_ITEM_MAX_AGE_DAYS = 14;
export const MIN_PROMOTABLE_CANDIDATE_POOL_SIZE = 1;

const isDev = process.env.NODE_ENV !== "production";

export interface CandidatePool {
  builtAt: number;
  buildDurationMs?: number;
  dateKey: string;
  items: RssReadingText[];
  feedsSucceeded: number;
  feedsFailed: number;
  itemsRejected: number;
  sourceHealth: SourceHealth[];
  /** Local emergency content is deliberately never considered a fresh live pool. */
  isFallback?: boolean;
}

export interface SourceHealth {
  id: string;
  name: string;
  language: RssSource["language"];
  category: Category;
  ok: boolean;
  skipped: boolean;
  accepted: number;
  rejected: number;
  reason: string;
  attemptedAt: string;
  lastSuccessfulRefreshAt: string | null;
  newestItemAt: string | null;
  oldestItemAt: string | null;
  rejectionReasons: Record<string, number>;
}

function itemTimestamp(item: { publishedAt: string }): number {
  return new Date(item.publishedAt).getTime();
}

export function sortNewestFirst<T extends { publishedAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => itemTimestamp(b) - itemTimestamp(a));
}

export function isFreshLiveItem(item: Pick<RssReadingText, "publishedAt">, now = Date.now()): boolean {
  return isPublishedWithinFreshnessWindow(item.publishedAt, LIVE_ITEM_MAX_AGE_DAYS, now);
}

export function filterFreshCandidatePool(pool: CandidatePool, now = Date.now()): CandidatePool {
  if (pool.isFallback) return pool;
  return { ...pool, items: sortNewestFirst(pool.items.filter((item) => isFreshLiveItem(item, now))) };
}

function logRejection(source: RssSource, itemTitle: string, reason: string): void {
  if (!isDev) return;
  console.log(`Rejected RSS item: ${source.name} / "${itemTitle}"\nReason: ${reason}`);
}

async function fetchFromSource(
  source: RssSource
): Promise<{ ok: boolean; items: RssReadingText[]; rejected: number; health: SourceHealth }> {
  const baseHealth = {
    id: source.id,
    name: source.name,
    language: source.language,
    category: source.category,
    attemptedAt: new Date().toISOString(),
    lastSuccessfulRefreshAt: null,
    newestItemAt: null,
    oldestItemAt: null,
    rejectionReasons: {},
  };

  if (source.language === "en" && !source.allowEnglishForTesting) {
    return {
      ok: true,
      items: [],
      rejected: 0,
      health: { ...baseHealth, ok: true, skipped: true, accepted: 0, rejected: 0, reason: "English source disabled" },
    };
  }

  const maxItems = source.maxItems ?? DEFAULT_MAX_PER_SOURCE;

  try {
    const res = await fetch(source.feedUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SorlioReader/1.0)" },
      next: { revalidate: FEED_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    });
    if (!res.ok) {
      return {
        ok: false,
        items: [],
        rejected: 0,
        health: { ...baseHealth, ok: false, skipped: false, accepted: 0, rejected: 0, reason: `HTTP ${res.status}` },
      };
    }

    const xml = await res.text();
    const rssItems = parseRssFeed(xml);
    const items: RssReadingText[] = [];
    let rejected = 0;
    const rejectionReasons: Record<string, number> = {};

    for (const item of rssItems) {
      if (items.length >= maxItems) break;
      const result = await itemToRssReadingText(item, source);
      if (result.ok) {
        items.push(result.text);
      } else {
        rejected++;
        rejectionReasons[result.rejection.reason] = (rejectionReasons[result.rejection.reason] ?? 0) + 1;
        logRejection(source, item.title || "(no title)", result.rejection.reason);
      }
    }

    const orderedItems = sortNewestFirst(items);
    const successfulAt = new Date().toISOString();
    return {
      ok: true,
      items: orderedItems,
      rejected,
      health: {
        ...baseHealth,
        ok: true,
        skipped: false,
        accepted: orderedItems.length,
        rejected,
        reason: orderedItems.length > 0 ? "Accepted candidates" : rejected > 0 ? "All candidates rejected" : "No feed items",
        lastSuccessfulRefreshAt: successfulAt,
        newestItemAt: orderedItems[0]?.publishedAt ?? null,
        oldestItemAt: orderedItems.at(-1)?.publishedAt ?? null,
        rejectionReasons,
      },
    };
  } catch {
    return {
      ok: false,
      items: [],
      rejected: 0,
      health: { ...baseHealth, ok: false, skipped: false, accepted: 0, rejected: 0, reason: "Fetch, timeout, or parse failure" },
    };
  }
}

export function dedupeRssItems(items: RssReadingText[]): RssReadingText[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const out: RssReadingText[] = [];

  for (const item of items) {
    const urlKey = item.sourceUrl.trim().toLowerCase();
    const titleKey = item.title.trim().toLowerCase();
    if (seenUrls.has(urlKey) || seenTitles.has(titleKey)) continue;
    if (out.some((existing) => areNearDuplicateTitles(existing.title, item.title))) continue;
    seenUrls.add(urlKey);
    seenTitles.add(titleKey);
    out.push(item);
  }

  return out;
}

export async function buildCandidatePool(
  enabledSources = rssSources.filter(isApprovedRssSource),
): Promise<CandidatePool> {
  const startedAt = Date.now();
  const settled = await Promise.allSettled(enabledSources.map(fetchFromSource));

  let feedsSucceeded = 0;
  let feedsFailed = 0;
  let itemsRejected = 0;
  const all: RssReadingText[] = [];
  const sourceHealth: SourceHealth[] = [];

  for (const result of settled) {
    if (result.status === "fulfilled" && result.value.ok) {
      feedsSucceeded++;
      all.push(...result.value.items);
      itemsRejected += result.value.rejected;
      sourceHealth.push(result.value.health);
    } else {
      feedsFailed++;
      if (result.status === "fulfilled") sourceHealth.push(result.value.health);
    }
  }

  const items = dedupeRssItems(sortNewestFirst(all));
  await attachEnglishBlurbs(items);
  const builtAt = Date.now();

  return {
    builtAt,
    buildDurationMs: builtAt - startedAt,
    dateKey: todayKey(),
    items,
    feedsSucceeded,
    feedsFailed,
    itemsRejected,
    sourceHealth,
  };
}

export function validateCandidatePoolForPromotion(pool: CandidatePool): { ok: boolean; reason: string } {
  if (pool.isFallback) return { ok: false, reason: "Fallback content cannot replace the live pool" };
  if (pool.dateKey !== todayKey()) return { ok: false, reason: "Candidate pool was built for a different day" };
  if (pool.items.length < MIN_PROMOTABLE_CANDIDATE_POOL_SIZE) {
    return {
      ok: false,
      reason: `Candidate pool has ${pool.items.length} items; at least ${MIN_PROMOTABLE_CANDIDATE_POOL_SIZE} are required`,
    };
  }
  if (pool.feedsSucceeded <= 0) return { ok: false, reason: "No RSS feeds succeeded" };
  if (!pool.items.some((item) => isFreshLiveItem(item))) {
    return { ok: false, reason: "No acceptably recent live items were produced" };
  }
  return { ok: true, reason: "Candidate pool passed promotion checks" };
}

export function isFreshCandidatePool(pool: CandidatePool, now = Date.now(), dateKey = todayKey()): boolean {
  return (
    !pool.isFallback &&
    (pool.dateKey === dateKey || pool.dateKey === previousDateKey(dateKey)) &&
    now - pool.builtAt >= 0 &&
    now - pool.builtAt <= CANDIDATE_POOL_MAX_AGE_MS &&
    pool.items.some((item) => isFreshLiveItem(item, now))
  );
}

export function isCandidatePool(value: unknown): value is CandidatePool {
  if (!value || typeof value !== "object") return false;
  const pool = value as Partial<CandidatePool>;
  return (
    typeof pool.builtAt === "number" &&
    typeof pool.dateKey === "string" &&
    Array.isArray(pool.items) &&
    typeof pool.feedsSucceeded === "number" &&
    typeof pool.feedsFailed === "number" &&
    typeof pool.itemsRejected === "number" &&
    Array.isArray(pool.sourceHealth)
  );
}

export function bankTextToRssReadingText(text: ReadingText, builtAt: number): RssReadingText {
  return {
    id: text.id,
    title: text.title,
    category: text.category,
    // A bundled reading keeps its own editorial level.
    difficulty: text.difficulty,
    readingTimeMinutes: text.minutes,
    language: text.language ?? "fr",
    originalText: text.body,
    sourceName: text.sourceName ?? "Sorlio reading bank",
    sourceUrl: text.sourceUrl ?? `internal:${text.id}`,
    publishedAt: text.publishedAt ?? new Date(builtAt).toISOString(),
    retrievedAt: new Date(builtAt).toISOString(),
    sourceId: "sorlio-reading-bank",
    sourceSiteUrl: null,
    attributionText: null,
    reuseBasis: null,
    reuseTermsUrl: null,
    reuseTermsCheckedAt: null,
    materialModifications: "Bundled practice reading; not live reporting.",
    blurbEn: text.blurbEn ?? null,
    isShortSnippet: text.isShortSnippet ?? false,
  };
}

export function createFallbackCandidatePool(): CandidatePool {
  const builtAt = Date.now();
  const items = getDailyExtraReadingTexts({ level: "B1", category: "all", limit: 50 }).map((text) =>
    bankTextToRssReadingText(text, builtAt)
  );

  return {
    builtAt,
    dateKey: todayKey(),
    items,
    feedsSucceeded: 0,
    feedsFailed: 0,
    itemsRejected: 0,
    sourceHealth: [],
    isFallback: true,
  };
}
