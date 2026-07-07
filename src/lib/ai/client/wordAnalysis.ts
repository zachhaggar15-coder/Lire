import type { WordAnalysis } from "@/lib/ai/types";
import { cacheStore, wordCacheKey } from "@/lib/ai/cache";

/**
 * Context-aware word analysis for the word bottom sheet (and, on first
 * save, for the vocabulary fields stored with the word). Checks the local
 * cache first — a cache hit costs nothing; a miss calls POST /api/ai/word
 * and caches the result. Returns null on any failure so callers can show a
 * graceful "unavailable" state instead of crashing.
 */
export async function getWordAnalysis(
  word: string,
  sentence: string,
  previousSentence?: string
): Promise<WordAnalysis | null> {
  const key = wordCacheKey(word, sentence);
  const cached = cacheStore.get<WordAnalysis>(key);
  if (cached) return cached;

  try {
    const res = await fetch("/api/ai/word", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, sentence, previousSentence }),
    });
    if (!res.ok) return null;

    const analysis: WordAnalysis = await res.json();
    cacheStore.set(key, analysis);
    return analysis;
  } catch {
    return null;
  }
}
