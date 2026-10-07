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
 * `isPremium` is only ever true when the server said so, or (offline) when a
 * copy of a recent server answer for THIS account is read back from device
 * storage — see client.ts. Device storage is editable by whoever holds the
 * device, so a status read from it (`fromDeviceCache`) is shown to the reader
 * but never grants anything: see `confersPremium`.
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
  /**
   * True when this answer was read from device storage because the server
   * could not be reached. Never set from a server response body.
   */
  fromDeviceCache: boolean;
}

/**
 * The security boundary for paid capability on the device.
 *
 * Only an answer the server gave in this session confers Premium (including
 * the server's own bounded outage answer, which it marks `stale`). A status
 * read back from device storage is display-only: offline, a subscriber sees
 * "Premium (last confirmed …)" but gets Free limits until the server answers
 * again. Server-enforced capabilities (AI, synced saves) never trust the
 * client at all.
 */
export function confersPremium(status: PremiumStatus): boolean {
  return status.isPremium && !status.fromDeviceCache;
}

export const FREE_PREMIUM_STATUS: PremiumStatus = {
  isPremium: false,
  status: "none",
  expiresAt: null,
  autoRenewing: null,
  stale: false,
  unverified: false,
  fromDeviceCache: false,
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
    // Only client.ts sets this, after parsing; a body cannot claim it.
    fromDeviceCache: false,
  };
}

export const PREMIUM_PRODUCT_ID = process.env.NEXT_PUBLIC_GOOGLE_PLAY_PREMIUM_PRODUCT_ID || "sorlio_premium_monthly";
export const ANDROID_PACKAGE = "app.sorlio.reader";

/** Google Play's Subscription Center for Sorlio Premium (the in-app cancellation route Play policy asks for). */
export const MANAGE_SUBSCRIPTION_URL = `https://play.google.com/store/account/subscriptions?sku=${encodeURIComponent(PREMIUM_PRODUCT_ID)}&package=${ANDROID_PACKAGE}`;
