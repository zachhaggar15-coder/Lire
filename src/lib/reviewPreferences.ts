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
  /** Read the French aloud when the answer is shown. Off by default so Review stays quiet. */
  speakAnswers: boolean;
}

export const DEFAULT_REVIEW_PREFERENCES: ReviewPreferences = {
  direction: "fr-en",
  mode: "words",
  // A finite sitting by default, so a large due pile never makes Review feel
  // endless. It only caps how many are asked now: the rest stay due and come
  // up in the next session. Scheduling and due dates are untouched. A reader
  // who chose "All" keeps that choice.
  sessionLength: 20,
  speakAnswers: false,
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
