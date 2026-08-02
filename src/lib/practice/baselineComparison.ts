import type { SessionRecord } from "@/lib/sessionRecord";
import { ratePer100Words } from "@/lib/sessionRecord";

/**
 * Personal-baseline / trend comparisons for the reading-independence
 * diagnostics. Only personal-average comparisons are implemented — no
 * cohort/other-learner data exists anywhere in this app, so `baselineSource`
 * never produces "cohort" today. The discriminant is typed now so a future
 * cohort feature could add it without a breaking change to any consumer.
 *
 * All thresholds live here, centralised, rather than scattered as magic
 * numbers across UI components.
 */
export const BASELINE_THRESHOLDS = {
  /** Spec's "3-5 completed texts" minimum before showing a trend/comparison — matches lookupStats.ts's existing MIN_SAMPLE_FOR_AVERAGE for consistency. */
  minimumSampleForTrend: 3,
  /** ±10% starting point — an explicit product threshold, not a scientific one. */
  toleranceBandPercent: 0.1,
  /** Below this word count, lookup rates are too noisy for a comparison claim to be meaningful. */
  shortTextWordFloor: 150,
};

export type TrendLabel = "Improving" | "Stable" | "Increasing support needed" | "Not enough data";
export type BaselineSource = "personal" | "levelBand" | "cohort";

export interface RollingLookupRate {
  windowSize: 5 | 10 | "all-time";
  /** Pooled rate (sum of lookups / sum of words across the window), same formula as lookupStats.ts's summarizeLookupRate. Null when the window has no records. */
  rate: number | null;
  sampleSize: number;
}

export interface BaselineComparison {
  baselineSource: BaselineSource;
  baselineRate: number | null;
  currentRate: number;
  toleranceBand: "below" | "within" | "above" | null;
  trend: TrendLabel;
  sampleSize: number;
  minimumSampleMet: boolean;
}

function completedSortedByRecency(records: SessionRecord[]): SessionRecord[] {
  return records
    .filter((r) => r.completionStatus === "completed" && r.completedAt)
    .sort((a, b) => (a.completedAt! < b.completedAt! ? 1 : -1));
}

function pooledRate(records: SessionRecord[]): number | null {
  if (records.length === 0) return null;
  const totalLookups = records.reduce((sum, r) => sum + r.totalLookupActions, 0);
  const totalWords = records.reduce((sum, r) => sum + r.wordCount, 0);
  return ratePer100Words(totalLookups, totalWords);
}

export function computeRollingLookupRate(records: SessionRecord[], windowSize: 5 | 10 | "all-time"): RollingLookupRate {
  const sorted = completedSortedByRecency(records);
  const window = windowSize === "all-time" ? sorted : sorted.slice(0, windowSize);
  return { windowSize, rate: pooledRate(window), sampleSize: window.length };
}

function toleranceBandFor(current: number, baseline: number): "below" | "within" | "above" {
  const lowerBound = baseline * (1 - BASELINE_THRESHOLDS.toleranceBandPercent);
  const upperBound = baseline * (1 + BASELINE_THRESHOLDS.toleranceBandPercent);
  // Lower lookup rate = more independent reading, so "below" the baseline rate is the favourable direction.
  if (current < lowerBound) return "below";
  if (current > upperBound) return "above";
  return "within";
}

/** Exposed directly for the progress page's overall trend (not tied to one specific reading's comparison). */
export function computeTrend(history: SessionRecord[]): TrendLabel {
  const sorted = completedSortedByRecency(history);
  const recentWindow = sorted.slice(0, 5);
  const priorWindow = sorted.slice(5, 10);
  if (recentWindow.length < BASELINE_THRESHOLDS.minimumSampleForTrend || priorWindow.length === 0) {
    return "Not enough data";
  }
  const recentRate = pooledRate(recentWindow);
  const priorRate = pooledRate(priorWindow);
  if (recentRate == null || priorRate == null || priorRate === 0) return "Not enough data";
  const band = toleranceBandFor(recentRate, priorRate);
  if (band === "below") return "Improving";
  if (band === "above") return "Increasing support needed";
  return "Stable";
}

function compareToHistory(current: SessionRecord, history: SessionRecord[], baselineSource: BaselineSource): BaselineComparison {
  const priorSessions = completedSortedByRecency(history.filter((r) => r.textId !== current.textId)).slice(0, 10);
  const baselineRate = pooledRate(priorSessions);
  const shortText = current.wordCount < BASELINE_THRESHOLDS.shortTextWordFloor;
  const minimumSampleMet = !shortText && priorSessions.length >= BASELINE_THRESHOLDS.minimumSampleForTrend;

  return {
    baselineSource,
    baselineRate,
    currentRate: current.lookupsPer100,
    toleranceBand: minimumSampleMet && baselineRate != null ? toleranceBandFor(current.lookupsPer100, baselineRate) : null,
    trend: computeTrend(priorSessions),
    sampleSize: priorSessions.length,
    minimumSampleMet,
  };
}

/** Compares against the learner's own recent history, any level (spec's default/mandatory comparison). */
export function compareToPersonalBaseline(current: SessionRecord, history: SessionRecord[]): BaselineComparison {
  return compareToHistory(current, history, "personal");
}

/** Compares against the learner's own recent history at the same estimated CEFR band. */
export function compareToLevelBand(current: SessionRecord, sameLevelHistory: SessionRecord[]): BaselineComparison {
  return compareToHistory(current, sameLevelHistory, "levelBand");
}

/**
 * Short learner-facing comparison line. Only ever says "your average" — no
 * cohort/other-learner wording exists anywhere, since baselineSource never
 * actually produces "cohort" today (see the module doc comment above).
 */
export function formatBaselineComparisonLabel(comparison: BaselineComparison, levelLabel?: string): string {
  if (!comparison.minimumSampleMet || comparison.toleranceBand == null) {
    return "Not enough data yet to compare.";
  }
  const suffix = comparison.baselineSource === "levelBand" && levelLabel ? ` for ${levelLabel} texts` : "";
  if (comparison.toleranceBand === "below") return `Below your average${suffix}.`;
  if (comparison.toleranceBand === "above") return `Above your average${suffix}.`;
  return `Around your average${suffix}.`;
}
