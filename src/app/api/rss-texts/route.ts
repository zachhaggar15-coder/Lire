import { NextResponse } from "next/server";
import { rssSources, type RssSource } from "@/data/rssSources";
import { parseRssFeed } from "@/lib/rss/parseRss";
import { itemToRssReadingText, type RssReadingText } from "@/lib/rss/rssToReadingText";
import { attachEnglishBlurbs } from "@/lib/rss/articleBlurbs";
import { rssReadingTextToReadingText } from "@/lib/rss/adaptReadingText";
import { putPersistedRssTexts } from "@/lib/rss/rssTextStore";
import { seededShuffle, todayKey } from "@/lib/rss/seededShuffle";
import type { Category } from "@/types";

/**
 * Rebuilding the candidate pool now sometimes scrapes full articles
 * (scrapeArticle.ts) on top of the per-feed XML fetch, which can push a
 * single feed's processing well past the platform's default serverless
 * timeout. Only the request that actually rebuilds the pool (cache miss,
 * or the cron in vercel.json) pays this cost — every other request just
 * reads the in-memory cache and returns quickly regardless.
 */
export const maxDuration = 60;

/**
 * How long each upstream feed fetch is cached via Next's Data Cache (not the
 * route itself — this route is intentionally dynamic, since it needs to
 * check the calendar day on every request).
 */
const FEED_REVALIDATE_SECONDS = 900;
const FEED_TIMEOUT_MS = 8000;

/** Default cap on usable items pulled from each working feed — overridable per-source via RssSource.maxItems. */
const DEFAULT_MAX_PER_SOURCE = 2;
/** How many texts a plain (unfiltered) request gets by default. */
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;
/** The whole point: don't re-fetch 100+ feeds on every request — see buildCandidatePool. */
const CANDIDATE_POOL_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const isDev = process.env.NODE_ENV !== "production";

/** Dev-only, never spams production logs — see "how to debug rejected feeds" in the README. */
function logRejection(source: RssSource, itemTitle: string, reason: string): void {
  if (!isDev) return;
  console.log(`Rejected RSS item: ${source.name} / "${itemTitle}"\nReason: ${reason}`);
}

interface CandidatePool {
  builtAt: number;
  items: RssReadingText[];
  feedsSucceeded: number;
  feedsFailed: number;
  itemsRejected: number;
}

// Process-lifetime in-memory cache. Resets on cold start in serverless
// environments — acceptable here; the first request after a reset just
// re-fetches the pool once, and every request after that reuses it.
let candidatePoolCache: CandidatePool | null = null;
let dailySelectionCache: { dateKey: string; items: RssReadingText[] } | null = null;

/**
 * Fetches one source's feed and returns up to its item cap of usable
 * items — those that pass the French-language and content-quality checks
 * in rssToReadingText.ts. Skips items that fail either check and tries the
 * next one in the feed, so one bad item never costs the whole source its
 * slot. Any fetch-level failure (network, timeout, non-200, bad XML)
 * resolves to `{ ok: false, items: [] }` rather than throwing, so one
 * broken feed never affects the others or the route as a whole — every
 * source goes through Promise.allSettled.
 */
async function fetchFromSource(source: RssSource): Promise<{ ok: boolean; items: RssReadingText[]; rejected: number }> {
  // This is a French reading app — English sources are skipped entirely
  // unless explicitly opted into for testing (see RssSource.allowEnglishForTesting).
  if (source.language === "en" && !source.allowEnglishForTesting) {
    return { ok: true, items: [], rejected: 0 };
  }

  const maxItems = source.maxItems ?? DEFAULT_MAX_PER_SOURCE;

  try {
    const res = await fetch(source.feedUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LireReader/1.0)" },
      next: { revalidate: FEED_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false, items: [], rejected: 0 };

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
    return { ok: true, items, rejected };
  } catch {
    // Network error, timeout, or parsing failure (covers malformed XML,
    // Atom/RSS/Blogger/Feedburner quirks parseRssFeed doesn't recognise,
    // etc.) — this single source is skipped, nothing else is affected.
    return { ok: false, items: [], rejected: 0 };
  }
}

