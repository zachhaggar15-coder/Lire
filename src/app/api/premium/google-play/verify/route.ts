import { NextResponse } from "next/server";
import { googlePlayApi } from "@/lib/premium/googlePlay";
import { reconcilePurchase } from "@/lib/premium/entitlement";
import { authenticatedUser, PREMIUM_PRODUCT_ID } from "@/lib/premium/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/server/rateLimit";
import { recordOpsEvent } from "@/lib/server/ops";

/**
 * Verifies a Google Play purchase for the signed-in account.
 *
 * HTTP 200 means "Google answered" — NOT "Premium is active". The body's
 * `isPremium` and `status` say what the subscription actually is (it may be
 * pending, for example). The client shows success only when isPremium is
 * true. Every other outcome has its own code so the UI can explain it:
 *
 *   401 needs-account                — no valid session
 *   400 invalid                      — malformed request / not Sorlio Premium
 *   402 not-a-purchase               — Google does not recognise the token
 *   409 owned-by-another-account     — this Play subscription belongs to a
 *                                      different Sorlio account
 *   429 rate-limited
 *   503 verification-unavailable     — Google or storage temporarily down;
 *                                      the purchase may be valid, retry
 */

const NO_STORE = { "Cache-Control": "private, no-store, max-age=0" };
const MAX_TOKEN_LENGTH = 2048;

function reply(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  const user = await authenticatedUser(request);
  if (!user) return reply({ code: "needs-account", error: "Sign in before subscribing." }, 401);
  const client = getSupabaseServiceClient();
  if (!client) return reply({ code: "verification-unavailable", error: "Purchases can't be verified right now." }, 503);

  if (!(await rateLimit(`premium-verify:${user.id}`, 10, 60_000))) {
    return reply({ code: "rate-limited", error: "Too many attempts. Please wait a minute and try again." }, 429);
  }

  const body = (await request.json().catch(() => null)) as { purchaseToken?: unknown; productId?: unknown } | null;
  const purchaseToken = typeof body?.purchaseToken === "string" ? body.purchaseToken.trim() : "";
  if (!purchaseToken || purchaseToken.length > MAX_TOKEN_LENGTH || body?.productId !== PREMIUM_PRODUCT_ID) {
    return reply({ code: "invalid", error: "This isn't a Sorlio Premium purchase." }, 400);
  }

  let outcome;
  try {
    outcome = await reconcilePurchase({ db: client, play: googlePlayApi, userId: user.id, purchaseToken, productId: PREMIUM_PRODUCT_ID });
  } catch {
    outcome = { kind: "unavailable" as const };
  }

  switch (outcome.kind) {
    case "ok":
      return reply({ ...outcome.view, code: outcome.view.isPremium ? "active" : outcome.view.status });
    case "conflict":
      void recordOpsEvent("billing.ownership_conflict");
      return reply(
        {
          code: "owned-by-another-account",
          error:
            "This Google Play subscription is already linked to a different Sorlio account. Sign in with that account to use Premium, or contact support if you need help moving it.",
        },
        409,
      );
    case "rejected":
      return reply({ code: "not-a-purchase", error: "Google Play didn't recognise this purchase." }, 402);
    case "wrong-product":
      return reply({ code: "invalid", error: "This isn't a Sorlio Premium purchase." }, 400);
    case "unavailable":
      void recordOpsEvent("billing.verify_unavailable");
      return reply(
        {
          code: "verification-unavailable",
          error: "We couldn't confirm the purchase with Google Play just now. If you were charged, your purchase is safe — Sorlio will keep trying.",
        },
        503,
      );
  }
}
