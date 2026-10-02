import { NextResponse, after } from "next/server";
import { isApprovedRssSource, rssSources, type RssSource } from "@/data/rssSources";
import type { RssReadingText } from "@/lib/rss/rssToReadingText";
import { rssReadingTextToReadingText } from "@/lib/rss/adaptReadingText";
import {
  getCurrentPersistedCandidatePool,
  getPersistedCandidatePool,
  getRssRefreshHealth,
  isRssPersistenceConfigured,
  putPersistedRssTexts,
} from "@/lib/rss/rssTextStore";
import { previousDateKey, todayKey } from "@/lib/rss/seededShuffle";
import type { Category } from "@/types";
import {
  createFallbackCandidatePool,
  filterFreshCandidatePool,
  isCandidatePool,
  isFreshCandidatePool,
  sortNewestFirst,
  type CandidatePool,
} from "@/lib/rss/candidatePool";
import { refreshAndPersistCandidatePool } from "@/lib/rss/candidatePoolRefresh";
import { getRssListingCacheHeaders } from "@/lib/rss/rssDeliveryPolicy";

/**
 * Rebuilding the candidate pool now sometimes scrapes full articles
 * (scrapeArticle.ts) on top of the per-feed XML fetch, which can push a
 * single feed's processing well past the platform's default serverless
 * timeout. The scheduled refresh (or an authenticated manual refresh) pays
 * this cost. User-facing requests only read a promoted pool or local fallback.
 */
export const maxDuration = 300;

/** How many texts a plain (unfiltered) request gets by default. */
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;
const isDev = process.env.NODE_ENV !== "production";

// Process-lifetime hot cache. A cold instance reads the shared promoted pool;
// it never makes an app-opening user wait for upstream RSS or AI work.
let candidatePoolCache: CandidatePool | null = null;
let dailySelectionCache: { dateKey: string; items: RssReadingText[] } | null = null;

function scheduleBackgroundRefresh(): void {
  if (!isRssPersistenceConfigured()) return;
  after(async () => {
    const result = await refreshAndPersistCandidatePool();
    if (result.ok && result.status === "refreshed") {
      candidatePoolCache = result.pool;
      dailySelectionCache = null;
    }
  });
}

/**
 * Resolves a prepared pool without ever doing upstream RSS or AI work in the
 * user's request. The order is hot memory, today's Redis pool, the last
 * successfully promoted pool, yesterday's pool, then bundled local content.
 */
async function getCandidatePool(): Promise<CandidatePool> {
  const todayK = todayKey();
  if (candidatePoolCache && isFreshCandidatePool(candidatePoolCache, Date.now(), todayK)) {
    return candidatePoolCache;
  }

  const todayPool = await getPersistedCandidatePool<unknown>(todayK);
  if (isCandidatePool(todayPool)) {
    const freshPool = filterFreshCandidatePool(todayPool);
    if (isFreshCandidatePool(freshPool, Date.now(), todayK)) {
      candidatePoolCache = freshPool;
      return freshPool;
    }
  }

  const currentPool = await getCurrentPersistedCandidatePool<unknown>();
  if (isCandidatePool(currentPool)) {
    const freshPool = filterFreshCandidatePool(currentPool);
    if (isFreshCandidatePool(freshPool, Date.now(), todayK)) {
      candidatePoolCache = freshPool;
      scheduleBackgroundRefresh();
      return freshPool;
    }
  }

  const previousPool = await getPersistedCandidatePool<unknown>(previousDateKey(todayK));
  if (isCandidatePool(previousPool)) {
    const freshPool = filterFreshCandidatePool(previousPool);
    if (isFreshCandidatePool(freshPool, Date.now(), todayK)) {
      candidatePoolCache = freshPool;
      scheduleBackgroundRefresh();
      return freshPool;
    }
  }

  const fallback = createFallbackCandidatePool();
  candidatePoolCache = fallback;
  scheduleBackgroundRefresh();
  return fallback;
}

export function parseLimit(raw: string | null): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.floor(n));
}

export function clampRssSelectionToLimit<T>(items: T[], limit: number): T[] {
  return items.slice(0, Math.max(0, limit));
}

