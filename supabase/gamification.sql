-- Liree gamification persistence tables.
-- The app remains local-first, but these tables give production Supabase
-- projects typed storage for XP, missions, completions and rewards.

create extension if not exists pgcrypto;

create or replace function public.lire_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_xp integer not null default 0,
  current_level integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  related_entity_id text,
  xp_amount integer not null check (xp_amount >= 0),
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create table if not exists public.daily_missions (
  id text not null,
  mission_date date not null,
  title text not null,
  description text not null,
  kind text not null,
  requirement integer not null check (requirement >= 0),
  xp_reward integer not null check (xp_reward >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (mission_date, id)
);

create table if not exists public.user_mission_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_date date not null,
  mission_id text not null,
  progress integer not null default 0,
  completed_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, mission_date, mission_id)
);

create table if not exists public.article_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id text not null,
  title text not null,
  source_name text,
  category text not null,
  difficulty text not null,
  completed_at timestamptz not null,
  words_read integer not null default 0,
  reading_minutes integer,
  translations_used integer not null default 0,
  full_translation_used boolean not null default false,
  saved_words integer not null default 0,
  phrases_saved integer not null default 0,
  comprehension_correct integer not null default 0,
  comprehension_total integer not null default 0,
  inference_correct integer not null default 0,
  inference_attempts integer not null default 0,
  summary_completed boolean not null default false,
  challenge_mode text not null default 'none',
  challenge_budget integer,
  challenge_completed boolean,
  score integer not null default 0 check (score between 0 and 100),
  score_breakdown jsonb not null default '{}'::jsonb,
  xp_earned integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create table if not exists public.article_scores (
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id text not null,
  score integer not null check (score between 0 and 100),
  breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create table if not exists public.user_topic_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  topic_level integer not null default 1,
  xp integer not null default 0,
  articles_completed integer not null default 0,
  avg_comprehension numeric(5,2) not null default 0,
  vocabulary_coverage numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, category)
);

create table if not exists public.vocabulary_mastery (
  user_id uuid not null references auth.users(id) on delete cascade,
  word text not null,
  lemma text,
  stage text not null default 'discovered',
  stage_index integer not null default 0,
  contexts integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, word)
);

create table if not exists public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  requirement integer not null default 1,
  xp_reward integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  progress integer not null default 0,
  unlocked_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table if not exists public.reading_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.personal_bests (
  user_id uuid not null references auth.users(id) on delete cascade,
  best_key text not null,
  value_numeric numeric,
  value_text text,
  related_entity_id text,
  achieved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, best_key)
);

create table if not exists public.passport_stamps (
  id text primary key,
  title text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_passport_stamps (
  user_id uuid not null references auth.users(id) on delete cascade,
  stamp_id text not null references public.passport_stamps(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, stamp_id)
);

create index if not exists user_xp_events_user_created_idx on public.user_xp_events(user_id, created_at desc);
create index if not exists article_completions_user_completed_idx on public.article_completions(user_id, completed_at desc);
create index if not exists vocabulary_mastery_user_stage_idx on public.vocabulary_mastery(user_id, stage_index desc);

alter table public.user_progress enable row level security;
alter table public.user_xp_events enable row level security;
alter table public.daily_missions enable row level security;
alter table public.user_mission_progress enable row level security;
alter table public.article_completions enable row level security;
alter table public.article_scores enable row level security;
alter table public.user_topic_progress enable row level security;
alter table public.vocabulary_mastery enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.reading_streaks enable row level security;
alter table public.personal_bests enable row level security;
alter table public.passport_stamps enable row level security;
alter table public.user_passport_stamps enable row level security;

drop policy if exists "Users manage own progress" on public.user_progress;
create policy "Users manage own progress" on public.user_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own xp events" on public.user_xp_events;
create policy "Users manage own xp events" on public.user_xp_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Authenticated users read missions" on public.daily_missions;
create policy "Authenticated users read missions" on public.daily_missions
  for select to authenticated using (true);

drop policy if exists "Users manage own mission progress" on public.user_mission_progress;
create policy "Users manage own mission progress" on public.user_mission_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own article completions" on public.article_completions;
create policy "Users manage own article completions" on public.article_completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own article scores" on public.article_scores;
create policy "Users manage own article scores" on public.article_scores
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own topic progress" on public.user_topic_progress;
create policy "Users manage own topic progress" on public.user_topic_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own vocabulary mastery" on public.vocabulary_mastery;
create policy "Users manage own vocabulary mastery" on public.vocabulary_mastery
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Authenticated users read achievements" on public.achievements;
create policy "Authenticated users read achievements" on public.achievements
  for select to authenticated using (true);

drop policy if exists "Users manage own achievements" on public.user_achievements;
create policy "Users manage own achievements" on public.user_achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own streaks" on public.reading_streaks;
create policy "Users manage own streaks" on public.reading_streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own personal bests" on public.personal_bests;
create policy "Users manage own personal bests" on public.personal_bests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Authenticated users read passport stamps" on public.passport_stamps;
create policy "Authenticated users read passport stamps" on public.passport_stamps
  for select to authenticated using (true);

drop policy if exists "Users manage own passport stamps" on public.user_passport_stamps;
create policy "Users manage own passport stamps" on public.user_passport_stamps
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
