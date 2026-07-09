import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { cleanRssText } from "@/lib/rss/cleanContent";

/**
 * Best-effort full-article extraction from a source's actual webpage —
 * used when a feed only publishes a short teaser (see rssToReadingText.ts).
 * Server-only (imports jsdom); never called from client code.
 *
 * This is deliberately a fallback, not the primary content path: it adds a
 * network hop and CPU-bound parsing per attempt, and is expected to fail
 * outright on paywalled or bot-protected sites — both are fine, since the
 * caller just keeps the feed-provided teaser when this returns null.
 */

const SCRAPE_TIMEOUT_MS = 6000;
/** Refuse to even try parsing a page this large — avoids wasting time on non-article pages that slipped through (e.g. a section front page). */
const MAX_HTML_BYTES = 3_000_000;

export async function scrapeFullArticle(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LireReader/1.0)" },
      signal: AbortSignal.timeout(SCRAPE_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const html = await res.text();
    if (!html || html.length > MAX_HTML_BYTES) return null;

    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();
    if (!article?.content) return null;

    // Readability's `.content` is still HTML (with paragraph structure
    // intact, unlike `.textContent` which collapses it) — run it through
    // the same clean pipeline as feed-sourced HTML for consistent output.
    const cleaned = cleanRssText(article.content);
    return cleaned || null;
  } catch {
    // Network error, timeout, non-HTML response, or Readability finding no
    // extractable article (common on non-article pages) — all just mean
    // "couldn't get more than the feed already gave us."
    return null;
  }
}
