import { notifyStoreChanged } from "@/lib/sync/runtime";
import { localStore } from "@/lib/localData/store";

/**
 * Remembers the last-used Review setup (direction, words vs phrases,
 * session length) so the practice hub opens to what you actually used
 * last time instead of always resetting to defaults.
 */
export interface ReviewPreferences {
  direction: "fr-en" | "en-fr";
  mode: "words" | "phrases";
  /** Cards per sitting before stopping, or null for "review everything due." */
  sessionLength: number | null;
}

export const DEFAULT_REVIEW_PREFERENCES: ReviewPreferences = {
  direction: "fr-en",
  mode: "words",
  sessionLength: null,
};

const KEY = "lire.reviewPrefs.v1";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getReviewPreferences(): ReviewPreferences {
  if (!hasStorage()) return DEFAULT_REVIEW_PREFERENCES;
  try {
    const raw = localStore.getItem(KEY);
    if (!raw) return DEFAULT_REVIEW_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_REVIEW_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_REVIEW_PREFERENCES;
  }
}

export function saveReviewPreferences(patch: Partial<ReviewPreferences>): ReviewPreferences {
  const next = { ...getReviewPreferences(), ...patch };
  if (hasStorage()) {
    localStore.setItem(KEY, JSON.stringify(next));
    notifyStoreChanged(KEY);
  }
  return next;
}
