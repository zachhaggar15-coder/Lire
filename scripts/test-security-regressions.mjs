import { existsSync, readFileSync } from "node:fs";
import { escapeFeedbackHtml, feedbackNotificationHtml } from "../src/lib/feedback/email.ts";
import { localRateLimitFallbackAllowed } from "../src/lib/server/rateLimit.ts";

let passed = 0;
let failed = 0;

function check(label, condition) {
  if (condition) passed++;
  else failed++;
  console.log(`${condition ? "OK" : "FAIL"} ${label}`);
}

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

console.log("--- Closed-test grants are navigation-only ---");
const closedTestClient = read("src/lib/access/useClosedTestPremium.ts");
check("client code cannot call an activation endpoint", !/closed-test-premium\/activate/.test(closedTestClient));
check("client code cannot request any temporary grant", !/fetch\(/.test(closedTestClient) && /active:\s*false/.test(closedTestClient));

console.log("--- Admin-only feedback operations require a token ---");
const feedbackRoute = read("src/app/api/admin/feedback/route.ts");
const feedbackDashboard = read("src/app/admin/feedback/page.tsx");
const feedbackLayout = read("src/app/admin/feedback/layout.tsx");
const adminSessionRoute = read("src/app/api/admin/session/route.ts");
check("production test-email route has been removed", !existsSync(new URL("../src/app/api/feedback/test/route.ts", import.meta.url)));
check("feedback reader requires admin authorization", /hasValidationAdminToken\(request\)/.test(feedbackRoute));
check("feedback dashboard uses the protected route", /\/api\/admin\/feedback/.test(feedbackDashboard));
check("feedback dashboard does not query Supabase from the browser", !/getSupabaseClient/.test(feedbackDashboard));
check("feedback dashboard renders an empty result state", /feedback\?\.length === 0/.test(feedbackDashboard));
check("feedback page is blocked by a server-validated session", /await cookies\(\)/.test(feedbackLayout) && /isValidationAdminSessionValue/.test(feedbackLayout));
check(
  "admin session cookie is hardened and does not contain the raw token",
  /validationAdminSessionValue/.test(adminSessionRoute) &&
    /httpOnly:\s*true/.test(adminSessionRoute) &&
    /secure:\s*true/.test(adminSessionRoute) &&
    /sameSite:\s*["']strict["']/.test(adminSessionRoute),
);
check(
  "admin feedback and session responses are not cacheable",
  [feedbackRoute, adminSessionRoute].every((source) => /Cache-Control.*private, no-store/.test(source)),
);

console.log("--- Public submissions retain only verified identities ---");
const feedback = read("src/app/api/feedback/route.ts");
const analytics = read("src/app/api/analytics/events/route.ts");
const research = read("src/app/api/research-prompts/route.ts");
const analyticsClient = read("src/lib/analytics/client.ts");
const feedbackClient = read("src/components/FeedbackModal.tsx");
const researchClient = read("src/components/PostSessionResearchPrompt.tsx");
const rateLimit = read("src/lib/server/rateLimit.ts");
check("feedback uses a verified bearer identity", /authenticatedUser\(request\)/.test(feedback) && /user_id: user\?\.id \?\? null/.test(feedback));
check("analytics ignores a body-supplied user id", /authenticatedUser\(request\)/.test(analytics) && !/event\.authenticatedUserId/.test(analytics));
check("research ignores a body-supplied user id", /authenticatedUser\(request\)/.test(research) && !/clean\(body\.userId/.test(research));
check(
  "signed-in clients attach optional bearer credentials",
  [analyticsClient, feedbackClient, researchClient].every((source) => /getOptionalBearerHeaders/.test(source)),
);
check(
  "analytics timestamps and environment are server-derived",
  /deployment_environment: deploymentEnvironment\(\)/.test(analytics) &&
    /created_at: new Date\(\)\.toISOString\(\)/.test(analytics) &&
    !/event\.deploymentEnvironment/.test(analytics) &&
    !/event\.createdAt/.test(analytics),
);
check("research context is allowlisted before storage", /sanitizeResearchContext\(body\.context\)/.test(research));
check("rate limits use shared Redis when configured", /@upstash\/redis/.test(rateLimit) && /client\.eval/.test(rateLimit));
check("rate-limit increment and expiry are atomic", /INCR/.test(rateLimit) && /PEXPIRE/.test(rateLimit) && /PTTL/.test(rateLimit));
check(
  "shared rate limiting fails closed in production but remains testable locally",
  localRateLimitFallbackAllowed({ NODE_ENV: "production", VERCEL_ENV: "production" }) === false &&
    localRateLimitFallbackAllowed({ NODE_ENV: "development", VERCEL_ENV: undefined }) === true &&
    localRateLimitFallbackAllowed({ NODE_ENV: "production", VERCEL_ENV: "preview" }) === true,
);
check(
  "rate limits do not trust caller-controlled forwarded headers",
  !/headers\.get\(["']x-forwarded-for["']\)/.test(rateLimit) &&
    !/headers\.get\(["']x-real-ip["']\)/.test(rateLimit) &&
    /headers\.get\(["']x-vercel-forwarded-for["']\)/.test(rateLimit),
);

console.log("--- Feedback emails escape supplied text ---");
const hostile = '<img src=x onerror="alert(1)"> & text';
check("HTML escaping encodes executable markup", escapeFeedbackHtml(hostile) === "&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; text");
check("feedback notification contains escaped rather than raw markup", !feedbackNotificationHtml({ category: "other", comment: hostile }).includes(hostile));

console.log("--- Sensitive admin responses are not cacheable ---");
const adminValidation = read("src/app/api/admin/validation/route.ts");
check("admin validation responses declare no-store", /Cache-Control.*private, no-store/.test(adminValidation));

console.log("--- Android beta confirmation copy uses the current product name ---");
const androidBeta = read("src/app/api/android-beta/route.ts");
check("Android beta email does not refer to Lire", !/Lire is still evolving/.test(androidBeta));

console.log("--- RSS fallback honours the requested limit ---");
const rssRoute = read("src/app/api/rss-texts/route.ts");
check("fallback target is capped by the request limit", /Math\.min\(MIN_GUARANTEED_ARTICLES, requestedLimit\)/.test(rssRoute));
check("the request limit is passed into fallback", /backfillIfShort\(selected, pool, snippetParam, todayK, limit\)/.test(rssRoute));
check("RSS response declares whether it is serving a fallback", /servingFallback: pool\.isFallback === true/.test(rssRoute));

console.log("--- Premium save boundaries are visible before interaction ---");
const meaningSheet = read("src/components/MeaningSheet.tsx");
const lessonComplete = read("src/components/LessonCompleteScreen.tsx");
check("word sheet labels an unavailable save as Premium", /Premium · Add to review/.test(meaningSheet) && /canSaveWord/.test(meaningSheet));
check("completion mini-review labels an unavailable save as Premium", /Premium · Add to review/.test(lessonComplete) && /canSaveWord/.test(lessonComplete));

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
