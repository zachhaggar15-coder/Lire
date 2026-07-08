import type { ReadingText } from "@/types";
import type { RssReadingText } from "@/lib/rss/rssToReadingText";
import { truncateAtSentence } from "@/lib/rss/cleanContent";

const PREVIEW_LENGTH = 160;

/** Maps the API's RssReadingText DTO onto the app's canonical ReadingText shape. */
export function rssReadingTextToReadingText(rss: RssReadingText): ReadingText {
  return {
    id: rss.id,
    title: rss.title,
    category: rss.category,
    difficulty: rss.difficulty,
    minutes: rss.readingTimeMinutes,
    preview: truncateAtSentence(rss.originalText, PREVIEW_LENGTH),
    body: rss.originalText,
    sourceName: rss.sourceName,
    sourceUrl: rss.sourceUrl,
    publishedAt: rss.publishedAt,
    language: rss.language,
  };
}
