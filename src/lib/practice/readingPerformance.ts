import type { PracticeExerciseType, SessionCompletionStatus, SessionRecord } from "@/lib/sessionRecord";

/**
 * Reading performance (spec's "component C") — diagnostic component metrics,
 * deliberately not one combined score. gamification.ts's existing 0-100
 * article score is untouched and keeps driving XP/levels exactly as today;
 * this is a parallel, additive presentation for the new diagnostics screens.
 */
export interface ReadingPerformanceMetrics {
  lookupsPer100: number;
  uniqueLookupsPer100: number;
  totalLookupActions: number;
  uniqueWordsLookedUp: number;
  /** 0-1, or null if there were no lookups to compute a percentage from. */
  percentLookedUpWordsSaved: number | null;
  completionStatus: SessionCompletionStatus;
  activeReadingTimeMs: number;
  /** 0-1 accuracy per exercise type, or null where the learner hasn't attempted that type yet. */
  practiceAccuracyByType: Record<PracticeExerciseType, number | null>;
  /** A neutral fact — the UI must never present this as a penalty. */
  audioUsed: boolean;
}

/** Average accuracy across whichever exercise types the learner has actually attempted, ignoring untried types. Null if none attempted yet. */
export function averagePracticeAccuracy(performance: ReadingPerformanceMetrics): number | null {
  const values = Object.values(performance.practiceAccuracyByType).filter((v): v is number => v != null);
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function computeReadingPerformance(record: SessionRecord): ReadingPerformanceMetrics {
  const practiceAccuracyByType = Object.fromEntries(
    (Object.entries(record.practice) as [PracticeExerciseType, { attempted: number; correct: number }][]).map(
      ([kind, stats]) => [kind, stats.attempted > 0 ? stats.correct / stats.attempted : null]
    )
  ) as Record<PracticeExerciseType, number | null>;

  return {
    lookupsPer100: record.lookupsPer100,
    uniqueLookupsPer100: record.uniqueLookupsPer100,
    totalLookupActions: record.totalLookupActions,
    uniqueWordsLookedUp: record.uniqueWordsLookedUp,
    percentLookedUpWordsSaved: record.uniqueWordsLookedUp > 0 ? record.wordsSaved / record.uniqueWordsLookedUp : null,
    completionStatus: record.completionStatus,
    activeReadingTimeMs: record.activeReadingTimeMs,
    practiceAccuracyByType,
    audioUsed: record.audioUsed,
  };
}
