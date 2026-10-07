/**
 * Facts the legal pages (privacy, terms, credits) state about the operator.
 *
 * Values in square brackets are placeholders that only the operator can
 * supply; they are deliberately visible rather than invented.
 * scripts/check-release-readiness.mjs lists every remaining placeholder, and
 * the release checklist requires that list to be empty before submission.
 */
export const LEGAL = {
  /** Trading name shown in the app. */
  serviceName: "Sorlio",
  /** Legal name of the person or company responsible for Sorlio. */
  operatorLegalName: "[Operator legal name]",
  /** Country whose law governs the terms and where the operator is established. */
  operatorCountry: "[Country of establishment, e.g. England and Wales]",
  /** Postal address for legal notices (may be a service address). */
  operatorAddress: "[Postal address for legal notices]",
  contactEmail: "sorlio@proton.me",
  /** Region of the Supabase project holding accounts and synced data. */
  databaseRegion: "[Supabase project region, e.g. EU West (Ireland)]",
  privacyEffectiveDate: "[Release date]",
  termsEffectiveDate: "[Release date]",
  minimumAge: 13,
  premiumPrice: "£3.99 a month",
} as const;

export function isPlaceholder(value: string): boolean {
  return /^\[.*\]$/.test(value);
}
