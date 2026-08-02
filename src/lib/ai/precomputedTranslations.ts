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
 * Split into NUM_SHARDS files (src/data/precomputed/shard-N.json) rather than
 * one ~9MB blob — see scripts/shard-precomputed-translations.mjs. A reader
 * only ever needs one article's translation, so sharding cuts what a single
 * article open has to fetch and JSON.parse from ~9MB to roughly 1/16th of
 * that. Each shard is still loaded via dynamic import, same reasoning as
 * fr-en-generated.ts: keeps it out of the shared client bundle so pages that
 * never open a reader (Settings, Words, Review) don't pay for it at all.
 */
const NUM_SHARDS = 16;

function shardForId(articleId: string): number {
  let hash = 0;
  for (let i = 0; i < articleId.length; i++) {
    hash = (hash * 31 + articleId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % NUM_SHARDS;
}

const shardCache = new Map<number, Promise<Record<string, ArticleTranslationResult>>>();

function loadShard(shard: number): Promise<Record<string, ArticleTranslationResult>> {
  let promise = shardCache.get(shard);
  if (!promise) {
    promise = import(`@/data/precomputed/shard-${shard}.json`).then(
      (module) => (module.default ?? module) as unknown as Record<string, ArticleTranslationResult>
    );
    shardCache.set(shard, promise);
  }
  return promise;
}

/** Returns the precomputed translation for this article id, or null if it isn't in the store (RSS/imported text, or the precompute script hasn't covered it yet). */
export async function getPrecomputedTranslation(articleId: string): Promise<ArticleTranslationResult | null> {
  try {
    const store = await loadShard(shardForId(articleId));
    return store[articleId] ?? null;
  } catch {
    return null;
  }
}
