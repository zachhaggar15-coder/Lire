/**
 * The database schema version this build needs: the number of the newest
 * file in supabase/migrations/. Each migration that changes what the app
 * relies on redefines public.sorlio_schema_version() to return its number.
 * scripts/verify-supabase.mjs and /api/health compare against this, so a
 * deploy whose migrations were never applied is caught before readers are.
 */
export const EXPECTED_SCHEMA_VERSION = 12;
