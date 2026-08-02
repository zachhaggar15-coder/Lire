import type { ChallengeResult } from "@/lib/practice/personalChallenge";
import { averagePracticeAccuracy, type ReadingPerformanceMetrics } from "@/lib/practice/readingPerformance";
import type { BaselineComparison } from "@/lib/practice/baselineComparison";

/**
 * Single shared source of diagnostic copy — consumed identically by the
 * lesson-completion screen and the progress page, so the two screens can
 * never say contradictory things about the same reading (e.g. "comfortable"
 * here, "likely too difficult" there). Branch order matters: the one branch
 * that can call a text too difficult is gated on the personal-challenge
 * label already agreeing it was a Stretch/Likely-too-difficult text, so a
 * "Comfortable"-labelled text can never also be told it was too hard.
 */
export interface DiagnosticContext {
  challenge: ChallengeResult;
  performance: ReadingPerformanceMetrics;
  baseline: BaselineComparison;
}

export interface DiagnosticMessage {
  headline: string;
  detail: string | null;
}

const RECURRING_WORDS_MIN_ACTIONS = 4;
const RECURRING_WORDS_UNIQUE_RATIO = 0.5;
const BROAD_VOCABULARY_UNIQUE_LOOKUPS_PER_100 = 8;

export function selectDiagnosticMessage(ctx: DiagnosticContext): DiagnosticMessage {
  const { challenge, performance, baseline } = ctx;
  const accuracy = averagePracticeAccuracy(performance);
  const lowAccuracy = accuracy != null && accuracy < 0.6;
  const highAccuracy = accuracy != null && accuracy >= 0.8;
  const aboveBaseline = baseline.toleranceBand === "above";
  const belowBaseline = baseline.toleranceBand === "below";
  const challengeIsHard = challenge.label === "Stretch" || challenge.label === "Likely too difficult";

  if (aboveBaseline && lowAccuracy && challengeIsHard) {
    return { headline: "This text may currently be above your comfortable reading level.", detail: challenge.explanation };
  }
  if (belowBaseline && highAccuracy) {
    return { headline: "You understood this text with little support.", detail: null };
  }
  if (belowBaseline && lowAccuracy) {
    return { headline: "You recognised most vocabulary, but some sentence meanings may need another pass.", detail: null };
  }
  if (aboveBaseline && highAccuracy) {
    return {
      headline: "This text introduced a lot of new vocabulary, but your overall comprehension remained strong.",
      detail: null,
    };
  }
  if (performance.totalLookupActions >= RECURRING_WORDS_MIN_ACTIONS && performance.uniqueWordsLookedUp <= performance.totalLookupActions * RECURRING_WORDS_UNIQUE_RATIO) {
    return { headline: "Most of your support came from a small number of recurring words.", detail: null };
  }
  if (performance.uniqueLookupsPer100 >= BROAD_VOCABULARY_UNIQUE_LOOKUPS_PER_100) {
    return { headline: "This text contained a broad range of unfamiliar vocabulary.", detail: null };
  }
  if (!baseline.minimumSampleMet) {
    return { headline: "Not enough data yet to compare this reading with your usual pace.", detail: challenge.explanation };
  }
  return { headline: "Independent reading.", detail: challenge.explanation };
}
