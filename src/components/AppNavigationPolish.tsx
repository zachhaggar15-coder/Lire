"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SCROLL_KEY_PREFIX = "lire-scroll:";

/** Keeps soft navigation feeling native by restoring each screen's position. */
export default function AppNavigationPolish() {
  const pathname = usePathname();

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
