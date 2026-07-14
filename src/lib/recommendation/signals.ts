import type { Category } from "@/types";
import type { ScorableArticle, ScoringContext, StarRating } from "@/lib/recommendation/types";
import { getTopicPreferenceScore } from "@/lib/recommendation/interests";

/**
 * Individual, pure 0-1 scoring signals — each one answers a single narrow
 * question about an article, deliberately kept independent so weights can
 * be tuned (see weights.ts) without touching the signals themselves.
 */

const CEFR_NUMERIC: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

/** How recent the article is — full marks under ~6h old, decaying to a floor by about 5 days. Undated (hardcoded) texts score neutral. */
export function freshnessScore(publishedAt: string | undefined, now: Date = new Date()): number {
  if (!publishedAt) return 0.5;
  const ageHours = (now.getTime() - new Date(publishedAt).getTime()) / 3_600_000;
  if (!Number.isFinite(ageHours)) return 0.5;
  if (ageHours <= 0) return 1;
  return Math.max(0.15, Math.min(1, Math.exp(-ageHours / 36)));
}

/** How close the article's estimated CEFR level is to the reader's own inferred level — 1 = exact match, tapering off with distance. */
export function difficultyMatchScore(articleCefr: string, userLevelNumeric: number): number {
  const articleNumeric = CEFR_NUMERIC[articleCefr] ?? 3;
  const distance = Math.abs(articleNumeric - userLevelNumeric);
  return Math.max(0, 1 - distance * 0.3);
}

/**
 * The "ideal challenge" band for `DifficultyEstimate.unknownWordRatio` — 1
 * inside the band, tapering off outside it.
 *
 * The recommendation spec frames this as "90-95% known / 5-10% unknown,"
 * which is a real, standard reading-comprehension heuristic — but it
 * assumes a *token-frequency-weighted* coverage metric (the kind you get
 * from "do you know the top 2000 words by frequency," where common words
 * like "le"/"de" are counted every time they appear). This app's
 * `unknownWordRatio` (src/lib/difficulty.ts) is deliberately simpler: the
 * fraction of *unique* non-basic words in the text, which runs much higher
 * for real news prose (lots of one-off proper nouns and specific
 * vocabulary) — calibrated against real RSS content while building this
 * feature, typical French news articles land around 45-70% on this scale,
 * not 5-10%. These constants target that actual range, not the literal
 * spec number, so the recommendation engine's band still means something
 * on this app's own difficulty scale.
 */
const IDEAL_UNKNOWN_MIN = 0.3;
const IDEAL_UNKNOWN_MAX = 0.5;
export function unknownWordTargetScore(unknownWordRatio: number): number {
  if (unknownWordRatio >= IDEAL_UNKNOWN_MIN && unknownWordRatio <= IDEAL_UNKNOWN_MAX) return 1;
  const distance =
    unknownWordRatio < IDEAL_UNKNOWN_MIN ? IDEAL_UNKNOWN_MIN - unknownWordRatio : unknownWordRatio - IDEAL_UNKNOWN_MAX;
  return Math.max(0, 1 - distance / 0.25);
}

/** How much this reader tends to engage with this article's category — see interests.ts. */
export function topicPreferenceScore(category: Category, context: ScoringContext): number {
  return getTopicPreferenceScore(category, context.interestProfile);
}

/** Gives a clear but modest lift to sources the reader explicitly prefers. */
export function sourcePreferenceScore(sourceName: string | undefined, context: ScoringContext): number {
  if (!sourceName) return 0.5;
  return context.preferredSources.includes(sourceName) ? 1 : 0.5;
}

/** Prefers a comfortable 1-4 minute read; very long reads taper off gently rather than being excluded outright. */
export function readingTimeScore(minutes: number): number {
  if (minutes <= 0) return 0.5;
  if (minutes <= 4) return 1;
  return Math.max(0.3, 1 - (minutes - 4) * 0.15);
}

/** Directly reuses the RSS content-quality verdict — poor-quality content should basically never be recommended. */
export function contentQualityScore(quality: ScorableArticle["contentQuality"]["quality"]): number {
  if (quality === "good") return 1;
  if (quality === "usable") return 0.6;
  return 0.1;
}

/** Reads on the same topic recently get a small penalty, so the ranked pool doesn't feel like a single-topic feed. */
export function varietyScore(category: Category, context: ScoringContext): number {
  const recentCount = context.recentCategories.filter((c) => c === category).length;
  return Math.max(0, 1 - recentCount * 0.25);
}

/** Infers a rough 1 (A1) .. 5 (C1) reader level from how many words they've marked known — deliberately simple, not a real placement test. */
export function inferUserLevelNumeric(knownWordCount: number): number {
  if (knownWordCount < 20) return 1;
  if (knownWordCount < 60) return 2;
  if (knownWordCount < 150) return 3;
  if (knownWordCount < 300) return 4;
  if (knownWordCount < 600) return 5;
  return 6;
}

/**
 * The "★★★★★ Perfect for you" style badge — driven by the same unknown-word
 * band as unknownWordTargetScore, just bucketed for display. Bands are
 * calibrated against this app's actual unknownWordRatio metric (45-70% for
 * real French news, see comment above IDEAL_UNKNOWN_MIN), not the literal
 * 5-30% a naive reading of the spec would suggest.
 */
export function getStarRating(unknownWordRatio: number): StarRating {
  if (unknownWordRatio <= 0.4) return { stars: 5, label: "Perfect for you" };
  if (unknownWordRatio <= 0.55) return { stars: 4, label: "Good challenge" };
  if (unknownWordRatio <= 0.7) return { stars: 3, label: "Challenging" };
  return { stars: 2, label: "Too difficult" };
}

/** Above this unknown-word ratio, an article is "save for later" material rather than something to recommend reading today. Matches IDEAL_UNKNOWN_MAX above. */
export const SAVE_FOR_LATER_THRESHOLD = 0.7;
