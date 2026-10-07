/**
 * Billing and entitlement — behavioural tests.
 *
 * The Google Play API is faked (fixtures of real subscriptionsv2 shapes); the
 * database is real Postgres (PGlite) with the production migrations, called
 * through the same SQL functions the server uses with the service role.
 */

import { createDatabase } from "./lib/pgHarness.mjs";
import { createRunner } from "./lib/fakeBrowser.mjs";

const { mapSubscription, PlayRejectedError, PlayUnavailableError } = await import("../src/lib/premium/googlePlay.ts");
const { reconcilePurchase, currentEntitlement, storedGrants, AI_FRESH_MS, STATUS_FRESH_MS } = await import("../src/lib/premium/entitlement.ts");
const { processNotification, verifyPushToken } = await import("../src/lib/premium/rtdn.ts");

const t = createRunner("billing");
const PRODUCT = "sorlio_premium_monthly";
const A = "aaaaaaaa-1111-4111-8111-00000000000a";
const B = "bbbbbbbb-1111-4111-8111-00000000000b";
const NOW = Date.parse("2026-10-06T12:00:00Z");
const future = (days) => new Date(NOW + days * 86_400_000).toISOString();

function sub(state, { expiry = future(20), ack = "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED", product = PRODUCT, linked, autoRenew = true } = {}) {
  return {
    subscriptionState: state,
    acknowledgementState: ack,
    linkedPurchaseToken: linked,
    latestOrderId: "GPA.1234",
    lineItems: [{ productId: product, expiryTime: expiry, autoRenewingPlan: { autoRenewEnabled: autoRenew } }],
  };
}

function fakePlay(byToken) {
  const calls = { get: 0, ack: [] };
  return {
    calls,
    api: {
      async getSubscription(token) {
        calls.get += 1;
        const value = typeof byToken === "function" ? byToken(token) : byToken[token];
        if (value instanceof Error) throw value;
        if (!value) throw new PlayRejectedError("unknown", 404);
        return value;
      },
      async acknowledge(product, token) {
        if (byToken.__ackFails) throw new PlayUnavailableError("ack down", 503);
        calls.ack.push(token);
      },
    },
  };
}

function serviceDb(h) {
  const setReturning = new Set(["sorlio_billing_due"]);
  return {
    async rpc(name, args) {
      const keys = Object.keys(args);
      const placeholders = keys.map((k, i) => `${k} => $${i + 1}`).join(", ");
      const values = keys.map((k) => args[k]);
      try {
        const out = await h.asService((tx) =>
          setReturning.has(name)
            ? tx.query(`select * from public.${name}(${placeholders})`, values)
            : tx.query(`select public.${name}(${placeholders}) as out`, values),
        );
        return { data: setReturning.has(name) ? out.rows : out.rows[0].out, error: null };
      } catch (error) {
        return { data: null, error: { message: error.message } };
      }
    },
  };
}

async function setup() {
  const h = await createDatabase();
  await h.addUser(A);
  await h.addUser(B);
  return { h, db: serviceDb(h) };
}

// ---------------------------------------------------------------------------

