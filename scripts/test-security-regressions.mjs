import { existsSync, readFileSync } from "node:fs";
import { localRateLimitFallbackAllowed } from "../src/lib/server/rateLimit.ts";

/**
 * Security and privacy regressions that are about the shape of the system
 * (which endpoints exist, which headers are set). Behaviour is covered by the
 * behavioural suites: billing, sync, isolation, deletion, persistence.
 */

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
const exists = (path) => existsSync(new URL(`../${path}`, import.meta.url));

console.log("--- Retired data collection is gone ---");
for (const path of [
  "src/app/api/analytics/events/route.ts",
  "src/app/api/research-prompts/route.ts",
  "src/app/api/android-beta/route.ts",
  "src/app/api/closed-test-premium/status/route.ts",
  "src/app/api/admin/validation/route.ts",
  "src/lib/analytics/client.ts",
  "src/components/AnalyticsConsentBanner.tsx",
  "src/components/PostSessionResearchPrompt.tsx",
  "sentry.server.config.ts",
  "instrumentation-client.ts",
]) {
  check(`${path} no longer exists`, !exists(path));
}
const pkg = JSON.parse(read("package.json"));
check("no Sentry SDK dependency", !pkg.dependencies["@sentry/nextjs"]);
check("no telemetry tunnel in next.config", !/tunnelRoute|withSentryConfig/.test(read("next.config.mjs")));

console.log("--- Feedback: verified identity only, no side channels ---");
const feedback = read("src/app/api/feedback/route.ts");
check("feedback uses a verified bearer identity", /authenticatedUser\(request\)/.test(feedback) && /user_id: user\?\.id \?\? null/.test(feedback));
check("feedback stores no device or session identifiers", !/anonymous_id|session_id/.test(feedback));
check("feedback content is never e-mailed", !/resend|sendFeedbackNotification|proton/i.test(feedback));
check("feedback request size is bounded", /MAX_BODY_BYTES/.test(feedback));