function isKnownCategory(value: string): value is Category {
  return ["news-style", "sport", "culture", "science", "everyday life"].includes(value);
}

function isKnownLanguage(value: string): value is RssSource["language"] {
  return value === "fr" || value === "en" || value === "mixed";
}

function isKnownSnippetFilter(value: string): value is "all" | "only" | "exclude" {
  return value === "all" || value === "only" || value === "exclude";
}

/**
 * Wraps the whole handler so an unexpected error anywhere in the pipeline
 * (a bad feed, a broken dependency, anything not already handled per-source
 * in fetchFromSource/buildCandidatePool) degrades to an empty-but-valid
 * response instead of a hard 500. This matters a lot more than it would for
 * a typical route: a 500 here means the home page's client-side catch falls
 * back to the same handful of static hardcoded texts on *every* load until
 * someone notices and redeploys a fix — exactly what happened when a static
 * jsdom import (see scrapeArticle.ts) started throwing at module-load time
 * in production and took this whole route down with it, silently, for
 * every request, with no daily variety at all in the meantime.
 */
export async function GET(request: Request) {
  try {
    return await handleGet(request);
  } catch (err) {
    if (isDev) console.error("GET /api/rss-texts failed unexpectedly:", err);
    const isHealthCheck = new URL(request.url).searchParams.get("health") === "true";
    return NextResponse.json(
      { ok: false, texts: [], fetchedAt: new Date().toISOString(), fewerThanRequested: true, error: "RSS delivery failed." },
      { status: isHealthCheck ? 503 : 200, headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }
}

async function handleGet(request: Request) {
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const rawLanguageParam = url.searchParams.get("language") ?? "all";
  const languageParam: RssSource["language"] | "all" = isKnownLanguage(rawLanguageParam) ? rawLanguageParam : "all";
  const categoryParam = url.searchParams.get("category") ?? "all";
  const rawSnippetParam = url.searchParams.get("snippets") ?? "all";
  const snippetParam = isKnownSnippetFilter(rawSnippetParam) ? rawSnippetParam : "all";
  const refresh = url.searchParams.get("refresh") === "true";
  const includeHealth = url.searchParams.get("health") === "true";
  const requestedId = url.searchParams.get("id")?.trim() || null;

  let pool: CandidatePool;
  let refreshStatus: string | undefined;
  let persistenceReason: string | undefined;

  if (refresh) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json(
        { ok: false, error: "CRON_SECRET is not configured" },
        { status: 503 }
      );
    }
    if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const result = await refreshAndPersistCandidatePool();
    refreshStatus = result.status;
    persistenceReason = result.persistenceReason;
    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          refreshStatus: result.status,
          error: result.persistenceReason,
          poolSize: result.pool?.items.length,
          feedsSucceeded: result.pool?.feedsSucceeded,
          feedsFailed: result.pool?.feedsFailed,
        },
        { status: result.status === "not-configured" ? 503 : 502 }
      );
    }

    if (result.status === "refreshed") {
      pool = result.pool;
      candidatePoolCache = result.pool;
      dailySelectionCache = null;
    } else {
      pool = await getCandidatePool();
    }
  } else {
    pool = await getCandidatePool();
  }

  if (requestedId) {
    const match = pool.items.find((item) => item.id === requestedId);
    if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const text = rssReadingTextToReadingText(match);
    after(() => putPersistedRssTexts([text]));
    return NextResponse.json({ text });
  }
  const todayK = todayKey();

  const isPlainDefaultQuery =
    limit === DEFAULT_LIMIT && languageParam === "all" && categoryParam === "all" && snippetParam === "all";

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
    if (snippetParam === "only") {
      candidates = candidates.filter((t) => t.isShortSnippet);
    } else if (snippetParam === "exclude") {
      candidates = candidates.filter((t) => !t.isShortSnippet);
    }
    // Current news is always newest-first. The pool itself is already
    // deduplicated and bounded per source, but sort again after filters so
    // every API variant preserves the same freshness guarantee.
    selected = sortNewestFirst(candidates).slice(0, limit);

    if (isPlainDefaultQuery) {
      dailySelectionCache = { dateKey: todayK, items: selected };
    }
  }

  selected = clampRssSelectionToLimit(selected, limit);

  // Direct-link persistence runs after the response so it never delays the
  // page. The complete promoted pool is already shared through Redis.
  after(() => putPersistedRssTexts(selected.map(rssReadingTextToReadingText)));

  const refreshHealth = includeHealth ? await getRssRefreshHealth() : null;
  const body = {
    texts: selected,
    fetchedAt: new Date().toISOString(),
    // When the underlying candidate pool was actually built/refreshed —
    // distinct from fetchedAt (which is just "now"). Lets the News page
    // show a real "Updated HH:MM" instead of implying constant freshness.
    poolBuiltAt: new Date(pool.builtAt).toISOString(),
    // Lets the home page show "fewer than 5" as an intentional quality
    // decision rather than a bug — see UI fallback behaviour in the README.
    fewerThanRequested: selected.length < limit,
    // Always included (unlike the verbose per-source sourceHealth array
    // below) — just two counts, cheap enough to send on every load, and
    // enough for the home page to notice "a lot of feeds are down today"
    // and say so, instead of a reader just seeing thinner variety with no
    // explanation. See the degraded-sources banner in page.tsx.
    feedHealth: { feedsSucceeded: pool.feedsSucceeded, feedsFailed: pool.feedsFailed },
    // This is intentionally present on ordinary reader requests too. A
    // fallback pool is useful reading material, but it must never be framed
    // as current reporting by the UI.
    servingFallback: pool.isFallback === true,
    ...(refresh && { ok: true, refreshStatus, persistenceReason }),
    ...(includeHealth && {
      sourceHealth: refreshHealth?.sourceHealth ?? pool.sourceHealth,
      sourceSummary: {
        lastSuccessfulRefreshAt:
          refreshHealth?.lastSuccessfulRefreshAt ?? (pool.isFallback ? null : new Date(pool.builtAt).toISOString()),
        feedsAttempted: refreshHealth?.feedsAttempted ?? pool.feedsSucceeded + pool.feedsFailed,
        feedsSucceeded: refreshHealth?.feedsSucceeded ?? pool.feedsSucceeded,
        feedsFailed:
          refreshHealth
            ? Math.max(0, refreshHealth.feedsAttempted - refreshHealth.feedsSucceeded)
            : pool.feedsFailed,
        itemsRejected: pool.itemsRejected,
        candidatePoolSize: pool.items.length,
        candidatePoolBuiltAt: new Date(pool.builtAt).toISOString(),
        candidatePoolBuildDurationMs: pool.buildDurationMs ?? null,
        servingFallback: pool.isFallback === true,
        liveItemsAvailable: pool.isFallback ? 0 : pool.items.length,
        enabledSources: rssSources.filter(isApprovedRssSource).map((source) => ({ id: source.id, name: source.name })),
        newestItemAt: pool.isFallback ? null : refreshHealth?.newestItemAt ?? pool.items[0]?.publishedAt ?? null,
        oldestLiveItemAt: pool.isFallback ? null : refreshHealth?.oldestLiveItemAt ?? pool.items.at(-1)?.publishedAt ?? null,
        lastRefreshAttemptAt: refreshHealth?.attemptedAt ?? null,
        lastRefreshStatus: refreshHealth?.status ?? null,
        lastRefreshReason: refreshHealth?.reason ?? null,
        persistenceConfigured: isRssPersistenceConfigured(),
      },
    }),
    ...(isDev && {
      debug: {
        feedsSucceeded: pool.feedsSucceeded,
        feedsFailed: pool.feedsFailed,
        itemsRejected: pool.itemsRejected,
        candidatePoolSize: pool.items.length,
        candidatePoolBuiltAt: new Date(pool.builtAt).toISOString(),
        selectedIds: selected.map((t) => t.id),
        sourceHealth: pool.sourceHealth,
        ordering: "publishedAt-desc",
      },
    }),
  };

  return NextResponse.json(body, {
    headers:
      refresh || includeHealth || pool.isFallback
        ? { "Cache-Control": "private, no-store, max-age=0" }
        : getRssListingCacheHeaders(),
  });
}
