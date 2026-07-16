"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, trackOnce } from "@/lib/analytics/client";
import { markPwaInstalled, initialiseValidationVisit } from "@/lib/validation/lifecycle";

export default function AppLifecycleTracker() {
  const pathname = usePathname();

  useEffect(() => {
    initialiseValidationVisit();

    function handleInstalled() {
      markPwaInstalled();
      trackEvent("pwa_installed", {});
    }

    window.addEventListener("appinstalled", handleInstalled);
    return () => window.removeEventListener("appinstalled", handleInstalled);
  }, []);

  useEffect(() => {
    if (pathname === "/") trackEvent("dashboard_viewed", {});
    if (pathname === "/changelog") trackEvent("changelog_opened", {});
    trackOnce(`page:${pathname}`, "content_section_opened", { section: pathname });
  }, [pathname]);

  return null;
}
