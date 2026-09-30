import { readFileSync } from "node:fs";

let passed = 0;
let failed = 0;
const failures = [];

function check(label, condition, detail = "") {
  if (condition) passed++;
  else {
    failed++;
    failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

const originalFlag = process.env.NEXT_PUBLIC_CLOSED_TEST_PREMIUM_ACCESS;
const originalSecret = process.env.CLOSED_TEST_PREMIUM_COOKIE_SECRET;

try {
  const feature = await import("../src/lib/closedTestPremium.ts");
  const server = await import("../src/lib/closedTestPremiumServer.ts");
  const access = await import("../src/lib/access/accessModel.ts");
  const android = await import("../src/lib/androidApp.ts");

  console.log("--- Closed-test switch defaults safely off ---");
  check("missing flag is disabled", !feature.closedTestPremiumEnabled(undefined));
  check("false is disabled", !feature.closedTestPremiumEnabled("false"));
  check("malformed flag is disabled", !feature.closedTestPremiumEnabled("yes"));
  check("true is enabled", feature.closedTestPremiumEnabled("true"));

  console.log("--- Access is centralised and reversible ---");
  check("web guest remains guest", access.accessTier(false, false, false) === "guest");
  check("Android grant becomes Premium without a fake account", access.accessTier(false, false, true) === "premium");
  check("real subscriber stays Premium", access.accessTier(true, true, false) === "premium");
  check("removing the grant returns a non-paying user to guest", access.accessTier(false, false, false) === "guest");
  const temporaryContext = access.accessContext("premium", { dateKey: "2026-09-30", articleIds: [], lookups: 0 });
  for (const featureName of ["saveWord", "comprehension", "aiExplanation", "practice", "review", "listening", "grammar", "importText"]) {
    check(`temporary Premium can use ${featureName}`, access.canUsePremiumFeature(temporaryContext, featureName).allowed);
  }

  console.log("--- Cookie grant requires both flag and server secret ---");
  process.env.NEXT_PUBLIC_CLOSED_TEST_PREMIUM_ACCESS = "true";
  delete process.env.CLOSED_TEST_PREMIUM_COOKIE_SECRET;
  check("flag alone cannot enable server grant", !server.closedTestPremiumServerEnabled());

  process.env.CLOSED_TEST_PREMIUM_COOKIE_SECRET = "closed-test-premium-cookie-secret-at-least-32";
  check("flag plus secret enables server grant", server.closedTestPremiumServerEnabled());
  const issued = await server.createClosedTestPremiumCookie();
  check("server can issue a signed grant", !!issued?.value);
  const grantedRequest = new Request("https://sorlio.site/api/closed-test-premium/status", {
    headers: { cookie: `${server.CLOSED_TEST_PREMIUM_COOKIE}=${issued?.value}` },
  });
  check("signed grant verifies", !!(await server.closedTestPremiumGrant(grantedRequest)));
  const forgedRequest = new Request("https://sorlio.site/api/closed-test-premium/status", {
    headers: { cookie: `${server.CLOSED_TEST_PREMIUM_COOKIE}=v1.9999999999999.forged.not-a-signature` },
  });
  check("forged grant is rejected", (await server.closedTestPremiumGrant(forgedRequest)) === null);
  process.env.NEXT_PUBLIC_CLOSED_TEST_PREMIUM_ACCESS = "false";
  check("disabling the flag invalidates an existing grant", (await server.closedTestPremiumGrant(grantedRequest)) === null);

  console.log("--- TWA and server boundaries are explicit ---");
  check("only the exact TWA referrer is recognised", android.isAndroidAppReferrer("android-app://app.sorlio.reader"));
  check("ordinary web referrer is not recognised", !android.isAndroidAppReferrer("https://sorlio.site/"));
  const proxy = read("proxy.ts");
  check("proxy requires a document navigation", /sec-fetch-dest/.test(proxy) && /document/.test(proxy));
  check("proxy requires the Android referrer", /isAndroidAppReferrer/.test(proxy));
  check("proxy uses an HttpOnly cookie", /httpOnly:\s*true/.test(proxy));
  check("proxy uses Next's config export", /export const config\s*=/.test(proxy));
  const activation = read("src/app/api/closed-test-premium/activate/route.ts");
  check("client-only TWA referrers have a same-origin activation fallback", /x-sorlio-twa-referrer/.test(activation) && /isAndroidAppReferrer/.test(activation));
  const clientGrant = read("src/lib/access/useClosedTestPremium.ts");
  check("only the existing Android-app detector can request activation", /isAndroidApp\(\)/.test(clientGrant) && /closed-test-premium\/activate/.test(clientGrant));
  const guard = read("src/lib/ai/guard.ts");
  check("AI recognises only the signed server grant", /closedTestPremiumGrant\(request\)/.test(guard));
  check("anonymous test AI is still rate-limited", /closed-test-ai:/.test(guard) && /rateLimit\(/.test(guard));
  check("temporary access does not write subscriptions", !/\.from\("sorlio_subscriptions"\)\.(?:insert|upsert|update|delete)/.test(guard));
  const notice = read("src/components/ClosedTestPremiumNotice.tsx");
  check("indicator says access is temporary", /temporary access, not a subscription/.test(notice));
} finally {
  if (originalFlag === undefined) delete process.env.NEXT_PUBLIC_CLOSED_TEST_PREMIUM_ACCESS;
  else process.env.NEXT_PUBLIC_CLOSED_TEST_PREMIUM_ACCESS = originalFlag;
  if (originalSecret === undefined) delete process.env.CLOSED_TEST_PREMIUM_COOKIE_SECRET;
  else process.env.CLOSED_TEST_PREMIUM_COOKIE_SECRET = originalSecret;
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log("\nFailures:");
  for (const failure of failures) console.log(`  - ${failure}`);
}
process.exit(failed ? 1 : 0);
