-- Sorlio — consolidated release migration.
--
-- This is the single file to run against a fresh Supabase project before the
-- first Play release. Paste the whole thing into Dashboard -> SQL Editor ->
-- New query -> Run. Every statement is idempotent, so re-running it is safe
-- and is the intended way to apply later additions.
--
-- It supersedes running supabase/schema.sql and supabase/validation.sql
-- separately; those two files are kept because they document why each table
-- exists, and this file is their union in dependency order.
--
-- supabase/gamification.sql is deliberately NOT included. It defines fourteen
-- tables (user_progress, user_xp_events, daily_missions, article_completions
-- and so on) left over from the CEFR-based gamification system that was
-- removed. No code path queries any of them — the app reads and writes only
-- the six tables below. Applying it would create empty tables holding reader
-- data models the app no longer has, which then have to be declared and
-- defended in Play's Data Safety form for no benefit.
--
-- The six tables this creates:
--   lire_user_data                  synced learning data (per signed-in user)
--   lire_subscriptions              Google Play entitlements (server only)
--   lire_analytics_events           optional, consent-gated product analytics
--   lire_feedback                   user-submitted feedback
--   lire_research_prompt_responses  in-app research prompt answers
--   lire_android_beta_interest      beta mailing list (email + consent state)
--
-- The lire_ prefix is retained on purpose. These tables and their RLS policies
-- are live and hold real reader data; renaming them to match the Sorlio name
-- would be a data migration with real downside and no user-visible benefit.
--
-- No secret belongs in this file. The service-role key is set as a server-side
-- environment variable and must never appear in SQL, in client code, or in any
-- committed file.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Synced learning data
-- ---------------------------------------------------------------------------
-- Holds every synced localStorage store as a JSONB blob keyed by
-- (user_id, store_key), where store_key is the same string the store already
-- uses locally (see SYNCED_STORES in src/lib/supabase/sync.ts). Mirroring
-- localStorage rather than modelling a relational schema is what lets the
-- local-first store modules stay unchanged.

create table if not exists public.lire_user_data (
  user_id uuid not null references auth.users (id) on delete cascade,
  store_key text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, store_key)
);

alter table public.lire_user_data enable row level security;

-- The only rule the anon key needs: a signed-in user reaches their own rows
-- and nothing else. auth.uid() comes from the JWT Supabase verifies, not from
-- anything the client asserts.
drop policy if exists "Users manage their own data" on public.lire_user_data;
create policy "Users manage their own data" on public.lire_user_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2. Google Play subscription entitlements
-- ---------------------------------------------------------------------------
-- Server-managed. RLS is enabled and no policy is created, so the anon and
-- authenticated roles can neither read nor write it; only the service-role
-- backend touches purchase tokens.

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

-- ---------------------------------------------------------------------------
-- 3. Optional product analytics
-- ---------------------------------------------------------------------------
-- Written only after the reader accepts the analytics prompt, and only via the
-- service-role backend. Both policies are deliberately false: the browser can
-- neither read these rows back nor insert them directly.

create table if not exists public.lire_analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  anonymous_id text,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  payload jsonb not null default '{}'::jsonb,
  app_version text not null default 'unknown',
  deployment_environment text not null default 'local',
  created_at timestamptz not null default now()
);

create index if not exists lire_analytics_events_created_idx on public.lire_analytics_events(created_at desc);
create index if not exists lire_analytics_events_name_created_idx on public.lire_analytics_events(event_name, created_at desc);
create index if not exists lire_analytics_events_anon_idx on public.lire_analytics_events(anonymous_id);
create index if not exists lire_analytics_events_user_idx on public.lire_analytics_events(user_id);
create index if not exists lire_analytics_events_env_idx on public.lire_analytics_events(deployment_environment);

alter table public.lire_analytics_events enable row level security;

drop policy if exists "No public analytics reads" on public.lire_analytics_events;
create policy "No public analytics reads" on public.lire_analytics_events
  for select using (false);

drop policy if exists "No direct analytics writes" on public.lire_analytics_events;
create policy "No direct analytics writes" on public.lire_analytics_events
  for insert with check (false);

-- ---------------------------------------------------------------------------
-- 4. Feedback
-- ---------------------------------------------------------------------------

create table if not exists public.lire_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  anonymous_id text,
  session_id text,
  category text not null,
  sentiment text,
  page text,
  feature text,
  article_id text,
  affected_term text,
  comment text,
  app_version text not null default 'unknown',
  deployment_environment text not null default 'local',
  created_at timestamptz not null default now()
);

create index if not exists lire_feedback_created_idx on public.lire_feedback(created_at desc);
create index if not exists lire_feedback_category_idx on public.lire_feedback(category, created_at desc);
create index if not exists lire_feedback_article_idx on public.lire_feedback(article_id);
create index if not exists lire_feedback_anon_idx on public.lire_feedback(anonymous_id);
create index if not exists lire_feedback_user_idx on public.lire_feedback(user_id);

alter table public.lire_feedback enable row level security;

