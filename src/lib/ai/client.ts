import type {
  ArticleTranslationRequest,
  ArticleTranslationResult,
  SentenceExplanation,
  SentenceExplanationRequest,
  WordExplanation,
  WordExplanationRequest,
} from "@/lib/ai/types";
import { articleTranslationCacheKey, cacheStore, sentenceCacheKey, wordCacheKey } from "@/lib/ai/cache";

export type AiResult<T> = { data: T; error?: undefined } | { data?: undefined; error: string };

const GENERIC_ERROR = "Couldn't get an AI answer. Please try again.";

/**
 * Calls POST /api/ai/explain-word, cache-first (keyed on word + the exact
 * article sentence, so the same word tapped in the same context never re-
 * generates). AI only ever runs here — i.e. only when the caller (the word
 * sheet's "Ask AI for nuance" button) is explicitly invoked by the reader.
 */
export async function getWordExplanation(req: WordExplanationRequest): Promise<AiResult<WordExplanation>> {
  const key = wordCacheKey(req.word, req.articleSentence);
  const cached = cacheStore.get<WordExplanation>(key);
  if (cached) return { data: cached };

  try {
    const res = await fetch("/api/ai/explain-word", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: (body && typeof body.error === "string" && body.error) || GENERIC_ERROR };
    }
    cacheStore.set(key, body as WordExplanation);
    return { data: body as WordExplanation };
  } catch {
    return { error: GENERIC_ERROR };
  }
}

/**
 * Calls POST /api/ai/explain-sentence, cache-first (keyed on the sentence
 * text). Same on-demand-only contract as getWordExplanation.
 */
export async function getSentenceExplanation(
  req: SentenceExplanationRequest
): Promise<AiResult<SentenceExplanation>> {
  const key = sentenceCacheKey(req.sentence);
  const cached = cacheStore.get<SentenceExplanation>(key);
  if (cached) return { data: cached };

  try {
    const res = await fetch("/api/ai/explain-sentence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: (body && typeof body.error === "string" && body.error) || GENERIC_ERROR };
    }
    cacheStore.set(key, body as SentenceExplanation);
    return { data: body as SentenceExplanation };
  } catch {
    return { error: GENERIC_ERROR };
  }
}

const TRANSLATION_GENERIC_ERROR = "Couldn't get a fluent translation. Please try again.";

/**
 * Calls POST /api/ai/translate-article, cache-first (keyed on article id +
 * sentence text, see articleTranslationCacheKey). Reader.tsx uses this for
 * background prewarming when fluent AI translation is enabled, and as a
 * cache-first fetch if the reader toggles Translate before the prewarm
 * finishes.
 */
export async function getArticleTranslation(
  articleId: string,
  req: ArticleTranslationRequest
): Promise<AiResult<ArticleTranslationResult>> {
  const key = articleTranslationCacheKey(articleId, req.sentences);
  const cached = cacheStore.get<ArticleTranslationResult>(key);
  if (cached) return { data: cached };

  try {
    const res = await fetch("/api/ai/translate-article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: (body && typeof body.error === "string" && body.error) || TRANSLATION_GENERIC_ERROR };
    }
    cacheStore.set(key, body as ArticleTranslationResult);
    return { data: body as ArticleTranslationResult };
  } catch {
    return { error: TRANSLATION_GENERIC_ERROR };
  }
}
