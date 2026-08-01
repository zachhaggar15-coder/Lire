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

    let cancelled = false;
    fetch(`/api/rss-texts/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { text: ReadingText } | null) => {
        if (cancelled) return;
        setText(data?.text ?? null);
        setChecked(true);
      })
      .catch(() => {
        if (!cancelled) {
          setText(null);
          setChecked(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, initialText]);

  return { text, checked };
}
