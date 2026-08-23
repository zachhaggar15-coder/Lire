# Supabase migrations

Numbered, ordered, idempotent. Run them in filename order against a fresh
Supabase project and you have the complete Sorlio database.

## Running them

**Dashboard (simplest):** SQL Editor → New query → paste one file → Run.
Repeat in order, `0001` through `0007`.

**CLI, if you prefer:**

```bash
supabase db push
```

Every file is safe to re-run — `create table if not exists`, `create index if
not exists`, and `drop policy if exists` before each `create policy`. Re-running
never touches existing rows.

## What each one does

| File | Creates |
| --- | --- |
| `0001_extensions.sql` | `pgcrypto`, for UUID and token generation |
| `0002_user_data.sql` | `sorlio_user_data` — synced learning data, per-user RLS |
| `0003_subscriptions.sql` | `sorlio_subscriptions` — Play entitlements, service-role only |
| `0004_analytics_events.sql` | `sorlio_analytics_events` — consent-gated analytics |
| `0005_feedback_and_research.sql` | `sorlio_feedback`, `sorlio_research_prompt_responses` |
| `0006_android_beta_interest.sql` | `sorlio_android_beta_interest` — beta mailing list |
| `0007_account_deletion_contract.sql` | Table comments recording the deletion rules |

Seven files, six tables. That is the whole database — if a table is not listed
here, the app does not query it.

## Two naming decisions worth knowing

**Tables are `sorlio_*`.** They were `lire_*` until this rebuild. Renaming was
only safe because this is a brand-new project with no rows to migrate; against
a live database it would have been a data migration for a cosmetic gain.

**The `store_key` values inside `sorlio_user_data` are still `lire.*`.** Those
are the localStorage keys on readers' devices — `lire.savedWords.v1` and the
rest. They are not the database's to rename: changing them would orphan every
saved word and every streak already sitting on a phone. The table is Sorlio's;
the keys inside it are the app's own history.

## Adding a table later

Add `0008_*.sql`; never edit a migration that has been run. If the new table
has a `user_id`, decide its deletion behaviour deliberately — see
`0007_account_deletion_contract.sql`. Getting this wrong leaves identifiable
rows behind after a deletion the reader was told was complete.

## What is not here

The previous `gamification.sql` defined fourteen tables — `user_progress`,
`user_xp_events`, `daily_missions`, `article_completions` and the rest — left
over from the CEFR-based gamification system that was removed. No code path
queries any of them, so they are not recreated. Creating them would mean
declaring reader data models the app does not have on Play's Data Safety form.

They remain in git history if ever needed.
