-- 0012: keep only the Google sign-in fields Sorlio needs.
--
-- On every Google sign-in, Supabase Auth copies the Google profile (name,
-- given/family name, profile picture URL, locale and so on) into
-- auth.users.raw_user_meta_data and auth.identities.identity_data. Sorlio
-- never reads any of it: the app shows the account email and nothing else.
-- Holding a teenager's name and photo URL for no purpose is exactly what
-- data minimisation forbids, so these triggers strip everything outside a
-- small allowlist on insert and on every update (each sign-in is an update).
--
-- Kept: email and its verification flag (shown in Settings, and used by
-- Supabase to link identities), and the provider's subject/issuer ids, which
-- Supabase Auth needs to recognise a returning Google account.
--
-- Existing rows are cleaned on each user's next sign-in. Cleaning rows of
-- users who never sign in again is a one-off UPDATE that changes production
-- data, so it is NOT run here; see docs/release/auth-metadata-backfill.md.
--
-- Additive and reversible: dropping the two triggers restores Supabase's
-- default behaviour (the stripped fields would be re-copied on next sign-in).

-- The trigger functions run when Supabase Auth's own role writes these
-- tables. They are security definer (owner: the migration role) so that no
-- privilege on public.* has to be granted to that role, and they call
-- nothing that could be revoked out from under a sign-in.
create or replace function public.sorlio_strip_user_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.raw_user_meta_data := coalesce(
    (select jsonb_object_agg(key, value)
       from jsonb_each(coalesce(new.raw_user_meta_data, '{}'::jsonb))
      where key in ('email', 'email_verified', 'phone_verified', 'sub', 'iss', 'provider_id')),
    '{}'::jsonb
  );
  return new;
end;
$$;

create or replace function public.sorlio_strip_identity_data()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.identity_data := coalesce(
    (select jsonb_object_agg(key, value)
       from jsonb_each(coalesce(new.identity_data, '{}'::jsonb))
      where key in ('email', 'email_verified', 'phone_verified', 'sub', 'iss', 'provider_id')),
    '{}'::jsonb
  );
  return new;
end;
$$;

revoke all on function public.sorlio_strip_user_metadata() from public, anon, authenticated;
revoke all on function public.sorlio_strip_identity_data() from public, anon, authenticated;

drop trigger if exists sorlio_strip_user_metadata on auth.users;
create trigger sorlio_strip_user_metadata
  before insert or update of raw_user_meta_data on auth.users
  for each row execute function public.sorlio_strip_user_metadata();

do $$
begin
  if to_regclass('auth.identities') is not null then
    execute 'drop trigger if exists sorlio_strip_identity_data on auth.identities';
    execute 'create trigger sorlio_strip_identity_data
      before insert or update of identity_data on auth.identities
      for each row execute function public.sorlio_strip_identity_data()';
  end if;
end $$;

create or replace function public.sorlio_schema_version()
returns integer
language sql
immutable
as $$ select 12 $$;

grant execute on function public.sorlio_schema_version() to anon, authenticated;
