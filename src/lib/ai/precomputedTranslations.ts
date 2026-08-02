import type { ArticleTranslationResult } from "@/lib/ai/types";

/**
 * Fluent translations baked in ahead of time for every static (build-time)
 * reading text — see scripts/precompute-fluent-translations.mjs. Whole-
 * article translations, keyed by article id, covering all the sentences in
 * that article in one shot (unlike the live path, which chunks a long
 * article into several requests).
 *
 * RSS/imported articles are never in this store — they're genuinely dynamic
 * and always go through the live AI path in ai/client.ts.
 *
 * LOAD IT WITH `loadPrecomputedTranslations()`, NOT A STATIC IMPORT — same
 * reasoning as fr-en-generated.ts: keeping the (multi-MB) JSON behind a
 * dynamic import keeps it out of the shared client bundle, so pages that
 * never open a reader (Settings, Words, Review) don't pay to download and
 * parse it.
 */
let cached: Promise<Record<string, ArticleTranslationResult>> | null = null;

function loadPrecomputedTranslations(): Promise<Record<string, ArticleTranslationResult>> {
  if (!cached) {
    cached = import("@/data/precomputedTranslations.json").then(
      (module) => (module.default ?? module) as unknown as Record<string, ArticleTranslationResult>
    );
  }
  return cached;
}

/** Returns the precomputed translation for this article id, or null if it isn't in the store (RSS/imported text, or the precompute script hasn't covered it yet). */
export async function getPrecomputedTranslation(articleId: string): Promise<ArticleTranslationResult | null> {
  try {
    const store = await loadPrecomputedTranslations();
    return store[articleId] ?? null;
  } catch {
    return null;
  }
}
