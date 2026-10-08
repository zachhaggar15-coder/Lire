import { ENTITLED_STATUSES, PlayRejectedError, PlayUnavailableError, mapSubscription, type PlayApi, type PlayStatus } from "@/lib/premium/googlePlay";

/**
 * Server-side entitlement authority.
 *
 * Every Premium decision on the server goes through here. The rules:
 *   - Only Google Play's verified subscription state can grant Premium.
 *   - A stored row is trusted only while it is fresh; stale rows are
 *     re-verified with Google before granting anything that costs money.
 *   - If Google cannot be reached, a row verified recently (within
 *     OFFLINE_GRACE_MS) still counts — bounded, so a refund or revocation
 *     that went unnoticed cannot grant Premium indefinitely.
 *   - Unknown states, invalid dates and missing data fail closed.
 *
 * Storage goes through SQL functions (migration 0009), which enforce that a
 * Play subscription belongs to one Sorlio account.
 */

/** /api/premium/status serves a stored answer this fresh without asking Google. */
export const STATUS_FRESH_MS = 10 * 60 * 1000;
/** AI routes re-verify anything older than this. */
export const AI_FRESH_MS = 24 * 60 * 60 * 1000;
/** If Google is down, a verification this recent still counts. */
export const OFFLINE_GRACE_MS = 72 * 60 * 60 * 1000;

export interface Rpc {
  rpc(name: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: { message?: string; code?: string } | null }>;
}

export interface StoredSubscription {
  user_id: string;
  product_id: string;
  purchase_token: string;
  status: string;
  expires_at: string | null;
  verified_at: string | null;
  revoked_at: string | null;
  acknowledged: boolean | null;
  auto_renewing: boolean | null;
}

export type EntitlementStatus = PlayStatus | "none";

export interface EntitlementView {
  isPremium: boolean;
  status: EntitlementStatus;
  expiresAt: string | null;
  autoRenewing: boolean | null;
  /** When Google last confirmed this. */
  verifiedAt: string | null;
  /** True when Google could not be reached and the answer comes from a recent stored check. */
  stale: boolean;
}

export const NO_ENTITLEMENT: EntitlementView = {
  isPremium: false,
  status: "none",
  expiresAt: null,
  autoRenewing: null,
  verifiedAt: null,
  stale: false,
};

