import type { ReadingText } from "@/types";

/**
 * Session-only cache for the RSS texts fetched on the home page. RSS ids
 * aren't known at build time (unlike the hardcoded texts), so the reader
 * route can't look them up server-side — instead the home page caches the
 * mapped texts here right after a successful fetch, and the reader page
 * reads from it client-side. Cleared automatically when the tab closes.
 */

const KEY = "lire.rssTexts.session";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.sessionStorage;
}

export function cacheRssTexts(texts: ReadingText[]): void {
  if (!hasStorage()) return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(texts));
  } catch {
    // Storage full or unavailable — the reader will just fall back to "not found".
  }
}

export function getCachedRssTexts(): ReadingText[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCachedRssTextById(id: string): ReadingText | undefined {
  return getCachedRssTexts().find((t) => t.id === id);
}
