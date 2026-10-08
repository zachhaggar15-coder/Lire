import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { EXPECTED_SCHEMA_VERSION } from "@/lib/server/schema";

/**
 * Release health check: is the database at the schema this build needs?
 * Returns no data beyond two integers, and 503 when the answer is no, so an
 * uptime monitor or the post-deploy smoke test fails loudly instead of the
 * first reader to open a sync or AI feature.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const client = getSupabaseServiceClient();
  if (!client) {
    return NextResponse.json({ ok: false, reason: "database-not-configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  const { data, error } = await client.rpc("sorlio_schema_version");
  const schema = !error && typeof data === "number" ? data : null;
  const ok = schema === EXPECTED_SCHEMA_VERSION;
  return NextResponse.json(
    { ok, schema, expected: EXPECTED_SCHEMA_VERSION, ...(ok ? {} : { reason: schema === null ? "schema-unreadable" : "schema-mismatch" }) },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
