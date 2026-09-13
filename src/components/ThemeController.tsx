"use client";

import { useEffect } from "react";
import { getSettings } from "@/lib/settings";
import { SETTINGS_CHANGED_EVENT, applyTheme } from "@/lib/theme";

/**
 * Keeps <html data-theme> in step after the first paint: when the Theme
 * setting changes, when synced settings arrive from another device or tab,
 * and when the device switches between light and dark while set to "system".
 * The initial value is stamped earlier by THEME_INIT_SCRIPT in layout.tsx.
 */
export default function ThemeController() {
  useEffect(() => {
    const apply = () => applyTheme(getSettings().theme);
    apply();

    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    media?.addEventListener?.("change", apply);
    window.addEventListener(SETTINGS_CHANGED_EVENT, apply);
    window.addEventListener("storage", apply);
    return () => {
      media?.removeEventListener?.("change", apply);
      window.removeEventListener(SETTINGS_CHANGED_EVENT, apply);
      window.removeEventListener("storage", apply);
    };
  }, []);

  return null;
}
