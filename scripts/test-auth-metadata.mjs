/**
 * Google profile minimisation (migration 0012), against the real schema.
 *
 * Supabase Auth copies the Google profile into auth.users and
 * auth.identities on every sign-in. The triggers must strip everything but
 * the allowlisted ids/email, and must keep working when the write comes from
 * Supabase Auth's own role (a privilege mistake here would break sign-in).
 */

import { readFileSync } from "node:fs";
import { createDatabase, migrationFiles } from "./lib/pgHarness.mjs";
import { EXPECTED_SCHEMA_VERSION } from "../src/lib/server/schema.ts";
import { createRunner } from "./lib/fakeBrowser.mjs";

const t = createRunner("auth metadata minimisation");
const USER = "cccccccc-3333-4333-8333-00000000000c";
const GOOGLE_PROFILE = {
  iss: "https://accounts.google.com",
  sub: "1234567890",
  email: "reader@example.test",
  email_verified: true,
  phone_verified: false,
  provider_id: "1234567890",
  name: "Alex Example",
  full_name: "Alex Example",
  given_name: "Alex",
  family_name: "Example",
  avatar_url: "https://lh3.googleusercontent.com/a/photo",
  picture: "https://lh3.googleusercontent.com/a/photo",
  locale: "en-GB",
};
const KEPT = ["email", "email_verified", "iss", "phone_verified", "provider_id", "sub"];

async function asAuthAdmin(h, fn) {
  return h.db.transaction(async (tx) => {
    await tx.query("set local role supabase_auth_admin");
    return fn(tx);
  });
}

await t.section("sign-up and sign-in as Supabase Auth's role", async () => {
  const h = await createDatabase();
  await asAuthAdmin(h, async (tx) => {
    await tx.query("insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)", [USER, GOOGLE_PROFILE.email, JSON.stringify(GOOGLE_PROFILE)]);
    await tx.query("insert into auth.identities (user_id, provider, provider_id, identity_data) values ($1, 'google', $2, $3)", [USER, GOOGLE_PROFILE.sub, JSON.stringify(GOOGLE_PROFILE)]);
  });
  const user = (await h.db.query("select raw_user_meta_data as m from auth.users where id = $1", [USER])).rows[0].m;
  const identity = (await h.db.query("select identity_data as m from auth.identities where user_id = $1", [USER])).rows[0].m;
  t.check("user metadata keeps only allowlisted keys", JSON.stringify(Object.keys(user).sort()) === JSON.stringify(KEPT), JSON.stringify(user));
  t.check("identity data keeps only allowlisted keys", JSON.stringify(Object.keys(identity).sort()) === JSON.stringify(KEPT), JSON.stringify(identity));
  t.check("email survives", user.email === GOOGLE_PROFILE.email && identity.email === GOOGLE_PROFILE.email);
  t.check("provider subject survives (returning-user lookup)", identity.sub === GOOGLE_PROFILE.sub);
  t.check("no name or photo stored", !JSON.stringify([user, identity]).match(/Alex|googleusercontent|en-GB/));

  // A later sign-in re-copies the profile; it must be stripped again.
  await asAuthAdmin(h, async (tx) => {
    await tx.query("update auth.users set raw_user_meta_data = raw_user_meta_data || $2 where id = $1", [USER, JSON.stringify({ name: "Alex Example", picture: "x" })]);
    await tx.query("update auth.identities set identity_data = identity_data || $2 where user_id = $1", [USER, JSON.stringify({ full_name: "Alex Example" })]);
  });
  const after = (await h.db.query("select u.raw_user_meta_data as u, i.identity_data as i from auth.users u join auth.identities i on i.user_id = u.id")).rows[0];
  t.check("re-sign-in profile copy is stripped again", !JSON.stringify(after).includes("Alex"));

  const nullMeta = "dddddddd-3333-4333-8333-00000000000d";
  await asAuthAdmin(h, (tx) => tx.query("insert into auth.users (id, email, raw_user_meta_data) values ($1, 'x@example.test', null)", [nullMeta]));
  const empty = (await h.db.query("select raw_user_meta_data as m from auth.users where id = $1", [nullMeta])).rows[0].m;
  t.check("null metadata becomes an empty object, not an error", JSON.stringify(empty) === "{}");
});

await t.section("the documented backfill cleans rows written before 0012", async () => {
  const h = await createDatabase();
  const OLD = "eeeeeeee-3333-4333-8333-00000000000e";
  // Simulate a row Supabase wrote before the trigger existed.
  await h.db.exec("alter table auth.users disable trigger sorlio_strip_user_metadata; alter table auth.identities disable trigger sorlio_strip_identity_data;");
  await h.db.query("insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)", [OLD, GOOGLE_PROFILE.email, JSON.stringify(GOOGLE_PROFILE)]);
  await h.db.query("insert into auth.identities (user_id, provider, identity_data) values ($1, 'google', $2)", [OLD, JSON.stringify(GOOGLE_PROFILE)]);
  await h.db.exec("alter table auth.users enable trigger sorlio_strip_user_metadata; alter table auth.identities enable trigger sorlio_strip_identity_data;");

  const doc = readFileSync(new URL("../docs/release/auth-metadata-backfill.md", import.meta.url), "utf8");
  const blocks = [...doc.matchAll(/```sql\r?\n([\s\S]*?)```/g)].map((match) => match[1]);
  const count = async () => {
    const results = await h.db.exec(blocks[0]);
    return results.map((result) => Number(Object.values(result.rows[0])[0]));
  };
  t.check("count query sees the old rows", JSON.stringify(await count()) === "[1,1]");
  await h.db.exec(blocks[1]);
  t.check("backfill leaves no profile fields", JSON.stringify(await count()) === "[0,0]");
  const kept = (await h.db.query("select raw_user_meta_data->>'email' as e from auth.users where id = $1", [OLD])).rows[0].e;
  t.check("backfill keeps the email", kept === GOOGLE_PROFILE.email);
});

await t.section("client roles cannot call the trigger functions", async () => {
  const h = await createDatabase();
  for (const role of ["anon", "authenticated"]) {
    const { rows } = await h.db.query(
      "select has_function_privilege($1, 'public.sorlio_strip_user_metadata()', 'execute') as a, has_function_privilege($1, 'public.sorlio_strip_identity_data()', 'execute') as b",
      [role],
    );
    t.check(`${role} has no execute on the strip functions`, rows[0].a === false && rows[0].b === false);
  }
  const version = (await h.db.query("select public.sorlio_schema_version() as v")).rows[0].v;
  const newest = Number(migrationFiles().at(-1).slice(0, 4));
  t.check("database reports the newest migration's number", version === newest, `${version} vs ${newest}`);
  t.check("the app expects that same version", EXPECTED_SCHEMA_VERSION === newest, `${EXPECTED_SCHEMA_VERSION} vs ${newest}`);
});

t.finish();
