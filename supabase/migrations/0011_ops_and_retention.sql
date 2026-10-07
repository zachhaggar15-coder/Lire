-- 0011 · Privacy-safe operational counters and retention housekeeping
--
-- Additive only. Nothing existing is deleted by applying this migration.
-- sorlio_maintenance() deletes data past its retention period when the
-- maintenance cron calls it; the periods are listed below and stated to
-- readers in the privacy policy (src/app/privacy/page.tsx).

-- ---------------------------------------------------------------------------
-- Operational counters: one row per (day, metric). No user ids, IPs, device
-- data or content — just "how many times did X happen today".
-- ---------------------------------------------------------------------------

create table if not exists public.sorlio_ops_counters (
  day date not null default current_date,
  metric text not null check (metric ~ '^[a-z]+\.[a-z_]+$' and char_length(metric) <= 64),
  count integer not null default 0 check (count >= 0),
  primary key (day, metric)
);

alter table public.sorlio_ops_counters enable row level security;
revoke all on table public.sorlio_ops_counters from anon, authenticated;

comment on table public.sorlio_ops_counters is
  'Aggregate daily operational counters (no personal data). Retained 400 days.';

create or replace function public.sorlio_ops_increment(p_metric text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  insert into public.sorlio_ops_counters as c (day, metric, count)
  values (current_date, p_metric, 1)
  on conflict (day, metric) do update set count = c.count + 1;
$$;

create or replace function public.sorlio_ops_summary(p_days integer default 14)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(jsonb_agg(jsonb_build_object('day', day, 'metric', metric, 'count', count) order by day desc, metric), '[]'::jsonb)
  from public.sorlio_ops_counters
  where day >= current_date - least(greatest(p_days, 1), 90);
$$;

-- ---------------------------------------------------------------------------
-- Retention housekeeping
-- ---------------------------------------------------------------------------

/**
 * Deletes data past its retention period. Returns counts per category.
 *   AI usage counters        older than 30 days
 *   Feedback                 older than 12 months
 *   Operational counters     older than 400 days
 *   Sync tombstones / quota  per sorlio_sync_purge (180 days / 30 days)
 *   RTDN idempotency log     per sorlio_billing_purge_events (90 days)
 */
create or replace function public.sorlio_maintenance()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_ai integer := 0;
  v_feedback integer := 0;
  v_ops integer := 0;
  v_sync jsonb;
  v_events integer;
begin
  if to_regclass('public.sorlio_ai_usage') is not null then
    delete from public.sorlio_ai_usage where usage_date < current_date - 30;
    get diagnostics v_ai = row_count;
  end if;
  delete from public.sorlio_feedback where created_at < now() - interval '12 months';
  get diagnostics v_feedback = row_count;
  delete from public.sorlio_ops_counters where day < current_date - 400;
  get diagnostics v_ops = row_count;
  v_sync := public.sorlio_sync_purge(180);
  v_events := public.sorlio_billing_purge_events();
  return jsonb_build_object(
    'ai_usage_rows', v_ai,
    'feedback_rows', v_feedback,
    'ops_rows', v_ops,
    'sync', v_sync,
    'billing_events', v_events
  );
end;
$$;

revoke all on function public.sorlio_ops_increment(text) from public, anon, authenticated;
revoke all on function public.sorlio_ops_summary(integer) from public, anon, authenticated;
revoke all on function public.sorlio_maintenance() from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant execute on function public.sorlio_ops_increment(text) to service_role';
    execute 'grant execute on function public.sorlio_ops_summary(integer) to service_role';
    execute 'grant execute on function public.sorlio_maintenance() to service_role';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Schema version marker, read by the release schema gate
-- (scripts/check-production-schema.mjs and /api/health).
-- ---------------------------------------------------------------------------

create or replace function public.sorlio_schema_version()
returns integer
language sql
immutable
as $$ select 11 $$;

grant execute on function public.sorlio_schema_version() to anon, authenticated;
