-- 0009 · Billing lifecycle and entitlement authority
--
-- Additive only. Existing rows keep working; new columns are nullable.
--
-- Why this exists
--   0003 stored one row per user with a coarse `status` and `expires_at`, and
--   the AI guard trusted that row until `expires_at`. A refund or revocation
--   was only noticed if the subscriber happened to reopen the Premium page,
--   so a refunded user could keep server AI for up to a month.
--
--   This migration adds:
--     * the raw Play subscription state and when Google last confirmed it, so
--       entitlement can be required to be FRESH, not merely unexpired;
--     * an idempotency log for Real-time Developer Notifications (RTDN);
--     * one SQL definition of "is entitled", used by every server check.
--
-- Rollback: every object here is new (columns, table, functions). Dropping
-- them restores 0003/0008 behaviour; no existing data is rewritten.

alter table public.sorlio_subscriptions
  add column if not exists play_state text,
  add column if not exists verified_at timestamptz,
  add column if not exists acknowledged boolean,
  add column if not exists auto_renewing boolean,
  add column if not exists linked_purchase_token text,
  add column if not exists latest_order_id text,
  add column if not exists revoked_at timestamptz;

comment on column public.sorlio_subscriptions.verified_at is
  'When Google Play last confirmed this subscription (status route, verify route or RTDN reconciliation). Entitlement requires a recent value.';

-- Rows written before this migration were verified when last updated.
update public.sorlio_subscriptions set verified_at = updated_at where verified_at is null;

-- Defence in depth: RLS with no policy already returns nothing to clients,
-- but no client role has any reason to hold privileges on this table.
revoke all on table public.sorlio_subscriptions from anon, authenticated;

/**
 * The single definition of "this account may use Premium right now".
 *
 * Fails closed on every uncertain input: unknown status, missing expiry,
 * missing verification time. `cancelled` still counts until the paid period
 * ends — the subscriber paid for it.
 *
 * Freshness: a row that Google has not re-confirmed for 7 days stops granting
 * Premium in SQL-only checks (the sync save quota). The AI guard applies a
 * stricter 24-hour freshness and re-verifies with Google itself, so a refund
 * or revocation that RTDN somehow missed is noticed within a day.
 */
create or replace function public.sorlio_has_premium(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.sorlio_subscriptions s
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

-- RTDN idempotency. Pub/Sub delivers at least once and out of order; each
-- message id is processed once. The purchase token is stored only as a
-- SHA-256 hash: the log is for idempotency and operations, and the token
-- itself is a bearer credential for the purchase.
create table if not exists public.sorlio_billing_events (
  message_id text primary key check (char_length(message_id) between 1 and 200),
  notification_type integer,
  purchase_token_sha256 text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  outcome text check (outcome is null or char_length(outcome) <= 200)
);

alter table public.sorlio_billing_events enable row level security;
revoke all on table public.sorlio_billing_events from anon, authenticated;

create index if not exists sorlio_billing_events_received_idx on public.sorlio_billing_events (received_at);

comment on table public.sorlio_billing_events is
  'RTDN idempotency log. No user id; token stored as SHA-256 only. Retained 90 days (sorlio_billing_purge_events, run by sorlio_maintenance).';

-- 0008 left sorlio_consume_ai_call executable by PUBLIC (the Postgres
-- default for new functions). It is not SECURITY DEFINER, so anon callers hit
-- RLS and could not write — but there is no reason for any client role to be
-- able to call it at all.
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'sorlio_consume_ai_call') then
    execute 'revoke all on function public.sorlio_consume_ai_call(uuid, integer) from public, anon, authenticated';
    execute 'alter function public.sorlio_consume_ai_call(uuid, integer) set search_path = public, pg_temp';
    if exists (select 1 from pg_roles where rolname = 'service_role') then
      execute 'grant execute on function public.sorlio_consume_ai_call(uuid, integer) to service_role';
    end if;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant execute on function public.sorlio_has_premium(uuid) to service_role';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Recording verified Play state (service role only)
-- ---------------------------------------------------------------------------
--
-- Ownership rule: one Play subscription belongs to one Sorlio account. A
-- purchase token (or the token it replaced, linkedPurchaseToken) already held
-- by a different account is a conflict — reported, never silently moved and
-- never swallowed. The caller shows a non-technical explanation without
-- revealing the other account.

/**
 * Stores Google's verified view of a subscription for p_user.
 * Returns {"result": "ok"} or {"result": "conflict"}.
 */
