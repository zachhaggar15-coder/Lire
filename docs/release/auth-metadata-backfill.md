# Auth metadata backfill (needs approval)

Migration `0012_auth_metadata_minimisation.sql` stops Supabase Auth from
keeping the Google profile (name, given/family name, profile photo URL,
locale) on every sign-in from the moment it is applied. Each existing user's
row is cleaned the next time they sign in.

Users who never sign in again keep the profile fields Supabase copied before
0012. Removing them is a one-off change to production rows, so it is not part
of the migration. It deletes no account and no learning data: only Google
profile fields that Sorlio never reads.

## 1. Count first (read-only)

Run in the Supabase SQL editor:

```sql
select count(*) as users_with_profile_fields
from auth.users
where raw_user_meta_data ?| array['name','full_name','given_name','family_name','avatar_url','picture','locale','nickname','preferred_username'];

select count(*) as identities_with_profile_fields
from auth.identities
where identity_data ?| array['name','full_name','given_name','family_name','avatar_url','picture','locale','nickname','preferred_username'];
```

Record both numbers in the release log.

## 2. Backfill (only after explicit approval)

0012 must already be applied: the `update` fires its triggers, which do the
stripping, so the allowlist lives in exactly one place.

```sql
begin;
update auth.users
   set raw_user_meta_data = raw_user_meta_data
 where raw_user_meta_data ?| array['name','full_name','given_name','family_name','avatar_url','picture','locale','nickname','preferred_username'];
update auth.identities
   set identity_data = identity_data
 where identity_data ?| array['name','full_name','given_name','family_name','avatar_url','picture','locale','nickname','preferred_username'];
-- Re-run the two counts from step 1: both must now be 0.
commit;
```

## Rollback

There is nothing to restore that Sorlio uses. If the triggers ever need to go,
`drop trigger sorlio_strip_user_metadata on auth.users; drop trigger
sorlio_strip_identity_data on auth.identities;` returns Supabase to its
default, and Google re-supplies the profile on each user's next sign-in.
