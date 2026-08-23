"use client";

import { usePathname } from "next/navigation";
import AccessPrompt from "@/components/AccessPrompt";
import RouteLoading from "@/components/RouteLoading";
import { canUsePremiumFeature } from "@/lib/access/accessModel";
import { useAccess } from "@/lib/access/useAccess";
import type { PremiumFeature } from "@/lib/access/limits";

/**
 * Wraps a whole route that requires Premium.
 *
 * One wrapper rather than a check inside each page, so a new Premium screen
 * cannot ship half-gated, and so every one of them explains itself the same
 * way.
 *
 * Renders the loading skeleton until entitlement is known. Showing the paywall
 * in that window would flash it at a paying subscriber on every cold start,
 * which is worse than a moment of skeleton.
 */
export default function PremiumRouteGate({
  feature,
  children,
  loadingVariant,
}: {
  feature: PremiumFeature;
  children: React.ReactNode;
  loadingVariant?: React.ComponentProps<typeof RouteLoading>["variant"];
}) {
  const { context, ready, tier } = useAccess();
  const pathname = usePathname();

  if (!ready) return <RouteLoading variant={loadingVariant} />;

  const decision = canUsePremiumFeature(context, feature);
  if (decision.allowed) return <>{children}</>;

  return (
    <div className="ligne-screen flex min-h-[70dvh] items-center">
      <div className="w-full">
        <AccessPrompt
          reason="needs-premium"
          blocked={feature}
          isGuest={tier === "guest"}
          // Back to the feature they wanted, so buying Premium returns them to
          // it rather than to the homepage.
          returnPath={pathname ?? "/"}
        />
      </div>
    </div>
  );
}
