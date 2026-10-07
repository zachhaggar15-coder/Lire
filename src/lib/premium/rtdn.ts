import { createHash } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { googlePlayApi, PACKAGE_NAME } from "@/lib/premium/googlePlay";
import { reconcilePurchase, type Rpc } from "@/lib/premium/entitlement";
import { PREMIUM_PRODUCT_ID } from "@/lib/premium/server";

/**
 * Google Play Real-time Developer Notifications, delivered by a Pub/Sub push
 * subscription.
 *
 * Security: Pub/Sub signs each push with a Google-issued OIDC token. The
 * token's signature, audience and expiry are verified, and its email must be
 * the push subscription's service account (RTDN_PUSH_SERVICE_ACCOUNT) with
 * email_verified true. Anything else gets 401 and is not processed.
 *
 * Handling (per Google's RTDN guidance, checked 2026-10-06):
 *   - The notification only says "something changed"; the authoritative
 *     state is fetched with purchases.subscriptionsv2.get (reconcilePurchase).
 *   - Message ids are recorded; a redelivered message that was already
 *     processed is acknowledged without work. Order does not matter because
 *     every message triggers a fresh read of current state.
 *   - REVOKED and voided-purchase notifications mark the subscription revoked.
 *   - A token no account has claimed yet is acknowledged and ignored: the
 *     purchasing app verifies it itself moments later.
 *   - If Google or the database is unavailable the endpoint returns 503 so
 *     Pub/Sub retries.
 */

const verifier = new OAuth2Client();
const REVOKED = 12;

export interface DeveloperNotification {
  packageName?: string;
  subscriptionNotification?: { notificationType?: number; purchaseToken?: string };
  voidedPurchaseNotification?: { purchaseToken?: string; productType?: number };
  testNotification?: unknown;
}

export async function verifyPushToken(
  authorization: string | null,
  config: { audience?: string; serviceAccount?: string },
  verify: (token: string, audience: string) => Promise<Record<string, unknown> | undefined> = async (token, audience) =>
    (await verifier.verifyIdToken({ idToken: token, audience })).getPayload() as Record<string, unknown> | undefined,
): Promise<boolean> {
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token || !config.audience || !config.serviceAccount) return false;
  try {
    const payload = await verify(token, config.audience);
    if (!payload) return false;
    const issuerOk = payload.iss === "https://accounts.google.com" || payload.iss === "accounts.google.com";
    return issuerOk && payload.email === config.serviceAccount && payload.email_verified === true;
  } catch {
    return false;
  }
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function processNotification(params: {
  db: Rpc;
  messageId: string;
  notification: DeveloperNotification;
  play: typeof googlePlayApi;
}): Promise<{ status: number; outcome: string }> {
  const { db, messageId, notification, play } = params;
  if (notification.packageName !== PACKAGE_NAME) return { status: 200, outcome: "ignored:package" };
  if (notification.testNotification) return { status: 200, outcome: "test" };

  const sub = notification.subscriptionNotification;
  const voided = notification.voidedPurchaseNotification;
  const token = sub?.purchaseToken ?? voided?.purchaseToken;
  if (!token || typeof token !== "string" || token.length > 2048) return { status: 200, outcome: "ignored:no-token" };
  const type = typeof sub?.notificationType === "number" ? sub.notificationType : voided ? -1 : 0;

  const claim = await db.rpc("sorlio_billing_claim_event", { p_message_id: messageId, p_type: type, p_token_sha256: sha256(token) });
  if (claim.error) return { status: 503, outcome: "storage-unavailable" };
  if (claim.data === false) return { status: 200, outcome: "duplicate" };

  const owner = await db.rpc("sorlio_billing_owner", { p_token: token });
  if (owner.error) return { status: 503, outcome: "storage-unavailable" };
  if (!owner.data) {
    await db.rpc("sorlio_billing_finish_event", { p_message_id: messageId, p_outcome: "unclaimed-token" });
    return { status: 200, outcome: "unclaimed-token" };
  }

  const outcome = await reconcilePurchase({
    db,
    play,
    userId: owner.data as string,
    purchaseToken: token,
    productId: PREMIUM_PRODUCT_ID,
    revoked: type === REVOKED || !!voided,
  });
  if (outcome.kind === "unavailable") return { status: 503, outcome: "google-unavailable" };
  await db.rpc("sorlio_billing_finish_event", { p_message_id: messageId, p_outcome: outcome.kind });
  return { status: 200, outcome: outcome.kind };
}

