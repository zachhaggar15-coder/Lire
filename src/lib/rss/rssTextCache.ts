import type { ReadingText } from "@/types";
import { pushStore } from "@/lib/supabase/sync";
import { estimateReadingMinutes, truncateAtSentence } from "@/lib/rss/cleanContent";
import { stripSourceBoilerplate } from "@/lib/rss/sourceNoise";

/**
 * Fast session cache plus a bounded localStorage offline cache for RSS
 * texts. Session storage keeps same-tab navigation instant; localStorage
 * lets opened/recent articles survive a fresh tab, app restart, or offline
 * moment without requiring the optional Redis persistence layer.
 */

const KEY = "lire.rssTexts.session";
const OFFLINE_KEY = "lire.rssTexts.offline";
const MAX_OFFLINE_TEXTS = 80;
const PREVIEW_LENGTH = 160;

function hasSessionStorage(): boolean {
  return typeof window !== "undefined" && !!window.sessionStorage;
}

function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readOfflineTexts(): ReadingText[] {
  if (!hasLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(OFFLINE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sanitizeRssText(text: ReadingText): ReadingText {
  const body = stripSourceBoilerplate(text.body);
  if (body === text.body) return text;
  return {
    ...text,
    body,
    preview: truncateAtSentence(body, PREVIEW_LENGTH),
    minutes: estimateReadingMinutes(`${text.title}\n\n${body}`),
  };
}

function sanitizeRssTexts(texts: ReadingText[]): ReadingText[] {
  return texts.map(sanitizeRssText);
}

function writeOfflineTexts(texts: ReadingText[]): void {
  if (!hasLocalStorage()) return;
  const sanitized = sanitizeRssTexts(texts);
  try {
    window.localStorage.setItem(OFFLINE_KEY, JSON.stringify(sanitized.slice(0, MAX_OFFLINE_TEXTS)));
    void pushStore(OFFLINE_KEY);
  } catch {
    // Offline caching is best-effort only.
  }
}

export function cacheRssTexts(texts: ReadingText[]): void {
  const sanitized = sanitizeRssTexts(texts);
  if (hasSessionStorage()) {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify(sanitized));
    } catch {
      // Storage full or unavailable; the reader can still use offline/server fallback.
    }
  }
  cacheOfflineTexts(sanitized);
}

export function getCachedRssTexts(): ReadingText[] {
  if (!hasSessionStorage()) return [];
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const sanitized = sanitizeRssTexts(parsed);
    const nextRaw = JSON.stringify(sanitized);
    if (nextRaw !== raw) window.sessionStorage.setItem(KEY, nextRaw);
    return sanitized;
  } catch {
    return [];
  }
}

export function getCachedRssTextById(id: string): ReadingText | undefined {
  return getCachedRssTexts().find((t) => t.id === id) ?? getOfflineRssTextById(id);
}

export function cacheOfflineTexts(texts: ReadingText[]): void {
  const existing = sanitizeRssTexts(readOfflineTexts());
  const byId = new Map<string, ReadingText>();
  for (const text of [...sanitizeRssTexts(texts), ...existing]) byId.set(text.id, text);
  writeOfflineTexts([...byId.values()]);
}

export function getOfflineRssTexts(): ReadingText[] {
  const raw = readOfflineTexts();
  const sanitized = sanitizeRssTexts(raw);
  if (JSON.stringify(sanitized) !== JSON.stringify(raw)) writeOfflineTexts(sanitized);
  return sanitized;
}

export function getOfflineRssTextById(id: string): ReadingText | undefined {
  return getOfflineRssTexts().find((text) => text.id === id);
}

export function getOfflineRssTextCount(): number {
  return readOfflineTexts().length;
}

export function clearOfflineRssTexts(): void {
  if (!hasLocalStorage()) return;
  window.localStorage.setItem(OFFLINE_KEY, JSON.stringify([]));
  void pushStore(OFFLINE_KEY);
}
