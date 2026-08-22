"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, trackOnce } from "@/lib/analytics/client";
import { markPwaInstalled, initialiseValidationVisit } from "@/lib/validation/lifecycle";
import {
  getAnalyticsConsent,
  subscribeToAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/privacy/analyticsConsent";

export default function AppLifecycleTracker() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<AnalyticsConsent | null>(null);

  useEffect(() => {
    setConsent(getAnalyticsConsent());
    return subscribeToAnalyticsConsent(setConsent);
  }, []);

  useEffect(() => {
    if (consent !== "granted") return;
    initialiseValidationVisit();

    function handleInstalled() {
      markPwaInstalled();
      trackEvent("pwa_installed", {});
    }

    window.addEventListener("appinstalled", handleInstalled);
    return () => window.removeEventListener("appinstalled", handleInstalled);
  }, [consent]);

  useEffect(() => {
    if (consent !== "granted") return;
    if (pathname === "/") trackEvent("dashboard_viewed", {});
    if (pathname === "/changelog") trackEvent("changelog_opened", {});
    trackOnce(`page:${pathname}`, "content_section_opened", { section: pathname });
  }, [consent, pathname]);

  return null;
}
