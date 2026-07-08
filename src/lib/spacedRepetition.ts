import type { SavedWord } from "@/types";

/**
 * A simple, fixed interval ladder driven by a consecutive-correct streak —
 * not full SM-2 (no per-answer quality rating). A lightweight `ease`
 * multiplier nudges the ladder up or down based on recent results, which is
 * as much "spaced repetition algorithm" as this app needs: keep it simple
 * and robust, not academically complete.
 *
 *   1st correct in a row: +1 day
 *   2nd correct in a row: +3 days
 *   3rd correct in a row: +7 days
 *   4th correct in a row: +14 days
 *   5th+ correct in a row: +30 days
 *
 * An incorrect answer resets the streak to 0 and brings the card back
 * immediately (due again right away, so it can resurface the same day).
 */
const INTERVAL_LADDER_DAYS = [1, 3, 7, 14, 30];

const DEFAULT_EASE = 1;
const EASE_STEP_UP = 0.15;
const EASE_STEP_DOWN = 0.2;
const MIN_EASE = 0.6;
const MAX_EASE = 2;

const DAY_MS = 24 * 60 * 60 * 1000;

export type ReviewResult = "correct" | "incorrect";

export interface SpacedRepetitionUpdate {
  ease: number;
  nextReviewAt: string;
  correctCount: number;
  incorrectCount: number;
  lastReviewResult: ReviewResult;
}

/** Fills in defaults for a word that hasn't been through the SRS fields yet — used by storage.ts's migration. */
export function defaultSpacedRepetitionFields(): Required<
  Pick<SavedWord, "ease" | "nextReviewAt" | "correctCount" | "incorrectCount" | "lastReviewResult">
> {
  return { ease: DEFAULT_EASE, nextReviewAt: null, correctCount: 0, incorrectCount: 0, lastReviewResult: null };
}

/** True if a word is a brand-new card that's never been reviewed yet. */
export function isNewCard(word: SavedWord): boolean {
  return (word.reviewCount ?? 0) === 0;
}

/** True if a word is due for review right now (new cards are always due). */
export function isDue(word: SavedWord, now: number = Date.now()): boolean {
  if (word.status === "known") return false;
  if (!word.nextReviewAt) return true;
  return new Date(word.nextReviewAt).getTime() <= now;
}

/**
 * Computes the next scheduling state after an answer. Does not touch
 * `reviewCount`/`lastReviewedAt` — storage.ts's recordReviewResult bumps
 * those the same way it always has, alongside this.
 */
export function computeNextSchedule(word: SavedWord, result: ReviewResult, now: Date = new Date()): SpacedRepetitionUpdate {
  const currentEase = word.ease ?? DEFAULT_EASE;

  if (result === "incorrect") {
    return {
      ease: Math.max(MIN_EASE, currentEase - EASE_STEP_DOWN),
      nextReviewAt: now.toISOString(),
      correctCount: 0,
      incorrectCount: (word.incorrectCount ?? 0) + 1,
      lastReviewResult: "incorrect",
    };
  }

  const correctCount = (word.correctCount ?? 0) + 1;
  const ease = Math.min(MAX_EASE, currentEase + EASE_STEP_UP);
  const ladderIndex = Math.min(correctCount, INTERVAL_LADDER_DAYS.length) - 1;
  const baseDays = INTERVAL_LADDER_DAYS[ladderIndex];
  const days = Math.max(1, Math.round(baseDays * ease));

  return {
    ease,
    nextReviewAt: new Date(now.getTime() + days * DAY_MS).toISOString(),
    correctCount,
    incorrectCount: word.incorrectCount ?? 0,
    lastReviewResult: "correct",
  };
}

export interface ReviewStats {
  dueToday: number;
  newWords: number;
  notDueYet: number;
  totalLearning: number;
}

/** Counts for the Review page's header — only ever considers learning/unsure words, never known ones. */
export function getReviewStats(words: SavedWord[], now: number = Date.now()): ReviewStats {
  const reviewable = words.filter((w) => w.status === "learning" || w.status === "unsure");
  let dueToday = 0;
  let newWords = 0;
  let notDueYet = 0;

  for (const word of reviewable) {
    if (isNewCard(word)) {
      newWords++;
    } else if (isDue(word, now)) {
      dueToday++;
    } else {
      notDueYet++;
    }
  }

  return { dueToday, newWords, notDueYet, totalLearning: reviewable.length };
}

/**
 * Builds today's review queue: every due-or-new learning/unsure word,
 * ordered by priority — due reviews before brand-new cards, most overdue
 * first, then unsure before learning, then least-reviewed, then most
 * recently saved. Not over-engineered: a single sort pass, no per-card
 * quality weighting beyond what the ladder already captures.
 */
export function buildReviewQueue(words: SavedWord[], now: number = Date.now()): SavedWord[] {
  return words
    .filter((w) => (w.status === "learning" || w.status === "unsure") && isDue(w, now))
    .sort((a, b) => {
      const aNew = isNewCard(a);
      const bNew = isNewCard(b);
      if (aNew !== bNew) return aNew ? 1 : -1;

      const aOverdue = a.nextReviewAt ? now - new Date(a.nextReviewAt).getTime() : 0;
      const bOverdue = b.nextReviewAt ? now - new Date(b.nextReviewAt).getTime() : 0;
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;

      if (a.status !== b.status) return a.status === "unsure" ? -1 : 1;

      const aReviewCount = a.reviewCount ?? 0;
      const bReviewCount = b.reviewCount ?? 0;
      if (aReviewCount !== bReviewCount) return aReviewCount - bReviewCount;

      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    });
}
