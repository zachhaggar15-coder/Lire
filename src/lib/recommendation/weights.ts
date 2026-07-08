/**
 * How much each signal (src/lib/recommendation/signals.ts) contributes to
 * an article's final ranking score. This is the one file to edit to
 * retune the recommendation engine's behaviour — nothing else needs to
 * change. Weights are normalised (sum to 1) so the total score stays a
 * readable 0-1 value; score.ts does not re-normalise them for you if you
 * change these, so keep them summing to 1 when you tune.
 */
export const SIGNAL_WEIGHTS = {
  freshness: 0.15,
  difficultyMatch: 0.2,
  topicPreference: 0.2,
  unknownWordTarget: 0.2,
  readingTime: 0.1,
  contentQuality: 0.1,
  variety: 0.05,
} as const;
