"use client";

import { useCallback, useEffect, useState } from "react";
import AppBar from "@/components/AppBar";
import { getAccessToken, getCurrentUser, onAuthStateChange, signInWithGoogle } from "@/lib/supabase/auth";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";

const PLAY_BILLING_METHOD = "https://play.google.com/billing";
const PRODUCT_ID = process.env.NEXT_PUBLIC_GOOGLE_PLAY_PREMIUM_PRODUCT_ID || "sorlio_premium_monthly";

type PurchaseState = "idle" | "working" | "success" | "error";

export default function PremiumPageClient() {
  const { status, loading, refresh } = usePremiumStatus();
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);
  const [signingIn, setSigningIn] = useState(false);
  const [billingAvailable, setBillingAvailable] = useState(false);
  const [displayPrice, setDisplayPrice] = useState("£3.99");
  const [purchaseState, setPurchaseState] = useState<PurchaseState>("idle");
  const [error, setError] = useState<string | null>(null);

  const verifyPurchase = useCallback(async (purchaseToken: string): Promise<boolean> => {
    const token = await getAccessToken();
    if (!token) return false;
    const response = await fetch("/api/premium/google-play/verify", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ purchaseToken, productId: PRODUCT_ID }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) throw new Error(result.error || "The purchase could not be verified.");
    await refresh();
    return true;
  }, [refresh]);

  useEffect(() => {
    getCurrentUser().then((user) => setUserEmail(user?.email ?? null));
    return onAuthStateChange((user) => setUserEmail(user?.email ?? null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function detectBilling() {
      if (!window.getDigitalGoodsService) return;
      try {
        const service = await window.getDigitalGoodsService(PLAY_BILLING_METHOD);
        const details = await service.getDetails([PRODUCT_ID]);
        const product = details.find((item) => item.itemId === PRODUCT_ID);
        if (!cancelled) {
          setBillingAvailable(true);
          if (product) {
            setDisplayPrice(new Intl.NumberFormat(undefined, { style: "currency", currency: product.price.currency }).format(Number(product.price.value)));
          }
        }
        const existing = (await service.listPurchases()).find((purchase) => purchase.itemId === PRODUCT_ID);
        if (existing && userEmail) await verifyPurchase(existing.purchaseToken);
      } catch {
        if (!cancelled) setBillingAvailable(false);
      }
    }
    void detectBilling();
    return () => { cancelled = true; };
  // Re-check purchases after passwordless sign-in completes.
  }, [userEmail, verifyPurchase]);

  async function subscribe() {
    if (!userEmail || !window.getDigitalGoodsService) return;
    setPurchaseState("working");
    setError(null);
    try {
      const request = new PaymentRequest(
        [{ supportedMethods: PLAY_BILLING_METHOD, data: { sku: PRODUCT_ID } }],
        { total: { label: "Sorlio Premium", amount: { currency: "GBP", value: "0" } } }
      );
      const response = await request.show();
      const purchaseToken = (response.details as { purchaseToken?: string }).purchaseToken;
      if (!purchaseToken || !(await verifyPurchase(purchaseToken))) throw new Error("The purchase could not be verified.");
      await response.complete("success");
      setPurchaseState("success");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        setPurchaseState("idle");
        return;
      }
      setError(caught instanceof Error ? caught.message : "The purchase could not be completed.");
      setPurchaseState("error");
    }
  }

  async function requestSignIn() {
    setSigningIn(true);
    setError(null);
    // Returns to Premium rather than the homepage, so the purchase the reader
    // came here for is still in front of them afterwards.
    const result = await signInWithGoogle("/premium");
    if (!result.ok) {
      setSigningIn(false);
      setError(result.error);
    }
  }

  return (
    <div className="ligne-screen">
      <AppBar title="Sorlio Premium" kicker="Unlimited reading" backHref="/" backLabel="Back to lessons" />
      <section className="rounded-card bg-brand p-6 text-cream shadow-raised">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cream/75">Monthly membership</p>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-4xl font-semibold">{displayPrice}</span>
          <span className="pb-1 text-sm text-cream/80">per month</span>
        </div>
        <ul className="mt-5 space-y-2 text-sm">
          <li>✓ Unlimited articles every day</li>
          <li>✓ Full vocabulary, translation, listening and practice tools</li>
          <li>✓ Premium access follows your Sorlio account</li>
        </ul>
      </section>

      <section className="mt-4 rounded-card border border-cream-dark bg-cream-card p-5 shadow-card">
        {loading || userEmail === undefined ? (
          <p className="text-sm text-ink-muted">Checking your membership…</p>
        ) : status.isPremium ? (
          <>
            <p className="font-semibold text-brand">Premium is active</p>
            <p className="mt-1 text-sm text-ink-muted">You have unlimited access{status.expiresAt ? ` through ${new Date(status.expiresAt).toLocaleDateString()}` : ""}.</p>
            <a
              href={`https://play.google.com/store/account/subscriptions?sku=${encodeURIComponent(PRODUCT_ID)}&package=app.sorlio.reader`}
              className="mt-4 inline-flex rounded-full bg-cream-dark px-4 py-2 text-sm font-semibold text-ink"
            >
              Manage or cancel in Google Play
            </a>
          </>
        ) : !userEmail ? (
          <>
            <p className="font-semibold text-ink">Sign in before subscribing</p>
            <p className="mt-1 text-sm text-ink-muted">The free version never needs an account. Premium signs in with Google so your purchase can be restored on another device.</p>
            <div className="mt-4">
              <GoogleSignInButton onClick={requestSignIn} disabled={signingIn} busy={signingIn} />
            </div>
          </>
        ) : billingAvailable ? (
          <button type="button" onClick={subscribe} disabled={purchaseState === "working"} className="min-h-12 w-full rounded-full bg-brand px-5 py-3 font-semibold text-white disabled:opacity-60">
            {purchaseState === "working" ? "Opening Google Play…" : `Subscribe for ${displayPrice}/month`}
          </button>
        ) : (
          <>
            <p className="font-semibold text-ink">Subscribe in the Sorlio Android app</p>
            <p className="mt-1 text-sm text-ink-muted">Google Play checkout is available when Sorlio is installed from its Play testing or public track. Existing subscribers can sign in here to use Premium on the web.</p>
          </>
        )}
        {purchaseState === "success" && <p className="mt-3 text-sm font-semibold text-brand">Premium is ready.</p>}
        {error && <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p>}
      </section>

      <p className="mt-4 text-xs leading-relaxed text-ink-muted">
        The subscription automatically renews each month unless cancelled in Google Play before renewal. Cancel at any time; access continues until the end of the paid period. Price and taxes are confirmed by Google Play before purchase.
      </p>
    </div>
  );
}
