import { NextResponse } from "next/server";
import { rssSources, type RssSource } from "@/data/rssSources";
import { parseRssFeed } from "@/lib/rss/parseRss";
import { itemToRssReadingText, type RssReadingText } from "@/lib/rss/rssToReadingText";
import { rssReadingTextToReadingText } from "@/lib/rss/adaptReadingText";
import { putPersistedRssTexts } from "@/lib/rss/rssTextStore";

// How long each upstream feed fetch is cached via Next's Data Cache (not the
// route itself — this route is intentionally dynamic; see note below).
const FEED_REVALIDATE_SECONDS = 900;

const FEED_TIMEOUT_MS = 8000;
const MAX_PER_SOURCE = 2;
const MAX_TEXTS = 20;

/**
 * Fetches one source's feed and returns up to MAX_PER_SOURCE items that
 * yield a usable reading text. Any failure (network, timeout, bad XML, no
 * suitable items) resolves to [] rather than throwing, so one broken feed
 * never affects the others — the caller runs every source through
 * Promise.allSettled.
 */
async function fetchUpToTwoFromSource(source: RssSource): Promise<RssReadingText[]> {
  try {
    const res = await fetch(source.feedUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LireReader/1.0)" },
      next: { revalidate: FEED_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const items = parseRssFeed(xml);

    const texts: RssReadingText[] = [];
    for (const item of items) {
      if (texts.length >= MAX_PER_SOURCE) break;
      const text = await itemToRssReadingText(item, source);
      if (text) texts.push(text);
    }
    return texts;
  } catch {
    // Network error, timeout, or parsing failure — skip this source silently.
    return [];
  }
}

export async function GET() {
  const enabledSources = rssSources.filter((s) => s.enabled);

  const settled = await Promise.allSettled(enabledSources.map(fetchUpToTwoFromSource));

  const texts: RssReadingText[] = settled
    .filter(
      (r): r is PromiseFulfilledResult<RssReadingText[]> => r.status === "fulfilled"
    )
    .flatMap((r) => r.value)
    .slice(0, MAX_TEXTS);

  // Best-effort, optional persistence so a direct link to one of these
  // articles survives a new tab/app restart — no-ops if no KV/Redis store
  // is configured (see rssTextStore.ts). Never blocks or fails the response.
  await putPersistedRssTexts(texts.map(rssReadingTextToReadingText));

  return NextResponse.json({ texts, fetchedAt: new Date().toISOString() });
}