await t.section("state mapping (pure)", async () => {
  const m = (s) => mapSubscription(s, PRODUCT, NOW);
  t.check("ACTIVE → entitled", m(sub("SUBSCRIPTION_STATE_ACTIVE")).entitled === true);
  t.check("GRACE → entitled", m(sub("SUBSCRIPTION_STATE_IN_GRACE_PERIOD")).status === "grace_period" && m(sub("SUBSCRIPTION_STATE_IN_GRACE_PERIOD")).entitled);
  t.check("CANCELED before expiry → entitled until expiry", m(sub("SUBSCRIPTION_STATE_CANCELED")).entitled && m(sub("SUBSCRIPTION_STATE_CANCELED")).status === "cancelled");
  t.check("CANCELED after expiry → expired", m(sub("SUBSCRIPTION_STATE_CANCELED", { expiry: future(-1) })).status === "expired" && !m(sub("SUBSCRIPTION_STATE_CANCELED", { expiry: future(-1) })).entitled);
  t.check("PENDING → not entitled", m(sub("SUBSCRIPTION_STATE_PENDING")).status === "pending" && !m(sub("SUBSCRIPTION_STATE_PENDING")).entitled);
  t.check("ON_HOLD → not entitled", !m(sub("SUBSCRIPTION_STATE_ON_HOLD", { expiry: future(-2) })).entitled);
  t.check("PAUSED → not entitled", !m(sub("SUBSCRIPTION_STATE_PAUSED")).entitled);
  t.check("EXPIRED → not entitled", !m(sub("SUBSCRIPTION_STATE_EXPIRED", { expiry: future(-1) })).entitled);
  t.check("PENDING_PURCHASE_CANCELED → expired", m(sub("SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED")).status === "expired");
  t.check("unknown state fails closed", !m(sub("SUBSCRIPTION_STATE_SOMETHING_NEW")).entitled && m(sub("SUBSCRIPTION_STATE_SOMETHING_NEW")).status === "unknown");
  t.check("invalid expiry fails closed", !m(sub("SUBSCRIPTION_STATE_ACTIVE", { expiry: "not-a-date" })).entitled);
  t.check("missing expiry fails closed", !m(sub("SUBSCRIPTION_STATE_ACTIVE", { expiry: null })).entitled);
  t.check("other product is not Sorlio Premium", !m(sub("SUBSCRIPTION_STATE_ACTIVE", { product: "something_else" })).productMatches);
  t.check("ACTIVE with past expiry → expired", m(sub("SUBSCRIPTION_STATE_ACTIVE", { expiry: future(-1) })).status === "expired");
});

await t.section("new purchase: verified, acknowledged, Premium", async () => {
  const { h, db } = await setup();
  const play = fakePlay({ tokA: sub("SUBSCRIPTION_STATE_ACTIVE", { ack: "ACKNOWLEDGEMENT_STATE_PENDING" }) });
  const out = await reconcilePurchase({ db, play: play.api, userId: A, purchaseToken: "tokA", productId: PRODUCT, now: NOW });
  t.check("outcome ok and Premium", out.kind === "ok" && out.view.isPremium === true, JSON.stringify(out));
  t.check("purchase acknowledged with Google", play.calls.ack.includes("tokA"));
  const { rows } = await h.db.query("select acknowledged, status, verified_at from public.sorlio_subscriptions where user_id = $1", [A]);
  t.check("row stored as acknowledged/active with verified_at", rows[0].acknowledged === true && rows[0].status === "active" && rows[0].verified_at);
  const sqlPremium = await h.asService((tx) => tx.query("select public.sorlio_has_premium($1) as p", [A]));
  t.check("SQL entitlement agrees", sqlPremium.rows[0].p === true);
});

await t.section("pending purchase: not Premium, not acknowledged", async () => {
  const { db } = await setup();
  const play = fakePlay({ tokP: sub("SUBSCRIPTION_STATE_PENDING", { ack: "ACKNOWLEDGEMENT_STATE_PENDING" }) });
  const out = await reconcilePurchase({ db, play: play.api, userId: A, purchaseToken: "tokP", productId: PRODUCT, now: NOW });
  t.check("HTTP-level success but isPremium false", out.kind === "ok" && out.view.isPremium === false && out.view.status === "pending");
  t.check("pending purchase not acknowledged", play.calls.ack.length === 0);
});

await t.section("acknowledgement outage: still entitled, retried by cron", async () => {
  const { h, db } = await setup();
  const fixtures = { tokA: sub("SUBSCRIPTION_STATE_ACTIVE", { ack: "ACKNOWLEDGEMENT_STATE_PENDING" }), __ackFails: true };
  const play = fakePlay(fixtures);
  const out = await reconcilePurchase({ db, play: play.api, userId: A, purchaseToken: "tokA", productId: PRODUCT, now: NOW });
  t.check("user is Premium (payment is real)", out.kind === "ok" && out.view.isPremium);
  const due = await db.rpc("sorlio_billing_due", { p_limit: 10 });
  t.check("unacknowledged row is queued for retry", due.data.some((r) => r.purchase_token === "tokA"));
  fixtures.__ackFails = false;
  await reconcilePurchase({ db, play: play.api, userId: A, purchaseToken: "tokA", productId: PRODUCT, now: NOW });
  const { rows } = await h.db.query("select acknowledged from public.sorlio_subscriptions where user_id = $1", [A]);
  t.check("retry acknowledges", rows[0].acknowledged === true && play.calls.ack.includes("tokA"));
});

