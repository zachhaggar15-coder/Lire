import { getArchive } from "@/lib/archive";
import { getArticleCompletions } from "@/lib/gamification";
import { getCurrentStreak } from "@/lib/habit";
import { getSelectedReadingLevel } from "@/lib/onboarding";
import { getAllProgress } from "@/lib/progress";
import { getSavedWords } from "@/lib/storage";
import { getValidationState } from "@/lib/validation/state";
import { getReviewStats } from "@/lib/spacedRepetition";
import { isStandalonePwa } from "@/lib/analytics/identity";

export interface ValidationBehaviourContext {
  anonymousId: string | null;
  firstSeenAt: string | null;
  isReturningUser: boolean;
  pwaInstalled: boolean;
  articlesStarted: number;
  articlesCompleted: number;
  readingSessionsCompleted: number;
  wordsSaved: number;
  reviewsCompleted: number;
  currentStreak: number;
  frenchLevel: string | null;
  firstTouchSource: string | null;
  firstTouchMedium: string | null;
  firstTouchCampaign: string | null;
  latestTouchSource: string | null;
  acquisitionSource: string | null;
}

export function buildValidationBehaviourContext(): ValidationBehaviourContext {
  const state = getValidationState();
  const progress = getAllProgress();
  const words = getSavedWords();
  const archive = getArchive();
  const reviewStats = getReviewStats(words);
  const completions = getArticleCompletions();
  const completedCount = Math.max(archive.length, completions.length, state.completedArticleCount);
  return {
    anonymousId: state.anonymousId,
    firstSeenAt: state.firstSeenAt,
    isReturningUser: state.activeDates.length > 1 || state.returnVisitCount > 0,
    pwaInstalled: isStandalonePwa() || state.pwaInstalled === true,
    articlesStarted: Object.values(progress).filter((item) => item.openedAt).length,
    articlesCompleted: completedCount,
    readingSessionsCompleted: state.readingSessionsCompleted,
    wordsSaved: words.filter((word) => word.status !== "known").length,
    reviewsCompleted: words.reduce((sum, word) => sum + (word.reviewCount ?? 0), 0) + reviewStats.dueToday * 0,
    currentStreak: getCurrentStreak(),
    frenchLevel: getSelectedReadingLevel(),
    firstTouchSource: state.firstTouch?.source ?? null,
    firstTouchMedium: state.firstTouch?.medium ?? null,
    firstTouchCampaign: state.firstTouch?.campaign ?? null,
    latestTouchSource: state.latestTouch?.source ?? null,
    acquisitionSource: state.firstTouch?.source ?? state.latestTouch?.source ?? null,
  };
}
