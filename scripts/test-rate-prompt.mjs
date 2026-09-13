// Logic tests for the "Rate Sorlio" prompt timing and Android-app detection. Run with:
//   node --import ./scripts/register-alias-loader.mjs scripts/test-rate-prompt.mjs
const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
};
globalThis.document = { referrer: "" };

const {
  DAYS_BETWEEN_RATE_PROMPTS,
  LESSONS_BEFORE_RATE_PROMPT,
  getRatePromptState,
  isEligibleForRatePrompt,
  markRatePromptShown,
  markRated,
  recordLessonCompletedForRating,
} = await import("../src/lib/ratePrompt.ts");
const { isAndroidApp, isAndroidAppReferrer, rememberAndroidAppLaunch } = await import("../src/lib/androidApp.ts");

let passed = 0;
let failed = 0;
function check(label, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`OK ${label}`);
  } else {
    failed++;
    console.log(`FAIL ${label}${detail ? ` - ${detail}` : ""}`);
  }
}

const DAY = 24 * 60 * 60 * 1000;
const now = new Date("2026-10-01T12:00:00Z");

console.log("--- android app detection ---");
check("TWA referrer is recognised", isAndroidAppReferrer("android-app://app.sorlio.reader/"));
check("other app referrers are not", !isAndroidAppReferrer("android-app://com.other.app/"));
check("web referrers are not", !isAndroidAppReferrer("https://sorlio.site/"));
check("a plain browser visit is not the Android app", isAndroidApp() === false);
document.referrer = "android-app://app.sorlio.reader/";
rememberAndroidAppLaunch();
document.referrer = "";
check("a TWA launch is remembered after the referrer is lost", isAndroidApp() === true);

console.log("--- eligibility ---");
store.clear();
const fresh = getRatePromptState();
check("new learners start at zero lessons", fresh.lessonsCompleted === 0 && fresh.lastShownAt === null && fresh.ratedAt === null);
for (let i = 1; i < LESSONS_BEFORE_RATE_PROMPT; i++) recordLessonCompletedForRating();
check("not eligible before enough lessons", !isEligibleForRatePrompt(getRatePromptState(), true, now));
recordLessonCompletedForRating();
check("eligible once the lesson threshold is reached", isEligibleForRatePrompt(getRatePromptState(), true, now));
check("never eligible outside the Android app", !isEligibleForRatePrompt(getRatePromptState(), false, now));

console.log("--- cooldown ---");
markRatePromptShown(now);
check("not shown again right away", !isEligibleForRatePrompt(getRatePromptState(), true, new Date(now.getTime() + DAY)));
check(
  "not shown again just before the cooldown ends",
  !isEligibleForRatePrompt(getRatePromptState(), true, new Date(now.getTime() + (DAYS_BETWEEN_RATE_PROMPTS - 1) * DAY))
);
check(
  "shown again after the cooldown",
  isEligibleForRatePrompt(getRatePromptState(), true, new Date(now.getTime() + DAYS_BETWEEN_RATE_PROMPTS * DAY))
);

console.log("--- rating ends the prompt for good ---");
markRated(now);
check("never eligible after rating", !isEligibleForRatePrompt(getRatePromptState(), true, new Date(now.getTime() + 400 * DAY)));
check("rating keeps the lesson count", getRatePromptState().lessonsCompleted === LESSONS_BEFORE_RATE_PROMPT);

console.log("--- corrupt storage is tolerated ---");
store.set("lire.ratePrompt.v1", "{not json");
check("corrupt state reads as empty", getRatePromptState().lessonsCompleted === 0);

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
