import type { ScoredArticle } from "@/lib/recommendation/types";
import { SAVE_FOR_LATER_THRESHOLD } from "@/lib/recommendation/signals";

export interface RecommendationSections {
  /** The single best-scoring article right now, or null if everything is save-for-later material. */
  todaysRecommendation: ScoredArticle | null;
  /** Short (<=3 min) reads from the ranked pool. */
  quickReads: ScoredArticle[];
  /** Articles closest to the ideal 90-95% known / 5-10% unknown band. */
  goodForYou: ScoredArticle[];
  /** A bit harder than "Good for you," but not into save-for-later territory. */
  stretchYourself: ScoredArticle[];
  /** Articles with a meaningfully high new-word ratio *and* good dictionary coverage — likely to teach several real, look-up-able words. */
  newVocabulary: ScoredArticle[];
  /** The newest news-style articles, freshest first. */
  latestNews: ScoredArticle[];
  /** Far above the reader's level — surfaced separately rather than recommended for today. */
  saveForLater: ScoredArticle[];
}

const SECTION_SIZE = 4;
/** An article only counts as "quick" up to this many minutes. */
const QUICK_READ_MAX_MINUTES = 3;
/** New-vocabulary candidates need at least this much of their text resolvable in the dictionary, so the "new words" are genuinely look-up-able rather than junk/foreign text. */
const MIN_DICTIONARY_COVERAGE_FOR_VOCAB = 0.7;

/**
 * Splits one ranked pool into the home page's named sections — every
 * section reuses the same underlying scored/ranked list (just filtered and
 * re-sorted for that section's specific angle), per the recommendation
 * spec. Pure and deterministic: same input, same output.
 */
export function buildSections(ranked: ScoredArticle[]): RecommendationSections {
  const saveForLater = ranked.filter((a) => a.difficulty.unknownWordRatio > SAVE_FOR_LATER_THRESHOLD);
  const active = ranked.filter((a) => a.difficulty.unknownWordRatio <= SAVE_FOR_LATER_THRESHOLD);

  const todaysRecommendation = active[0] ?? null;

  const quickReads = active.filter((a) => a.text.minutes <= QUICK_READ_MAX_MINUTES).slice(0, SECTION_SIZE);

  // Excludes whatever's already Today's Recommendation — otherwise the top
  // overall pick (which is usually also a strong difficulty-band match)
  // shows up twice on the home page, once as the star pick and again as
  // the first "Good For You" card.
  const goodForYou = active
    .filter((a) => a.text.id !== todaysRecommendation?.text.id)
    .sort((a, b) => b.score.unknownWordTarget - a.score.unknownWordTarget)
    .slice(0, SECTION_SIZE);

  const stretchYourself = active
    .filter((a) => a.score.unknownWordTarget < 1)
    .sort((a, b) => b.difficulty.unknownWordRatio - a.difficulty.unknownWordRatio)
    .slice(0, SECTION_SIZE);

  const newVocabulary = active
    .filter((a) => a.difficulty.dictionaryCoverage >= MIN_DICTIONARY_COVERAGE_FOR_VOCAB)
    .sort((a, b) => b.difficulty.unknownWordRatio - a.difficulty.unknownWordRatio)
    .slice(0, SECTION_SIZE);

  const latestNews = active
    .filter((a) => a.text.category === "news-style")
    .sort((a, b) => new Date(b.text.publishedAt ?? 0).getTime() - new Date(a.text.publishedAt ?? 0).getTime())
    .slice(0, SECTION_SIZE);

  return { todaysRecommendation, quickReads, goodForYou, stretchYourself, newVocabulary, latestNews, saveForLater };
}
