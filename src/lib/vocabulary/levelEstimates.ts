import type { Difficulty } from "@/types";

/**
 * Rough size of the vocabulary a reader at each level typically has. An
 * estimate for difficulty and recommendations only — never a claim that the
 * reader knows any particular word.
 */
export const LEVEL_VOCABULARY_ESTIMATES: Record<Difficulty, number> = {
  A1: 500,
  A2: 1000,
  B1: 2000,
  B2: 3500,
  C1: 5500,
  C2: 8000,
};

export function vocabularyEstimateForLevel(level: Difficulty): number {
  return LEVEL_VOCABULARY_ESTIMATES[level];
}
