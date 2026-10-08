/**
 * Premium authority on the device (audit RC09).
 *
 * Device storage belongs to whoever holds the device, so an entitlement read
 * back from it must never confer paid capability. This forges the account's
 * cached status (active, future expiry, recently "confirmed"), cuts the
 * network, and checks what the app would let a never-paying account do.
 */

import { createStorage, createRunner, installWindow } from "./lib/fakeBrowser.mjs";

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://testref.supabase.co";
const SESSION_KEY = "sb-testref-auth-token";
const A = "aaaaaaaa-0000-4000-8000-0000000000a1";
const B = "bbbbbbbb-0000-4000-8000-0000000000b2";
const NOW = Date.parse("2026-10-07T12:00:00Z");

const t = createRunner("premium cache authority");
const control = createStorage();
installWindow(control);

const store = await import("../src/lib/localData/store.ts");
const identity = await import("../src/lib/localData/identity.ts");
const client = await import("../src/lib/premium/client.ts");
const types = await import("../src/lib/premium/types.ts");
const access = await import("../src/lib/access/accessModel.ts");

// The signed-in session as the app sees it. The identity partition is chosen
// from the Supabase session key in storage, exactly as on a real device.
let currentUser = null;
function signIn(userId) {
  currentUser = userId;
  control.storage.setItem(SESSION_KEY, JSON.stringify({ access_token: "token", user: { id: userId } }));
  store.__resetLocalStoreForTests(null);
}
const session = async () => (currentUser ? { access_token: "token", user: { id: currentUser } } : null);

function forgeCache(userId, overrides = {}) {
  const partition = store.storeFor(identity.accountIdentity(userId));
  partition.setItem("lire.premium.status.v1", JSON.stringify({
    userId,
    confirmedAt: new Date(NOW - 60_000).toISOString(),
    status: { isPremium: true, status: "active", expiresAt: "2027-01-01T00:00:00Z", autoRenewing: true, stale: false, unverified: false, ...overrides },
  }));
}

const offline = () => Promise.reject(new TypeError("Failed to fetch"));
const tierFor = (status) => access.tierForStatus(true, status);

await t.section("forged cache + network failure confers nothing", async () => {
  control.data.clear();
  signIn(A);
  forgeCache(A);
  const status = await client.fetchPremiumStatus(offline, NOW, session);
  t.check("cache is read back for display", status.isPremium === true && status.fromDeviceCache === true);
  t.check("but it does not confer Premium", types.confersPremium(status) === false);
  const context = access.accessContext(tierFor(status), 5);
  t.check("tier stays free", context.tier === "free");
  t.check("sixth new save of the day is refused", access.canSaveNewWord(context).allowed === false);
  t.check("AI features stay locked", access.canUse(context, "aiWordHelp").allowed === false && access.canUse(context, "aiTranslation").allowed === false);
});

await t.section("a body cannot smuggle the device-cache flag either way", async () => {
  const parsed = types.parsePremiumStatus({ isPremium: true, status: "active", expiresAt: "2027-01-01T00:00:00Z", fromDeviceCache: false }, NOW);
  t.check("server answer confers Premium", types.confersPremium(parsed) === true);
  const forgedBody = types.parsePremiumStatus({ isPremium: true, status: "active", expiresAt: "2027-01-01T00:00:00Z", fromDeviceCache: true }, NOW);
  t.check("parser ignores a fromDeviceCache claim in a body", forgedBody.fromDeviceCache === false);
  const outage = types.parsePremiumStatus({ isPremium: true, status: "active", expiresAt: "2027-01-01T00:00:00Z", stale: true }, NOW);
  t.check("server's own bounded outage answer still confers Premium", types.confersPremium(outage) === true);
});

await t.section("server answers are never overridden by the cache", async () => {
  control.data.clear();
  signIn(A);
  forgeCache(A);
  for (const code of [401, 403, 500, 503]) {
    const status = await client.fetchPremiumStatus(() => Promise.resolve(new Response("{}", { status: code })), NOW, session);
    t.check(`HTTP ${code} → not Premium, cache ignored`, status.isPremium === false && !types.confersPremium(status));
  }
  const ok = await client.fetchPremiumStatus(() => Promise.resolve(new Response(JSON.stringify({ isPremium: false, status: "none", expiresAt: null }), { status: 200 })), NOW, session);
  t.check("HTTP 200 isPremium:false → not Premium", ok.isPremium === false);
});

await t.section("malformed or out-of-range forged caches are rejected outright", async () => {
  const cases = {
    "future confirmedAt": () => {
      const p = store.storeFor(identity.accountIdentity(A));
      const v = JSON.parse(p.getItem("lire.premium.status.v1"));
      v.confirmedAt = new Date(NOW + 3_600_000).toISOString();
      p.setItem("lire.premium.status.v1", JSON.stringify(v));
    },
    "confirmed 4 days ago": () => {
      const p = store.storeFor(identity.accountIdentity(A));
      const v = JSON.parse(p.getItem("lire.premium.status.v1"));
      v.confirmedAt = new Date(NOW - 4 * 86_400_000).toISOString();
      p.setItem("lire.premium.status.v1", JSON.stringify(v));
    },
    "expired subscription": () => forgeCache(A, { expiresAt: "2026-01-01T00:00:00Z" }),
    "invalid expiry": () => forgeCache(A, { expiresAt: "not-a-date" }),
    "non-entitled status": () => forgeCache(A, { status: "revoked" }),
  };
  for (const [label, mutate] of Object.entries(cases)) {
    control.data.clear();
    signIn(A);
    forgeCache(A);
    mutate();
    const status = await client.fetchPremiumStatus(offline, NOW, session);
    t.check(`${label} → not even displayed as Premium`, status.isPremium === false && status.unverified === true);
  }
});

await t.section("another account's cache never carries over", async () => {
  control.data.clear();
  signIn(A);
  forgeCache(A);
  signIn(B);
  const status = await client.fetchPremiumStatus(offline, NOW, session);
  t.check("B sees no Premium from A's partition", status.isPremium === false);
  forgeCache(B, {});
  const p = store.storeFor(identity.accountIdentity(B));
  const v = JSON.parse(p.getItem("lire.premium.status.v1"));
  v.userId = A;
  p.setItem("lire.premium.status.v1", JSON.stringify(v));
  const mismatched = await client.fetchPremiumStatus(offline, NOW, session);
  t.check("cache naming another user is ignored", mismatched.isPremium === false);
});

t.finish();
