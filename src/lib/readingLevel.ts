import type { Difficulty, ReadingText } from "@/types";

/**
 * Sorlio states a CEFR level only when someone assigned one: a lesson, a
 * classic extract, or a text the reader imported and levelled. Live news has
 * no editorial level, and the content-based estimator (lib/difficulty.ts) is
 * not accurate enough to stand in for one — measured against the 1,355
 * labelled built-in readings it agreed with the label 24% of the time and
 * never placed a C1 or C2 text above B1. So a news article simply has no
 * level, and everything that reads a level goes through this module.
 */

const LEVELS: Difficulty[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

/**
 * `ReadingText.difficulty` is a required field, so an unrated text still
 * carries a value there. It is never shown or compared: read levels through
 * `editorialLevel`.
 */
export const UNRATED_PLACEHOLDER: Difficulty = "B1";

/** Stored in history records (completions, lookup stats) instead of a level. */
export const UNRATED_RECORD_LEVEL = "unrated";

type LevelSource = Pick<ReadingText, "id" | "levelUnrated">;

/** True for a text with no assigned CEFR level. Older cached news (saved before the flag existed) is recognised by its id. */
export function isLevelUnrated(text: LevelSource): boolean {
  return text.levelUnrated ?? text.id.startsWith("rss-");
}

/** The text's assigned CEFR level, or null when it has none. */
export function editorialLevel(text: LevelSource & Pick<ReadingText, "difficulty">): Difficulty | null {
  return isLevelUnrated(text) ? null : text.difficulty;
}

/** The level to write into a history record. */
export function recordedLevel(text: LevelSource & Pick<ReadingText, "difficulty">): string {
  return editorialLevel(text) ?? UNRATED_RECORD_LEVEL;
}

export type LevelFit = "Easier" | "Good fit" | "Challenging" | "Hard";

/** How a levelled text compares with the reader's chosen level. Both levels are editorial, so this is a plain comparison, not an estimate. */
export function levelFit(textLevel: Difficulty, readerLevel: Difficulty): LevelFit {
  const gap = LEVELS.indexOf(textLevel) - LEVELS.indexOf(readerLevel);
  if (gap < 0) return "Easier";
  if (gap === 0) return "Good fit";
  if (gap === 1) return "Challenging";
  return "Hard";
}
