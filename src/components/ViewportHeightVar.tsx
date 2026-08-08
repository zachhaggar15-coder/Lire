"use client";

import { useEffect } from "react";

/**
 * Some Android PWA/WebView builds compute `100dvh` taller than what's
 * actually interactively visible (the gesture/nav bar isn't subtracted),
 * so a sheet sized purely with dvh can fit its whole layout inside that
 * inflated budget — nothing overflows, so nothing scrolls — while the tail
 * of the sheet still renders behind the nav bar, unreachable. This measures
 * the real visual viewport height in JS and exposes it as --vvh, which
 * fixed-height sheets prefer over dvh via calc(var(--vvh,100dvh)-...).
 */
export default function ViewportHeightVar() {
  useEffect(() => {
    function update() {
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--vvh", `${height}px`);
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, []);

  return null;
}
