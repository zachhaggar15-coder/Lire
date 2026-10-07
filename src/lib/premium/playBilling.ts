import { getSupabaseClient } from "@/lib/supabase/client";
import { activeIdentity, readJson, storeFor, writeJson } from "@/lib/localData/store";
import { PREMIUM_PRODUCT_ID } from "@/lib/premium/types";
import {
  PLAY_BILLING_METHOD,
  interpretVerifyResponse,
  runPurchase,
  stateForResult,
  verifyWithRetry,
  type PurchaseDeps,
  type PurchaseState,
  type VerifyResult,
} from "@/lib/premium/purchase";

/**
 * Browser side of Google Play Billing inside the Android app (Trusted Web
 * Activity), via the Digital Goods API and PaymentRequest.
 */

export interface ProductOffer {
  /** Localised price from Google Play, e.g. "£3.99". */
  price: string;
  /** "month", or null if Play did not say. */
  period: "month" | "year" | null;
  /** Non-null only if the Play product actually offers a free trial. */
  freeTrial: string | null;
  introductoryPrice: string | null;
}

const PENDING_KEY = "lire.premium.pendingTokens.v1";

export function billingSupported(): boolean {
  return typeof window !== "undefined" && typeof window.getDigitalGoodsService === "function" && typeof PaymentRequest !== "undefined";
}

async function service(): Promise<DigitalGoodsService | null> {
  if (!billingSupported()) return null;
  try {
    return await window.getDigitalGoodsService!(PLAY_BILLING_METHOD);
  } catch {
    return null;
  }
}

function formatPrice(price: { currency: string; value: string } | undefined): string | null {
  if (!price || !Number.isFinite(Number(price.value))) return null;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: price.currency }).format(Number(price.value));
  } catch {
    return null;
  }
}

function describeDuration(iso: string | undefined): string | null {
  if (!iso) return null;
  const match = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?$/.exec(iso);
  if (!match) return iso;
  const [, y, m, w, d] = match;
  const parts = [
    y && `${y} ${y === "1" ? "year" : "years"}`,
    m && `${m} ${m === "1" ? "month" : "months"}`,
    w && `${w} ${w === "1" ? "week" : "weeks"}`,
    d && `${d} ${d === "1" ? "day" : "days"}`,
  ].filter(Boolean);
  return parts.join(" ") || null;
}

/** Product details from Google Play — the only source for prices shown at checkout. */
export async function loadOffer(): Promise<ProductOffer | null> {
  const goods = await service();
  if (!goods) return null;
  try {
    const details = await goods.getDetails([PREMIUM_PRODUCT_ID]);
    const product = details.find((item) => item.itemId === PREMIUM_PRODUCT_ID);
    const price = formatPrice(product?.price);
    if (!product || !price) return null;
    return {
      price,
      period: product.subscriptionPeriod === "P1M" ? "month" : product.subscriptionPeriod === "P1Y" ? "year" : null,
      freeTrial: describeDuration(product.freeTrialPeriod),
      introductoryPrice: formatPrice(product.introductoryPrice),
    };
  } catch {
    return null;
  }
}

function pendingTokens(): string[] {
  const identity = activeIdentity();
  if (identity.kind !== "account") return [];
  const value = readJson<unknown>(PENDING_KEY, [], storeFor(identity));
  return Array.isArray(value) ? value.filter((t): t is string => typeof t === "string" && t.length < 2048) : [];
}

function setPendingTokens(tokens: string[]): void {
  const identity = activeIdentity();
  if (identity.kind !== "account") return;
  writeJson(PENDING_KEY, [...new Set(tokens)].slice(0, 5), storeFor(identity));
}

async function verifyToken(purchaseToken: string): Promise<VerifyResult> {
  const client = getSupabaseClient();
  const { data } = client ? await client.auth.getSession() : { data: { session: null } };
  if (!data.session) return { kind: "needs-account" };
  try {
    const response = await fetch("/api/premium/google-play/verify", {
      method: "POST",
      headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ purchaseToken, productId: PREMIUM_PRODUCT_ID }),
    });
    return interpretVerifyResponse(response);
  } catch {
    return { kind: "unavailable" };
  }
}

function browserDeps(onState: (state: PurchaseState) => void): PurchaseDeps {
  return {
    async requestPayment(sku) {
      const request = new PaymentRequest(
        [{ supportedMethods: PLAY_BILLING_METHOD, data: { sku } }],
        // Required by the API shape; Google Play ignores it and charges the
        // price configured in Play Console, which the sheet shows.
        { total: { label: "Sorlio Premium", amount: { currency: "GBP", value: "0" } } },
      );
      const response = await request.show();
      const details = response.details as { purchaseToken?: unknown } | undefined;
      return {
        purchaseToken: typeof details?.purchaseToken === "string" ? details.purchaseToken : null,
        complete: (result) => response.complete(result),
      };
    },
    verify: verifyToken,
    rememberPending: (token) => setPendingTokens([...pendingTokens(), token]),
    forgetPending: (token) => setPendingTokens(pendingTokens().filter((t) => t !== token)),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    onState,
  };
}

export function purchasePremium(onState: (state: PurchaseState) => void): Promise<PurchaseState> {
  if (!billingSupported()) {
    const state: PurchaseState = { phase: "unavailable", message: "Subscribing is available in the Sorlio Android app from Google Play." };
    onState(state);
    return Promise.resolve(state);
  }
  return runPurchase(browserDeps(onState));
}

/**
 * Restores Premium for this account: re-verifies purchases Google Play holds
 * for this device's Play account, plus any purchase whose confirmation was
 * still outstanding. Returns the most useful resulting state, or null if
 * there was nothing to restore.
 */
export async function restorePurchases(): Promise<PurchaseState | null> {
  const tokens = new Set(pendingTokens());
  const goods = await service();
  if (goods) {
    try {
      for (const purchase of await goods.listPurchases()) {
        if (purchase.itemId === PREMIUM_PRODUCT_ID && purchase.purchaseToken) tokens.add(purchase.purchaseToken);
      }
    } catch {
      // Play unavailable; pending tokens can still be retried.
    }
  }
  if (tokens.size === 0) return null;
  const deps = { verify: verifyToken, sleep: (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)) };
  let best: PurchaseState | null = null;
  const rank: Record<string, number> = { active: 5, pending: 4, "verification-delayed": 3, "ownership-conflict": 2, failed: 1 };
  for (const token of tokens) {
    const result = await verifyWithRetry(deps, token);
    if (result.kind !== "unavailable" && result.kind !== "pending") setPendingTokens(pendingTokens().filter((t) => t !== token));
    const state = stateForResult(result);
    if (!best || (rank[state.phase] ?? 0) > (rank[best.phase] ?? 0)) best = state;
  }
  return best;
}
