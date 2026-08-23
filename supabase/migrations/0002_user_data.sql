-- 0002 · Synced learning data
--
-- Sorlio is local-first. Every store already lives in localStorage and works
-- with no account at all; this table is a mirror bolted on top for readers who
-- sign in, not the primary home of anything.
--
-- One row per (user, store), holding that store's value as JSONB. store_key is
-- the very same string the store uses locally — see SYNCED_STORES in
-- src/lib/supabase/sync.ts, which currently lists 36 of them. Mirroring
-- localStorage rather than modelling a relational schema is deliberate: it
-- means storage.ts, knownWords.ts and the rest never have to know sync exists,
-- and a new store becomes one line in that array rather than a migration.
--
-- The lire.* store_key VALUES stay as they are. They are the localStorage keys
-- on readers' devices, and renaming them would orphan every saved word and
-- every streak already on a phone. The table name is Sorlio's; the keys inside
-- it are the app's own history.
--
-- updated_at is set by the client on write and is what the merge in sync.ts
-- compares, so a stale device cannot clobber newer data.

create table if not exists public.sorlio_user_data (
  user_id uuid not null references auth.users (id) on delete cascade,
  store_key text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, store_key)
);

alter table public.sorlio_user_data enable row level security;

-- The only rule the anon key needs. auth.uid() is read from the JWT Supabase
-- verifies server-side, never from anything the browser asserts, so a signed-in
-- reader reaches their own rows and nothing else.
drop policy if exists "Users manage their own data" on public.sorlio_user_data;
create policy "Users manage their own data" on public.sorlio_user_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
