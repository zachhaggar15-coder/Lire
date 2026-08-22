import { GoogleAuth } from "google-auth-library";
import type { PremiumStatus, SubscriptionStatus } from "@/lib/premium/types";

const PACKAGE_NAME = "app.liree.reader";
const PUBLISHER_SCOPE = "https://www.googleapis.com/auth/androidpublisher";

interface SubscriptionV2 {
  subscriptionState?: string;
  acknowledgementState?: string;
  lineItems?: Array<{ expiryTime?: string; productId?: string }>;
}

function credentials(): Record<string, unknown> | null {
  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function accessToken(): Promise<string> {
  const configured = credentials();
  if (!configured) throw new Error("Google Play service account is not configured");
  const auth = new GoogleAuth({ credentials: configured, scopes: [PUBLISHER_SCOPE] });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token.token) throw new Error("Google Play access token was unavailable");
  return token.token;
}

function mapState(state: string | undefined, expiresAt: string | null): SubscriptionStatus {
  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) return "expired";
  if (state === "SUBSCRIPTION_STATE_ACTIVE") return "active";
  if (state === "SUBSCRIPTION_STATE_IN_GRACE_PERIOD") return "grace_period";
  if (state === "SUBSCRIPTION_STATE_CANCELED") return "cancelled";
  return "expired";
}

export interface VerifiedPlaySubscription extends PremiumStatus {
  productId: string;
  purchaseToken: string;
}

export async function verifyPlaySubscription(
  purchaseToken: string,
  expectedProductId: string
): Promise<VerifiedPlaySubscription> {
  const token = await accessToken();
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) throw new Error(`Google Play verification failed (${response.status})`);
  const purchase = (await response.json()) as SubscriptionV2;
  const matchingLine = purchase.lineItems?.find((item) => item.productId === expectedProductId);
  if (!matchingLine) throw new Error("Purchase does not match the Lire Premium product");

  const expiryTimes = (purchase.lineItems ?? [])
    .map((item) => item.expiryTime)
    .filter((value): value is string => Boolean(value));
  const expiresAt = expiryTimes.sort().at(-1) ?? null;
  const status = mapState(purchase.subscriptionState, expiresAt);
  const isPremium = ["active", "grace_period", "cancelled"].includes(status) && Boolean(expiresAt);

  if (purchase.acknowledgementState === "ACKNOWLEDGEMENT_STATE_PENDING") {
    const acknowledgeUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/subscriptions/${encodeURIComponent(expectedProductId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`;
    const acknowledge = await fetch(acknowledgeUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: "{}",
    });
    if (!acknowledge.ok) throw new Error(`Google Play acknowledgement failed (${acknowledge.status})`);
  }

  return { isPremium, status, expiresAt, productId: expectedProductId, purchaseToken };
}
