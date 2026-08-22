-- Lire — cross-device sync schema.
--
-- Run this once in your Supabase project's SQL Editor (Dashboard ->
-- SQL Editor -> New query -> paste this whole file -> Run). Safe to re-run:
-- every statement is idempotent (create-if-not-exists / drop-then-create).
--
-- `lire_user_data` holds every synced localStorage store as a
-- JSONB blob keyed by (user_id, store_key) — store_key is the same string
-- each store already uses as its own localStorage key (see
-- src/lib/supabase/sync.ts's SYNCED_STORES). This mirrors localStorage
-- directly rather than modelling a full relational schema, so the app's
-- existing store modules (storage.ts, knownWords.ts, etc.) don't need to
-- change how they read/write locally — sync is a thin layer bolted on top.
--
-- Named with a `lire_` prefix (rather than a generic `user_data`)
-- specifically so it reads unambiguously if this project's Supabase
-- instance is shared with other, unrelated apps.
-- `lire_subscriptions` separately holds server-managed Google Play
-- entitlements and is never exposed through an anon-key policy.

create table if not exists public.lire_user_data (
  user_id uuid not null references auth.users (id) on delete cascade,
  store_key text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, store_key)
);

alter table public.lire_user_data enable row level security;

-- Each signed-in user can only ever read/write their own rows — this is
-- the only access rule the anon key needs, since auth.uid() comes from the
-- verified JWT Supabase issues on sign-in, not anything the client sends.
drop policy if exists "Users manage their own data" on public.lire_user_data;
create policy "Users manage their own data" on public.lire_user_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Server-managed Google Play subscription entitlements. No client policy is
-- created: only the service-role backend may read or write purchase tokens.
create table if not exists public.lire_subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  provider text not null check (provider = 'google_play'),
  product_id text not null,
  purchase_token text not null unique,
  status text not null,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.lire_subscriptions enable row level security;
