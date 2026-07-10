// One-off diagnostic: fetch a single RSS source and print itemToRssReadingText's
// rejection reason for every item, so a 100%-rejected source in the health
// panel can be triaged (genuinely dead vs. this run's bad luck) before
// deciding whether to disable it in rssSources.ts. Not part of the test
// suite — run manually with:
//   node --import ./scripts/register-alias-loader.mjs scripts/diag-rss-source.mjs <source-id> [--body]
import { rssSources } from "../src/data/rssSources.ts";
import { parseRssFeed } from "../src/lib/rss/parseRss.ts";
import { itemToRssReadingText } from "../src/lib/rss/rssToReadingText.ts";
import { cleanRssText } from "../src/lib/rss/cleanContent.ts";

const id = process.argv[2];
const showBody = process.argv.includes("--body");
const source = rssSources.find((s) => s.id === id);
if (!source) {
  console.log(`No source with id "${id}"`);
  process.exit(1);
}

const res = await fetch(source.feedUrl, {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; LireReader/1.0)" },
});
console.log(`${source.name} (${source.feedUrl}) -> HTTP ${res.status}`);
const xml = await res.text();
const items = parseRssFeed(xml);
console.log(`Parsed ${items.length} items`);

for (const item of items.slice(0, 6)) {
  if (showBody) {
    const candidateBodies = [item.description, item.contentEncoded].filter(Boolean).map(cleanRssText);
    const cleanedBody = candidateBodies.sort((a, b) => b.length - a.length)[0] ?? "";
    console.log(`--- "${item.title}" (${cleanedBody.split(/\s+/).filter(Boolean).length} words) ---`);
    console.log(cleanedBody.slice(0, 500));
    console.log();
  }
  const result = await itemToRssReadingText(item, source);
  if (result.ok) {
    console.log(`OK: "${item.title}" -> ${result.text.originalText.split(/\s+/).length} words, snippet=${result.text.isShortSnippet}`);
  } else {
    console.log(`REJECT: "${item.title}" -> ${result.rejection.reason}`);
  }
}
