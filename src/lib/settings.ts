import type { AppSettings } from "@/types";
import { notifyStoreChanged } from "@/lib/sync/runtime";
import { SETTINGS_CHANGED_EVENT } from "@/lib/theme";
import { localStore } from "@/lib/localData/store";

/** localStorage-backed app settings (display preferences only). */

const KEY = "lire.settings.v1";

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
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
    const raw = localStore.getItem(KEY);
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
    localStore.setItem(KEY, JSON.stringify(next));
    notifyStoreChanged(KEY);
    window.dispatchEvent?.(new Event(SETTINGS_CHANGED_EVENT));
  }
  return next;
}
