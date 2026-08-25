-- 0008 · Per-user daily AI call budget
--
-- The AI routes spend real money on every call. Requiring a Premium account
-- (see src/lib/ai/guard.ts) bounds who can spend it; this bounds how much any
-- one account can spend in a day.
--
-- This is an anti-abuse ceiling, not a product limit. It sits far above what
-- reading a few articles could ever consume, so a paying reader will not meet
-- it — but a subscriber who scripts the endpoint stops at a known number
-- instead of an open-ended bill.
--
-- Counting has to be atomic. Read-then-write from the API route would let two
-- concurrent requests both read "299 of 300" and both proceed, which is
-- exactly the pattern someone abusing the endpoint would hit. The function
-- below does the check and the increment in a single statement.
--
-- Service-role only, like every other non-user table here: RLS on, no policy.

create table if not exists public.sorlio_ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null,
  calls integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

alter table public.sorlio_ai_usage enable row level security;

create index if not exists sorlio_ai_usage_date_idx on public.sorlio_ai_usage(usage_date desc);

comment on table public.sorlio_ai_usage is
  'Daily per-user AI call counter, an anti-abuse ceiling on paid AI features. Cascades on auth user delete.';

/**
 * Records one AI call against today's budget, atomically.
 *
 * Returns true when the call is within budget and has been counted, false
 * when the account is already at its limit — in which case nothing is
 * incremented, so a blocked caller cannot inflate their own counter.
 *
 * The WHERE on the conflict clause is what makes that work: at the limit the
 * UPDATE matches no row, RETURNING yields nothing, and v_calls stays null.
 */
create or replace function public.sorlio_consume_ai_call(p_user_id uuid, p_limit integer)
returns boolean
language plpgsql
as $$
declare
  v_calls integer;
begin
  if p_limit <= 0 then
    return false;
  end if;

  insert into public.sorlio_ai_usage as u (user_id, usage_date, calls, updated_at)
  values (p_user_id, current_date, 1, now())
  on conflict (user_id, usage_date) do update
    set calls = u.calls + 1,
        updated_at = now()
    where u.calls < p_limit
  returning u.calls into v_calls;

  return v_calls is not null;
end;
$$;

-- Old rows have no value once the day is over. Not scheduled automatically —
-- run it whenever, or wire it to a cron job:
--   delete from public.sorlio_ai_usage where usage_date < current_date - 90;
