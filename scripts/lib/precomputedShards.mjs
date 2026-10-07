// Shard layout for src/data/precomputed/shard-N.json. Must match
// shardForId/NUM_SHARDS in src/lib/ai/precomputedTranslations.ts.

export const NUM_SHARDS = 16;

export function shardForId(articleId) {
  let hash = 0;
  for (let i = 0; i < articleId.length; i++) {
    hash = (hash * 31 + articleId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % NUM_SHARDS;
}
