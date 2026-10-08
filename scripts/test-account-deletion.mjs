/**
 * Account deletion contract, against the real schema (PGlite + migrations).
 *
 *  1. Every public table with a foreign key to auth.users either cascades on
 *     delete or is deleted explicitly by /api/account/delete. A new table that
 *     does neither fails this test.
 *  2. After the route's explicit deletes and the auth-user delete, no row
 *     belonging to the account remains in any table.
 *  3. A deleted account's still-valid token cannot write anything back.
 */

import { readFileSync } from "node:fs";
import { createDatabase } from "./lib/pgHarness.mjs";
import { createRunner } from "./lib/fakeBrowser.mjs";

const t = createRunner("account deletion");
const route = readFileSync(new URL("../src/app/api/account/delete/route.ts", import.meta.url), "utf8");
const explicit = [...route.matchAll(/"(sorlio_[a-z_]+)"/g)].map((m) => m[1]);

const A = "aaaaaaaa-2222-4222-8222-00000000000a";
const B = "bbbbbbbb-2222-4222-8222-00000000000b";

await t.section("every user-linked table is covered", async () => {
  const h = await createDatabase();
  const { rows } = await h.db.query(`
    select c.conrelid::regclass::text as table_name, c.confdeltype as on_delete
    from pg_constraint c
    where c.contype = 'f' and c.confrelid = 'auth.users'::regclass
  `);
  t.check("found user-linked tables", rows.length >= 8, JSON.stringify(rows));
  for (const row of rows) {
    const table = row.table_name.replace(/^public\./, "");
    const covered = row.on_delete === "c" || explicit.includes(table);
    t.check(`${table} is cascaded or explicitly deleted`, covered, `on_delete=${row.on_delete}`);
  }
});

await t.section("nothing of the account survives deletion; other accounts untouched", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await h.addUser(B);
  for (const user of [A, B]) {
    await h.db.query("insert into public.sorlio_user_data (user_id, store_key, data) values ($1, 'lire.savedWords.v1', '[]')", [user]);
    await h.db.query("insert into public.sorlio_feedback (user_id, category, comment) values ($1, 'other', 'hello')", [user]);
    await h.db.query("insert into public.sorlio_analytics_events (user_id, event_name) values ($1, 'x')", [user]);
    await h.db.query("insert into public.sorlio_research_prompt_responses (user_id, prompt_type, response) values ($1, 'x', 'y')", [user]);
    await h.db.query("insert into public.sorlio_android_beta_interest (user_id, email, email_normalized, source) values ($1, $2, $2, 'x')", [user, `${user}@x.test`]);
    await h.db.query("insert into public.sorlio_ai_usage (user_id, usage_date, calls) values ($1, current_date, 3)", [user]);
    await h.db.query(
      `insert into public.sorlio_subscriptions (user_id, provider, product_id, purchase_token, status, expires_at, verified_at)
       values ($1, 'google_play', 'p', $2, 'active', now() + interval '5 days', now())`,
      [user, `tok-${user}`],
    );
    await h.rpc(user, "sorlio_sync_push", { p_expected_user: user, p_ops: [{ store: "lire.knownWords.v1", id: "oui", op: "put", base_rev: null, data: true }], p_day: null });
  }
  // Route behaviour: explicit deletes, then the auth user.
  for (const table of explicit) await h.db.query(`delete from public.${table} where user_id = $1`, [A]);
  await h.db.query("delete from auth.users where id = $1", [A]);

  const { rows: tables } = await h.db.query(`
    select table_name from information_schema.columns
    where table_schema = 'public' and column_name = 'user_id'
  `);
  for (const { table_name } of tables) {
    const { rows } = await h.db.query(`select count(*)::int as n from public.${table_name} where user_id = $1`, [A]);
    t.check(`no ${table_name} rows remain for the deleted account`, rows[0].n === 0, `n=${rows[0].n}`);
    const { rows: other } = await h.db.query(`select count(*)::int as n from public.${table_name} where user_id = $1`, [B]);
    t.check(`${table_name} rows of another account untouched`, other[0].n > 0 || table_name === "sorlio_save_quota", `n=${other[0].n}`);
  }

  let recreated = false;
  try {
    await h.rpc(A, "sorlio_sync_push", { p_expected_user: A, p_ops: [{ store: "lire.knownWords.v1", id: "zombie", op: "put", base_rev: null, data: true }], p_day: null });
    recreated = true;
  } catch {}
  t.check("deleted account's token cannot recreate data", !recreated);
});

t.finish();
