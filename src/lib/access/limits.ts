/**
 * What each access tier may do in a day.
 *
 * Sorlio has three states and they are deliberately distinct: a guest gets
 * enough to understand the product, a free account gets meaningfully more so
 * signing in is worth doing, and Premium removes the ceiling and opens the
 * deeper learning system.
 *
 * Every number lives here. Scattering them through components is how a product
 * ends up with a gate that disagrees with the copy next to it.
 */

export type AccessTier = "guest" | "free" | "premium";

export interface TierLimits {
  /** Distinct articles openable per day. null means unlimited. */
  articlesPerDay: number | null;
  /** Word lookups per day. null means unlimited. */
  lookupsPerDay: number | null;
  /** Saving vocabulary, and the deeper learning features listed in FEATURES. */
  advancedFeatures: boolean;
}

export const TIER_LIMITS: Record<AccessTier, TierLimits> = {
  guest: { articlesPerDay: 1, lookupsPerDay: 3, advancedFeatures: false },
  free: { articlesPerDay: 3, lookupsPerDay: 10, advancedFeatures: false },
  premium: { articlesPerDay: null, lookupsPerDay: null, advancedFeatures: true },
};

/**
 * The features behind Premium.
 *
 * Named individually rather than checked as one boolean so a gate reads as
 * what it is at the call site, and so this list is the only place the set can
 * grow.
 */
export type PremiumFeature =
  | "saveWord"
  | "comprehension"
  | "aiExplanation"
  | "practice"
  | "review"
  | "listening"
  | "grammar"
  | "importText";

/** Human-readable reason shown when a Premium feature is blocked. */
export const PREMIUM_FEATURE_LABEL: Record<PremiumFeature, string> = {
  saveWord: "Saving words",
  comprehension: "Comprehension questions",
  aiExplanation: "AI explanations",
  practice: "Practice sessions",
  review: "Review",
  listening: "Listening exercises",
  grammar: "Grammar exercises",
  importText: "Importing your own text",
};
