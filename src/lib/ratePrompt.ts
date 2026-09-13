/**
 * When to invite a learner to rate Sorlio on Google Play.
 *
 * Deliberately no "Are you enjoying Sorlio?" question first: Google Play's
 * review guidelines forbid filtering who is sent to the store by sentiment.
 * The card offers "Rate on Google Play" and "Send feedback" side by side to
 * everyone who qualifies.
 */

export const RATE_PROMPT_KEY = "lire.ratePrompt.v1";
export const LESSONS_BEFORE_RATE_PROMPT = 3;
export const DAYS_BETWEEN_RATE_PROMPTS = 60;

export interface RatePromptState {
  lessonsCompleted: number;
  lastShownAt: string | null;
  ratedAt: string | null;
}

const EMPTY: RatePromptState = { lessonsCompleted: 0, lastShownAt: null, ratedAt: null };

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getRatePromptState(): RatePromptState {
  if (!hasStorage()) return EMPTY;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RATE_PROMPT_KEY) ?? "null");
    if (!parsed || typeof parsed !== "object") return EMPTY;
    return {
      lessonsCompleted: typeof parsed.lessonsCompleted === "number" ? parsed.lessonsCompleted : 0,
      lastShownAt: typeof parsed.lastShownAt === "string" ? parsed.lastShownAt : null,
      ratedAt: typeof parsed.ratedAt === "string" ? parsed.ratedAt : null,
    };
  } catch {
    return EMPTY;
  }
}

function save(state: RatePromptState): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(RATE_PROMPT_KEY, JSON.stringify(state));
  } catch {
    // Best-effort — worst case the prompt timing resets.
  }
}

/** Pure eligibility rule, kept separate from storage so it can be tested directly. */
export function isEligibleForRatePrompt(state: RatePromptState, isAndroidApp: boolean, now: Date = new Date()): boolean {
  if (!isAndroidApp) return false;
  if (state.ratedAt) return false;
  if (state.lessonsCompleted < LESSONS_BEFORE_RATE_PROMPT) return false;
  if (!state.lastShownAt) return true;
  const daysSinceShown = (now.getTime() - new Date(state.lastShownAt).getTime()) / (24 * 60 * 60 * 1000);
  return daysSinceShown >= DAYS_BETWEEN_RATE_PROMPTS;
}

export function recordLessonCompletedForRating(): RatePromptState {
  const next = { ...getRatePromptState() };
  next.lessonsCompleted += 1;
  save(next);
  return next;
}

export function markRatePromptShown(now: Date = new Date()): void {
  save({ ...getRatePromptState(), lastShownAt: now.toISOString() });
}

export function markRated(now: Date = new Date()): void {
  save({ ...getRatePromptState(), ratedAt: now.toISOString() });
}
