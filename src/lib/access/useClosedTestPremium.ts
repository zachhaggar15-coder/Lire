/**
 * Closed-test Premium is deliberately disabled. A TWA referrer and Fetch
 * Metadata can both be forged by a raw HTTP client, and the current Android
 * wrapper has no native attestation channel. Keep this hook fail-closed until
 * a future binary can present proof that the server can verify.
 */
export function useClosedTestPremium() {
  return { active: false, loading: false };
}
