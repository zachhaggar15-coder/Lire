import type { Category } from "@/types";
import type { RssSource } from "@/data/rssSources";
import type { RssItem } from "@/lib/rss/parseRss";
import {
  cleanRssText,
  estimateReadingMinutes,
  hasBrokenTemplateSyntax,
  looksLikeBoilerplate,
  truncateAtSentence,
} from "@/lib/rss/cleanContent";
import { isAcceptableFrenchText } from "@/lib/rss/language";
import { analyseContentQuality, DEFAULT_MIN_WORDS, isAcceptableReadingContent } from "@/lib/rss/contentQuality";
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

/** Why itemToRssReadingText rejected a candidate — used for dev-only logging in the RSS route, never shown to users. */
export interface RssRejection {
  reason: string;
}

export type RssConversionResult =
  | { ok: true; text: RssReadingText }
  | { ok: false; rejection: RssRejection };

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
 * Converts one RSS item into a RssReadingText, or a rejection reason
 * (dev-mode logging only — see the RSS route). Rejects when:
 *   - title/link missing, or either contains broken CMS template syntax.
 *   - the item isn't recognisably French — checked on the body *alone*
 *     (a French title must not be able to rescue an English body) and
 *     again on title+body combined (title context can help a short,
 *     otherwise-ambiguous body read as French).
 *   - the cleaned body fails content-quality checks (too short, too few
 *     sentences, truncated, boilerplate) — checked on the body alone,
 *     never padded out by the title.
 * Prefers the feed's `description` as the reading body — it's normally a
 * short, self-contained summary, which suits a language-learning "short
 * text" better than a full `content:encoded` article dump.
 */
export async function itemToRssReadingText(
  item: RssItem,
  source: RssSource
): Promise<RssConversionResult> {
  const title = cleanRssText(item.title);
  if (!title || !item.link) {
    return { ok: false, rejection: { reason: "missing title or link" } };
  }
  if (hasBrokenTemplateSyntax(title)) {
    return { ok: false, rejection: { reason: "title has broken CMS template syntax" } };
  }

  // Feeds are inconsistent about which field (if either) has the fuller
  // text — some put a full article in content:encoded, some repeat the
  // same short teaser in both, some only fill in description. Cleaning
  // both up front and keeping the longer one is more robust than assuming
  // either field is reliably better across 100+ different feeds.
  const candidateBodies = [item.description, item.contentEncoded]
    .filter((b): b is string => !!b)
    .map((b) => cleanRssText(b));
  const cleanedBody = candidateBodies.sort((a, b) => b.length - a.length)[0] ?? "";

  if (hasBrokenTemplateSyntax(cleanedBody)) {
    return { ok: false, rejection: { reason: "body has broken CMS template syntax" } };
  }
  if (looksLikeBoilerplate(cleanedBody)) {
    return { ok: false, rejection: { reason: "body looks like nav/cookie/legal boilerplate" } };
  }

  // Content-quality check uses the body alone — a short teaser doesn't
  // become real reading material just because the title is long.
  const minWords = source.minWords ?? DEFAULT_MIN_WORDS;
  const quality = analyseContentQuality(cleanedBody, minWords);
  if (!isAcceptableReadingContent(cleanedBody, minWords)) {
    return { ok: false, rejection: { reason: `content quality: ${quality.reason}` } };
  }

  // Language check on the body alone first — a French title must never be
  // able to rescue an English body. Then again on title+body combined,
  // which gives short-but-genuinely-French bodies the benefit of their
  // (usually also French) title's extra signal.
  if (!isAcceptableFrenchText(cleanedBody)) {
    return { ok: false, rejection: { reason: "body is not recognisably French" } };
  }
  if (!isAcceptableFrenchText(`${title}. ${cleanedBody}`)) {
    return { ok: false, rejection: { reason: "title+body combined is not recognisably French" } };
  }

  const body = truncateAtSentence(cleanedBody, MAX_BODY_LENGTH);
  const originalText = `${title}.\n\n${body}`;

  return {
    ok: true,
    text: {
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
    },
  };
}
