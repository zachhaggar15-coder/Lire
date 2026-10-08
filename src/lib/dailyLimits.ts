/**
 * Daily article counts, in a module with no imports so that code which only
 * needs a number (RssPrefetch, mounted on every page) does not pull the
 * reading corpus (~3.4 MB of text in publicDomainBank's imports) into every
 * page's client bundle.
 */

/** Public-domain bank extracts offered per day. */
export const DAILY_BANK_ARTICLE_LIMIT = 8;

/** News articles fetched from /api/rss-texts for the News page. */
export const DAILY_RSS_ARTICLE_LIMIT = 24;
