import { GoogleAuth } from "google-auth-library";

/**
 * Google Play Developer API access for subscriptions.
 *
 * Only Google decides whether someone has paid. This module fetches the
 * subscription resource (purchases.subscriptionsv2.get), maps it to Sorlio's
 * entitlement states with a pure function, and acknowledges purchases. It has
 * no side effects on Sorlio's database — see entitlement.ts for that.
 *
 * State mapping follows "Manage the subscription lifecycle"
 * (developer.android.com/google/play/billing/lifecycle/subscriptions,
 * checked 2026-10-06):
 *   ACTIVE            → active        (entitled)
 *   IN_GRACE_PERIOD   → grace_period  (entitled; payment being retried)
 *   CANCELED          → cancelled     (entitled until expiryTime, then expired)
 *   PENDING           → pending       (not entitled; payment not complete)
 *   ON_HOLD           → on_hold       (not entitled)
 *   PAUSED            → paused        (not entitled)
 *   EXPIRED           → expired       (not entitled; revocations also land here)
 *   PENDING_PURCHASE_CANCELED → expired
 *   anything else     → unknown       (not entitled — fail closed)
 */

export const PACKAGE_NAME = "app.sorlio.reader";
const PUBLISHER_SCOPE = "https://www.googleapis.com/auth/androidpublisher";
const API = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications";

export type PlayStatus =
  | "pending"
  | "active"
  | "grace_period"
  | "cancelled"
  | "on_hold"
  | "paused"
  | "expired"
  | "revoked"
  | "unknown";

export const ENTITLED_STATUSES: ReadonlySet<PlayStatus> = new Set(["active", "grace_period", "cancelled"]);

export interface SubscriptionV2 {
  subscriptionState?: string;
  acknowledgementState?: string;
  linkedPurchaseToken?: string;
  latestOrderId?: string;
  lineItems?: Array<{
    productId?: string;
    expiryTime?: string;
    autoRenewingPlan?: { autoRenewEnabled?: boolean };
  }>;
}

export interface MappedSubscription {
  status: PlayStatus;
  entitled: boolean;
  expiresAt: string | null;
  autoRenewing: boolean | null;
  acknowledged: boolean;
  linkedPurchaseToken: string | null;
  latestOrderId: string | null;
  /** True when this purchase is for the expected Premium product. */
  productMatches: boolean;
}

export class PlayUnavailableError extends Error {
  readonly httpStatus: number | null;
  constructor(message: string, httpStatus: number | null = null) {
    super(message);
    this.name = "PlayUnavailableError";
    this.httpStatus = httpStatus;
  }
}

export class PlayRejectedError extends Error {
  readonly httpStatus: number;
  constructor(message: string, httpStatus: number) {
    super(message);
    this.name = "PlayRejectedError";
    this.httpStatus = httpStatus;
  }
}

function validDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

/** Pure mapping from Google's resource to Sorlio's entitlement view. */
export function mapSubscription(purchase: SubscriptionV2, expectedProductId: string, now = Date.now()): MappedSubscription {
  const lines = Array.isArray(purchase.lineItems) ? purchase.lineItems : [];
  const line = lines.find((item) => item?.productId === expectedProductId);
  const expiries = lines.map((item) => validDate(item?.expiryTime)).filter((v): v is string => !!v).sort();
  const expiresAt = line ? validDate(line.expiryTime) ?? expiries.at(-1) ?? null : null;
  const autoRenew = line?.autoRenewingPlan?.autoRenewEnabled;

  let status: PlayStatus;
  switch (purchase.subscriptionState) {
    case "SUBSCRIPTION_STATE_ACTIVE":
      status = "active";
      break;
    case "SUBSCRIPTION_STATE_IN_GRACE_PERIOD":
      status = "grace_period";
      break;
    case "SUBSCRIPTION_STATE_CANCELED":
      status = "cancelled";
      break;
    case "SUBSCRIPTION_STATE_PENDING":
      status = "pending";
      break;
    case "SUBSCRIPTION_STATE_ON_HOLD":
      status = "on_hold";
      break;
    case "SUBSCRIPTION_STATE_PAUSED":
      status = "paused";
      break;
    case "SUBSCRIPTION_STATE_EXPIRED":
    case "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED":
      status = "expired";
      break;
    default:
      status = "unknown";
  }

  // An entitled state whose expiry has passed (or is missing/invalid) is not
  // entitled. Cancelled subscriptions in particular end at expiryTime.
  const unexpired = !!expiresAt && Date.parse(expiresAt) > now;
  if (ENTITLED_STATUSES.has(status) && !unexpired) status = "expired";

  return {
    status,
    entitled: !!line && ENTITLED_STATUSES.has(status) && unexpired,
    expiresAt,
    autoRenewing: typeof autoRenew === "boolean" ? autoRenew : null,
    acknowledged: purchase.acknowledgementState === "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    linkedPurchaseToken: typeof purchase.linkedPurchaseToken === "string" && purchase.linkedPurchaseToken ? purchase.linkedPurchaseToken : null,
    latestOrderId: typeof purchase.latestOrderId === "string" ? purchase.latestOrderId : null,
    productMatches: !!line,
  };
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
  if (!configured) throw new PlayUnavailableError("Google Play service account is not configured");
  try {
    const auth = new GoogleAuth({ credentials: configured, scopes: [PUBLISHER_SCOPE] });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    if (!token.token) throw new Error("no token");
    return token.token;
  } catch {
    throw new PlayUnavailableError("Google Play access token was unavailable");
  }
}

export interface PlayApi {
  getSubscription(purchaseToken: string): Promise<SubscriptionV2>;
  acknowledge(productId: string, purchaseToken: string): Promise<void>;
}

/** The real Google Play Developer API. Tests inject a fake PlayApi instead. */
export const googlePlayApi: PlayApi = {
  async getSubscription(purchaseToken) {
    const token = await accessToken();
    let response: Response;
    try {
      response = await fetch(`${API}/${PACKAGE_NAME}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new PlayUnavailableError("Google Play could not be reached");
    }
    // 400/404/410: the token is not a valid Sorlio purchase. 5xx/429: Google
    // is having trouble — retry later rather than treating it as "not paid".
    if (response.status === 400 || response.status === 404 || response.status === 410) {
      throw new PlayRejectedError("Google Play does not recognise this purchase", response.status);
    }
    if (!response.ok) throw new PlayUnavailableError(`Google Play verification failed (${response.status})`, response.status);
    return (await response.json()) as SubscriptionV2;
  },
  async acknowledge(productId, purchaseToken) {
    const token = await accessToken();
    let response: Response;
    try {
      response = await fetch(
        `${API}/${PACKAGE_NAME}/purchases/subscriptions/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: "{}",
          signal: AbortSignal.timeout(10_000),
        },
      );
    } catch {
      throw new PlayUnavailableError("Google Play could not be reached");
    }
    if (!response.ok) throw new PlayUnavailableError(`Google Play acknowledgement failed (${response.status})`, response.status);
  },
};
