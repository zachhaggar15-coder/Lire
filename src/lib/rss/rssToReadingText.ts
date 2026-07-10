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
import {
  analyseContentQuality,
  countWords,
  DEFAULT_MIN_WORDS,
  isAcceptableAsShortSnippet,
  isAcceptableReadingContent,
} from "@/lib/rss/contentQuality";
import { scrapeFullArticle } from "@/lib/rss/scrapeArticle";
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
  /**
   * A 2-3 sentence English summary of what the article is about, shown on
   * the home-page card before a reader taps in — mutated in after the
   * initial conversion, once per candidate-pool build, by
   * src/lib/rss/articleBlurbs.ts. Null until (and unless) that step fills
   * it in — AI isn't configured, the batch call failed, etc. are all fine;
   * the card just doesn't show a blurb for that article.
   */
  blurbEn: string | null;
  /**
   * True when this item fell short of DEFAULT_MIN_WORDS but still cleared
   * the much lower SHORT_SNIPPET_MIN_WORDS bar (contentQuality.ts) — routed
   * into the home page's "Short Snippets" section instead of the normal
   * recommendation sections, rather than being discarded outright.
   */
  isShortSnippet: boolean;
}

/** Why itemToRssReadingText rejected a candidate — used for dev-only logging in the RSS route, never shown to users. */
export interface RssRejection {
  reason: string;
}

export type RssConversionResult =
  | { ok: true; text: RssReadingText }
  | { ok: false; rejection: RssRejection };

/**
 * A safety ceiling, not a routine truncation point — raised from an earlier
 * 1200 (~200 words) now that full articles are scraped from the source page
 * when a feed only teases (see scrapeFullArticle below). Long-form articles
 * can run several thousand words; this just guards against a pathological
 * scrape (e.g. Readability grabbing an oversized related-content block).
 */
const MAX_BODY_LENGTH = 20_000;
/**
 * Below this word count, the feed's own teaser isn't "substantial reading
 * content" — attempt to scrape the full article from the source page
 * instead (falling back to the teaser if scraping fails or isn't longer).
 * Well above DEFAULT_MIN_WORDS: that constant is the bare minimum to accept
 * *something*, this is the bar for "don't even bother trying to do better."
 */
const FULL_ARTICLE_TARGET_WORDS = 250;

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
 * Starts from the longer of the feed's `description`/`content:encoded`; if
 * that's still short of FULL_ARTICLE_TARGET_WORDS, attempts to scrape the
 * full article from the source page (scrapeArticle.ts) and uses whichever
 * is longer and still clean — see "Full-length articles" in the README.
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

  // The feed's own teaser often isn't "substantial reading content" (many
  // outlets only publish a short summary, by design). When it falls short
  // of the full-article bar, try scraping the real article from the source
  // page — best-effort: any failure (network, timeout, paywall, no
  // extractable content) just means falling back to the feed's teaser, same
  // as before this existed. Only the longer, still-clean result is kept.
  let finalBody = cleanedBody;
  if (countWords(cleanedBody) < FULL_ARTICLE_TARGET_WORDS && (source.allowScraping ?? true)) {
    const scraped = await scrapeFullArticle(item.link);
    if (
      scraped &&
      countWords(scraped) > countWords(cleanedBody) &&
      !hasBrokenTemplateSyntax(scraped) &&
      !looksLikeBoilerplate(scraped)
    ) {
      finalBody = scraped;
    }
  }

  // Content-quality check uses the body alone — a short teaser doesn't
  // become real reading material just because the title is long.
  const minWords = source.minWords ?? DEFAULT_MIN_WORDS;
  const quality = analyseContentQuality(finalBody, minWords);
  let isShortSnippet = false;
  if (!isAcceptableReadingContent(finalBody, minWords)) {
    // Only a "too short" rejection gets a second chance at the lower
    // snippet bar — content rejected for being truncated, boilerplate, or
    // shaped like a broken list is just as unsuitable at 20 words as at 60.
    if (quality.isTooShort && isAcceptableAsShortSnippet(finalBody)) {
      isShortSnippet = true;
    } else {
      return { ok: false, rejection: { reason: `content quality: ${quality.reason}` } };
    }
  }

  // Language check on the body alone first — a French title must never be
  // able to rescue an English body. Then again on title+body combined,
  // which gives short-but-genuinely-French bodies the benefit of their
  // (usually also French) title's extra signal.
  if (!isAcceptableFrenchText(finalBody)) {
    return { ok: false, rejection: { reason: "body is not recognisably French" } };
  }
  if (!isAcceptableFrenchText(`${title}. ${finalBody}`)) {
    return { ok: false, rejection: { reason: "title+body combined is not recognisably French" } };
  }

  const body = truncateAtSentence(finalBody, MAX_BODY_LENGTH);
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
      blurbEn: null,
      isShortSnippet,
    },
  };
}
