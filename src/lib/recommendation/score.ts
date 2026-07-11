import type { ScorableArticle, ScoreBreakdown, ScoredArticle, ScoringContext } from "@/lib/recommendation/types";
import {
  contentQualityScore,
  difficultyMatchScore,
  freshnessScore,
  getStarRating,
  readingTimeScore,
  sourcePreferenceScore,
  topicPreferenceScore,
  unknownWordTargetScore,
  varietyScore,
} from "@/lib/recommendation/signals";
import { SIGNAL_WEIGHTS } from "@/lib/recommendation/weights";

/** Deterministic: the same article + context always produces the same score — no randomness anywhere in this module. */
export function scoreArticle(article: ScorableArticle, context: ScoringContext): ScoreBreakdown {
  const now = context.now ?? new Date();

  const freshness = freshnessScore(article.text.publishedAt, now);
  const difficultyMatch = difficultyMatchScore(article.difficulty.cefr, context.userLevelNumeric);
  const topicPreference = topicPreferenceScore(article.text.category, context);
  const sourcePreference = sourcePreferenceScore(article.text.sourceName, context);
  const unknownWordTarget = unknownWordTargetScore(article.difficulty.unknownWordRatio);
  const readingTime = readingTimeScore(article.text.minutes);
  const contentQuality = contentQualityScore(article.contentQuality.quality);
  const variety = varietyScore(article.text.category, context);

  const total =
    freshness * SIGNAL_WEIGHTS.freshness +
    difficultyMatch * SIGNAL_WEIGHTS.difficultyMatch +
    topicPreference * SIGNAL_WEIGHTS.topicPreference +
    sourcePreference * SIGNAL_WEIGHTS.sourcePreference +
    unknownWordTarget * SIGNAL_WEIGHTS.unknownWordTarget +
    readingTime * SIGNAL_WEIGHTS.readingTime +
    contentQuality * SIGNAL_WEIGHTS.contentQuality +
    variety * SIGNAL_WEIGHTS.variety;

  return { freshness, difficultyMatch, topicPreference, sourcePreference, unknownWordTarget, readingTime, contentQuality, variety, total };
}

/** Scores and ranks a pool of articles, highest total score first. */
export function rankArticles(articles: ScorableArticle[], context: ScoringContext): ScoredArticle[] {
  return articles
    .map((article) => ({
      ...article,
      score: scoreArticle(article, context),
      starRating: getStarRating(article.difficulty.unknownWordRatio),
    }))
    .sort((a, b) => b.score.total - a.score.total);
}
