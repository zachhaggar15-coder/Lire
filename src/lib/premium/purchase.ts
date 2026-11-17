import { PREMIUM_PRODUCT_ID } from "@/lib/premium/types";

/**
 * The Premium purchase flow as an explicit state machine.
 *
 * The rule that drives everything here: the UI says "Premium is active" only
 * when the SERVER confirms the account is entitled. An HTTP 200 from the
 * verify endpoint is not enough — the body must say isPremium: true.
 *
 * States
 *   idle                    nothing in progress
 *   requesting              Google Play's purchase sheet is open
 *   verifying               Play returned a purchase; confirming with server
 *   active                  server confirmed Premium
 *   pending                 Play says the payment is pending (e.g. cash
 *                           payment); no access yet, re-checked later
 *   verification-delayed    payment accepted by Play but the server could not
 *                           confirm it yet — NOT a failure; retried
 *                           automatically and on next launch
 *   ownership-conflict      the Play subscription belongs to another Sorlio
 *                           account
 *   cancelled               the reader closed the sheet; nothing was charged
 *   failed                  Play or the server definitively refused
 *   needs-account           not signed in
 *   unavailable             Play Billing isn't available (not the Android app)
 *
 * PaymentRequest.complete() is only a UI signal to the Play sheet. It is
 * "success" only when the server confirmed (or confirmed pending), "fail" only
 * when the purchase was definitively refused, and "unknown" while
 * verification is delayed — a purchase that may have charged the reader is
 * never reported as failed.
 */

export type PurchasePhase =
  | "idle"
  | "requesting"
  | "verifying"
  | "active"
  | "pending"
  | "verification-delayed"
  | "ownership-conflict"
  | "cancelled"
  | "failed"
  | "needs-account"
  | "unavailable";

export interface PurchaseState {
  phase: PurchasePhase;
  message: string | null;
}

export const PLAY_BILLING_METHOD = "https://play.google.com/billing";

export type VerifyResult =
  | { kind: "active" }
  | { kind: "pending" }
  | { kind: "not-entitled" }
  | { kind: "conflict"; message: string }
  | { kind: "rejected"; message: string }
  | { kind: "needs-account" }
  | { kind: "unavailable" };

/** Interprets a verify endpoint response strictly. */
export async function interpretVerifyResponse(response: Response): Promise<VerifyResult> {
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  const message = typeof body?.error === "string" ? body.error : null;
  if (response.status === 200) {
    if (body?.isPremium === true) return { kind: "active" };
    if (body?.status === "pending") return { kind: "pending" };
    return { kind: "not-entitled" };
  }
  if (response.status === 401) return { kind: "needs-account" };
  if (response.status === 409) return { kind: "conflict", message: message ?? "This subscription is linked to a different Sorlio account." };
  if (response.status === 400 || response.status === 402) return { kind: "rejected", message: message ?? "Google Play didn't confirm this purchase." };
  return { kind: "unavailable" };
}

export interface PurchaseDeps {
  /** Opens Play's purchase sheet. Resolves with the response or throws (AbortError on cancel). */
  requestPayment(sku: string): Promise<{ purchaseToken: string | null; complete(result: "success" | "fail" | "unknown"): Promise<void> }>;
  verify(purchaseToken: string): Promise<VerifyResult>;
  /** Persists a token whose verification is still outstanding (survives reloads). */
  rememberPending(purchaseToken: string): void;
  forgetPending(purchaseToken: string): void;
  sleep(ms: number): Promise<void>;
  onState(state: PurchaseState): void;
}

export const RETRY_DELAYS_MS = [3_000, 10_000, 30_000];

const DELAYED_MESSAGE =
  "Payment received — we're confirming it with Google Play. This can take a minute. You won't be charged twice, and Premium will switch on automatically.";
const PENDING_MESSAGE =
  "Google Play says your payment is still pending. Premium will start as soon as Google confirms it — you don't need to buy again.";

/** Verifies a token, retrying while the server is temporarily unavailable. */
export async function verifyWithRetry(deps: Pick<PurchaseDeps, "verify" | "sleep">, token: string): Promise<VerifyResult> {
  let result = await deps.verify(token);
  for (const delay of RETRY_DELAYS_MS) {
    if (result.kind !== "unavailable") break;
    await deps.sleep(delay);
    result = await deps.verify(token);
  }
  return result;
}

export function stateForResult(result: VerifyResult): PurchaseState {
  switch (result.kind) {
    case "active":
      return { phase: "active", message: "Premium is active. Thank you!" };
    case "pending":
      return { phase: "pending", message: PENDING_MESSAGE };
    case "conflict":
      return { phase: "ownership-conflict", message: result.message };
    case "rejected":
      return { phase: "failed", message: result.message };
    case "needs-account":
      return { phase: "needs-account", message: "Sign in to finish setting up Premium." };
    case "not-entitled":
      return { phase: "failed", message: "Google Play didn't confirm an active subscription. If you were charged, contact support and we'll sort it out." };
    case "unavailable":
      return { phase: "verification-delayed", message: DELAYED_MESSAGE };
  }
}

export async function runPurchase(deps: PurchaseDeps, sku = PREMIUM_PRODUCT_ID): Promise<PurchaseState> {
  const emit = (state: PurchaseState) => {
    deps.onState(state);
    return state;
  };
  emit({ phase: "requesting", message: null });

  let response: Awaited<ReturnType<PurchaseDeps["requestPayment"]>>;
  try {
    response = await deps.requestPayment(sku);
  } catch (error) {
    const { name, message } = (error as { name?: string; message?: string } | null) ?? {};
    // Chromium also raises AbortError("Invalid state") when the Play payment
    // app fails to launch; that is a genuine failure, not the reader cancelling.
    if (name === "AbortError" && !/invalid state/i.test(message ?? "")) return emit({ phase: "cancelled", message: null });
    return emit({ phase: "failed", message: "Google Play couldn't start the purchase. You haven't been charged." });
  }

  const token = response.purchaseToken;
  if (!token) {
    await response.complete("fail").catch(() => {});
    return emit({ phase: "failed", message: "Google Play didn't return a purchase. You haven't been charged." });
  }

  // From here the reader may have paid. Keep the token until it's resolved.
  deps.rememberPending(token);
  emit({ phase: "verifying", message: "Confirming your purchase…" });
  const result = await verifyWithRetry(deps, token);
  const state = stateForResult(result);

  // "fail" only when Google itself refused the purchase; whenever the reader
  // may have been charged (delayed, conflict, unconfirmed) the sheet is told
  // "unknown" rather than "failed".
  const sheet = result.kind === "active" || result.kind === "pending" ? "success" : result.kind === "rejected" ? "fail" : "unknown";
  await response.complete(sheet).catch(() => {});
  if (result.kind !== "unavailable" && result.kind !== "pending") deps.forgetPending(token);
  return emit(state);
}
