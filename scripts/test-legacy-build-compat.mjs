/**
 * Expand-before-contract check for migrations 0008-0012.
 *
 * Production runs build edcc8a4 until the new web build is deployed. That
 * build must keep working against the fully migrated schema, so the
 * migrations can be applied first. This replays the old build's own database
 * calls (copied from edcc8a4) against PGlite with every migration applied:
 *
 *   - client sync: signed-in upsert/select on sorlio_user_data (0002 model);
 *   - service role: subscription upsert/select/update with only the 0003 columns;
 *   - service role: sorlio_consume_ai_call for the AI guard;
 *   - service role: feedback and analytics inserts with the old columns;
 *   - auth: a Google sign-in (insert + metadata update) by Supabase Auth's role.
 *
 * And that a legacy row written by the old build is picked up by the new
 * sync on that account's first item-level sync.
 */

import { createDatabase } from "./lib/pgHarness.mjs";
import { createRunner } from "./lib/fakeBrowser.mjs";

const t = createRunner("legacy build compatibility");
const USER = "abababab-4444-4444-8444-00000000000a";
const OTHER = "cdcdcdcd-4444-4444-8444-00000000000c";

const h = await createDatabase();
await h.addUser(USER);
await h.addUser(OTHER);

await t.section("old client sync (0002) still works", async () => {
  await h.as(USER, (tx) =>
    tx.query(
      `insert into public.sorlio_user_data (user_id, store_key, data, updated_at) values ($1, $2, $3, now()), ($1, $4, $5, now())
       on conflict (user_id, store_key) do update set data = excluded.data, updated_at = excluded.updated_at`,
      [USER, "lire.savedWords.v1", JSON.stringify([{ word: "maison", translation: "house" }]), "__sync_meta__:lire.savedWords.v1", JSON.stringify({ tombstones: {} })],
    ),
  );
  const own = await h.as(USER, (tx) => tx.query("select store_key from public.sorlio_user_data where user_id = $1", [USER]));
  t.check("signed-in user can upsert and read own legacy rows", own.rows.length === 2);
  const other = await h.as(OTHER, (tx) => tx.query("select count(*)::int as n from public.sorlio_user_data where user_id = $1", [USER]));
  t.check("another account still cannot read them", other.rows[0].n === 0);
});

await t.section("old server routes (service role) still work", async () => {
  await h.asService((tx) =>
    tx.query(
      `insert into public.sorlio_subscriptions (user_id, provider, product_id, purchase_token, status, expires_at, updated_at)
       values ($1, 'google_play', 'sorlio_premium_monthly', 'tok-legacy', 'active', now() + interval '20 days', now())
       on conflict (user_id) do update set status = excluded.status, expires_at = excluded.expires_at, updated_at = excluded.updated_at`,
      [USER],
    ),
  );
  const row = await h.asService((tx) => tx.query("select status, expires_at from public.sorlio_subscriptions where user_id = $1", [USER]));
  t.check("subscription upsert with only 0003 columns succeeds", row.rows[0]?.status === "active");
  await h.asService((tx) => tx.query("update public.sorlio_subscriptions set status = 'cancelled', updated_at = now() where user_id = $1", [USER]));
  t.check("status-route update succeeds", true);

  const allowed = await h.asService((tx) => tx.query("select public.sorlio_consume_ai_call($1, 300) as ok", [USER]));
  t.check("AI guard quota RPC callable by service role", allowed.rows[0].ok === true);

  await h.asService((tx) =>
    tx.query(
      `insert into public.sorlio_feedback (user_id, anonymous_id, session_id, category, page, feature, comment, app_version, deployment_environment)
       values ($1, 'anon_x', 'sess_x', 'useful', '/', 'reader', 'ok', '1.0.3', 'production')`,
      [USER],
    ),
  );
  await h.asService((tx) => tx.query("insert into public.sorlio_analytics_events (event_name, anonymous_id, payload) values ('app_opened', 'anon_x', '{}')"));
  t.check("old feedback and analytics inserts still accepted", true);
});

await t.section("clients gain nothing they should not have", async () => {
  let blocked = false;
  try {
    await h.as(USER, (tx) => tx.query("select * from public.sorlio_subscriptions"));
  } catch {
    blocked = true;
  }
  t.check("authenticated role can no longer read subscriptions directly", blocked);
  let quotaBlocked = false;
  try {
    await h.as(USER, (tx) => tx.query("select public.sorlio_consume_ai_call($1, 300)", [USER]));
  } catch {
    quotaBlocked = true;
  }
  t.check("authenticated role cannot spend AI quota directly", quotaBlocked);
});

await t.section("Google sign-in by Supabase Auth's role", async () => {
  const NEW = "efefefef-4444-4444-8444-00000000000e";
  await h.db.transaction(async (tx) => {
    await tx.query("set local role supabase_auth_admin");
    await tx.query("insert into auth.users (id, email, raw_user_meta_data) values ($1, 'n@example.test', $2)", [NEW, JSON.stringify({ email: "n@example.test", sub: "9", name: "N", picture: "p" })]);
    await tx.query("insert into auth.identities (user_id, provider, provider_id, identity_data) values ($1, 'google', '9', $2)", [NEW, JSON.stringify({ email: "n@example.test", sub: "9", name: "N" })]);
    await tx.query("update auth.users set raw_user_meta_data = raw_user_meta_data || '{\"name\":\"N\"}' where id = $1", [NEW]);
  });
  const meta = (await h.db.query("select raw_user_meta_data as m from auth.users where id = $1", [NEW])).rows[0].m;
  t.check("sign-in writes succeed and keep email + subject", meta.email === "n@example.test" && meta.sub === "9" && !("name" in meta));
});

await t.section("old build's data reaches the new sync", async () => {
  const pulled = await h.rpc(USER, "sorlio_sync_pull", { p_expected_user: USER, p_after_rev: 0, p_limit: 100 });
  const words = pulled.items.filter((item) => item.store === "lire.savedWords.v1").map((item) => item.id);
  t.check("legacy saved word imported on first item-level sync", JSON.stringify(words) === '["maison"]', JSON.stringify(words));
  const premium = pulled.premium;
  t.check("legacy-verified subscription without verified_at is not treated as fresh Premium", premium === false);
});

t.finish();
