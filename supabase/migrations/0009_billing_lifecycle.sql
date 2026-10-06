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
  'RTDN idempotency log. No user id; token stored as SHA-256 only. Retained 90 days (sorlio_purge_operational_data).';

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