drop policy if exists "No public feedback reads" on public.lire_feedback;
create policy "No public feedback reads" on public.lire_feedback
  for select using (false);

drop policy if exists "No direct feedback writes" on public.lire_feedback;
create policy "No direct feedback writes" on public.lire_feedback
  for insert with check (false);

-- ---------------------------------------------------------------------------
-- 5. Research prompt responses
-- ---------------------------------------------------------------------------

create table if not exists public.lire_research_prompt_responses (
  id uuid primary key default gen_random_uuid(),
  prompt_type text not null,
  response text not null,
  comment text,
  user_id uuid references auth.users(id) on delete set null,
  anonymous_id text,
  session_id text,
  page text,
  behavioural_context jsonb not null default '{}'::jsonb,
  app_version text not null default 'unknown',
  deployment_environment text not null default 'local',
  created_at timestamptz not null default now()
);

create index if not exists lire_research_created_idx on public.lire_research_prompt_responses(created_at desc);
create index if not exists lire_research_prompt_idx on public.lire_research_prompt_responses(prompt_type, created_at desc);
create index if not exists lire_research_anon_idx on public.lire_research_prompt_responses(anonymous_id);
create index if not exists lire_research_user_idx on public.lire_research_prompt_responses(user_id);

alter table public.lire_research_prompt_responses enable row level security;

drop policy if exists "No public research reads" on public.lire_research_prompt_responses;
create policy "No public research reads" on public.lire_research_prompt_responses
  for select using (false);

drop policy if exists "No direct research writes" on public.lire_research_prompt_responses;
create policy "No direct research writes" on public.lire_research_prompt_responses
  for insert with check (false);

-- ---------------------------------------------------------------------------
-- 6. Android beta mailing list
-- ---------------------------------------------------------------------------
-- Keyed by normalised email with its own unsubscribe token. Note the
-- deletion rule below: this table is intentionally excluded from account
-- deletion.

create table if not exists public.lire_android_beta_interest (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null,
  user_id uuid references auth.users(id) on delete set null,
  anonymous_id text,
  french_level text,
  uses_android boolean,
  current_learning_tools text,
  motivation text,
  desired_improvement text,
  source text not null,
  current_path text not null default '/',
  first_touch_source text,
  first_touch_medium text,
  first_touch_campaign text,
  latest_touch_source text,
  is_returning_user boolean not null default false,
  pwa_installed boolean,
  articles_started integer not null default 0,
  articles_completed integer not null default 0,
  reading_sessions_completed integer not null default 0,
  words_saved integer not null default 0,
  reviews_completed integer not null default 0,
  current_streak integer not null default 0,
  app_version text not null default 'unknown',
  deployment_environment text not null default 'local',
  consent_source text,
  consent_at timestamptz,
  confirmation_sent_at timestamptz,
  unsubscribe_token text not null default encode(gen_random_bytes(24), 'hex'),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists lire_android_beta_email_unique on public.lire_android_beta_interest(email_normalized);
create unique index if not exists lire_android_beta_unsubscribe_token_unique on public.lire_android_beta_interest(unsubscribe_token);
create index if not exists lire_android_beta_created_idx on public.lire_android_beta_interest(created_at desc);
create index if not exists lire_android_beta_source_idx on public.lire_android_beta_interest(first_touch_source, source);
create index if not exists lire_android_beta_anon_idx on public.lire_android_beta_interest(anonymous_id);
create index if not exists lire_android_beta_user_idx on public.lire_android_beta_interest(user_id);

alter table public.lire_android_beta_interest enable row level security;

drop policy if exists "No public beta reads" on public.lire_android_beta_interest;
create policy "No public beta reads" on public.lire_android_beta_interest
  for select using (false);

drop policy if exists "No direct beta writes" on public.lire_android_beta_interest;
create policy "No direct beta writes" on public.lire_android_beta_interest
  for insert with check (false);

-- ---------------------------------------------------------------------------
-- Account deletion — what cascades and what does not
-- ---------------------------------------------------------------------------
-- Play requires that in-app account deletion actually removes the account's
-- data, so this distinction is worth stating explicitly.
--
-- Cascade on auth user delete (references ... on delete cascade):
--   lire_user_data        every synced store
--   lire_subscriptions    the entitlement row and its purchase token
--
-- Do NOT cascade — these use `on delete set null`, which would orphan the row
-- rather than remove it, so /api/account/delete deletes them by user_id first:
--   lire_feedback
--   lire_research_prompt_responses
--   lire_analytics_events
--
-- Adding another user-linked table means either giving it an on-delete-cascade
-- reference to auth.users, or adding it to that endpoint's list. Doing neither
-- leaves identifiable rows behind after a deletion the reader was told was
-- complete.
--
-- lire_android_beta_interest is intentionally excluded from deletion. It is
-- keyed by email rather than account, carries its own unsubscribe token, and
-- records a separate mailing-list consent — deleting the row would destroy the
-- unsubscribe state that stops further email being sent to that address.
-- Readers unsubscribe through the link in the email itself.
