import {
  CANDIDATE_POOL_MAX_AGE_MS,
  MIN_PROMOTABLE_CANDIDATE_POOL_SIZE,
  buildCandidatePool,
  dedupeRssItems,
  filterFreshCandidatePool,
  isCandidatePool,
  isFreshCandidatePool,
  sortNewestFirst,
  validateCandidatePoolForPromotion,
} from "../src/lib/rss/candidatePool.ts";
import { isApprovedRssSource, rssSources } from "../src/data/rssSources.ts";
import { parseRssFeed } from "../src/lib/rss/parseRss.ts";
import { itemToRssReadingText } from "../src/lib/rss/rssToReadingText.ts";
import { RSS_LISTING_CDN_CACHE_CONTROL, getRssListingCacheHeaders } from "../src/lib/rss/rssDeliveryPolicy.ts";
import { todayKey } from "../src/lib/rss/seededShuffle.ts";
import { clampRssSelectionToLimit, parseLimit } from "../src/app/api/rss-texts/route.ts";
import { readFileSync } from "node:fs";

let passed = 0;
let failed = 0;

function check(label, actual, expected) {
  const ok = actual === expected;
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? "✓" : "✗"} ${label} — expected ${expected}, got ${actual}`);
}

function makePool(overrides = {}) {
  const now = new Date().toISOString();
  return {
    builtAt: Date.now(),
    dateKey: todayKey(),
    items: Array.from({ length: MIN_PROMOTABLE_CANDIDATE_POOL_SIZE }, (_, index) => ({
      id: `rss-${index}`,
      title: `Article ${index}`,
      sourceUrl: `https://example.test/${index}`,
      publishedAt: now,
    })),
    feedsSucceeded: 10,
    feedsFailed: 0,
    itemsRejected: 0,
    sourceHealth: [],
    ...overrides,
  };
}

console.log("--- RSS promotion policy ---");
check("a healthy pool is promotable", validateCandidatePoolForPromotion(makePool()).ok, true);
check(
  "an undersized pool cannot overwrite the last good pool",
  validateCandidatePoolForPromotion(makePool({ items: Array.from({ length: MIN_PROMOTABLE_CANDIDATE_POOL_SIZE - 1 }) })).ok,
  false
);
check("fallback content cannot be promoted", validateCandidatePoolForPromotion(makePool({ isFallback: true })).ok, false);
check("a current live pool is fresh", isFreshCandidatePool(makePool()), true);
check("fallback content is never treated as a fresh live pool", isFreshCandidatePool(makePool({ isFallback: true })), false);
check(
  "an expired pool is not fresh",
  isFreshCandidatePool(makePool({ builtAt: Date.now() - CANDIDATE_POOL_MAX_AGE_MS - 1 })),
  false
);
check("a malformed Redis value is rejected", isCandidatePool({ builtAt: Date.now(), items: [] }), false);
check(
  "a pool containing only stale live items is not fresh",
  isFreshCandidatePool(makePool({ items: [{ publishedAt: "2025-01-01T00:00:00.000Z" }] })),
  false,
);

console.log("\n--- Approved source registry ---");
const approved = rssSources.filter(isApprovedRssSource);
check("four reviewed official feeds are enabled", approved.length, 4);
check("every enabled source has visible attribution", approved.every((source) => source.attributionText.length > 0), true);
check("every enabled source records a checked reuse basis", approved.every((source) => !!source.reuseBasis && !!source.reuseTermsUrl && !!source.reuseTermsCheckedAt), true);
check("enabled sources never permit linked-page scraping", approved.every((source) => !source.contentUse.linkedPageContent && source.allowScraping === false), true);
check("Le Monde remains disabled", rssSources.find((source) => source.id === "le-monde")?.enabled, false);
check("France 24 remains disabled", rssSources.find((source) => source.id === "france-24-french")?.enabled, false);
check("only Parliament has the reviewed one-sentence exception", approved.filter((source) => source.minSentences === 1).map((source) => source.id).join(","), "europarl-press-releases");

