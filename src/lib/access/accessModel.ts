import { FEATURES, FREE_DAILY_NEW_SAVES, isPremiumOnly, type AccessTier, type Feature } from "@/lib/access/features";
import { confersPremium, type PremiumStatus } from "@/lib/premium/types";

/**
 * One place that answers "may this person do this right now".
 *
 * Pure functions of the tier and today's save count, so every gate can be
 * reasoned about without React state and every message names the real reason.
 */

export type AccessDenialReason = "needs-premium" | "daily-save-limit";

export interface AccessDecision {
  allowed: boolean;
  /** Only set when `allowed` is false. */
  reason: AccessDenialReason | null;
  /** Remaining allowance when countable; null means unlimited. */
  remaining: number | null;
}

export interface AccessContext {
  tier: AccessTier;
  /** New words saved today (the larger of this device's count and the server's, for accounts). */
  newSavesToday: number;
}

const ALLOWED: AccessDecision = { allowed: true, reason: null, remaining: null };

/**
 * A real Premium entitlement implies a signed-in account, so a cached
 * entitlement can never apply to a guest.
 */
export function accessTier(authenticated: boolean, premium: boolean): AccessTier {
  if (!authenticated) return "guest";
  return premium ? "premium" : "free";
}

/**
 * The tier the app actually grants for a fetched entitlement. A status read
 * back from device storage is display-only (confersPremium), so a forged or
 * leftover cache can never raise the tier.
 */
export function tierForStatus(authenticated: boolean, status: PremiumStatus): AccessTier {
  return accessTier(authenticated, confersPremium(status));
}

export function accessContext(tier: AccessTier, newSavesToday = 0): AccessContext {
  return { tier, newSavesToday: Math.max(0, Math.floor(newSavesToday)) };
}

/** May this feature be used? (For saving words, see canSaveNewWord, which also counts.) */
export function canUse(context: AccessContext, feature: Feature): AccessDecision {
  if (context.tier === "premium") return ALLOWED;
  if (feature === "saveWord") return canSaveNewWord(context);
  if (isPremiumOnly(feature)) return { allowed: false, reason: "needs-premium", remaining: 0 };
  return ALLOWED;
}

/** Saving a NEW word. Reviewing, editing or deleting saved words is never limited. */
export function canSaveNewWord(context: AccessContext): AccessDecision {
  if (context.tier === "premium") return ALLOWED;
  const remaining = FREE_DAILY_NEW_SAVES - context.newSavesToday;
  if (remaining > 0) return { allowed: true, reason: null, remaining: remaining - 1 };
  return { allowed: false, reason: "daily-save-limit", remaining: 0 };
}

export const canUseAI = (context: AccessContext) => canUse(context, "aiWordHelp");

export { FEATURES };
export type { AccessTier, Feature };
