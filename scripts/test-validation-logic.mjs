import assert from "node:assert/strict";
import {
  sanitizeAnalyticsPayload,
  validateAnalyticsPayload,
} from "../src/lib/analytics/events.ts";
import {
  applyReadingSessionToState,
  isMeaningfulReadingSession,
  retentionReached,
} from "../src/lib/validation/definitions.ts";
import { emptyValidationState } from "../src/lib/validation/state.ts";
import { applyAttribution, attributionFromUrl } from "../src/lib/analytics/attribution.ts";
import { mergeAndroidBetaMetadata, normalizeAndroidBetaInput } from "../src/lib/beta/android.ts";

function check(name, condition) {
  assert.ok(condition, name);
  console.log(`ok - ${name}`);
}

console.log("\n--- Validation analytics rules ---");

check(
  "completed article always counts as meaningful",
  isMeaningfulReadingSession({ completed: true, activeMs: 0, maxProgressPercent: 0, learningActions: 0 })
);
check(
  "deep reading without completion counts as meaningful",
  isMeaningfulReadingSession({ completed: false, activeMs: 45_000, maxProgressPercent: 50, learningActions: 0 })
);
check(
  "support-heavy short reading counts as meaningful",
  isMeaningfulReadingSession({ completed: false, activeMs: 30_000, maxProgressPercent: 10, learningActions: 2 })
);
check(
  "brief passive open is not meaningful",
  !isMeaningfulReadingSession({ completed: false, activeMs: 29_000, maxProgressPercent: 49, learningActions: 1 })
);

const baseState = {
  ...emptyValidationState(),
  anonymousId: "anon_test",
  firstSeenAt: "2026-07-01T09:00:00.000Z",
};
const firstSession = applyReadingSessionToState({
  state: baseState,
  completedAt: "2026-07-01T09:10:00.000Z",
  signals: { completed: true, activeMs: 120_000, maxProgressPercent: 100, learningActions: 1 },
});
check("first completed learning session activates user", firstSession.activatedNow && !!firstSession.state.firstActivatedAt);
check("meaningful session date is recorded once", firstSession.state.meaningfulSessionDates.length === 1);

const secondSession = applyReadingSessionToState({
  state: firstSession.state,
  completedAt: "2026-07-02T09:10:00.000Z",
  signals: { completed: true, activeMs: 90_000, maxProgressPercent: 100, learningActions: 1 },
});
check("two meaningful sessions on two days strongly activates user", secondSession.strongNow);

const thirdSession = applyReadingSessionToState({
  state: secondSession.state,
  completedAt: "2026-07-03T09:10:00.000Z",
  signals: { completed: true, activeMs: 90_000, maxProgressPercent: 100, learningActions: 1 },
});
check("three active meaningful days reaches habit-forming marker", thirdSession.habitNow);
check("day-one retention is detected", retentionReached(baseState.firstSeenAt, ["2026-07-01", "2026-07-02"], "day1"));
check("rolling seven-day retention is detected", retentionReached(baseState.firstSeenAt, ["2026-07-01", "2026-07-06"], "rolling7"));

console.log("\n--- Attribution and payload privacy ---");

const attributed = attributionFromUrl({
  href: "https://liree.vercel.app/?utm_source=reddit&utm_medium=social&utm_campaign=beta&ref=post",
  referrer: "https://example.com/thread",
  now: new Date("2026-07-01T10:00:00.000Z"),
});
check("utm source wins over referrer attribution", attributed.source === "reddit" && attributed.medium === "social");

const direct = attributionFromUrl({
  href: "https://liree.vercel.app/",
  now: new Date("2026-07-01T10:05:00.000Z"),
});
const withExplicit = applyAttribution(emptyValidationState(), attributed, true);
const afterDirect = applyAttribution(withExplicit, direct, false);
check("direct visits do not overwrite explicit first touch", afterDirect.firstTouch?.source === "reddit");
check("direct visits do not overwrite explicit latest touch", afterDirect.latestTouch?.source === "reddit");

check(
  "analytics rejects required-property omissions",
  !validateAnalyticsPayload("article_opened", {}).ok
);
check(
  "analytics rejects sensitive text payload keys",
  !validateAnalyticsPayload("word_lookup_opened", { body: "full article text" }).ok
);
check(
  "analytics sanitizer drops sensitive text payload keys",
  !("body" in sanitizeAnalyticsPayload({ body: "full article text", articleId: "a1" }))
);

console.log("\n--- Android beta input normalization ---");

const context = {
  anonymousId: "anon_test",
  firstSeenAt: "2026-07-01T09:00:00.000Z",
  isReturningUser: true,
  pwaInstalled: false,
  articlesStarted: 2,
  articlesCompleted: 1,
  readingSessionsCompleted: 1,
  wordsSaved: 4,
  reviewsCompleted: 1,
  currentStreak: 2,
  frenchLevel: "A2",
  firstTouchSource: "reddit",
  firstTouchMedium: "social",
  firstTouchCampaign: "beta",
  latestTouchSource: "reddit",
  acquisitionSource: "reddit",
};

const normalized = normalizeAndroidBetaInput({
  email: " Tester@Example.COM ",
  source: "article_completion",
  currentPath: "/reader/story",
  usesAndroid: true,
  motivation: "Reading news on the commute",
  context,
});
check("android beta input lowercases normalized email", normalized.ok && normalized.value.emailNormalized === "tester@example.com");
check(
  "android beta input rejects unknown source",
  !normalizeAndroidBetaInput({ email: "x@example.com", source: "unknown", context }).ok
);

if (!normalized.ok) throw new Error("Expected normalized beta input.");
const merged = mergeAndroidBetaMetadata({ motivation: "Keep this" }, { ...normalized.value, motivation: null });
check("android beta merge preserves existing optional answers", merged.motivation === "Keep this");
check("android beta merge stores behavioural context", merged.articles_completed === 1 && merged.first_touch_source === "reddit");

console.log("\nAll validation logic checks passed.");