/** Removes items that share a source URL or a (trimmed, lowercased) title with an earlier item. */
function dedupe(items: RssReadingText[]): RssReadingText[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const out: RssReadingText[] = [];
  for (const item of items) {
    const urlKey = item.sourceUrl.trim().toLowerCase();
    const titleKey = item.title.trim().toLowerCase();
    if (seenUrls.has(urlKey) || seenTitles.has(titleKey)) continue;
    seenUrls.add(urlKey);
    seenTitles.add(titleKey);
    out.push(item);
  }
  return out;
}

/** Fetches every enabled feed concurrently and builds the deduped candidate pool. */
async function buildCandidatePool(): Promise<CandidatePool> {
  const enabledSources = rssSources.filter((s) => s.enabled);
  const settled = await Promise.allSettled(enabledSources.map(fetchFromSource));

  let feedsSucceeded = 0;
  let feedsFailed = 0;
  let itemsRejected = 0;
  const all: RssReadingText[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled" && result.value.ok) {
      feedsSucceeded++;
      all.push(...result.value.items);
      itemsRejected += result.value.rejected;
    } else {
      feedsFailed++;
    }
  }

  const items = dedupe(all);
  // Best-effort, batched, concurrent — see articleBlurbs.ts. Never throws;
  // a failure here just leaves blurbEn null on the affected items.
  await attachEnglishBlurbs(items);

  return { builtAt: Date.now(), items, feedsSucceeded, feedsFailed, itemsRejected };
}

async function getCandidatePool(forceRefresh: boolean): Promise<CandidatePool> {
  const isStale =
    !candidatePoolCache || Date.now() - candidatePoolCache.builtAt > CANDIDATE_POOL_TTL_MS;
  if (forceRefresh || isStale) {
    candidatePoolCache = await buildCandidatePool();
  }
  const pool = candidatePoolCache;
  if (!pool) throw new Error("unreachable: candidate pool was just built");
  return pool;
}

function parseLimit(raw: string | null): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.floor(n));
}

function isKnownCategory(value: string): value is Category {
  return ["news-style", "sport", "culture", "science", "everyday life"].includes(value);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const languageParam = url.searchParams.get("language") ?? "all";
  const categoryParam = url.searchParams.get("category") ?? "all";
  const refresh = url.searchParams.get("refresh") === "true";

  const pool = await getCandidatePool(refresh);
  const todayK = todayKey();

  const isPlainDefaultQuery =
    limit === DEFAULT_LIMIT && languageParam === "all" && categoryParam === "all";

  let selected: RssReadingText[];

  if (isPlainDefaultQuery && !refresh && dailySelectionCache?.dateKey === todayK) {
    selected = dailySelectionCache.items;
  } else {
    let candidates = pool.items;
    if (languageParam !== "all") {
      candidates = candidates.filter((t) => t.language === languageParam);
    }
    if (categoryParam !== "all" && isKnownCategory(categoryParam)) {
      candidates = candidates.filter((t) => t.category === categoryParam);
    }
    // Deterministic per (day, language, category) — same inputs always
    // shuffle to the same order, so the selection is stable all day and
    // only changes once the date (or the query) changes. Never Math.random().
    const seed = `${todayK}::${languageParam}::${categoryParam}`;
    selected = seededShuffle(candidates, seed).slice(0, limit);

    if (isPlainDefaultQuery) {
      dailySelectionCache = { dateKey: todayK, items: selected };
    }
  }

  // Best-effort, optional persistence so a direct link to one of these
  // articles survives a new tab/app restart — no-ops if no KV/Redis store
  // is configured (see rssTextStore.ts). Never blocks or fails the response.
  await putPersistedRssTexts(selected.map(rssReadingTextToReadingText));

  return NextResponse.json({
    texts: selected,
    fetchedAt: new Date().toISOString(),
    // Lets the home page show "fewer than 5" as an intentional quality
    // decision rather than a bug — see UI fallback behaviour in the README.
    fewerThanRequested: selected.length < limit,
    ...(isDev && {
      debug: {
        feedsSucceeded: pool.feedsSucceeded,
        feedsFailed: pool.feedsFailed,
        itemsRejected: pool.itemsRejected,
        candidatePoolSize: pool.items.length,
        candidatePoolBuiltAt: new Date(pool.builtAt).toISOString(),
        selectedIds: selected.map((t) => t.id),
        seed: `${todayK}::${languageParam}::${categoryParam}`,
      },
    }),
  });
}
