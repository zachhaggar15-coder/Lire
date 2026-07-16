-- Lire validation, Android beta, feedback, and research tables.
-- Run in Supabase SQL Editor after supabase/schema.sql.
-- Service-role access is used by Next.js API routes for inserts/admin reads.
-- RLS remains enabled so anon/authenticated browser clients cannot list data.

create extension if not exists pgcrypto;

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
