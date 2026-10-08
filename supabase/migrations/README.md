# Supabase migrations

Numbered, ordered, idempotent. Run them in filename order against a fresh
Supabase project and you have the complete Sorlio database.

## Running them

**Production (`blumuxrepzzdwwzomffx`) is at `0012`, and its migration history
records exactly `0001`–`0012`** (reconciled 7 Oct 2026 with
`supabase migration repair`). Keep it that way:

1. Add the next file as `0013_<name>.sql` (four-digit prefix, the CLI accepts it).
2. Test it locally: `npm test` runs every migration against PGlite, including
   `test-legacy-build-compat.mjs` (the deployed build must keep working).
3. Read-only check: `npx supabase@2.120.0 migration list --linked`.
4. Apply it deliberately (reviewed SQL editor run or the Supabase MCP
   `apply_migration`), then `migration repair --status applied 0013` if it was
   not recorded, and confirm `migration list` shows local = remote.
5. Bump `EXPECTED_SCHEMA_VERSION` (src/lib/server/schema.ts) and
   `sorlio_schema_version()`; verify with `npm run verify:supabase`.

Do not use `supabase db push` against production: it applies everything it
thinks is missing, without the review above.

Re-running a file is safe — tables, indexes and functions use `if not exists`
/ `create or replace` — and never deletes or rewrites user data. Two files do
write rows: `0009` backfills `verified_at` on existing subscriptions, and
`0010` upserts the sync store registry (`sorlio_sync_stores`).

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
| `0008_ai_usage.sql` | `sorlio_ai_usage` + `sorlio_consume_ai_call()` — daily AI budget |
| `0009_billing_lifecycle.sql` | Play subscription lifecycle columns, `sorlio_billing_events` (RTDN idempotency), server-only billing functions, `sorlio_has_premium()` |
| `0010_item_sync.sql` | Item-level sync: `sorlio_sync_stores`, `sorlio_sync_state`, `sorlio_sync_items`, `sorlio_save_quota` and the `sorlio_sync_*` functions |
| `0011_ops_and_retention.sql` | `sorlio_ops_counters` (identifier-free daily counts), `sorlio_maintenance()` retention, `sorlio_schema_version()` |
| `0012_auth_metadata_minimisation.sql` | Triggers that strip the Google profile (name, photo) Supabase Auth copies on sign-in |

`0004` and `0006` (analytics, beta list) and the research-prompt table from
`0005` are retired: the app no longer writes them. They are dropped only after
the purge in `docs/release/analytics-purge-plan.md` is approved. If a table is
not listed here, the app does not query it.

## Release gate

Each migration that changes what the app relies on redefines
`sorlio_schema_version()` to return its own number, and the build expects
`EXPECTED_SCHEMA_VERSION` in `src/lib/server/schema.ts`. `npm test` fails if
those disagree with the newest file here; `npm run verify:supabase` and
`GET /api/health` (503 on mismatch) fail if the live database is behind.

## Checking it worked

```bash
npm run verify:supabase
```

Reads `.env.local` (or a path you pass after `--`, or the ambient environment)
and checks the live database against what these files declare: all six tables
present, the superseded `lire_*` and gamification tables absent, both keys
issued by the project the URL points at, and row-level security actually
refusing the anon key.

It reads no row contents — every check uses an exact-count header, so it
reports how many rows a key can see without retrieving any of them. The single
write is a deliberate probe: it tries an anon `INSERT`, which a correct policy
rejects, and cleans up if the policy turns out to be wrong.

Checks against an empty table are reported as **inconclusive** rather than
passing, because "the anon key saw no rows" proves nothing when there are no
rows to see. Re-run once real data exists to turn those into real assertions.

Worth running after applying migrations, after rotating keys, and after
pointing the app at a different project.

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

Add the next number; never edit a migration that has been run. If the new table
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
