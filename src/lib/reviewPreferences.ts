import { pushStore } from "@/lib/supabase/sync";

/**
 * Remembers the last-used Review setup (direction, words vs phrases) so the
 * practice hub opens to what you actually used last time instead of always
 * resetting to French-to-English/words.
 */
export interface ReviewPreferences {
  direction: "fr-en" | "en-fr";
  mode: "words" | "phrases";
}

export const DEFAULT_REVIEW_PREFERENCES: ReviewPreferences = {
  direction: "fr-en",
  mode: "words",
};

const KEY = "lire.reviewPrefs.v1";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getReviewPreferences(): ReviewPreferences {
  if (!hasStorage()) return DEFAULT_REVIEW_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(KEY);
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
    window.localStorage.setItem(KEY, JSON.stringify(next));
    void pushStore(KEY);
  }
  return next;
}
