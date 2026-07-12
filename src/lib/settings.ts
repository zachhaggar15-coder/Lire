import type { AppSettings } from "@/types";
import { pushStore } from "@/lib/supabase/sync";

/** localStorage-backed app settings (display preferences only). */

const KEY = "lire.settings.v1";

export const DEFAULT_SETTINGS: AppSettings = {
  showSavedHighlights: true,
  showKnownWordStyling: true,
  fontSize: "medium",
  speechRate: 1,
  speechVoiceURI: null,
  translationMode: "natural",
  aiTranslationEnabled: true,
};

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getSettings(): AppSettings {
  if (!hasStorage()) return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(patch: Partial<AppSettings>): AppSettings {
  const next = { ...getSettings(), ...patch };
  if (hasStorage()) {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    void pushStore(KEY);
  }
  return next;
}
