"use client";

import { useEffect, useState } from "react";

/**
 * Registers the service worker (production only) and keeps the installed
 * app on the latest deploy automatically.
 *
 * sw.js calls `self.skipWaiting()` + `clients.claim()` unconditionally on
 * install, so a new service worker activates and takes control silently in
 * the background — but the page's already-loaded JS/HTML doesn't change
 * until a real reload. `controllerchange` fires exactly when that handover
 * happens.
 *
 * This used to leave the actual reload up to the user (a dismissible "A new
 * version is ready" banner) — easy to miss, and browsers only lazily
 * re-check a registered service worker for updates, so an installed PWA
 * that's reopened without navigating anywhere new could sit on a stale
 * version indefinitely even across a full close-and-reopen. Two changes fix
 * both halves of that gap:
 *  1. Force an immediate update check on registration AND every time the
 *     app is foregrounded (visibilitychange -> visible) — exactly the
 *     moment "reopening the app" should mean "check for the latest",
 *     instead of waiting on the browser's own schedule.
 *  2. Once a new version takes over, reload automatically after a brief,
 *     visible "Updating…" notice rather than requiring a manual tap — a
 *     stale JS/API mismatch is a real broken-page risk, not a cosmetic
 *     inconvenience worth leaving to chance.
 */
const RELOAD_GUARD_KEY = "lire.swAutoReloaded.v1";
const AUTO_RELOAD_DELAY_MS = 1500;

export default function ServiceWorker() {
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    // The guard only protects the page that is about to reload. sessionStorage
    // survives reloads, so clear the previous page's marker now; otherwise a
    // second deployment in the same long-running PWA session never reloads.
    sessionStorage.removeItem(RELOAD_GUARD_KEY);
    const hadController = !!navigator.serviceWorker.controller;
    let registration: ServiceWorkerRegistration | null = null;

    function checkForUpdate() {
      registration?.update().catch(() => {
        // A failed manual update check just means we fall back to whatever the browser does on its own schedule.
      });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") checkForUpdate();
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registration = reg;
        checkForUpdate();
        document.addEventListener("visibilitychange", handleVisibilityChange);
      })
      .catch(() => {
        /* ignore registration errors */
      });

    function handleControllerChange() {
      // Not an update — this is just the very first activation on a fresh visit.
      if (!hadController) return;
      // One auto-reload per browser session is enough; guards against any
      // edge case where controllerchange could fire more than once.
      if (sessionStorage.getItem(RELOAD_GUARD_KEY)) return;
      sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
      setUpdating(true);
      window.setTimeout(() => window.location.reload(), AUTO_RELOAD_DELAY_MS);
    }
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (!updating) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 mx-auto flex max-w-md justify-center px-4 pt-[var(--safe-top)]">
      <div className="mt-2 flex items-center gap-3 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg">
        <span>Updating to the latest version…</span>
      </div>
    </div>
  );
}