create or replace function public.sorlio_billing_record(
  p_user uuid,
  p_product text,
  p_token text,
  p_linked_token text,
  p_status text,
  p_expires timestamptz,
  p_auto_renewing boolean,
  p_acknowledged boolean,
  p_order_id text,
  p_revoked boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_user is null or p_token is null or char_length(p_token) = 0 then
    raise exception 'invalid_arguments' using errcode = '22023';
  end if;
  if p_status not in ('pending', 'active', 'grace_period', 'cancelled', 'on_hold', 'paused', 'expired', 'revoked', 'unknown') then
    raise exception 'invalid_status' using errcode = '22023';
  end if;

  -- Serialise concurrent verifications of the same token.
  perform pg_advisory_xact_lock(hashtext('sorlio_billing:' || p_token));

  if exists (
    select 1 from public.sorlio_subscriptions s
    where s.user_id <> p_user
      and (s.purchase_token = p_token or (p_linked_token is not null and s.purchase_token = p_linked_token))
  ) then
    return jsonb_build_object('result', 'conflict');
  end if;

  insert into public.sorlio_subscriptions as s (
    user_id, provider, product_id, purchase_token, status, play_state, expires_at, updated_at,
    verified_at, acknowledged, auto_renewing, linked_purchase_token, latest_order_id, revoked_at
  ) values (
    p_user, 'google_play', p_product, p_token, p_status, p_status, p_expires, now(),
    now(), p_acknowledged, p_auto_renewing, p_linked_token, p_order_id,
    case when p_revoked then now() else null end
  )
  on conflict (user_id) do update set
    product_id = excluded.product_id,
    purchase_token = excluded.purchase_token,
    status = excluded.status,
    play_state = excluded.play_state,
    expires_at = excluded.expires_at,
    updated_at = now(),
    verified_at = now(),
    acknowledged = excluded.acknowledged,
    auto_renewing = excluded.auto_renewing,
    linked_purchase_token = excluded.linked_purchase_token,
    latest_order_id = excluded.latest_order_id,
    -- A revocation sticks to its token; a genuinely new purchase clears it.
    revoked_at = case
      when p_revoked then coalesce(s.revoked_at, now())
      when s.purchase_token = excluded.purchase_token then s.revoked_at
      else null
    end;

  return jsonb_build_object('result', 'ok');
end;
$$;

/** The account holding a purchase token (or the token it replaced), if any. */
create or replace function public.sorlio_billing_owner(p_token text)
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select s.user_id from public.sorlio_subscriptions s
  where s.purchase_token = p_token or s.linked_purchase_token = p_token
  order by s.updated_at desc
  limit 1;
$$;

/** One account's stored subscription, for entitlement decisions. */
create or replace function public.sorlio_billing_get(p_user uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select to_jsonb(s) from public.sorlio_subscriptions s where s.user_id = p_user;
$$;

/**
 * Records an RTDN message id. Returns true until the message has been
 * processed successfully, so a failed attempt is retried on redelivery and a
 * processed duplicate is skipped.
 */
create or replace function public.sorlio_billing_claim_event(p_message_id text, p_type integer, p_token_sha256 text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_processed timestamptz;
begin
  insert into public.sorlio_billing_events (message_id, notification_type, purchase_token_sha256)
    values (p_message_id, p_type, p_token_sha256)
    on conflict (message_id) do nothing;
  select processed_at into v_processed from public.sorlio_billing_events where message_id = p_message_id;
  return v_processed is null;
end;
$$;

create or replace function public.sorlio_billing_finish_event(p_message_id text, p_outcome text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.sorlio_billing_events set processed_at = now(), outcome = left(p_outcome, 200) where message_id = p_message_id;
$$;

/** Subscriptions that need re-verification (stale, or not yet acknowledged). */
create or replace function public.sorlio_billing_due(p_limit integer default 50)
returns table (user_id uuid, product_id text, purchase_token text)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select s.user_id, s.product_id, s.purchase_token
  from public.sorlio_subscriptions s
  where (s.acknowledged is distinct from true and s.status in ('active', 'grace_period', 'cancelled'))
     or (s.status in ('active', 'grace_period', 'cancelled', 'pending', 'on_hold', 'paused')
         and (s.verified_at is null or s.verified_at < now() - interval '20 hours'))
  order by s.verified_at nulls first
  limit least(greatest(p_limit, 1), 200);
$$;

/** Housekeeping: drop RTDN log entries older than 90 days. */
create or replace function public.sorlio_billing_purge_events()
returns integer
language sql
security definer
set search_path = public, pg_temp
as $$
  with gone as (delete from public.sorlio_billing_events where received_at < now() - interval '90 days' returning 1)
  select count(*)::integer from gone;
$$;

revoke all on function public.sorlio_billing_record(uuid, text, text, text, text, timestamptz, boolean, boolean, text, boolean) from public, anon, authenticated;
revoke all on function public.sorlio_billing_owner(text) from public, anon, authenticated;
revoke all on function public.sorlio_billing_get(uuid) from public, anon, authenticated;
revoke all on function public.sorlio_billing_claim_event(text, integer, text) from public, anon, authenticated;
revoke all on function public.sorlio_billing_finish_event(text, text) from public, anon, authenticated;
revoke all on function public.sorlio_billing_due(integer) from public, anon, authenticated;
revoke all on function public.sorlio_billing_purge_events() from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant execute on function public.sorlio_billing_record(uuid, text, text, text, text, timestamptz, boolean, boolean, text, boolean) to service_role';
    execute 'grant execute on function public.sorlio_billing_owner(text) to service_role';
    execute 'grant execute on function public.sorlio_billing_get(uuid) to service_role';
    execute 'grant execute on function public.sorlio_billing_claim_event(text, integer, text) to service_role';
    execute 'grant execute on function public.sorlio_billing_finish_event(text, text) to service_role';
    execute 'grant execute on function public.sorlio_billing_due(integer) to service_role';
    execute 'grant execute on function public.sorlio_billing_purge_events() to service_role';
  end if;
end $$;
