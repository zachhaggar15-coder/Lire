-- Complimentary Premium access is an account entitlement, not a Google Play
-- purchase. Keep it separate from verified subscriptions so billing sync and
-- RTDN can never overwrite the grant or mistake it for a renewable purchase.
create table if not exists public.sorlio_premium_grants (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  reason text not null check (char_length(reason) between 1 and 200)
);

alter table public.sorlio_premium_grants enable row level security;
revoke all on table public.sorlio_premium_grants from public, anon, authenticated;
grant select, insert, update, delete on table public.sorlio_premium_grants to service_role;

create or replace function public.sorlio_complimentary_premium(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.sorlio_premium_grants g
    where g.user_id = p_user_id and g.revoked_at is null
  );
$$;

revoke all on function public.sorlio_complimentary_premium(uuid) from public, anon, authenticated;
grant execute on function public.sorlio_complimentary_premium(uuid) to service_role;

-- The database save quota uses this function; the web AI/status guards also
-- check the grant through the service-only RPC above.
create or replace function public.sorlio_has_premium(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.sorlio_complimentary_premium(p_user_id) or exists (
    select 1 from public.sorlio_subscriptions s
    where s.user_id = p_user_id
      and s.status in ('active', 'grace_period', 'cancelled')
      and s.expires_at is not null
      and s.expires_at > now()
      and s.revoked_at is null
      and s.verified_at is not null
      and s.verified_at > now() - interval '7 days'
  );
$$;

revoke all on function public.sorlio_has_premium(uuid) from public, anon, authenticated;
grant execute on function public.sorlio_has_premium(uuid) to service_role;

create or replace function public.sorlio_schema_version()
returns integer language sql immutable
set search_path = public, pg_temp
as $$ select 13; $$;
grant execute on function public.sorlio_schema_version() to anon, authenticated;
