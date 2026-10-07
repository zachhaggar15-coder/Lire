import { NextResponse } from "next/server";
import { googlePlayApi } from "@/lib/premium/googlePlay";
import { currentEntitlement, NO_ENTITLEMENT, STATUS_FRESH_MS } from "@/lib/premium/entitlement";
import { authenticatedUser } from "@/lib/premium/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/server/rateLimit";

/**
 * The signed-in account's entitlement, as the server sees it.
 *
 * A stored answer younger than STATUS_FRESH_MS is served as-is; older ones are
 * re-verified with Google. If Google is unreachable, a recent verification
 * still counts (bounded — see entitlement.ts) and `stale: true` says so.
 *
 * Never cached by browsers, the service worker or CDNs: the body is specific
 * to one account.
 */

const NO_STORE = { "Cache-Control": "private, no-store, max-age=0", Vary: "Authorization" };

export async function GET(request: Request) {
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({ ...NO_ENTITLEMENT, code: "needs-account" }, { status: 401, headers: NO_STORE });
  const client = getSupabaseServiceClient();
  if (!client) return NextResponse.json({ code: "unavailable" }, { status: 503, headers: NO_STORE });
  if (!(await rateLimit(`premium-status:${user.id}`, 30, 60_000))) {
    return NextResponse.json({ code: "rate-limited" }, { status: 429, headers: NO_STORE });
  }
  try {
    const view = await currentEntitlement({ db: client, play: googlePlayApi, userId: user.id, freshMs: STATUS_FRESH_MS });
    return NextResponse.json(view, { headers: NO_STORE });
  } catch {
    // Storage failure: say so. The client must not read this as "free" or "Premium".
    return NextResponse.json({ code: "unavailable" }, { status: 503, headers: NO_STORE });
  }
}
