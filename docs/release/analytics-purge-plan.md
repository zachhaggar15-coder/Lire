# Retired data collection: purge plan (needs approval)

This release removes product analytics, in-app research prompts and the
Android beta mailing list. The code that wrote these tables is gone, but the
tables and their rows are still in the production database. Deleting them is
irreversible, so it waits for explicit approval.

## Current state

Counts from `npm run verify:supabase` (exact-count headers, no rows read):

| Table | Rows | Written by | Status |
| --- | ---: | --- | --- |
| `sorlio_analytics_events` | 11,894 (7 Oct 2026) | the **currently deployed** build | still growing until this release is deployed |
| `sorlio_research_prompt_responses` | 0 | — | empty |
| `sorlio_android_beta_interest` | 0 | — | empty |

The analytics count rose from 11,874 to 11,894 during this work: the old build
in production still sends events. Deploying this release stops that.

`sorlio_feedback` is **not** retired: feedback continues, without identifiers
(see the privacy policy). Existing feedback rows are covered by the 12-month
retention in `sorlio_maintenance()`.

## Order of operations

1. Deploy this release (stops all new analytics writes).
2. Re-run `npm run verify:supabase`; record the final counts here.
3. Decide whether any aggregate is worth keeping (for example, total events
   per day). If so, export **aggregates only**, never rows with
   `anonymous_id`/`session_id`/`user_id`, before step 4.
4. With approval, run in the Supabase SQL editor:

```sql
begin;
-- Sanity check: these must match the counts recorded in step 2.
select (select count(*) from public.sorlio_analytics_events) as analytics,
       (select count(*) from public.sorlio_research_prompt_responses) as research,
       (select count(*) from public.sorlio_android_beta_interest) as beta;

drop table if exists public.sorlio_analytics_events;
drop table if exists public.sorlio_research_prompt_responses;
drop table if exists public.sorlio_android_beta_interest;
commit;
```

5. Re-run `npm run verify:supabase`: the "Retired tables" section should
   report each table as dropped.
6. Remove `0004_analytics_events.sql`, `0006_android_beta_interest.sql` and
   the research-prompt half of `0005` from a fresh-project setup by adding a
   migration that drops them (so a new environment never recreates them).
   `src/app/api/account/delete/route.ts` still deletes a leaving user's rows
   from these tables while they exist and already tolerates them being gone;
   drop them from its list in the same change.

## Backups

Supabase point-in-time backups retain the dropped rows for the plan's backup
window (7 days on Pro). State that window in the privacy policy's retention
section once the purge date is known.

## Rollback

None needed for the app: nothing reads these tables. Recovery of the data
itself is only possible from a Supabase backup within its retention window.
