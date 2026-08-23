-- 0004 · Optional product analytics
--
-- Nothing reaches this table unless the reader accepted the analytics prompt:
-- trackEvent() returns immediately when hasAnalyticsConsent() is false, before
-- an event is even constructed. See src/lib/analytics/client.ts.
--
-- Both policies below are deliberately `false` rather than absent, so the
-- intent is explicit in the schema: the browser may neither read these rows
-- back nor insert them directly. Writes go through /api/analytics/events using
-- the service-role key, which is where the payload deny-list is enforced.
--
-- user_id is `on delete set null` rather than cascade, because an analytics row
-- outliving its account is useful in aggregate and harmless once anonymous.
-- That is exactly why the deletion endpoint has to remove these rows
-- explicitly — see 0007.

create table if not exists public.sorlio_analytics_events (
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

create index if not exists sorlio_analytics_events_created_idx on public.sorlio_analytics_events(created_at desc);
create index if not exists sorlio_analytics_events_name_created_idx on public.sorlio_analytics_events(event_name, created_at desc);
create index if not exists sorlio_analytics_events_anon_idx on public.sorlio_analytics_events(anonymous_id);
create index if not exists sorlio_analytics_events_user_idx on public.sorlio_analytics_events(user_id);
create index if not exists sorlio_analytics_events_env_idx on public.sorlio_analytics_events(deployment_environment);

alter table public.sorlio_analytics_events enable row level security;

drop policy if exists "No public analytics reads" on public.sorlio_analytics_events;
create policy "No public analytics reads" on public.sorlio_analytics_events
  for select using (false);

drop policy if exists "No direct analytics writes" on public.sorlio_analytics_events;
create policy "No direct analytics writes" on public.sorlio_analytics_events
  for insert with check (false);
