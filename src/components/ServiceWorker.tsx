"use client";

import { useEffect, useState } from "react";

/**
 * Registers the service worker (production only) for installability, and
 * watches for a new version taking over control of this tab.
 *
 * sw.js calls `self.skipWaiting()` + `clients.claim()` unconditionally on
 * install, so a new service worker activates and takes control silently in
 * the background — but the page's already-loaded JS/HTML doesn't change
 * until a real reload. `controllerchange` fires exactly when that handover
 * happens; we only treat it as "an update landed" if this tab already had a
 * controller before (i.e. this isn't just the very first activation on a
 * fresh visit), so returning users get a nudge instead of silently running
 * stale code after a deploy.
 */
export default function ServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    const hadController = !!navigator.serviceWorker.controller;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* ignore registration errors */
    });

    function handleControllerChange() {
      if (hadController) setUpdateAvailable(true);
    }
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 mx-auto flex max-w-md justify-center px-4 pt-[var(--safe-top)]">
      <div className="mt-2 flex items-center gap-3 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg">
        <span>A new version is ready.</span>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-white/20 px-3 py-1 font-semibold active:scale-95"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