await t.section("one Play subscription, two Sorlio accounts", async () => {
  const { h, db } = await setup();
  const play = fakePlay({ tokA: sub("SUBSCRIPTION_STATE_ACTIVE") });
  await reconcilePurchase({ db, play: play.api, userId: A, purchaseToken: "tokA", productId: PRODUCT, now: NOW });
  const second = await reconcilePurchase({ db, play: play.api, userId: B, purchaseToken: "tokA", productId: PRODUCT, now: NOW });
  t.check("second account gets a conflict, not an error string", second.kind === "conflict");
  const { rows } = await h.db.query("select user_id from public.sorlio_subscriptions");
  t.check("subscription stays with the first account only", rows.length === 1 && rows[0].user_id === A);
  const bView = await currentEntitlement({ db, play: play.api, userId: B, freshMs: STATUS_FRESH_MS, now: NOW });
  t.check("second account is not Premium", bView.isPremium === false);
  // Resubscription by B linking A's token is also A's lineage.
  const play2 = fakePlay({ tokB: sub("SUBSCRIPTION_STATE_ACTIVE", { linked: "tokA" }) });
  const linked = await reconcilePurchase({ db, play: play2.api, userId: B, purchaseToken: "tokB", productId: PRODUCT, now: NOW });
  t.check("linked token owned by another account is a conflict", linked.kind === "conflict");
  t.check("conflict is never acknowledged on the wrong account's behalf", play2.calls.ack.length === 0);
});

await t.section("resubscription by the same account replaces the old token", async () => {
  const { h, db } = await setup();
  const play = fakePlay({
    old: sub("SUBSCRIPTION_STATE_EXPIRED", { expiry: future(-3) }),
    renewed: sub("SUBSCRIPTION_STATE_ACTIVE", { linked: "old", ack: "ACKNOWLEDGEMENT_STATE_PENDING" }),
  });
  await reconcilePurchase({ db, play: play.api, userId: A, purchaseToken: "old", productId: PRODUCT, now: NOW });
  const out = await reconcilePurchase({ db, play: play.api, userId: A, purchaseToken: "renewed", productId: PRODUCT, now: NOW });
  t.check("resubscription is Premium", out.kind === "ok" && out.view.isPremium);
  const { rows } = await h.db.query("select purchase_token, linked_purchase_token from public.sorlio_subscriptions where user_id = $1", [A]);
  t.check("row now holds the new token, linked to the old", rows[0].purchase_token === "renewed" && rows[0].linked_purchase_token === "old");
});

await t.section("invalid tokens and Google outages are distinguished", async () => {
  const { db } = await setup();
  const rejected = await reconcilePurchase({ db, play: fakePlay({}).api, userId: A, purchaseToken: "forged", productId: PRODUCT, now: NOW });
  t.check("forged/unknown token → rejected", rejected.kind === "rejected");
  const down = await reconcilePurchase({ db, play: fakePlay(() => new PlayUnavailableError("503", 503)).api, userId: A, purchaseToken: "x", productId: PRODUCT, now: NOW });
  t.check("Google outage → unavailable (retry), not 'not paid'", down.kind === "unavailable");
  const wrong = await reconcilePurchase({ db, play: fakePlay({ other: sub("SUBSCRIPTION_STATE_ACTIVE", { product: "coins" }) }).api, userId: A, purchaseToken: "other", productId: PRODUCT, now: NOW });
  t.check("a different product never grants Premium", wrong.kind === "wrong-product");
});

