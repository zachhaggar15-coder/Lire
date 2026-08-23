-- 0005 · Feedback and research prompt responses
--
-- Two tables with the same shape of concern: both hold free text a reader
-- chose to send, both are written only through a service-role API route, and
-- both are readable by nobody through the anon key.
--
-- Kept in one migration because they are created together, share the same
-- policy pattern, and are always reasoned about as a pair — including in the
-- deletion endpoint, which removes rows from both.

-- ---------------------------------------------------------------------------
-- Feedback
-- ---------------------------------------------------------------------------
create table if not exists public.sorlio_feedback (
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

create index if not exists sorlio_feedback_created_idx on public.sorlio_feedback(created_at desc);
create index if not exists sorlio_feedback_category_idx on public.sorlio_feedback(category, created_at desc);
create index if not exists sorlio_feedback_article_idx on public.sorlio_feedback(article_id);
create index if not exists sorlio_feedback_anon_idx on public.sorlio_feedback(anonymous_id);
create index if not exists sorlio_feedback_user_idx on public.sorlio_feedback(user_id);

alter table public.sorlio_feedback enable row level security;

drop policy if exists "No public feedback reads" on public.sorlio_feedback;
create policy "No public feedback reads" on public.sorlio_feedback
  for select using (false);

drop policy if exists "No direct feedback writes" on public.sorlio_feedback;
create policy "No direct feedback writes" on public.sorlio_feedback
  for insert with check (false);

-- ---------------------------------------------------------------------------
-- Research prompt responses
-- ---------------------------------------------------------------------------
create table if not exists public.sorlio_research_prompt_responses (
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

create index if not exists sorlio_research_created_idx on public.sorlio_research_prompt_responses(created_at desc);
create index if not exists sorlio_research_prompt_idx on public.sorlio_research_prompt_responses(prompt_type, created_at desc);
create index if not exists sorlio_research_anon_idx on public.sorlio_research_prompt_responses(anonymous_id);
create index if not exists sorlio_research_user_idx on public.sorlio_research_prompt_responses(user_id);

alter table public.sorlio_research_prompt_responses enable row level security;

drop policy if exists "No public research reads" on public.sorlio_research_prompt_responses;
create policy "No public research reads" on public.sorlio_research_prompt_responses
  for select using (false);

drop policy if exists "No direct research writes" on public.sorlio_research_prompt_responses;
create policy "No direct research writes" on public.sorlio_research_prompt_responses
  for insert with check (false);
