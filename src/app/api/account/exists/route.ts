import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";

/**
 * Lets a device learn which of the accounts it holds local data for have been
 * deleted elsewhere, so it can erase that data (see accountCleanup.ts). This
 * is what makes "deleting your account removes its data from your other
 * devices" true.
 *
 * Takes at most five account ids and answers only "missing" for each; it
 * returns nothing about existing accounts. Ids are random UUIDs that only the
 * device that held the account knows.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NO_STORE = { "Cache-Control": "private, no-store, max-age=0" };

export async function POST(request: Request) {
  if (!(await rateLimit(`account-exists:${clientIp(request)}`, 10, 60_000))) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: NO_STORE });
  }
  const body = (await request.json().catch(() => null)) as { ids?: unknown } | null;
  const ids = Array.isArray(body?.ids) ? body.ids : null;
  if (!ids || ids.length === 0 || ids.length > 5 || !ids.every((id) => typeof id === "string" && UUID_RE.test(id))) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }
  const client = getSupabaseServiceClient();
  if (!client) return NextResponse.json({ error: "Unavailable." }, { status: 503, headers: NO_STORE });

  const missing: string[] = [];
  for (const id of ids as string[]) {
    const { data, error } = await client.auth.admin.getUserById(id);
    if (data?.user) continue;
    // Only a definite "not found" counts; any other failure is not evidence of deletion.
    const status = (error as { status?: number } | null)?.status;
    if (status === 404 || (error && /not.?found/i.test(error.message))) missing.push(id.toLowerCase());
    else if (error) return NextResponse.json({ error: "Unavailable." }, { status: 503, headers: NO_STORE });
  }
  return NextResponse.json({ missing }, { headers: NO_STORE });
}
