import { rssSources, type RssSource } from "@/data/rssSources";
import { getDailyExtraReadingTexts } from "@/lib/publicDomainBank";
import { attachEnglishBlurbs } from "@/lib/rss/articleBlurbs";
import { parseRssFeed } from "@/lib/rss/parseRss";
import { itemToRssReadingText, type RssReadingText } from "@/lib/rss/rssToReadingText";
import { todayKey } from "@/lib/rss/seededShuffle";
import { areNearDuplicateTitles } from "@/lib/rss/titleSimilarity";
import type { Category, ReadingText } from "@/types";

const FEED_REVALIDATE_SECONDS = 900;
const FEED_TIMEOUT_MS = 8000;
const DEFAULT_MAX_PER_SOURCE = 2;

export const CANDIDATE_POOL_MAX_AGE_MS = 12 * 60 * 60 * 1000;
export const MIN_PROMOTABLE_CANDIDATE_POOL_SIZE = 20;

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
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LireReader/1.0)" },
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

    for (const item of rssItems) {
      if (items.length >= maxItems) break;
      const result = await itemToRssReadingText(item, source);
      if (result.ok) {
        items.push(result.text);
      } else {
        rejected++;
        logRejection(source, item.title || "(no title)", result.rejection.reason);
      }
    }

    return {
      ok: true,
      items,
      rejected,
      health: {
        ...baseHealth,
        ok: true,
        skipped: false,
        accepted: items.length,
        rejected,
        reason: items.length > 0 ? "Accepted candidates" : rejected > 0 ? "All candidates rejected" : "No feed items",
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

function dedupe(items: RssReadingText[]): RssReadingText[] {
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

export async function buildCandidatePool(): Promise<CandidatePool> {
  const startedAt = Date.now();
  const enabledSources = rssSources.filter((source) => source.enabled);
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

  const items = dedupe(all);
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
  return { ok: true, reason: "Candidate pool passed promotion checks" };
}

export function isFreshCandidatePool(pool: CandidatePool, now = Date.now(), dateKey = todayKey()): boolean {
  return (
    !pool.isFallback &&
    pool.dateKey === dateKey &&
    now - pool.builtAt >= 0 &&
    now - pool.builtAt <= CANDIDATE_POOL_MAX_AGE_MS
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
    difficulty: "B1",
    readingTimeMinutes: text.minutes,
    language: text.language ?? "fr",
    originalText: text.body,
    sourceName: text.sourceName ?? "Lire reading bank",
    sourceUrl: text.sourceUrl ?? `internal:${text.id}`,
    publishedAt: text.publishedAt ?? new Date(builtAt).toISOString(),
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
