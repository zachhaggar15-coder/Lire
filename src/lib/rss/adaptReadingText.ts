import type { ReadingText } from "@/types";
import type { RssReadingText } from "@/lib/rss/rssToReadingText";
import { estimateReadingMinutes, truncateAtSentence } from "@/lib/rss/cleanContent";
import { stripSourceBoilerplate } from "@/lib/rss/sourceNoise";

const PREVIEW_LENGTH = 160;

/** Maps the API's RssReadingText DTO onto the app's canonical ReadingText shape. */
export function rssReadingTextToReadingText(rss: RssReadingText): ReadingText {
  const body = stripSourceBoilerplate(rss.originalText, rss.sourceName, rss.sourceUrl);
  return {
    id: rss.id,
    title: rss.title,
    category: rss.category,
    difficulty: rss.difficulty,
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
  };
}
