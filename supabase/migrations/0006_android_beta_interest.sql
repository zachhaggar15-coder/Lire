-- 0006 · Android beta mailing list
--
-- Keyed by normalised email rather than by account, because someone can join
-- the list without ever creating an account. user_id is recorded as null even
-- when a signed-in reader submits it.
--
-- Each row carries its own unsubscribe_token, generated server-side, which is
-- what the unsubscribe link in the email carries. That token is why this table
-- is excluded from account deletion — see 0007.
--
-- Note that the CTA feeding this table is gated behind
-- NEXT_PUBLIC_ANDROID_BETA_CTA_ENABLED, which defaults to false. A standard
-- production build therefore never writes here at all; the table exists so the
-- feature can be switched on without a schema change.

create table if not exists public.sorlio_android_beta_interest (
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

-- One row per address, so re-submitting updates rather than duplicating, and
-- one row per token, so an unsubscribe link can never be ambiguous.
create unique index if not exists sorlio_android_beta_email_unique on public.sorlio_android_beta_interest(email_normalized);
create unique index if not exists sorlio_android_beta_unsubscribe_token_unique on public.sorlio_android_beta_interest(unsubscribe_token);
create index if not exists sorlio_android_beta_created_idx on public.sorlio_android_beta_interest(created_at desc);
create index if not exists sorlio_android_beta_source_idx on public.sorlio_android_beta_interest(first_touch_source, source);
create index if not exists sorlio_android_beta_anon_idx on public.sorlio_android_beta_interest(anonymous_id);
create index if not exists sorlio_android_beta_user_idx on public.sorlio_android_beta_interest(user_id);

alter table public.sorlio_android_beta_interest enable row level security;

drop policy if exists "No public beta reads" on public.sorlio_android_beta_interest;
create policy "No public beta reads" on public.sorlio_android_beta_interest
  for select using (false);

drop policy if exists "No direct beta writes" on public.sorlio_android_beta_interest;
create policy "No direct beta writes" on public.sorlio_android_beta_interest
  for insert with check (false);
