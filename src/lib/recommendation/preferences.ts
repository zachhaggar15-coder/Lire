import type { ReadingText } from "@/types";
import { nudgeTopicPreference } from "@/lib/recommendation/interests";
import { pushStore } from "@/lib/supabase/sync";

const HIDDEN_SOURCES_KEY = "lire.recommendation.hiddenSources.v1";
const SAVED_LATER_KEY = "lire.recommendation.savedLater.v1";
const PREF_EVENT = "lire-recommendation-preferences";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function notify(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(PREF_EVENT));
}

function readStringList(key: string): string[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeStringList(key: string, values: string[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(key, JSON.stringify([...new Set(values)]));
  void pushStore(key);
  notify();
}

export function subscribeToRecommendationPreferences(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PREF_EVENT, callback);
  return () => window.removeEventListener(PREF_EVENT, callback);
}

export function getHiddenSources(): string[] {
  return readStringList(HIDDEN_SOURCES_KEY);
}

export function isSourceHidden(sourceName?: string): boolean {
  return !!sourceName && getHiddenSources().includes(sourceName);
}

export function hideSource(sourceName: string): void {
  writeStringList(HIDDEN_SOURCES_KEY, [...getHiddenSources(), sourceName]);
}

export function getSavedLaterIds(): string[] {
  return readStringList(SAVED_LATER_KEY);
}

export function isSavedForLater(id: string): boolean {
  return getSavedLaterIds().includes(id);
}

export function saveForLater(id: string): void {
  writeStringList(SAVED_LATER_KEY, [...getSavedLaterIds(), id]);
}

export function removeFromSavedLater(id: string): void {
  writeStringList(
    SAVED_LATER_KEY,
    getSavedLaterIds().filter((savedId) => savedId !== id)
  );
}

export function recordArticlePreference(text: ReadingText, direction: "more" | "less"): void {
  nudgeTopicPreference(text.category, direction === "more" ? 0.18 : -0.18);
  notify();
}
