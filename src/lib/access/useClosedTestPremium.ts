"use client";

import { useEffect, useState } from "react";
import { isAndroidApp } from "@/lib/androidApp";
import { closedTestPremiumEnabled } from "@/lib/closedTestPremium";

/**
 * Resolves the server-issued TWA grant after hydration. Starting in loading
 * state avoids flashing a Premium gate while a legitimate closed tester's
 * HttpOnly cookie is being checked.
 */
export function useClosedTestPremium() {
  const enabled = closedTestPremiumEnabled();
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    let cancelled = false;
    if (!enabled) {
      setActive(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("/api/closed-test-premium/status", { cache: "no-store" })
      .then(async (response) => {
        const body = response.ok ? ((await response.json()) as { active?: unknown }) : null;
        return body?.active === true;
      })
      .then(async (alreadyActive) => {
        if (alreadyActive || !isAndroidApp()) return alreadyActive;
        const activated = await fetch("/api/closed-test-premium/activate", {
          method: "POST",
          cache: "no-store",
          headers: { "x-sorlio-twa-referrer": document.referrer },
        });
        const body = activated.ok ? ((await activated.json()) as { active?: unknown }) : null;
        return body?.active === true;
      })
      .catch(() => false)
      .then((nextActive) => {
        if (!cancelled) setActive(nextActive);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { active, loading };
}
