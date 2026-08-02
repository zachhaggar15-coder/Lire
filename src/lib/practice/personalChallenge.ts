import { COMFORT_MIN, COMFORT_MAX } from "@/lib/journey/state";

/**
 * Personal reading challenge (spec's "component B") — a categorical,
 * explained label, never a raw percentage. Deliberately not a new scoring
 * engine: it widens the unknownWordRatio comfort band journey/state.ts
 * already computes internally (only to pick the next lesson) into 5
 * learner-facing labels, then applies at most one bounded nudge from a
 * handful of other signals. No weighted regression, no "complicated
 * recommendation engine."
 */
export type ChallengeLabel = "Comfortable" | "Appropriate" | "Good challenge" | "Stretch" | "Likely too difficult";

const LABELS_IN_ORDER: ChallengeLabel[] = ["Comfortable", "Appropriate", "Good challenge", "Stretch", "Likely too difficult"];

/** Extends journey/state.ts's existing comfort band outward for the two extra outer labels. */
const CHALLENGE_LOW_MIN = COMFORT_MIN * 0.5;
const CHALLENGE_HIGH_MAX = COMFORT_MAX * 1.6;

export interface ChallengeInput {
  /** From difficulty.ts's DifficultyEstimate — already personalised once the reader has enough known words. */
  unknownWordRatio: number;
  /** 0-1: fraction of this text's content words already in the reader's saved-word list. */
  percentPreviouslySaved?: number;
  /** Pooled lookup rate (per 100 words) at this level from recent sessions, or null with insufficient history. */
  recentLookupRateAtLevel?: number | null;
  /** 0-1 recent practice accuracy, or null with insufficient attempts. */
  recentPracticeAccuracy?: number | null;
  /** 0-1 fraction of recent sessions at this level that were abandoned rather than completed. */
  recentAbandonRate?: number | null;
}

export interface ChallengeResult {
  label: ChallengeLabel;
  explanation: string;
}

function baseLabel(unknownWordRatio: number): ChallengeLabel {
  if (unknownWordRatio < CHALLENGE_LOW_MIN) return "Comfortable";
  if (unknownWordRatio < COMFORT_MIN) return "Appropriate";
  if (unknownWordRatio <= COMFORT_MAX) return "Good challenge";
  if (unknownWordRatio <= CHALLENGE_HIGH_MAX) return "Stretch";
  return "Likely too difficult";
}

function nudge(label: ChallengeLabel, steps: number): ChallengeLabel {
  const index = LABELS_IN_ORDER.indexOf(label);
  const nextIndex = Math.max(0, Math.min(LABELS_IN_ORDER.length - 1, index + steps));
  return LABELS_IN_ORDER[nextIndex];
}

const EXPLANATIONS: Record<ChallengeLabel, string> = {
  Comfortable: "This text is close to vocabulary you already know well.",
  Appropriate: "This text is a good match for your current reading level.",
  "Good challenge": "This text is close to your current reading level, with some unfamiliar vocabulary.",
  Stretch: "This text introduces more unfamiliar vocabulary than your recent reading.",
  "Likely too difficult": "This text looks considerably harder than what you've been reading comfortably.",
};

/**
 * Combines the core ratio-based label with at most one ordinal nudge (up or
 * down, never more than one step) from recent-performance signals — keeps
 * the whole thing simple and auditable rather than a weighted score.
 */
export function estimatePersonalChallenge(input: ChallengeInput): ChallengeResult {
  let label = baseLabel(input.unknownWordRatio);

  const highAbandon = (input.recentAbandonRate ?? 0) > 0.4;
  const strongRecentPerformance =
    (input.recentPracticeAccuracy ?? 0) >= 0.8 &&
    input.recentLookupRateAtLevel != null &&
    ratePer100WordsIsLow(input.recentLookupRateAtLevel);
  const stronglyKnownVocabulary = (input.percentPreviouslySaved ?? 0) >= 0.3;

  if (highAbandon) {
    label = nudge(label, 1);
  } else if (strongRecentPerformance || stronglyKnownVocabulary) {
    label = nudge(label, -1);
  }

  return { label, explanation: EXPLANATIONS[label] };
}

function ratePer100WordsIsLow(rate: number): boolean {
  return rate < 6;
}
