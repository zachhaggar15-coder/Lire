/**
 * Admin session security (audit RC22), through the real route handlers.
 *
 * The old scheme set a cookie equal to sha256(admin token): identical for
 * every sign-in, never expiring server-side, and still valid after "logout".
 * Each scenario below replays a captured cookie against the feedback reader.
 */

import { createHash } from "node:crypto";
import { createRunner } from "./lib/fakeBrowser.mjs";

process.env.VALIDATION_ADMIN_TOKEN = "admin-token-for-tests-0123456789";
delete process.env.KV_REST_API_URL;
delete process.env.UPSTASH_REDIS_REST_URL;

const t = createRunner("admin session");
const sessionRoute = await import("../src/app/api/admin/session/route.ts");
const feedbackRoute = await import("../src/app/api/admin/feedback/route.ts");
const { ADMIN_SESSION_COOKIE } = await import("../src/lib/admin/auth.ts");
const session = await import("../src/lib/admin/session.ts");

const BASE = "https://sorlio.test";
let ipCounter = 0;
const ip = () => `198.51.100.${++ipCounter}`;

async function signIn(token = process.env.VALIDATION_ADMIN_TOKEN) {
  const response = await sessionRoute.POST(new Request(`${BASE}/api/admin/session`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-vercel-forwarded-for": ip() },
    body: JSON.stringify({ token }),
  }));
  const cookie = response.headers.get("set-cookie") ?? "";
  return { status: response.status, value: cookie.match(new RegExp(`${ADMIN_SESSION_COOKIE}=([^;]*)`))?.[1] ?? null, cookie };
}
async function readFeedback(value) {
  const headers = { "x-vercel-forwarded-for": ip() };
  if (value) headers.cookie = `${ADMIN_SESSION_COOKIE}=${value}`;
  return (await feedbackRoute.GET(new Request(`${BASE}/api/admin/feedback`, { headers }))).status;
}
// Authorised requests get past auth to "storage not configured" (503) in tests.
const AUTHORISED = 503;

await t.section("sign-in issues a distinct, expiring session", async () => {
  const wrong = await signIn("not-the-token");
  t.check("wrong token is refused", wrong.status === 401 && !wrong.value);
  const a = await signIn();
  const b = await signIn();
  t.check("sign-in succeeds", a.status === 200 && !!a.value);
  t.check("cookie is HttpOnly, Secure, SameSite=Strict, 8h", /HttpOnly/i.test(a.cookie) && /Secure/i.test(a.cookie) && /SameSite=strict/i.test(a.cookie) && /Max-Age=28800/i.test(a.cookie));
  t.check("two sign-ins get different values", a.value !== b.value);
  t.check("cookie reveals nothing derived only from the token", !a.value.includes(createHash("sha256").update(`sorlio-validation-admin:${process.env.VALIDATION_ADMIN_TOKEN}`).digest("hex")));
  t.check("valid session reads feedback", (await readFeedback(a.value)) === AUTHORISED);
});

await t.section("logout revokes server-side", async () => {
  const { value } = await signIn();
  const out = await sessionRoute.DELETE(new Request(`${BASE}/api/admin/session`, { method: "DELETE", headers: { cookie: `${ADMIN_SESSION_COOKIE}=${value}` } }));
  t.check("logout succeeds and clears the cookie", out.status === 200 && /Max-Age=0/i.test(out.headers.get("set-cookie") ?? ""));
  t.check("replaying the captured cookie after logout → 401", (await readFeedback(value)) === 401);
  const other = await signIn();
  t.check("a different live session is unaffected", (await readFeedback(other.value)) === AUTHORISED);
});

await t.section("expiry, tampering and rotation", async () => {
  const token = process.env.VALIDATION_ADMIN_TOKEN;
  const now = Date.now();
  const issued = session.createAdminSession(token, now - 9 * 3600 * 1000);
  t.check("session older than 8h → 401", (await readFeedback(issued.value)) === 401);
  const fresh = session.createAdminSession(token, now);
  const [v, id, exp, sig] = fresh.value.split(".");
  t.check("extended expiry with the old signature → 401", (await readFeedback(`${v}.${id}.${Number(exp) + 86400}.${sig}`)) === 401);
  const forged = session.createAdminSession("guessed-token", now).value;
  t.check("session signed with another token → 401", (await readFeedback(forged)) === 401);
  const live = await signIn();
  process.env.VALIDATION_ADMIN_TOKEN = "rotated-admin-token-9876543210";
  t.check("rotating the admin token invalidates existing sessions", (await readFeedback(live.value)) === 401);
  process.env.VALIDATION_ADMIN_TOKEN = token;
  t.check("pure check: far-future expiry beyond the TTL is rejected", session.readAdminSession(token, session.createAdminSession(token, now + 30 * 86400 * 1000).value, now) === null);
});

await t.section("legacy and malformed cookies", async () => {
  const legacy = createHash("sha256").update(`sorlio-validation-admin:${process.env.VALIDATION_ADMIN_TOKEN}`).digest("hex");
  t.check("old deterministic value under the new name → 401", (await readFeedback(legacy)) === 401);
  const oldName = await feedbackRoute.GET(new Request(`${BASE}/api/admin/feedback`, { headers: { cookie: `__Host-sorlio-validation-admin=${legacy}`, "x-vercel-forwarded-for": ip() } }));
  t.check("old cookie name → 401", oldName.status === 401);
  for (const bad of ["", "v2", "v2.a.b.c", "v1.xxxxxxxxxxxxxxxxxxxx.9999999999.sig", "../../etc"]) {
    t.check(`malformed ${JSON.stringify(bad)} → 401`, (await readFeedback(bad)) === 401);
  }
  t.check("no credentials → 401", (await readFeedback(null)) === 401);
});

await t.section("bearer token still works for scripts", async () => {
  const response = await feedbackRoute.GET(new Request(`${BASE}/api/admin/feedback`, { headers: { authorization: `Bearer ${process.env.VALIDATION_ADMIN_TOKEN}`, "x-vercel-forwarded-for": ip() } }));
  t.check("correct bearer → authorised", response.status === AUTHORISED);
  const wrong = await feedbackRoute.GET(new Request(`${BASE}/api/admin/feedback`, { headers: { authorization: "Bearer nope", "x-vercel-forwarded-for": ip() } }));
  t.check("wrong bearer → 401", wrong.status === 401);
});

t.finish();
