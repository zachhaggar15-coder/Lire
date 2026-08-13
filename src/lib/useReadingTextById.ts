"use client";

import { useEffect, useState } from "react";
import type { ReadingText } from "@/types";
import { getCustomTextById } from "@/lib/customTexts";
import { getCachedRssTextById } from "@/lib/rss/rssTextCache";

/**
 * Resolves a reading text by id on the client, for routes that only have the
 * id in the URL. Hardcoded texts resolve server-side elsewhere and can be
 * passed in as `initialText`; RSS texts don't have stable build-time ids, so
 * they're looked up client-side: first the sessionStorage cache the home page
 * populates right after fetching (fast, no network), and if that misses
 * (e.g. a direct link opened in a fresh tab), the optional server-side
 * persisted store via GET /api/rss-texts/[id] — which itself no-ops to
 * "not found" if no KV/Redis store is configured.
 */
export function useReadingTextById(id: string, initialText: ReadingText | null): { text: ReadingText | null; checked: boolean } {
  const [text, setText] = useState<ReadingText | null>(initialText);
  const [checked, setChecked] = useState(initialText !== null);

  useEffect(() => {
    if (initialText) return;

    const custom = getCustomTextById(id);
    if (custom) {
      setText(custom);
      setChecked(true);
      return;
    }

    const cached = getCachedRssTextById(id);
    if (cached) {
      setText(cached);
      setChecked(true);
      return;
    }

    // Only live-news articles use the remote RSS lookup path. A missing
    // bundled/custom id can be rejected immediately; asking the RSS fallback
    // for an id it could never contain used to trigger a full cold candidate-
    // pool build before showing the unavailable screen.
    if (!id.startsWith("rss-")) {
      setText(null);
      setChecked(true);
      return;
    }

    let cancelled = false;
    async function loadRemoteText() {
      try {
        const encodedId = encodeURIComponent(id);
        let response = await fetch(`/api/rss-texts/${encodedId}`);
        // Redis is optional. If it has not been configured or this entry has
        // expired, ask today's candidate pool for the exact id instead of
        // declaring a freshly shared article unavailable.
        if (!response.ok) response = await fetch(`/api/rss-texts?id=${encodedId}`);
        const data = response.ok ? ((await response.json()) as { text?: ReadingText }) : null;
        if (!cancelled) setText(data?.text ?? null);
      } catch {
        if (!cancelled) setText(null);
      } finally {
        if (!cancelled) setChecked(true);
      }
    }
    void loadRemoteText();

    return () => {
      cancelled = true;
    };
  }, [id, initialText]);

  return { text, checked };
}
