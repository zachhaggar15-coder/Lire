import { getSupabaseServiceClient } from "@/lib/supabase/server";

/**
 * Privacy-safe operational signals.
 *
 * Sorlio has no product analytics. To still know when something is broken,
 * server code records named counters per day — "billing.verify_unavailable",
 * "ai.provider_error", "rss.refresh_failed" — with no user id, IP, content or
 * device information. The admin health view reads the totals.
 *
 * Also written to the Vercel function log as a single structured line, so a
 * failure is visible even if the database is the thing that is down.
 */

export type OpsMetric =
  | "billing.verify_unavailable"
  | "billing.ownership_conflict"
  | "billing.rtdn_processed"
  | "billing.rtdn_failed"
  | "billing.rtdn_rejected"
  | "billing.ack_failed"
  | "billing.reconcile_failed"
  | "ai.quota_unavailable"
  | "ai.quota_exhausted"
  | "ai.provider_error"
  | "ai.not_configured"
  | "rss.refresh_failed"
  | "rss.refresh_ok"
  | "cron.maintenance_ok"
  | "cron.maintenance_failed"
  | "account.deleted"
  | "account.delete_failed"
  | "feedback.stored";

const METRIC_RE = /^[a-z]+\.[a-z_]+$/;

export async function recordOpsEvent(metric: OpsMetric): Promise<void> {
  if (!METRIC_RE.test(metric)) return;
  try {
    console.info(JSON.stringify({ sorlio_ops: metric }));
  } catch {
    // Logging must never fail a request.
  }
  const client = getSupabaseServiceClient();
  if (!client) return;
  try {
    await client.rpc("sorlio_ops_increment", { p_metric: metric });
  } catch {
    // Best effort.
  }
}
