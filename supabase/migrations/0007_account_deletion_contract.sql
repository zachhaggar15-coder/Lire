-- 0007 · Account deletion contract
--
-- Google Play requires that advertised account deletion actually deletes. The
-- rules are split across two mechanisms — foreign-key cascade for some tables,
-- explicit DELETEs in the API route for others — so this migration records the
-- contract in the database itself, where it cannot drift out of sight.
--
-- These COMMENT statements are real schema objects: they persist in Postgres
-- and are visible in the Supabase table editor, so the next person to add a
-- user-linked table sees the rule before they get it wrong.
--
-- ---------------------------------------------------------------------------
-- Cascades automatically when the auth user is deleted:
--   sorlio_user_data       — every synced store
--   sorlio_subscriptions   — the entitlement row and its purchase token
--   sorlio_ai_usage        — the daily AI counter (added in 0008)
--
-- Does NOT cascade. These use `on delete set null`, which orphans the row
-- rather than removing it, so /api/account/delete deletes them by user_id
-- BEFORE calling auth.admin.deleteUser:
--   sorlio_feedback
--   sorlio_research_prompt_responses
--   sorlio_analytics_events
--
-- Deliberately NOT deleted:
--   sorlio_android_beta_interest — keyed by email, not account, and holds the
--   unsubscribe token that stops further email to that address. Deleting the
--   row would destroy the reader's own unsubscribe state.
--
-- Adding another user-linked table means choosing one of the first two
-- behaviours on purpose. Doing neither leaves identifiable rows behind after a
-- deletion the reader was told was complete.
-- ---------------------------------------------------------------------------

comment on table public.sorlio_user_data is
  'Synced learning data, one JSONB row per (user, store_key). Cascades on auth user delete.';

comment on table public.sorlio_subscriptions is
  'Google Play entitlements. Service-role only: RLS on with no policy. Cascades on auth user delete.';

comment on table public.sorlio_analytics_events is
  'Consent-gated product analytics. Does NOT cascade (on delete set null) - /api/account/delete removes rows by user_id explicitly.';

comment on table public.sorlio_feedback is
  'Reader-submitted feedback. Does NOT cascade (on delete set null) - /api/account/delete removes rows by user_id explicitly.';

comment on table public.sorlio_research_prompt_responses is
  'In-app research prompt answers. Does NOT cascade (on delete set null) - /api/account/delete removes rows by user_id explicitly.';

comment on table public.sorlio_android_beta_interest is
  'Beta mailing list, keyed by email. Intentionally NOT deleted on account deletion: it holds the unsubscribe token that stops further email.';