await t.section("freshness: stale rows re-verify; outages are bounded", async () => {
  const { h, db } = await setup();
  const fixtures = { tokA: sub("SUBSCRIPTION_STATE_ACTIVE") };
  const play = fakePlay(fixtures);
  await reconcilePurchase({ db, play: play.api, userId: A, purchaseToken: "tokA", productId: PRODUCT, now: NOW });
  play.calls.get = 0;
  await currentEntitlement({ db, play: play.api, userId: A, freshMs: AI_FRESH_MS, now: Date.now() });
  t.check("fresh row: no Google call", play.calls.get === 0);

  // Refunded and revoked at Google, but no notification reached Sorlio.
  await h.db.query("update public.sorlio_subscriptions set verified_at = now() - interval '30 hours' where user_id = $1", [A]);
  fixtures.tokA = sub("SUBSCRIPTION_STATE_EXPIRED", { expiry: future(-1) });
  const afterRefund = await currentEntitlement({ db, play: play.api, userId: A, freshMs: AI_FRESH_MS });
  t.check("stale row is re-verified and the refund is noticed", afterRefund.isPremium === false && play.calls.get === 1);

  // Google outage with a recent verification → still Premium, flagged stale.
  fixtures.tokA = sub("SUBSCRIPTION_STATE_ACTIVE");
  await currentEntitlement({ db, play: play.api, userId: A, freshMs: 0 });
  await h.db.query("update public.sorlio_subscriptions set verified_at = now() - interval '48 hours' where user_id = $1", [A]);
  fixtures.tokA = new PlayUnavailableError("down", 503);
  const outage = await currentEntitlement({ db, play: play.api, userId: A, freshMs: AI_FRESH_MS });
  t.check("outage within 72h keeps Premium, marked stale", outage.isPremium === true && outage.stale === true);
  await h.db.query("update public.sorlio_subscriptions set verified_at = now() - interval '100 hours' where user_id = $1", [A]);
  const longOutage = await currentEntitlement({ db, play: play.api, userId: A, freshMs: AI_FRESH_MS });
  t.check("outage beyond 72h: no Premium (bounded)", longOutage.isPremium === false);
  await h.db.query("update public.sorlio_subscriptions set status = 'active', expires_at = now() + interval '9 days', revoked_at = null, verified_at = now() - interval '8 days' where user_id = $1", [A]);
  const sql = await h.asService((tx) => tx.query("select public.sorlio_has_premium($1) as p", [A]));
  t.check("SQL check (save quota) also expires stale rows", sql.rows[0].p === false);
});

await t.section("stored-row rules (pure)", async () => {
  const base = { status: "active", expires_at: future(5), verified_at: new Date(NOW - 1000).toISOString(), revoked_at: null };
  t.check("fresh active row grants", storedGrants(base, AI_FRESH_MS, NOW));
  t.check("revoked never grants", !storedGrants({ ...base, revoked_at: new Date(NOW).toISOString() }, AI_FRESH_MS, NOW));
  t.check("invalid expiry never grants", !storedGrants({ ...base, expires_at: "garbage" }, AI_FRESH_MS, NOW));
  t.check("missing verification never grants", !storedGrants({ ...base, verified_at: null }, AI_FRESH_MS, NOW));
  t.check("on_hold never grants", !storedGrants({ ...base, status: "on_hold" }, AI_FRESH_MS, NOW));
  t.check("null row never grants", !storedGrants(null, AI_FRESH_MS, NOW));
});

