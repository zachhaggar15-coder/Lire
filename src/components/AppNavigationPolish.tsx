"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SCROLL_KEY_PREFIX = "lire-scroll:";
const PRIMARY_DESTINATIONS = new Set(["/", "/live-news", "/review", "/settings"]);

function motionBetween(currentPath: string, nextPath: string): "forward" | "back" | "crossfade" {
  if (currentPath === nextPath || (PRIMARY_DESTINATIONS.has(currentPath) && PRIMARY_DESTINATIONS.has(nextPath))) {
    return "crossfade";
  }
  if (PRIMARY_DESTINATIONS.has(nextPath)) return "back";
  return "forward";
}

/** Keeps soft navigation feeling native by restoring each screen's position. */
export default function AppNavigationPolish() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.dataset.navigationMotion = "crossfade";

    function prepareLinkMotion(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      document.documentElement.dataset.navigationMotion = anchor.closest('nav[aria-label="Primary"]')
        ? "crossfade"
        : motionBetween(window.location.pathname, url.pathname);
    }

    function prepareBackMotion() {
      document.documentElement.dataset.navigationMotion = "back";
    }

    document.addEventListener("click", prepareLinkMotion, true);
    window.addEventListener("popstate", prepareBackMotion);
    return () => {
      document.removeEventListener("click", prepareLinkMotion, true);
      window.removeEventListener("popstate", prepareBackMotion);
    };
  }, []);

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    const key = `${SCROLL_KEY_PREFIX}${pathname}`;
    const saved = Number(window.sessionStorage.getItem(key));
    const frame = window.requestAnimationFrame(() => {
      if (Number.isFinite(saved) && saved > 0) window.scrollTo({ top: saved, behavior: "auto" });
    });

    let ticking = false;
    function savePosition() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        window.sessionStorage.setItem(key, String(Math.max(0, Math.round(window.scrollY))));
        ticking = false;
      });
    }

    window.addEventListener("scroll", savePosition, { passive: true });
    window.addEventListener("pagehide", savePosition);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", savePosition);
      window.removeEventListener("pagehide", savePosition);
      window.sessionStorage.setItem(key, String(Math.max(0, Math.round(window.scrollY))));
    };
  }, [pathname]);

  return null;
}
