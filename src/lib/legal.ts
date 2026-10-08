/**
 * Facts the legal pages (privacy, terms, credits) state about the operator.
 *
 * Operator identity supplied for the 8 October 2026 release.
 * scripts/check-release-readiness.mjs guards against missing legal facts.
 */
export const LEGAL = {
  /** Trading name shown in the app. */
  serviceName: "Sorlio",
  /** Legal name of the person or company responsible for Sorlio. */
  operatorLegalName: "Zachary Haggar, trading as Sorlio",
  /** Country whose law governs the terms and where the operator is established. */
  operatorCountry: "United Kingdom",
  /** Postal address for legal notices (may be a service address). */
  operatorAddress: "58 Ockford Road, Godalming, Surrey, GU7 1RF, United Kingdom",
  contactEmail: "Sorlio@proton.me",
  /** Region of the Supabase project holding accounts and synced data (eu-central-1). */
  databaseRegion: "the EU (Frankfurt, Germany)",
  privacyEffectiveDate: "8 October 2026",
  termsEffectiveDate: "8 October 2026",
  minimumAge: 13,
  premiumPrice: "£3.99 a month",
} as const;

export function isPlaceholder(value: string): boolean {
  return /^\[.*\]$/.test(value);
}
