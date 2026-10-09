"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AppBar from "@/components/AppBar";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { signInWithGoogle } from "@/lib/supabase/auth";
import { activeIdentity } from "@/lib/localData/store";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";
import { MANAGE_SUBSCRIPTION_URL } from "@/lib/premium/types";
import { billingSupported, getBillingDiagnostic, loadOffer, purchasePremium, restorePurchases, type ProductOffer } from "@/lib/premium/playBilling";
import type { PurchaseState } from "@/lib/premium/purchase";
import { FEATURES, FREE_DAILY_NEW_SAVES } from "@/lib/access/features";
import { LEGAL } from "@/lib/legal";

/** UK launch price, used only for information outside the Android app. Checkout always shows Google Play's price. */
const UK_LAUNCH_PRICE = "£3.99";

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const time = Date.parse(iso);
  return Number.isFinite(time) ? new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(time)) : null;
}

const FREE_ROWS = [
  "Read Sorlio texts and live French news",
  "Import your own French text",
  "Listen while you read",
  "Tap any word for the built-in dictionary meaning",
  `Save ${FREE_DAILY_NEW_SAVES} new words a day, and review all your saved words`,
  "Grammar lessons and exercises",
  "Progress and streaks",
];

export default function PremiumPageClient() {
  const { status, loading, refresh } = usePremiumStatus();
  // Match SSR during hydration; the account identity lives in browser storage.
  const [signedIn, setSignedIn] = useState(false);
  const [offer, setOffer] = useState<ProductOffer | null>(null);
  // "loading" until Play answers; "missing" when it returned no product
  // details, in which case checkout is not offered (we never charge against a
  // price we could not show) and the reader can retry.
  const [offerState, setOfferState] = useState<"loading" | "ready" | "missing">("loading");
  const [inApp, setInApp] = useState(false);
  const [purchase, setPurchase] = useState<PurchaseState>({ phase: "idle", message: null });
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const refreshOffer = useCallback(() => {
    setOfferState("loading");
    void loadOffer().then((next) => {
      setOffer(next);
      setOfferState(next ? "ready" : "missing");
    });
  }, []);

  useEffect(() => {
    setSignedIn(activeIdentity().kind === "account");
    setInApp(billingSupported());
    refreshOffer();
  }, [refreshOffer]);

  // Inside the app, quietly finish any purchase whose confirmation was still
  // outstanding (e.g. the app closed mid-verification), once per visit.
  useEffect(() => {
    if (!signedIn || !billingSupported()) return;
    void restorePurchases().then(async (state) => {
      if (state && state.phase !== "failed") {
        setPurchase(state);
        if (state.phase === "active") await refresh();
      }
    });
  }, [signedIn, refresh]);

  const busy = purchase.phase === "requesting" || purchase.phase === "verifying";

  async function subscribe() {
    const result = await purchasePremium(setPurchase);
    if (result.phase === "active") await refresh();
  }

  async function restore() {
    setPurchase({ phase: "verifying", message: "Checking Google Play for your subscription…" });
    const result = await restorePurchases();
    if (!result) setPurchase({ phase: "idle", message: "No Sorlio Premium subscription was found for the Google account on this device." });
    else setPurchase(result);
    if (result?.phase === "active") await refresh();
  }

  async function requestSignIn() {
    setSigningIn(true);
    setSignInError(null);
    const result = await signInWithGoogle("/premium");
    if (!result.ok) {
      setSigningIn(false);
      setSignInError(result.error ? "Sign-in didn't complete. Please try again." : null);
    }
  }

  const priceLabel = offer ? `${offer.price}${offer.period === "month" ? " a month" : offer.period === "year" ? " a year" : ""}` : `${UK_LAUNCH_PRICE} a month in the UK`;
  const expiry = formatDate(status.expiresAt);

  return (
    <div className="ligne-screen">
      <AppBar title="Sorlio Premium" kicker="Optional upgrade" backHref="/settings" backLabel="Back to settings" />

      <section className="rounded-card bg-brand p-5 text-cream shadow-raised">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-cream/80">Premium</p>
        <h2 className="mt-1 text-2xl font-semibold leading-tight">Unlimited saving and AI help when you need it</h2>
        <p className="mt-2 text-sm text-cream/90">
          {priceLabel}
          {!offer && " · the exact price and any tax are shown by Google Play before you pay"}
        </p>
      </section>

      <section className="mt-4 rounded-card border border-cream-dark bg-cream-card p-5 shadow-card" aria-labelledby="premium-adds">
        <h2 id="premium-adds" className="font-semibold text-ink">
          What Premium adds
        </h2>
        <h3 className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">Unlimited saving</h3>
        <ul className="mt-1.5 space-y-1.5 text-sm text-ink">
          <li>✓ {FEATURES.unlimitedSaves.label}</li>
          <li>✓ Build a review list with no daily cap</li>
        </ul>
        <h3 className="mt-4 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">AI help</h3>
        <ul className="mt-1.5 space-y-1.5 text-sm text-ink">
          <li>✓ {FEATURES.aiWordHelp.label}</li>
          <li>✓ {FEATURES.aiSentenceHelp.label}</li>
          <li>✓ {FEATURES.aiTranslation.label}</li>
          <li>✓ {FEATURES.aiPractice.label}</li>
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          AI help runs only when you ask for it. It sends the sentence or text you&rsquo;re asking about to our AI provider,
          OpenAI, and AI answers can contain mistakes. See the{" "}
          <Link href="/privacy" className="font-semibold text-brand underline underline-offset-2">
            privacy policy
          </Link>
          .
        </p>
      </section>

      <section className="mt-4 rounded-card border border-cream-dark bg-cream-card p-5 shadow-card" aria-labelledby="free-includes">
        <h2 id="free-includes" className="font-semibold text-ink">
          Always free
        </h2>
        <ul className="mt-2 space-y-1.5 text-sm text-ink-muted">
          {FREE_ROWS.map((row) => (
            <li key={row}>✓ {row}</li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-card border border-cream-dark bg-cream-card p-5 shadow-card" aria-live="polite">
        {loading ? (
          <p className="text-sm text-ink-muted">Checking your subscription…</p>
        ) : status.isPremium ? (
          <>
            <p className="font-semibold text-brand">
              {status.status === "cancelled"
                ? `Premium is active until ${expiry ?? "the end of your paid period"}`
                : status.status === "grace_period"
                  ? "Premium is active — Google Play couldn't take your last payment"
                  : "Premium is active"}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {status.status === "cancelled"
                ? "You've cancelled, so it won't renew. You keep Premium until then."
                : status.status === "grace_period"
                  ? "Update your payment method in Google Play to keep Premium."
                  : expiry
                    ? `Renews automatically on ${expiry} unless you cancel.`
                    : "Renews automatically each month unless you cancel."}
            </p>
            {status.fromDeviceCache ? (
              <p className="mt-1 text-xs text-ink-muted">
                You&rsquo;re offline, so this is your last confirmed status. Premium features return as soon as Sorlio can
                check your subscription again.
              </p>
            ) : status.stale ? (
              <p className="mt-1 text-xs text-ink-muted">Couldn&rsquo;t reach Google Play just now — showing your last confirmed status.</p>
            ) : null}
          </>
        ) : !signedIn ? (
          <>
            <p className="font-semibold text-ink">Sign in to subscribe</p>
            <p className="mt-1 text-sm text-ink-muted">
              Sorlio&rsquo;s free version never needs an account. Premium is linked to a Google sign-in so it works on all
              your devices and can be restored.
            </p>
            <div className="mt-4">
              <GoogleSignInButton onClick={requestSignIn} disabled={signingIn} busy={signingIn} />
            </div>
            {signInError && (
              <p role="alert" className="mt-2 text-sm text-rose-700">
                {signInError}
              </p>
            )}
          </>
        ) : status.status === "pending" ? (
          <>
            <p className="font-semibold text-ink">Your payment is pending</p>
            <p className="mt-1 text-sm text-ink-muted">Premium starts as soon as Google Play confirms the payment. You don&rsquo;t need to buy again.</p>
          </>
        ) : status.status === "on_hold" || status.status === "paused" ? (
          <>
            <p className="font-semibold text-ink">{status.status === "on_hold" ? "Your subscription is on hold" : "Your subscription is paused"}</p>
            <p className="mt-1 text-sm text-ink-muted">
              {status.status === "on_hold" ? "Google Play couldn't take a payment. Fix your payment method in Google Play to restart Premium." : "Premium resumes when your pause ends. You can resume early in Google Play."}
            </p>
          </>
        ) : inApp ? (
          <>
            {offerState === "missing" && (
              <div role="alert" className="mb-3 rounded-2xl bg-cream px-3 py-2 text-sm text-ink">
                Couldn&rsquo;t load the subscription from Google Play.{" "}
                <button type="button" onClick={refreshOffer} className="font-semibold text-brand underline underline-offset-2">
                  Try again
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => void subscribe()}
              disabled={busy || offerState !== "ready"}
              className="min-h-12 w-full rounded-full bg-brand px-5 py-3 font-semibold text-cream disabled:opacity-60"
            >
              {purchase.phase === "requesting" ? "Opening Google Play…" : purchase.phase === "verifying" ? "Confirming…" : offer ? `Subscribe for ${offer.price}${offer.period === "month" ? " a month" : ""}` : "Subscribe with Google Play"}
            </button>
            <button type="button" onClick={() => void restore()} disabled={busy} className="mt-2 min-h-12 w-full text-sm font-semibold text-ink-muted underline underline-offset-2 disabled:opacity-60">
              Already subscribed? Restore purchase
            </button>
          </>
        ) : (
          <>
            <p className="font-semibold text-ink">Subscribe in the Sorlio Android app</p>
            <p className="mt-1 text-sm text-ink-muted">
              Premium is sold through Google Play in the Android app. If you already subscribe, it works here too once you
              sign in with the same Google account.
            </p>
          </>
        )}

        {purchase.message && purchase.phase !== "idle" && (
          <p
            role={purchase.phase === "failed" || purchase.phase === "ownership-conflict" ? "alert" : "status"}
            className={`mt-3 text-sm ${purchase.phase === "active" ? "font-semibold text-brand" : purchase.phase === "failed" || purchase.phase === "ownership-conflict" ? "text-rose-700" : "text-ink"}`}
          >
            {purchase.message}
          </p>
        )}
        {inApp && purchase.phase === "failed" && getBillingDiagnostic() && (
          // TEMPORARY: billing diagnostics for the internal-test device.
          <pre className="mt-2 whitespace-pre-wrap break-words rounded border border-rose-200 p-2 text-xs text-ink-muted">
            {`canMakePayment: ${getBillingDiagnostic()!.canMakePayment}\nerror.name: ${getBillingDiagnostic()!.errorName}\nerror.message: ${getBillingDiagnostic()!.errorMessage}\nms to failure: ${getBillingDiagnostic()!.msToFailure}\nUA: ${getBillingDiagnostic()!.userAgent}`}
          </pre>
        )}
        {purchase.phase === "idle" && purchase.message && <p className="mt-3 text-sm text-ink-muted">{purchase.message}</p>}
        {purchase.phase === "ownership-conflict" && (
          <p className="mt-2 text-sm text-ink-muted">
            Need help? Email{" "}
            <a href={`mailto:${LEGAL.contactEmail}`} className="font-semibold text-brand underline underline-offset-2">
              {LEGAL.contactEmail}
            </a>{" "}
            from either Google account. We&rsquo;ll never show one account&rsquo;s details to the other.
          </p>
        )}

        {signedIn && (
          <a
            href={MANAGE_SUBSCRIPTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-12 items-center rounded-full bg-cream-dark px-4 text-sm font-semibold text-ink"
          >
            Manage or cancel in Google Play
          </a>
        )}
      </section>

      <section className="mt-4 text-xs leading-relaxed text-ink-muted">
        <p>
          Sorlio Premium is a monthly subscription that renews automatically until you cancel.
          {offer?.freeTrial ? ` It starts with a ${offer.freeTrial} free trial; you'll be charged when the trial ends unless you cancel before then.` : " There is no free trial."}{" "}
          Cancel any time in Google Play (Settings › Account in Sorlio links there); you keep Premium until the end of the
          period you&rsquo;ve paid for. Payment, renewal and refunds are handled by Google Play. Prices can differ by
          country; Google Play shows the exact price, including tax, before you pay.
        </p>
        <p className="mt-2">
          <Link href="/terms" className="font-semibold text-brand underline underline-offset-2">
            Terms
          </Link>{" "}
          ·{" "}
          <Link href="/privacy" className="font-semibold text-brand underline underline-offset-2">
            Privacy
          </Link>
        </p>
      </section>

      <Link href="/" className="mt-4 block min-h-12 rounded-full py-3 text-center text-sm font-semibold text-ink-muted">
        Not now — back to reading
      </Link>
    </div>
  );
}
