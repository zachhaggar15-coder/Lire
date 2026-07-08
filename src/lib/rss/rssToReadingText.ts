import type { Category } from "@/types";
import type { RssSource } from "@/data/rssSources";
import type { RssItem } from "@/lib/rss/parseRss";
import {
  cleanRssText,
  estimateReadingMinutes,
  hasBrokenTemplateSyntax,
  isTextLongEnough,
  looksLikeBoilerplate,
  truncateAtSentence,
} from "@/lib/rss/cleanContent";
import { hashString } from "@/lib/hash";

/** The exact shape returned by GET /api/rss-texts. */
export interface RssReadingText {
  id: string;
  title: string;
  category: Category;
  difficulty: "B1";
  readingTimeMinutes: number;
  /** The source feed's declared language — see RssSource.language. */
  language: "fr" | "en" | "mixed";
  originalText: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
}

const MAX_BODY_LENGTH = 1200;

function parsePublishedAt(pubDate: string | null): string {
  if (pubDate) {
    const parsed = new Date(pubDate);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return new Date().toISOString();
}

/** Maps a feed's own <category> text to one of our fixed categories, falling back to the source default. */
function mapToKnownCategory(rawCategories: string[], fallback: Category): Category {
  const joined = rawCategories.join(" ").toLowerCase();
  if (/sport|football|rugby|tennis|olymp/.test(joined)) return "sport";
  if (/sciences?|tech|numérique|numerique|jeux vid|intelligence artificielle/.test(joined)) return "science";
  if (/culture|cinéma|cinema|musique|art|littérature|litterature/.test(joined)) return "culture";
  return fallback;
}

/**
 * Converts one RSS item into a RssReadingText, or returns null if the item
 * doesn't have enough usable content (missing link/title, too short, or
 * looks like nav/cookie/legal boilerplate rather than a real reading text).
 * Prefers the feed's `description` as the reading body — it's normally a
 * short, self-contained summary, which suits a language-learning "short
 * text" better than a full `content:encoded` article dump.
 */
export async function itemToRssReadingText(
  item: RssItem,
  source: RssSource
): Promise<RssReadingText | null> {
  const title = cleanRssText(item.title);
  if (!title || !item.link || hasBrokenTemplateSyntax(title)) return null;

  const rawBody = item.description || item.contentEncoded || "";
  const cleanedBody = cleanRssText(rawBody);
  if (
    !isTextLongEnough(cleanedBody) ||
    looksLikeBoilerplate(cleanedBody) ||
    hasBrokenTemplateSyntax(cleanedBody)
  ) {
    return null;
  }

  const body = truncateAtSentence(cleanedBody, MAX_BODY_LENGTH);
  const originalText = `${title}.\n\n${body}`;

  return {
    id: `rss-${source.id}-${hashString(item.link || title)}`,
    title,
    category: mapToKnownCategory(item.categories, source.category),
    difficulty: "B1",
    readingTimeMinutes: estimateReadingMinutes(originalText),
    language: source.language,
    originalText,
    sourceName: source.name,
    sourceUrl: item.link,
    publishedAt: parsePublishedAt(item.pubDate),
  };
}
