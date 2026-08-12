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
      const viewport = window.visualViewport;
      const height = viewport?.height ?? window.innerHeight;
      const offsetTop = viewport?.offsetTop ?? 0;
      const keyboardInset = Math.max(0, window.innerHeight - height - offsetTop);
      document.documentElement.style.setProperty("--vvh", `${height}px`);
      document.documentElement.style.setProperty("--visual-offset-top", `${offsetTop}px`);
      document.documentElement.style.setProperty("--keyboard-inset", `${keyboardInset}px`);
      document.documentElement.classList.toggle("keyboard-open", keyboardInset > 120);
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
      document.documentElement.classList.remove("keyboard-open");
      document.documentElement.style.removeProperty("--vvh");
      document.documentElement.style.removeProperty("--visual-offset-top");
      document.documentElement.style.removeProperty("--keyboard-inset");
    };
  }, []);

  return null;
}