console.log("\n--- Parsing, freshness, ordering, and attribution ---");
const currentIso = new Date().toISOString();
const frenchBody = "Le service public annonce une mesure nouvelle pour les habitants. Cette information explique les démarches à suivre et les dates importantes, afin que chacun puisse préparer son dossier correctement et éviter un retard administratif.";
const servicePublicXml = `<rss><channel><item><title>Une démarche &amp; ses dates</title><link>https://www.service-public.gouv.fr/particuliers/actualites/A1?x=1&amp;y=2</link><dc:date>${currentIso}</dc:date><description><![CDATA[${frenchBody}]]></description></item></channel></rss>`;
const parsedServicePublic = parseRssFeed(servicePublicXml);
check("Service-Public-shaped RSS parses an item", parsedServicePublic.length, 1);
check("XML entities are decoded in canonical links", parsedServicePublic[0].link.includes("&y=2"), true);
const converted = await itemToRssReadingText(parsedServicePublic[0], approved[0]);
check("approved Service-Public content converts", converted.ok, true);
check("converted content keeps registry attribution", converted.ok ? converted.text.attributionText : null, approved[0].attributionText);
check("converted content keeps the stable source id", converted.ok ? converted.text.sourceId : null, approved[0].id);
check("converted content records retrieval time", converted.ok ? Number.isFinite(Date.parse(converted.text.retrievedAt)) : false, true);

const staleParsed = [{ ...parsedServicePublic[0], pubDate: "2025-01-01T00:00:00.000Z" }];
const staleConverted = await itemToRssReadingText(staleParsed[0], approved[0]);
check("stale feed content is rejected", staleConverted.ok, false);

const parliament = approved.find((source) => source.id === "europarl-press-releases");
const conciseParliamentItem = {
  ...parsedServicePublic[0],
  title: "Prix européen pour le journalisme",
  link: "https://www.europarl.europa.eu/news/fr/press-room/example",
  description: "Le jury du prix européen pour le journalisme a retenu dix reportages pour cette nouvelle édition organisée aujourd'hui à Strasbourg avec plusieurs partenaires.",
};
const conciseParliamentConverted = parliament ? await itemToRssReadingText(conciseParliamentItem, parliament) : null;
check("reviewed Parliament one-sentence summaries are accepted", conciseParliamentConverted?.ok, true);

const ordered = sortNewestFirst([
  { id: "old", publishedAt: "2026-09-01T00:00:00.000Z" },
  { id: "new", publishedAt: "2026-10-01T00:00:00.000Z" },
]);
check("live items are ordered newest-first", ordered[0].id, "new");
const duplicateBase = converted.ok ? converted.text : null;
check(
  "duplicate URLs are removed",
  duplicateBase ? dedupeRssItems([duplicateBase, { ...duplicateBase, id: "duplicate" }]).length : 0,
  1,
);
check(
  "stale items are pruned from persisted live pools",
  duplicateBase
    ? filterFreshCandidatePool(makePool({ items: [duplicateBase, { ...duplicateBase, id: "stale", publishedAt: "2025-01-01T00:00:00.000Z" }] })).items.length
    : 0,
  1,
);

console.log("\n--- Multi-source resilience ---");
const realFetch = globalThis.fetch;
const testSources = approved.map((source, index) => ({
  ...source,
  id: `test-source-${index}`,
  name: `Test source ${index}`,
  feedUrl: `https://feeds.example.test/${index}.xml`,
  maxItems: 1,
}));
function mockFeed(index) {
  return `<rss><channel><item><title>Actualité officielle ${index}</title><link>https://example.test/article-${index}</link><pubDate>${currentIso}</pubDate><description><![CDATA[${frenchBody}]]></description></item></channel></rss>`;
}
globalThis.fetch = async (url) => {
  const index = Number(String(url).match(/(\d+)\.xml$/)?.[1] ?? -1);
  if (index === 1) return new Response("down", { status: 503 });
  return new Response(mockFeed(index), { status: 200, headers: { "content-type": "application/rss+xml" } });
};
const degradedPool = await buildCandidatePool(testSources);
check("one failing feed does not fail healthy feeds", degradedPool.feedsSucceeded, approved.length - 1);
check("one failing feed is counted", degradedPool.feedsFailed, 1);
check("healthy feeds still contribute live items", degradedPool.items.length, approved.length - 1);

