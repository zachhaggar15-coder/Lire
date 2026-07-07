import type { SentenceExplanation } from "@/lib/ai/types";
import { cacheStore, sentenceCacheKey } from "@/lib/ai/cache";

/**
 * AI translation + grammar/idiom explanation for the sentence bottom sheet.
 * Cache-first, same failure contract as getWordAnalysis: null means
 * "couldn't get an explanation," not "there is no explanation."
 */
export async function getSentenceExplanation(
  sentence: string,
  previousSentence?: string
): Promise<SentenceExplanation | null> {
  const key = sentenceCacheKey(sentence, previousSentence);
  const cached = cacheStore.get<SentenceExplanation>(key);
  if (cached) return cached;

  try {
    const res = await fetch("/api/ai/sentence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence, previousSentence }),
    });
    if (!res.ok) return null;

    const result: SentenceExplanation = await res.json();
    cacheStore.set(key, result);
    return result;
  } catch {
    return null;
  }
}
