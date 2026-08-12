"use client";

import { useEffect } from "react";
import type { RssReadingText } from "@/lib/rss/rssToReadingText";
import { rssReadingTextToReadingText } from "@/lib/rss/adaptReadingText";
import { cacheDefaultLiveNewsPool, getCachedDefaultLiveNewsPool } from "@/lib/rss/rssTextCache";
import { DAILY_RSS_ARTICLE_LIMIT } from "@/lib/publicDomainBank";

/**
 * Mounted once at the root layout, so it fires exactly once per app open
 * (root layout persists across client-side navigation). Warms the same
 * unfiltered payload the News tab's default view fetches, so tapping into
 * /live-news for the first time in a session renders instantly from cache
 * instead of waiting on a fresh network round trip.
 */
export default function RssPrefetch() {
  useEffect(() => {
    if (getCachedDefaultLiveNewsPool()) return;
    const controller = new AbortController();

    async function load() {
      try {
        const params = new URLSearchParams({ limit: String(DAILY_RSS_ARTICLE_LIMIT), snippets: "exclude" });
        const res = await fetch(`/api/rss-texts?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) return;
        const data: { texts: RssReadingText[]; poolBuiltAt?: string } = await res.json();
        cacheDefaultLiveNewsPool(data.texts.map(rssReadingTextToReadingText), data.poolBuiltAt ?? null);
      } catch {
        // Best-effort prefetch; the News tab fetches fresh on its own if this fails.
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  return null;
}
