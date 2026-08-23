import { getDailyUsage, hasOpenedArticleToday, type DailyUsage } from "@/lib/access/dailyUsage";
import { TIER_LIMITS, type AccessTier, type PremiumFeature } from "@/lib/access/limits";

/**
 * One place that answers "may this person do this right now".
 *
 * Small on purpose. Every decision is a pure function of three things — the
 * tier, what has been used today, and which feature is being attempted — so a
 * gate can be reasoned about without tracing React state, and the UI never has
 * to work out *why* something is blocked in order to say the right thing.
 *
 * The `reason` is the load-bearing part. "You need an account" and "you need
 * Premium" are different restrictions, and showing the wrong one is how a
 * product asks somebody to sign up for something signing up will not give
 * them.
 */

export type AccessDenialReason = "needs-account" | "needs-premium";

export interface AccessDecision {
  allowed: boolean;
  /** Only set when `allowed` is false. */
  reason: AccessDenialReason | null;
  /** Remaining allowance, when the limit is countable. null means unlimited. */
  remaining: number | null;
}

const ALLOWED: AccessDecision = { allowed: true, reason: null, remaining: null };

function allow(remaining: number | null = null): AccessDecision {
  return { allowed: true, reason: null, remaining };
}

function deny(reason: AccessDenialReason, remaining = 0): AccessDecision {
  return { allowed: false, reason, remaining };
}

/**
 * The tier a person is in.
 *
 * Premium implies authenticated, but the check is written so a stale cached
 * entitlement can never grant Premium to a signed-out device: signing out
 * makes `authenticated` false, which drops straight back to guest.
 */
export function accessTier(authenticated: boolean, premium: boolean): AccessTier {
  if (!authenticated) return "guest";
  return premium ? "premium" : "free";
}

export interface AccessContext {
  tier: AccessTier;
  usage: DailyUsage;
}

export function accessContext(tier: AccessTier, usage: DailyUsage = getDailyUsage()): AccessContext {
  return { tier, usage };
}

/**
 * May this article be opened?
 *
 * Reopening an article already read today never costs another allowance —
 * going back to finish something is continuing one lesson, not starting a
 * second.
 */
export function canStartArticle(context: AccessContext, articleId: string): AccessDecision {
  const limit = TIER_LIMITS[context.tier].articlesPerDay;
  if (limit === null) return ALLOWED;
  if (context.usage.articleIds.includes(articleId)) return allow(Math.max(0, limit - context.usage.articleIds.length));

  const used = context.usage.articleIds.length;
  if (used < limit) return allow(limit - used - 1);
  // A guest is short of an account; a free user is short of Premium.
  return deny(context.tier === "guest" ? "needs-account" : "needs-premium");
}

export function canLookupWord(context: AccessContext): AccessDecision {
  const limit = TIER_LIMITS[context.tier].lookupsPerDay;
  if (limit === null) return ALLOWED;
  if (context.usage.lookups < limit) return allow(limit - context.usage.lookups - 1);
  return deny(context.tier === "guest" ? "needs-account" : "needs-premium");
}

/**
 * May this Premium feature be used?
 *
 * Always "needs-premium", never "needs-account", even for a guest. An account
 * alone does not unlock these, so prompting a guest to sign in here would be
 * asking them to do something that leaves them exactly as blocked. The UI
 * explains that Premium requires an account and routes them through sign-in on
 * the way to purchase — see PremiumGate.
 */
export function canUsePremiumFeature(context: AccessContext, _feature: PremiumFeature): AccessDecision {
  return TIER_LIMITS[context.tier].advancedFeatures ? ALLOWED : deny("needs-premium");
}

/** Named helpers, so call sites read as the thing being gated. */
export const canSaveWord = (context: AccessContext) => canUsePremiumFeature(context, "saveWord");
export const canUseComprehension = (context: AccessContext) => canUsePremiumFeature(context, "comprehension");
export const canUseAIExplanation = (context: AccessContext) => canUsePremiumFeature(context, "aiExplanation");
export const canUsePractice = (context: AccessContext) => canUsePremiumFeature(context, "practice");
export const canUseReview = (context: AccessContext) => canUsePremiumFeature(context, "review");
export const canUseListening = (context: AccessContext) => canUsePremiumFeature(context, "listening");
export const canUseGrammar = (context: AccessContext) => canUsePremiumFeature(context, "grammar");
export const canImportText = (context: AccessContext) => canImport(context);

function canImport(context: AccessContext): AccessDecision {
  return canUsePremiumFeature(context, "importText");
}

/** Re-exported so callers need only this module. */
export { getDailyUsage, hasOpenedArticleToday };
export type { DailyUsage };
export type { AccessTier, PremiumFeature };
