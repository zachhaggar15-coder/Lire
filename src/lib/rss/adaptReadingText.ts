import type { ReadingText } from "@/types";
import { getBuiltInTextById } from "@/lib/publicDomainBank";
import { UNRATED_PLACEHOLDER } from "@/lib/readingLevel";
import type { RssReadingText } from "@/lib/rss/rssToReadingText";
import { estimateReadingMinutes, truncateAtSentence } from "@/lib/rss/cleanContent";
import { stripSourceBoilerplate } from "@/lib/rss/sourceNoise";

const PREVIEW_LENGTH = 160;

/**
 * Settles the level of a feed item, including ones cached before levels were
 * honest: live news (`rss-` ids) carried a blanket "B1", and bundled readings
 * served as a fallback had theirs overwritten with "B1". News becomes unrated;
 * a bundled reading gets its editorial level back.
 */
export function settleFeedLevel(text: ReadingText): ReadingText {
  if (text.id.startsWith("rss-")) {
    return text.levelUnrated === true ? text : { ...text, levelUnrated: true };
  }
  if (text.sourceId === "sorlio-reading-bank") {
    const builtIn = getBuiltInTextById(text.id);
    if (builtIn && (builtIn.difficulty !== text.difficulty || text.levelUnrated !== false)) {
      return { ...text, difficulty: builtIn.difficulty, levelUnrated: false };
    }
  }
  return text;
}

/** Maps the API's RssReadingText DTO onto the app's canonical ReadingText shape. */
export function rssReadingTextToReadingText(rss: RssReadingText): ReadingText {
  const body = stripSourceBoilerplate(rss.originalText, rss.sourceName, rss.sourceUrl);
  return settleFeedLevel({
    id: rss.id,
    title: rss.title,
    category: rss.category,
    difficulty: rss.difficulty ?? UNRATED_PLACEHOLDER,
    levelUnrated: rss.difficulty === null,
    minutes: body === rss.originalText ? rss.readingTimeMinutes : estimateReadingMinutes(body),
    preview: truncateAtSentence(body, PREVIEW_LENGTH),
    blurbEn: rss.blurbEn,
    body,
    sourceName: rss.sourceName,
    sourceUrl: rss.sourceUrl,
    publishedAt: rss.publishedAt,
    retrievedAt: rss.retrievedAt,
    sourceId: rss.sourceId,
    sourceSiteUrl: rss.sourceSiteUrl,
    attributionText: rss.attributionText,
    reuseBasis: rss.reuseBasis,
    reuseTermsUrl: rss.reuseTermsUrl,
    reuseTermsCheckedAt: rss.reuseTermsCheckedAt,
    materialModifications: rss.materialModifications,
    language: rss.language,
    isShortSnippet: rss.isShortSnippet,
  });
}
