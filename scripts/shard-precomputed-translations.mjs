// One-off migration: splits the single ~9MB precomputedTranslations.json into
// NUM_SHARDS smaller files under src/data/precomputed/. A reader only ever
// needs ONE article's translation, but the old single-file store meant every
// article open fetched and JSON.parse'd the whole ~9MB blob (all 1406
// articles) in the background — real cold-start/bandwidth cost on a slow
// connection, and main-thread jank parsing it. Sharding means a typical
// fetch is ~1/16th the size.
//
// Usage: node scripts/shard-precomputed-translations.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "fs";

const SOURCE_PATH = new URL("../src/data/precomputedTranslations.json", import.meta.url);
const OUTPUT_DIR = new URL("../src/data/precomputed/", import.meta.url);
export const NUM_SHARDS = 16;

export function shardForId(articleId) {
  let hash = 0;
  for (let i = 0; i < articleId.length; i++) {
    hash = (hash * 31 + articleId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % NUM_SHARDS;
}

function main() {
  const store = JSON.parse(readFileSync(SOURCE_PATH, "utf8"));
  const shards = Array.from({ length: NUM_SHARDS }, () => ({}));

  for (const [id, translation] of Object.entries(store)) {
    shards[shardForId(id)][id] = translation;
  }

  if (existsSync(OUTPUT_DIR)) rmSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });

  for (let i = 0; i < NUM_SHARDS; i++) {
    writeFileSync(new URL(`shard-${i}.json`, OUTPUT_DIR), JSON.stringify(shards[i]));
  }

  console.log(`Wrote ${NUM_SHARDS} shards covering ${Object.keys(store).length} articles to ${OUTPUT_DIR.pathname}`);
}

main();