globalThis.fetch = async () => new Response("down", { status: 503 });
const failedPool = await buildCandidatePool(testSources);
check("all failing feeds produce no live items", failedPool.items.length, 0);
check("all failing feeds are counted", failedPool.feedsFailed, approved.length);
check("an all-failed pool cannot be promoted", validateCandidatePoolForPromotion(failedPool).ok, false);
globalThis.fetch = realFetch;

console.log("\n--- RSS delivery cache policy ---");
const headers = getRssListingCacheHeaders();
check("browser responses require revalidation", headers["Cache-Control"], "public, max-age=0, must-revalidate");
check("Vercel CDN gets the shared RSS cache policy", headers["Vercel-CDN-Cache-Control"], RSS_LISTING_CDN_CACHE_CONTROL);
check("CDN keeps a six-hour fresh window", RSS_LISTING_CDN_CACHE_CONTROL.includes("s-maxage=21600"), true);
check("CDN can serve stale data during revalidation", RSS_LISTING_CDN_CACHE_CONTROL.includes("stale-while-revalidate=86400"), true);

console.log("\n--- RSS request limits ---");
const sample = Array.from({ length: 80 }, (_, index) => ({ id: `item-${index}` }));
for (const limit of [1, 3, 5]) {
  check(`limit=${limit} is a hard response ceiling`, clampRssSelectionToLimit(sample, parseLimit(String(limit))).length, limit);
}
check("missing limit uses the documented default", clampRssSelectionToLimit(sample, parseLimit(null)).length, 5);
check("oversized limit is capped at the maximum", clampRssSelectionToLimit(sample, parseLimit("500")).length, 50);
check("fallback-sized input still respects limit=1", clampRssSelectionToLimit(sample.slice(0, 9), parseLimit("1")).length, 1);

console.log("\n--- RSS fallback disclosure ---");
const articleBrowser = readFileSync(new URL("../src/components/ArticleBrowserPage.tsx", import.meta.url), "utf8");
check("fallback is explicitly described as non-current practice content", articleBrowser.includes("classic practice readings, not current reporting"), true);
check("fallback copy does not promise disabled sources will recover", articleBrowser.includes("while live sources recover"), false);
const routeSource = readFileSync(new URL("../src/app/api/rss-texts/route.ts", import.meta.url), "utf8");
check("live responses never invisibly mix in bundled bank content", routeSource.includes("backfillIfShort"), false);
const readingCard = readFileSync(new URL("../src/components/ReadingCard.tsx", import.meta.url), "utf8");
check("article cards expose the original-source link", readingCard.includes("Read the original source"), true);
const vercelConfig = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
check("the RSS refresh cron remains scheduled daily", vercelConfig.crons?.[0]?.schedule, "0 7 * * *");
const cronRoute = readFileSync(new URL("../src/app/api/cron/rss-refresh/route.ts", import.meta.url), "utf8");
check("the scheduled refresh requires the Vercel cron bearer secret", cronRoute.includes("authorization") && cronRoute.includes("CRON_SECRET"), true);
const rssStore = readFileSync(new URL("../src/lib/rss/rssTextStore.ts", import.meta.url), "utf8");
check("candidate pools are staged and read back before promotion", rssStore.includes("staging:") && rssStore.includes("staged.builtAt !== pool.builtAt"), true);
check("candidate-pool promotion updates dated and current keys together", rssStore.includes(".multi()") && rssStore.includes("CURRENT_CANDIDATE_POOL_KEY"), true);

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
