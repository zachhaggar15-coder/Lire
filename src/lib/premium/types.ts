export type SubscriptionStatus =
  | "none"
  | "pending"
  | "active"
  | "grace_period"
  | "cancelled"
  | "on_hold"
  | "paused"
  | "expired"
  | "revoked"
  | "unknown";

/**
 * The client's view of an account's entitlement.
 *
 * `isPremium` is only ever true when the server said so (or, offline, when a
 * recent server answer for THIS account said so — see client.ts). It is a
 * display hint: every capability that matters (AI, unlimited synced saves) is
 * enforced by the server independently.
 */
export interface PremiumStatus {
  isPremium: boolean;
  status: SubscriptionStatus;
  expiresAt: string | null;
  autoRenewing: boolean | null;
  /** True when this answer is not fresh from the server (offline / server unavailable). */
  stale: boolean;
  /** True when the server could not be asked at all and there was no usable recent answer. */
  unverified: boolean;
}

export const FREE_PREMIUM_STATUS: PremiumStatus = {
  isPremium: false,
  status: "none",
  expiresAt: null,
  autoRenewing: null,
  stale: false,
  unverified: false,
};

const STATUSES: ReadonlySet<string> = new Set(["none", "pending", "active", "grace_period", "cancelled", "on_hold", "paused", "expired", "revoked", "unknown"]);
const ENTITLED: ReadonlySet<string> = new Set(["active", "grace_period", "cancelled"]);

/**
 * Strictly parses a server entitlement body. Anything malformed, any invalid
 * or past expiry, or any status outside the entitled set yields "not Premium".
 */
export function parsePremiumStatus(body: unknown, now = Date.now()): PremiumStatus {
  if (!body || typeof body !== "object") return FREE_PREMIUM_STATUS;
  const value = body as Record<string, unknown>;
  const status = typeof value.status === "string" && STATUSES.has(value.status) ? (value.status as SubscriptionStatus) : "unknown";
  const expiresAt = typeof value.expiresAt === "string" && Number.isFinite(Date.parse(value.expiresAt)) ? value.expiresAt : null;
  const isPremium =
    value.isPremium === true && ENTITLED.has(status) && expiresAt !== null && Date.parse(expiresAt) > now;
  return {
    isPremium,
    status,
    expiresAt,
    autoRenewing: typeof value.autoRenewing === "boolean" ? value.autoRenewing : null,
    stale: value.stale === true,
    unverified: false,
  };
}

export const PREMIUM_PRODUCT_ID = process.env.NEXT_PUBLIC_GOOGLE_PLAY_PREMIUM_PRODUCT_ID || "sorlio_premium_monthly";
export const ANDROID_PACKAGE = "app.sorlio.reader";

/** Google Play's Subscription Center for Sorlio Premium (the in-app cancellation route Play policy asks for). */
export const MANAGE_SUBSCRIPTION_URL = `https://play.google.com/store/account/subscriptions?sku=${encodeURIComponent(PREMIUM_PRODUCT_ID)}&package=${ANDROID_PACKAGE}`;
