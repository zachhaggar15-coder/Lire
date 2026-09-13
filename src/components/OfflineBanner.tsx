"use client";

import { useEffect, useState } from "react";

/**
 * A small top notice while the device is offline, so a failed load reads as
 * "no connection" rather than "Sorlio is broken". Says what still works.
 */
export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(navigator.onLine === false);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div role="status" className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto flex max-w-md justify-center px-4 pt-[var(--safe-top)]">
      <div className="mt-2 rounded-full bg-ink px-4 py-2 text-center text-xs font-semibold text-cream shadow-lg">
        You&apos;re offline — saved words, review and opened articles still work.
      </div>
    </div>
  );
}
