import type { Category, ReadingText } from "@/types";
import type { DifficultyEstimate } from "@/lib/difficulty";
import type { ContentQualityAnalysis } from "@/lib/rss/contentQuality";

/** Everything the scoring engine needs about one candidate article. Computed once per article per home-page load, then reused across every section. */
export interface ScorableArticle {
  text: ReadingText;
  difficulty: DifficultyEstimate;
  contentQuality: ContentQualityAnalysis;
}

export interface ScoreBreakdown {
  freshness: number;
  difficultyMatch: number;
  topicPreference: number;
  unknownWordTarget: number;
  readingTime: number;
  contentQuality: number;
  variety: number;
  /** Weighted sum of the above, 0-1. Higher = more recommendable right now. */
  total: number;
}

export interface ScoredArticle extends ScorableArticle {
  score: ScoreBreakdown;
  starRating: StarRating;
}

export interface StarRating {
  stars: 2 | 3 | 4 | 5;
  label: string;
}

/** -1..1 per category, read via getInterestProfile(). See src/lib/recommendation/interests.ts. */
export type InterestProfile = Record<Category, number>;

export interface ScoringContext {
  interestProfile: InterestProfile;
  /** Categories completed/opened in roughly the last week, most-recent first — drives the variety signal. */
  recentCategories: Category[];
  /** A rough 1 (A1) .. 5 (C1) estimate of the reader's own level, inferred from known-word count. */
  userLevelNumeric: number;
  now?: Date;
}