await t.section("RTDN: revocation, duplicates, ordering, outages", async () => {
  const { h, db } = await setup();
  const fixtures = { tokA: sub("SUBSCRIPTION_STATE_ACTIVE") };
  const play = fakePlay(fixtures);
  await reconcilePurchase({ db, play: play.api, userId: A, purchaseToken: "tokA", productId: PRODUCT, now: NOW });
  const note = (type, token = "tokA") => ({ packageName: "app.sorlio.reader", subscriptionNotification: { notificationType: type, purchaseToken: token } });

  fixtures.tokA = sub("SUBSCRIPTION_STATE_EXPIRED", { expiry: future(-0.01) });
  const revoked = await processNotification({ db, messageId: "m1", notification: note(12), play: play.api });
  t.check("REVOKED processed", revoked.status === 200 && revoked.outcome === "ok");
  const view = await currentEntitlement({ db, play: play.api, userId: A, freshMs: AI_FRESH_MS });
  t.check("revoked subscription loses Premium immediately", view.isPremium === false && view.status === "revoked");

  const dup = await processNotification({ db, messageId: "m1", notification: note(12), play: play.api });
  t.check("duplicate delivery is skipped", dup.outcome === "duplicate");

  fixtures.tokA = new PlayUnavailableError("down", 503);
  const failed = await processNotification({ db, messageId: "m2", notification: note(2), play: play.api });
  t.check("Google outage → 503 so Pub/Sub retries", failed.status === 503);
  fixtures.tokA = sub("SUBSCRIPTION_STATE_ACTIVE");
  const retried = await processNotification({ db, messageId: "m2", notification: note(2), play: play.api });
  t.check("redelivery after outage is processed (not treated as duplicate)", retried.outcome === "ok");
  // Out-of-order: an old CANCELED arrives after a RENEWED; state is re-read
  // from Google each time, so the late message cannot regress it.
  fixtures.tokB = sub("SUBSCRIPTION_STATE_ACTIVE");
  await reconcilePurchase({ db, play: play.api, userId: B, purchaseToken: "tokB", productId: PRODUCT, now: NOW });
  await processNotification({ db, messageId: "b-renewed", notification: note(2, "tokB"), play: play.api });
  const late = await processNotification({ db, messageId: "b-cancel-old", notification: note(3, "tokB"), play: play.api });
  const afterLate = await currentEntitlement({ db, play: play.api, userId: B, freshMs: AI_FRESH_MS });
  t.check("late/out-of-order notification cannot regress state", late.outcome === "ok" && afterLate.isPremium === true && afterLate.status === "active");

  const unclaimed = await processNotification({ db, messageId: "m3", notification: note(4, "nobodys"), play: play.api });
  t.check("unclaimed token acknowledged without creating anything", unclaimed.outcome === "unclaimed-token");
  const other = await processNotification({ db, messageId: "m4", notification: { ...note(4), packageName: "com.evil" }, play: play.api });
  t.check("other package ignored", other.outcome === "ignored:package");
  const voided = await processNotification({ db, messageId: "m5", notification: { packageName: "app.sorlio.reader", voidedPurchaseNotification: { purchaseToken: "tokA", productType: 1 } }, play: play.api });
  const afterVoid = await currentEntitlement({ db, play: play.api, userId: A, freshMs: AI_FRESH_MS });
  t.check("voided purchase (refund) revokes", voided.outcome === "ok" && afterVoid.isPremium === false);
  const { rows } = await h.db.query("select purchase_token_sha256 from public.sorlio_billing_events limit 1");
  t.check("event log stores only a token hash", /^[0-9a-f]{64}$/.test(rows[0].purchase_token_sha256));
});

await t.section("RTDN push authentication", async () => {
  const config = { audience: "https://sorlio.site/api/premium/rtdn", serviceAccount: "rtdn@sorlio.iam.gserviceaccount.com" };
  const good = { iss: "https://accounts.google.com", email: config.serviceAccount, email_verified: true };
  const verify = (payload) => async () => payload;
  t.check("valid token accepted", await verifyPushToken("Bearer x", config, verify(good)));
  t.check("missing header rejected", !(await verifyPushToken(null, config, verify(good))));
  t.check("wrong service account rejected", !(await verifyPushToken("Bearer x", config, verify({ ...good, email: "attacker@x.iam.gserviceaccount.com" }))));
  t.check("unverified email rejected", !(await verifyPushToken("Bearer x", config, verify({ ...good, email_verified: false }))));
  t.check("wrong issuer rejected", !(await verifyPushToken("Bearer x", config, verify({ ...good, iss: "https://evil.example" }))));
  t.check("signature/audience failure rejected", !(await verifyPushToken("Bearer x", config, async () => { throw new Error("bad sig"); })));
  t.check("unconfigured endpoint rejects everything", !(await verifyPushToken("Bearer x", {}, verify(good))));
});

await t.section("clients cannot reach billing data or functions", async () => {
  const { h } = await setup();
  for (const sql of [
    "select * from public.sorlio_subscriptions",
    "select public.sorlio_billing_get('" + A + "')",
    "select public.sorlio_billing_record('" + A + "','p','t',null,'active',now() + interval '9 days',true,true,null,false)",
    "select * from public.sorlio_billing_events",
  ]) {
    let allowed = false;
    try {
      await h.as(A, (tx) => tx.query(sql));
      allowed = true;
    } catch {}
    t.check(`authenticated user denied: ${sql.slice(0, 50)}`, !allowed);
  }
});

t.finish();
