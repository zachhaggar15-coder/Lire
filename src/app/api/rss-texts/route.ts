import { NextResponse } from "next/server";
import { rssSources, type RssSource } from "@/data/rssSources";
import { parseRssFeed } from "@/lib/rss/parseRss";
import { itemToRssReadingText, type RssReadingText } from "@/lib/rss/rssToReadingText";
import { rssReadingTextToReadingText } from "@/lib/rss/adaptReadingText";
import { putPersistedRssTexts } from "@/lib/rss/rssTextStore";

// Re-fetch feeds at most every 15 minutes; serve the cached route response in between.
export const revalidate = 900;

const FEED_TIMEOUT_MS = 8000;
const MAX_TEXTS = 5;

/**
 * Fetches one source's feed and returns the first item that yields a usable
 * reading text. Any failure (network, timeout, bad XML, no suitable item)
 * resolves to null rather than throwing, so one broken feed never affects
 * the others — the caller runs every source through Promise.allSettled.
 */
async function fetchOneFromSource(source: RssSource): Promise<RssReadingText | null> {
  try {
    const res = await fetch(source.feedUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LireReader/1.0)" },
      next: { revalidate },
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const xml = await res.text();
    const items = parseRssFeed(xml);

    for (const item of items) {
      const text = await itemToRssReadingText(item, source);
      if (text) return text;
    }
    return null;
  } catch {
    // Network error, timeout, or parsing failure — skip this source silently.
    return null;
  }
}

export async function GET() {
  const enabledSources = rssSources.filter((s) => s.enabled);

  const settled = await Promise.allSettled(enabledSources.map(fetchOneFromSource));

  const texts: RssReadingText[] = settled
    .filter(
      (r): r is PromiseFulfilledResult<RssReadingText | null> => r.status === "fulfilled"
    )
    .map((r) => r.value)
    .filter((t): t is RssReadingText => t !== null)
    .slice(0, MAX_TEXTS);

  // Best-effort, optional persistence so a direct link to one of these
  // articles survives a new tab/app restart — no-ops if no KV/Redis store
  // is configured (see rssTextStore.ts). Never blocks or fails the response.
  await putPersistedRssTexts(texts.map(rssReadingTextToReadingText));

  return NextResponse.json({ texts, fetchedAt: new Date().toISOString() });
}
