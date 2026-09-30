/**
 * Public half of the temporary closed-test entitlement.
 *
 * This is deliberately just an enable switch. Whether this browser actually
 * receives the entitlement is decided server-side from a signed TWA cookie;
 * a public build flag or a localStorage value must never be enough on its own.
 */
export const CLOSED_TEST_PREMIUM_FLAG = "NEXT_PUBLIC_CLOSED_TEST_PREMIUM_ACCESS";

export function closedTestPremiumEnabled(value = process.env.NEXT_PUBLIC_CLOSED_TEST_PREMIUM_ACCESS): boolean {
  return value === "1" || value?.toLowerCase() === "true";
}
