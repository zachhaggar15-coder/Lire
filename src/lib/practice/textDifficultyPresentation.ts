import type { DifficultyEstimate, EstimatedCefr, LearnerLabel } from "@/lib/difficulty";

/**
 * Text difficulty (spec's "component A") is not a new estimate — difficulty.ts
 * already blends CEFR-numeric vocabulary scoring with sentence length, and
 * its label thresholds are not driven by word count alone. The only real gap
 * was presentation: showing CEFR/label, word count, and reading time as three
 * separate facts instead of implying one is derived from another (a long A1
 * text should never look like a B1 text just because it has more words).
 */
export interface DifficultyDisplay {
  cefr: EstimatedCefr;
  label: LearnerLabel;
  wordCount: number;
  minutes: number;
}

export function presentTextDifficulty(estimate: DifficultyEstimate, minutes: number): DifficultyDisplay {
  return {
    cefr: estimate.cefr,
    label: estimate.label,
    wordCount: estimate.wordCount,
    minutes,
  };
}
