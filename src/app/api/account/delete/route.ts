import { NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/premium/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { recordOpsEvent } from "@/lib/server/ops";
import { rateLimit } from "@/lib/server/rateLimit";

/**
 * Deletes the signed-in account.
 *
 * The request body is ignored entirely: the account to delete is whichever one
 * the bearer token authenticates as. Accepting a user id from the client would
 * turn this into a way to delete other people's accounts, and no amount of
 * checking afterwards is as safe as never reading it.
 *
 * The service-role key lives only here, server-side. `admin.deleteUser` is not
 * available to the anon key by design.
 */

/**
 * Tables holding user-linked rows that a cascade will not reach.
 *
 * `sorlio_user_data` and `sorlio_subscriptions` both declare
 * `references auth.users(id) on delete cascade`, so removing the auth user
 * clears them. These three do not: they reference auth.users with
 * `on delete set null`, which nulls the column and keeps the row. Deleting the
 * auth user would leave rows behind that still identify the person — feedback
 * and research responses contain free text they wrote.
 *
 * Deleted explicitly, before the auth user, so a failure here surfaces as a
 * failed deletion rather than leaving data behind under a deleted account.
 */
const NON_CASCADING_USER_TABLES = [
  "sorlio_feedback",
  // Retired features (no longer collected), still deleted for older rows:
  "sorlio_research_prompt_responses",
  "sorlio_analytics_events",
  "sorlio_android_beta_interest",
];

// Cascade with the auth user: sorlio_user_data (legacy sync), sorlio_sync_items,
// sorlio_sync_state, sorlio_save_quota, sorlio_subscriptions, sorlio_ai_usage.
// Asserted against the real schema in scripts/test-account-deletion.mjs.

export async function POST(request: Request) {
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Sign in before deleting your account." }, { status: 401 });

  const client = getSupabaseServiceClient();
  if (!client) return NextResponse.json({ error: "Account deletion isn't available right now. Please try again later." }, { status: 503 });
  if (!(await rateLimit(`account-delete:${user.id}`, 5, 60_000))) {
    return NextResponse.json({ error: "Please wait a minute and try again." }, { status: 429 });
  }

  for (const table of NON_CASCADING_USER_TABLES) {
    const { error } = await client.from(table).delete().eq("user_id", user.id);
    // A missing table is not a failure: these are optional telemetry tables
    // that need not exist in every environment. Anything else is, because it
    // means identifiable rows would survive the account.
    if (error && !isMissingTable(error)) {
      return NextResponse.json({ error: "Your account could not be deleted. Please try again." }, { status: 500 });
    }
  }

  // Last, because it is the irreversible step. `sorlio_user_data` and
  // `sorlio_subscriptions` cascade away with it.
  const { error } = await client.auth.admin.deleteUser(user.id);
  if (error) {
    void recordOpsEvent("account.delete_failed");
    return NextResponse.json({ error: "Your account could not be deleted. Please try again." }, { status: 500 });
  }

  void recordOpsEvent("account.deleted");
  return NextResponse.json({ ok: true });
}

function isMissingTable(error: { code?: string; message?: string }): boolean {
  // Postgres "undefined_table", plus PostgREST's schema-cache miss for a
  // relation it cannot find.
  return error.code === "42P01" || error.code === "PGRST205" || /does not exist/i.test(error.message ?? "");
}