function time(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Pure: does this stored row grant Premium at `now`, given a maximum age? */
export function storedGrants(row: StoredSubscription | null, maxAgeMs: number, now = Date.now()): boolean {
  if (!row) return false;
  if (row.revoked_at) return false;
  if (!ENTITLED_STATUSES.has(row.status as PlayStatus)) return false;
  const expires = time(row.expires_at);
  const verified = time(row.verified_at);
  if (expires === null || expires <= now) return false;
  if (verified === null || now - verified > maxAgeMs) return false;
  return true;
}

export function viewFromRow(row: StoredSubscription | null, stale: boolean, maxAgeMs: number, now = Date.now()): EntitlementView {
  if (!row) return NO_ENTITLEMENT;
  const grants = storedGrants(row, maxAgeMs, now);
  const known = ["pending", "active", "grace_period", "cancelled", "on_hold", "paused", "expired", "revoked", "unknown"];
  let status = (known.includes(row.status) ? row.status : "unknown") as EntitlementStatus;
  if (row.revoked_at) status = "revoked";
  else if (ENTITLED_STATUSES.has(status as PlayStatus) && !grants && (time(row.expires_at) ?? 0) <= now) status = "expired";
  return {
    isPremium: grants,
    status,
    expiresAt: row.expires_at,
    autoRenewing: row.auto_renewing,
    verifiedAt: row.verified_at,
    stale,
  };
}

export async function loadSubscription(db: Rpc, userId: string): Promise<StoredSubscription | null> {
  const { data, error } = await db.rpc("sorlio_billing_get", { p_user: userId });
  if (error) throw new Error("subscription_read_failed");
  return (data as StoredSubscription | null) ?? null;
}

export type ReconcileOutcome =
  | { kind: "ok"; view: EntitlementView }
  | { kind: "conflict" }
  | { kind: "rejected" }
  | { kind: "wrong-product" }
  | { kind: "unavailable" };

/**
 * Verifies a purchase token with Google and records the result for the user.
 * Acknowledges new purchases (Google refunds unacknowledged purchases after
 * three days); a failed acknowledgement is retried by the maintenance cron.
 */
export async function reconcilePurchase(params: {
  db: Rpc;
  play: PlayApi;
  userId: string;
  purchaseToken: string;
  productId: string;
  revoked?: boolean;
  now?: number;
}): Promise<ReconcileOutcome> {
  const { db, play, userId, purchaseToken, productId } = params;
  let resource;
  try {
    resource = await play.getSubscription(purchaseToken);
  } catch (error) {
    if (error instanceof PlayRejectedError) return { kind: "rejected" };
    return { kind: "unavailable" };
  }
  const mapped = mapSubscription(resource, productId, params.now);
  if (!mapped.productMatches) return { kind: "wrong-product" };

  // Before acknowledging, make sure this subscription is not someone else's.
  const owner = await db.rpc("sorlio_billing_owner", { p_token: purchaseToken });
  if (owner.error) return { kind: "unavailable" };
  if (owner.data && owner.data !== userId) return { kind: "conflict" };
  if (mapped.linkedPurchaseToken) {
    const linkedOwner = await db.rpc("sorlio_billing_owner", { p_token: mapped.linkedPurchaseToken });
    if (linkedOwner.error) return { kind: "unavailable" };
    if (linkedOwner.data && linkedOwner.data !== userId) return { kind: "conflict" };
  }

  let acknowledged = mapped.acknowledged;
  if (!acknowledged && mapped.entitled && mapped.status !== "pending") {
    try {
      await play.acknowledge(productId, purchaseToken);
      acknowledged = true;
    } catch (error) {
      if (!(error instanceof PlayUnavailableError)) throw error;
      // Entitlement is still valid; the cron retries well inside 3 days.
    }
  }

  const status: PlayStatus = params.revoked ? "revoked" : mapped.status;
  const recorded = await db.rpc("sorlio_billing_record", {
    p_user: userId,
    p_product: productId,
    p_token: purchaseToken,
    p_linked_token: mapped.linkedPurchaseToken,
    p_status: status,
    p_expires: mapped.expiresAt,
    p_auto_renewing: mapped.autoRenewing,
    p_acknowledged: acknowledged,
    p_order_id: mapped.latestOrderId,
    p_revoked: !!params.revoked,
  });
  if (recorded.error) return { kind: "unavailable" };
  if ((recorded.data as { result?: string } | null)?.result === "conflict") return { kind: "conflict" };

  const row = await loadSubscription(db, userId);
  return { kind: "ok", view: viewFromRow(row, false, STATUS_FRESH_MS + AI_FRESH_MS, params.now) };
}

/**
 * The account's current entitlement. Uses the stored row if it was verified
 * within `freshMs`; otherwise asks Google. If Google is unreachable, falls
 * back to the stored row only within OFFLINE_GRACE_MS of its last verification.
 */
export async function currentEntitlement(params: {
  db: Rpc;
  play: PlayApi;
  userId: string;
  freshMs: number;
  now?: number;
}): Promise<EntitlementView> {
  const now = params.now ?? Date.now();
  const row = await loadSubscription(params.db, params.userId);
  if (!row) return NO_ENTITLEMENT;
  if (storedGrants(row, params.freshMs, now) || (!ENTITLED_STATUSES.has(row.status as PlayStatus) && (time(row.verified_at) ?? 0) > now - params.freshMs)) {
    return viewFromRow(row, false, params.freshMs, now);
  }
  const outcome = await reconcilePurchase({
    db: params.db,
    play: params.play,
    userId: params.userId,
    purchaseToken: row.purchase_token,
    productId: row.product_id,
    now,
  });
  if (outcome.kind === "ok") return outcome.view;
  if (outcome.kind === "unavailable") return viewFromRow(row, true, OFFLINE_GRACE_MS, now);
  // Google no longer recognises the token, or it now belongs elsewhere: no Premium.
  return { ...viewFromRow(row, false, 0, now), isPremium: false };
}
