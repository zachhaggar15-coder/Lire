"use client";

import Link from "next/link";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";
import { MANAGE_SUBSCRIPTION_URL } from "@/lib/premium/types";

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const time = Date.parse(iso);
  return Number.isFinite(time) ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(time)) : null;
}

/**
 * Subscription status in Settings › Account, with Google Play's Subscription
 * Center one tap away — the in-app cancellation route Play's Subscriptions
 * policy asks for. Shown to every signed-in account, subscribed or not, so a
 * subscriber never has to hunt for it.
 */
export default function SubscriptionSummary() {
  const { status, loading } = usePremiumStatus();
  const expiry = formatDate(status.expiresAt);

  let title = "Free plan";
  let detail = "Reading, news, listening, review and grammar are free. Premium adds unlimited saving and AI help.";
  if (loading) {
    title = "Subscription";
    detail = "Checking…";
  } else if (status.isPremium && status.status === "cancelled") {
    title = "Premium — cancelled";
    detail = `You keep Premium until ${expiry ?? "the end of your paid period"}. It won't renew.`;
  } else if (status.isPremium && status.status === "grace_period") {
    title = "Premium — payment problem";
    detail = "Google Play couldn't take your last payment. Update your payment method in Google Play to keep Premium.";
  } else if (status.isPremium) {
    title = "Premium";
    detail = expiry ? `Renews automatically on ${expiry}. Cancel any time in Google Play.` : "Renews automatically each month. Cancel any time in Google Play.";
  } else if (status.status === "pending") {
    title = "Premium — payment pending";
    detail = "Premium starts when Google Play confirms your payment.";
  } else if (status.status === "on_hold" || status.status === "paused") {
    title = status.status === "on_hold" ? "Premium — on hold" : "Premium — paused";
    detail = status.status === "on_hold" ? "Fix your payment method in Google Play to restart Premium." : "Premium resumes when the pause ends.";
  }

  if (!loading && status.fromDeviceCache) {
    detail = `${detail} You're offline: Premium features return when Sorlio can check your subscription again.`;
  }

  return (
    <div className="mt-4 border-t border-cream-fill pt-3" aria-live="polite">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{detail}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <a
          href={MANAGE_SUBSCRIPTION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-full bg-cream-dark px-4 text-sm font-semibold text-ink"
        >
          Manage or cancel subscription
        </a>
        {!status.isPremium && !loading && (
          <Link href="/premium" className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-brand underline underline-offset-2">
            About Premium
          </Link>
        )}
      </div>
    </div>
  );
}
