-- 0003 · Google Play subscription entitlements
--
-- Server-managed and server-only. RLS is enabled and NO policy is created,
-- which is the point: with RLS on and no policy, the anon and authenticated
-- roles can neither read nor write this table at all. Only the service-role
-- backend touches it, after verifying the purchase against Google's
-- subscriptionsv2 API — see src/lib/premium/googlePlay.ts.
--
-- The absence of a policy here is load-bearing. Adding a permissive one would
-- let a browser read purchase tokens, which are bearer credentials for the
-- purchase they represent.
--
-- purchase_token is unique so the same Play purchase cannot be attached to two
-- different accounts.

create table if not exists public.sorlio_subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  provider text not null check (provider = 'google_play'),
  product_id text not null,
  purchase_token text not null unique,
  status text not null,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.sorlio_subscriptions enable row level security;