console.log("--- Admin-only feedback operations require a token ---");
const feedbackRoute = read("src/app/api/admin/feedback/route.ts");
const feedbackDashboard = read("src/app/admin/feedback/page.tsx");
const feedbackLayout = read("src/app/admin/feedback/layout.tsx");
const adminSessionRoute = read("src/app/api/admin/session/route.ts");
check("production test-email route has been removed", !exists("src/app/api/feedback/test/route.ts"));
check("feedback reader requires admin authorization", /await hasAdminAccess\(request\)/.test(feedbackRoute));
check("feedback dashboard uses the protected route", /\/api\/admin\/feedback/.test(feedbackDashboard));
check("feedback dashboard does not query Supabase from the browser", !/getSupabaseClient/.test(feedbackDashboard));
check("feedback page is blocked by a server-validated session", /await cookies\(\)/.test(feedbackLayout) && /await isAdminSessionCookie/.test(feedbackLayout));
check(
  "admin session cookie is hardened, per-session and revocable (behaviour: test-admin-session.mjs)",
  /createAdminSession\(/.test(adminSessionRoute) &&
    /revokeAdminSession\(request\)/.test(adminSessionRoute) &&
    /httpOnly:\s*true/.test(adminSessionRoute) &&
    /secure:\s*true/.test(adminSessionRoute) &&
    /sameSite:\s*["']strict["']/.test(adminSessionRoute),
);
check(
  "admin feedback and session responses are not cacheable",
  [feedbackRoute, adminSessionRoute].every((source) => /Cache-Control.*private, no-store/.test(source)),
);

console.log("--- Rate limiting ---");
const rateLimit = read("src/lib/server/rateLimit.ts");
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
check("purchase verification is rate-limited per account", /rateLimit\(`premium-verify:\$\{user\.id\}`/.test(read("src/app/api/premium/google-play/verify/route.ts")));
check("status checks are rate-limited per account", /rateLimit\(`premium-status:\$\{user\.id\}`/.test(read("src/app/api/premium/status/route.ts")));

console.log("--- Entitlement responses are private ---");
check("status responses are never cached", /private, no-store, max-age=0/.test(read("src/app/api/premium/status/route.ts")));
check("verify responses are never cached", /private, no-store, max-age=0/.test(read("src/app/api/premium/google-play/verify/route.ts")));

console.log("--- AI routes never leak provider errors or accept free-text levels ---");
for (const name of ["explain-word", "explain-sentence", "paraphrase", "translate-article"]) {
  const route = read(`src/app/api/ai/${name}/route.ts`);
  check(`${name}: errors go through aiFailureResponse`, /aiFailureResponse\(err\)/.test(route) && !/err\.message/.test(route));
  check(`${name}: level is allowlisted`, /learnerLevel\(level\)/.test(route) && !/optionalText\(level/.test(route));
  check(`${name}: requires a paid caller`, /requirePaidAiCaller\(request\)/.test(route));
}
check("OpenAI error bodies are not propagated", !/body\.slice\(0, 300\)/.test(read("src/lib/ai/openai.ts")));

console.log("--- RSS fallback honours the requested limit ---");
const rssRoute = read("src/app/api/rss-texts/route.ts");
check("every RSS response is clamped to the request limit", /clampRssSelectionToLimit\(selected, limit\)/.test(rssRoute));
check("live responses cannot be padded with bundled fallback texts", !/backfillIfShort/.test(rssRoute));

console.log("--- Security headers ---");
{
  const previous = { env: process.env.NODE_ENV, supabase: process.env.NEXT_PUBLIC_SUPABASE_URL };
  process.env.NODE_ENV = "production";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example-project.supabase.co";
  const config = (await import("../next.config.mjs")).default;
  const rules = await config.headers();
  if (previous.env === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previous.env;
  if (previous.supabase === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = previous.supabase;
  const all = rules.find((rule) => rule.source === "/:path*");
  const header = (name) => all?.headers.find((h) => h.key.toLowerCase() === name)?.value ?? "";
  const csp = Object.fromEntries(
    header("content-security-policy")
      .split(";")
      .map((directive) => directive.trim().split(/\s+/))
      .map(([name, ...values]) => [name, values.join(" ")])
  );
  check("headers apply to every path", Boolean(all));
  check("scripts only from this origin, no eval in production", csp["script-src"] === "'self' 'unsafe-inline'");
  // Chrome validates a PaymentRequest's payment-method identifier against
  // connect-src (falling back to default-src); "payment-src" is not a CSP
  // directive. Without the exact entry below, `new PaymentRequest(...)` throws
  // RangeError ("payment method identifier violates Content Security Policy")
  // and Play Billing in the Android app cannot start.
  const PLAY_BILLING = "https://play.google.com/billing";
  const connectSources = (csp["connect-src"] ?? "").split(/\s+/).filter(Boolean);
  check("connect-src exists (no fallback to default-src for payment methods)", connectSources.length > 0);
  check("connect-src permits the exact Play Billing payment method identifier", connectSources.includes(PLAY_BILLING), csp["connect-src"]);
  check(
    "Play Billing is allowed as one exact URL, not play.google.com or a wildcard/scheme",
    !connectSources.some((source) => source === "https://play.google.com" || source === "https://*.google.com" || source === "https:" || source === "*" || /^https:\/\/play\.google\.com\/?$/.test(source))
  );
  check(
    "browser connects only to this origin, the Supabase project and the Play Billing payment method id",
    connectSources.join(" ") === `'self' ${PLAY_BILLING} https://example-project.supabase.co`,
    csp["connect-src"]
  );
  check("default-src stays 'self' (no broad fallback)", csp["default-src"] === "'self'");
  check(
    "no framing, plugins, or base/form hijacking",
    csp["frame-ancestors"] === "'none'" && csp["object-src"] === "'none'" && csp["base-uri"] === "'self'" && csp["form-action"] === "'self'"
  );
  check(
    "nosniff, DENY framing and HSTS are set",
    header("x-content-type-options") === "nosniff" && header("x-frame-options") === "DENY" && /max-age=\d{8}/.test(header("strict-transport-security"))
  );
  check("payment stays allowed for Play Billing", /payment=\(self\)/.test(header("permissions-policy")));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
