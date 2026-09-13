import type { ThemePreference } from "@/types";

/**
 * Light/dark theme. The palette itself lives in globals.css as CSS variables
 * switched by html[data-theme="dark"]; this module only decides which theme
 * applies and stamps it on <html>.
 */

export const SETTINGS_CHANGED_EVENT = "lire:settings-changed";

/** Page background per theme — used for the browser/status-bar theme-color. Keep in sync with --c-cream in globals.css. */
export const THEME_SURFACE = { light: "#FFFCF4", dark: "#151412" } as const;

export type ResolvedTheme = keyof typeof THEME_SURFACE;

export function resolveTheme(preference: ThemePreference | undefined, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === "light" || preference === "dark") return preference;
  return systemPrefersDark ? "dark" : "light";
}

export function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches === true;
}

export function applyTheme(preference: ThemePreference | undefined): ResolvedTheme {
  const theme = resolveTheme(preference, systemPrefersDark());
  if (typeof document === "undefined") return theme;
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_SURFACE[theme]);
  return theme;
}

/**
 * Runs inline in <head> before first paint so a dark-mode user never sees a
 * flash of the light theme. Must stay dependency-free: it's serialised as a
 * string, not bundled. Mirrors resolveTheme/applyTheme above.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p="system";var raw=localStorage.getItem("lire.settings.v1");if(raw){var s=JSON.parse(raw);if(s&&(s.theme==="light"||s.theme==="dark"||s.theme==="system"))p=s.theme;}var d=p==="dark"||(p==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);var t=d?"dark":"light";document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"${THEME_SURFACE.dark}":"${THEME_SURFACE.light}");}catch(e){}})();`;
