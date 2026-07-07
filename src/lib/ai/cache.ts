import { hashString } from "@/lib/hash";

/**
 * Storage-agnostic cache contract. `CacheStore` is the only thing the AI
 * client services depend on — swap `localStorageCacheStore` for a Supabase-
 * backed implementation later (e.g. a `select`/`upsert` against a
 * `ai_translation_cache` table) without touching any calling code.
 */
export interface CacheStore {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
}

const PREFIX = "lire.aiCache.";

class LocalStorageCacheStore implements CacheStore {
  private hasStorage(): boolean {
    return typeof window !== "undefined" && !!window.localStorage;
  }

  get<T>(key: string): T | null {
    if (!this.hasStorage()) return null;
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.hasStorage()) return;
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — caching is a nice-to-have, not fatal.
    }
  }
}

/** The active cache store. Point this at a Supabase-backed implementation later. */
export const cacheStore: CacheStore = new LocalStorageCacheStore();

export function wordCacheKey(word: string, sentence: string): string {
  return `word:${hashString(`${word.toLowerCase()}::${sentence}`)}`;
}

export function sentenceCacheKey(sentence: string, previousSentence?: string): string {
  return `sentence:${hashString(`${sentence}::${previousSentence ?? ""}`)}`;
}

export function articleCacheKey(textId: string): string {
  return `article:${textId}`;
}
