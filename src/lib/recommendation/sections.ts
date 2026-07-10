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
  /** Deliberately short (below the normal content-quality bar) texts — quick, low-commitment reading practice. Never overlaps the other sections, since normal sections exclude short snippets entirely. */
  shortSnippets: ScoredArticle[];
  /** Far above the reader's level — surfaced separately rather than recommended for today. */
  saveForLater: ScoredArticle[];
}

const SECTION_SIZE = 4;
/** An article only counts as "quick" up to this many minutes. */
const QUICK_READ_MAX_MINUTES = 3;
/** New-vocabulary candidates need at least this much of their text resolvable in the dictionary, so the "new words" are genuinely look-up-able rather than junk/foreign text. */
const MIN_DICTIONARY_COVERAGE_FOR_VOCAB = 0.7;
/** Short Snippets gets a bigger allowance than the other sections — it's the whole point of the section, not a side dish. */
const SHORT_SNIPPET_SECTION_SIZE = 8;

/**
 * Claims articles into a section in priority order, skipping any id another
 * (earlier) section already claimed — see buildSections. This is what
 * guarantees an article never appears twice across the home page: once
 * picked for "Today's Recommendation," it's no longer eligible for "Good
 * For You," "Quick Reads," etc., even though each section is filtered from
 * the same underlying ranked pool.
 */
function take(list: ScoredArticle[], usedIds: Set<string>, limit: number): ScoredArticle[] {
  const picked: ScoredArticle[] = [];
  for (const article of list) {
    if (picked.length >= limit) break;
    if (usedIds.has(article.text.id)) continue;
    picked.push(article);
    usedIds.add(article.text.id);
  }
  return picked;
}

/**
 * Splits one ranked pool into the home page's named sections — every
 * section reuses the same underlying scored/ranked list (just filtered and
 * re-sorted for that section's specific angle), per the recommendation
 * spec. Pure and deterministic: same input, same output.
 *
 * Sections are populated in a fixed priority order (Today's Recommendation
 * first, then Good For You, Quick Reads, Stretch Yourself, New Vocabulary,
 * Latest News) and every section after the first excludes any article a
 * higher-priority section already claimed, so the same article is never
 * shown twice on the home page.
 */
export function buildSections(ranked: ScoredArticle[]): RecommendationSections {
  // Short snippets are a different kind of content entirely (deliberately
  // below the normal length bar) — kept out of every other section's pool
  // so a 30-word snippet never gets recommended as "Good For You" material,
  // and given their own section instead.
  const shortSnippetPool = ranked.filter((a) => a.text.isShortSnippet);
  const withoutSnippets = ranked.filter((a) => !a.text.isShortSnippet);

  const saveForLater = withoutSnippets.filter((a) => a.difficulty.unknownWordRatio > SAVE_FOR_LATER_THRESHOLD);
  const active = withoutSnippets.filter((a) => a.difficulty.unknownWordRatio <= SAVE_FOR_LATER_THRESHOLD);

  const usedIds = new Set<string>();

  const todaysRecommendation = take(active, usedIds, 1)[0] ?? null;

  const goodForYou = take(
    [...active].sort((a, b) => b.score.unknownWordTarget - a.score.unknownWordTarget),
    usedIds,
    SECTION_SIZE
  );

  const quickReads = take(
    active.filter((a) => a.text.minutes <= QUICK_READ_MAX_MINUTES),
    usedIds,
    SECTION_SIZE
  );

  const stretchYourself = take(
    [...active]
      .filter((a) => a.score.unknownWordTarget < 1)
      .sort((a, b) => b.difficulty.unknownWordRatio - a.difficulty.unknownWordRatio),
    usedIds,
    SECTION_SIZE
  );

  const newVocabulary = take(
    [...active]
      .filter((a) => a.difficulty.dictionaryCoverage >= MIN_DICTIONARY_COVERAGE_FOR_VOCAB)
      .sort((a, b) => b.difficulty.unknownWordRatio - a.difficulty.unknownWordRatio),
    usedIds,
    SECTION_SIZE
  );

  const latestNews = take(
    [...active]
      .filter((a) => a.text.category === "news-style")
      .sort((a, b) => new Date(b.text.publishedAt ?? 0).getTime() - new Date(a.text.publishedAt ?? 0).getTime()),
    usedIds,
    SECTION_SIZE
  );

  const shortSnippets = shortSnippetPool.slice(0, SHORT_SNIPPET_SECTION_SIZE);

  return {
    todaysRecommendation,
    quickReads,
    goodForYou,
    stretchYourself,
    newVocabulary,
    latestNews,
    shortSnippets,
    saveForLater,
  };
}
