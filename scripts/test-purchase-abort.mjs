/**
 * PaymentRequest.show() errors: a reader closing the Play sheet is a
 * cancellation, but Chromium's AbortError("Invalid state") (Play payment app
 * failed to launch) is a genuine failure and must not be hidden as one.
 */

import { createRunner } from "./lib/fakeBrowser.mjs";

const { runPurchase } = await import("@/lib/premium/purchase");
const t = createRunner("purchase abort handling");

function depsThrowing(error) {
  return {
    requestPayment: async () => {
      throw error;
    },
    verify: async () => ({ kind: "unavailable" }),
    rememberPending() {},
    forgetPending() {},
    sleep: async () => {},
    onState() {},
  };
}

function abort(message) {
  const error = new Error(message);
  error.name = "AbortError";
  return error;
}

await t.section("abort handling", async () => {
  t.check("user closing the sheet is cancelled", (await runPurchase(depsThrowing(abort("The user aborted a request.")))).phase === "cancelled");
  t.check("AbortError: Invalid state is a failure", (await runPurchase(depsThrowing(abort("Invalid state")))).phase === "failed");
  const other = new Error("boom");
  other.name = "NotSupportedError";
  t.check("other errors are failures", (await runPurchase(depsThrowing(other))).phase === "failed");
});

t.finish();
