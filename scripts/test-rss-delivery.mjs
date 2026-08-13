import {
  CANDIDATE_POOL_MAX_AGE_MS,
  MIN_PROMOTABLE_CANDIDATE_POOL_SIZE,
  isCandidatePool,
  isFreshCandidatePool,
  validateCandidatePoolForPromotion,
} from "../src/lib/rss/candidatePool.ts";
import { RSS_LISTING_CDN_CACHE_CONTROL, getRssListingCacheHeaders } from "../src/lib/rss/rssDeliveryPolicy.ts";
import { todayKey } from "../src/lib/rss/seededShuffle.ts";

let passed = 0;
let failed = 0;

function check(label, actual, expected) {
  const ok = actual === expected;
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? "✓" : "✗"} ${label} — expected ${expected}, got ${actual}`);
}

function makePool(overrides = {}) {
  return {
    builtAt: Date.now(),
    dateKey: todayKey(),
    items: Array.from({ length: MIN_PROMOTABLE_CANDIDATE_POOL_SIZE }, (_, index) => ({ id: `rss-${index}` })),
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

console.log("\n--- RSS delivery cache policy ---");
const headers = getRssListingCacheHeaders();
check("browser responses require revalidation", headers["Cache-Control"], "public, max-age=0, must-revalidate");
check("Vercel CDN gets the shared RSS cache policy", headers["Vercel-CDN-Cache-Control"], RSS_LISTING_CDN_CACHE_CONTROL);
check("CDN keeps a six-hour fresh window", RSS_LISTING_CDN_CACHE_CONTROL.includes("s-maxage=21600"), true);
check("CDN can serve stale data during revalidation", RSS_LISTING_CDN_CACHE_CONTROL.includes("stale-while-revalidate=86400"), true);

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
