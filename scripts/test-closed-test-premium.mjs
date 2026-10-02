import { existsSync, readFileSync } from "node:fs";

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

function path(relative) {
  return new URL(`../${relative}`, import.meta.url);
}

function read(relative) {
  return readFileSync(path(relative), "utf8");
}

console.log("--- Closed-test access fails closed ---");
check("the forgeable activation route is absent", !existsSync(path("src/app/api/closed-test-premium/activate/route.ts")));
check("no proxy mints an entitlement from request headers", !existsSync(path("proxy.ts")));
check("the retired public feature-flag helper is absent", !existsSync(path("src/lib/closedTestPremium.ts")));

const statusRoute = await import("../src/app/api/closed-test-premium/status/route.ts");
const forgedRequest = new Request("https://sorlio.site/api/closed-test-premium/status", {
  headers: {
    referer: "android-app://app.sorlio.reader",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    cookie: "__Host-sorlio-closed-test-premium=v1.9999999999999.forged.signature",
  },
});
const forgedResponse = await statusRoute.GET(forgedRequest);
const forgedBody = await forgedResponse.json();
check("caller-controlled TWA-like headers cannot mint Premium", forgedBody.active === false);
check("retired entitlement cookies are actively expired", /Max-Age=0/i.test(forgedResponse.headers.get("set-cookie") ?? ""));

const clientGrant = read("src/lib/access/useClosedTestPremium.ts");
check("the client hook is hard-disabled", /active:\s*false/.test(clientGrant) && !/fetch\(/.test(clientGrant));
const guard = read("src/lib/ai/guard.ts");
check("AI has no temporary-cookie entitlement branch", !/closedTestPremiumGrant|closed-test-ai/.test(guard));
check("AI still requires authenticated paid access", /authenticatedUser\(request\)/.test(guard) && /hasActivePremium/.test(guard));
check("real subscription quota remains enforced", /sorlio_consume_ai_call/.test(guard));

console.log(`\n${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log("\nFailures:");
  for (const failure of failures) console.log(`  - ${failure}`);
}
process.exit(failed ? 1 : 0);
