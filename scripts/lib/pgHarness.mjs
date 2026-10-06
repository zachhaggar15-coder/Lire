/**
 * Real-Postgres test harness for Sorlio's migrations.
 *
 * Runs every file in supabase/migrations against an in-process Postgres
 * (PGlite — Postgres compiled to WASM), on top of a minimal stand-in for the
 * parts of Supabase the migrations depend on:
 *   - an `auth.users` table,
 *   - `auth.uid()` reading the JWT subject from a session setting, exactly as
 *     Supabase's own implementation does,
 *   - the `anon`, `authenticated` and `service_role` roles.
 *
 * Tests act as a given user with `as(userId)`, which switches to the
 * `authenticated` role and sets the JWT subject — the same privileges a
 * browser holding that user's session gets through PostgREST. That makes
 * privilege and RLS mistakes show up here rather than in production.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, "..", "..", "supabase", "migrations");

const SUPABASE_STUB = `
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
-- Supabase's default privileges: client roles get table and function access
-- unless a migration revokes it. Reproduced so that missing revokes fail here.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
`;

export function migrationFiles() {
  return readdirSync(migrationsDir)
    .filter((name) => /^\d{4}_.*\.sql$/.test(name))
    .sort();
}

export async function createDatabase({ upTo } = {}) {
  // PGlite treats a global `window` as "running in a browser". Tests that fake
  // one for app code must not change how the database boots.
  const fakeWindow = globalThis.window;
  delete globalThis.window;
  const db = new PGlite({ extensions: { pgcrypto } });
  try {
    await db.waitReady;
    await db.exec(SUPABASE_STUB);
  } finally {
    if (fakeWindow !== undefined) globalThis.window = fakeWindow;
  }
  for (const file of migrationFiles()) {
    if (upTo && file > upTo) break;
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    try {
      await db.exec(sql);
    } catch (error) {
      throw new Error(`Migration ${file} failed: ${error.message}`);
    }
  }

  async function addUser(id, email = `${id.slice(0, 8)}@example.test`) {
    await db.query("insert into auth.users (id, email) values ($1, $2)", [id, email]);
    return id;
  }

  /** Runs `fn` inside a transaction as the given user with the authenticated role. */
  async function as(userId, fn) {
    return db.transaction(async (tx) => {
      await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [userId ?? ""]);
      await tx.query(userId ? "set local role authenticated" : "set local role anon");
      return fn(tx);
    });
  }

  async function asService(fn) {
    return db.transaction(async (tx) => {
      await tx.query("set local role service_role");
      return fn(tx);
    });
  }

  /** Calls an RPC as a user and returns the decoded jsonb result. */
  async function rpc(userId, name, args) {
    const keys = Object.keys(args);
    const placeholders = keys.map((key, index) => `${key} => $${index + 1}`).join(", ");
    const values = keys.map((key) => {
      const value = args[key];
      return value !== null && typeof value === "object" ? JSON.stringify(value) : value;
    });
    return as(userId, async (tx) => {
      const result = await tx.query(`select public.${name}(${placeholders}) as out`, values);
      return result.rows[0].out;
    });
  }

  return { db, addUser, as, asService, rpc };
}
