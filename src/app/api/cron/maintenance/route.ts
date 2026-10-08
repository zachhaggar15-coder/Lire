import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { googlePlayApi } from "@/lib/premium/googlePlay";
import { reconcilePurchase } from "@/lib/premium/entitlement";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { recordOpsEvent } from "@/lib/server/ops";

/**
 * Daily maintenance (vercel.json cron):
 *   1. re-verify subscriptions that are stale or not yet acknowledged — this
 *      is the safety net if a Real-time Developer Notification was missed,
 *      and it retries acknowledgements well inside Google's 3-day window;
 *   2. delete data past its retention period (sorlio_maintenance).
 */

export const maxDuration = 300;

function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function GET(request: Request) {
  if (!authorised(request)) return new Response("Unauthorized", { status: 401 });
  const client = getSupabaseServiceClient();
  if (!client) return NextResponse.json({ ok: false, error: "not-configured" }, { status: 503 });

  const billing = { checked: 0, ok: 0, unavailable: 0, other: 0 };
  const { data: due, error: dueError } = await client.rpc("sorlio_billing_due", { p_limit: 100 });
  if (!dueError && Array.isArray(due)) {
    for (const row of due as Array<{ user_id: string; product_id: string; purchase_token: string }>) {
      billing.checked += 1;
      try {
        const outcome = await reconcilePurchase({
          db: client,
          play: googlePlayApi,
          userId: row.user_id,
          purchaseToken: row.purchase_token,
          productId: row.product_id,
        });
        if (outcome.kind === "ok") billing.ok += 1;
        else if (outcome.kind === "unavailable") billing.unavailable += 1;
        else billing.other += 1;
      } catch {
        billing.unavailable += 1;
      }
    }
  }
  if (billing.unavailable > 0) void recordOpsEvent("billing.reconcile_failed");

  const { data: retention, error: retentionError } = await client.rpc("sorlio_maintenance");
  const ok = !dueError && !retentionError;
  void recordOpsEvent(ok ? "cron.maintenance_ok" : "cron.maintenance_failed");
  return NextResponse.json({ ok, billing, retention: retention ?? null }, { status: ok ? 200 : 502 });
}
