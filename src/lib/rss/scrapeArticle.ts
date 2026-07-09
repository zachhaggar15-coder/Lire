import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { cleanRssText, looksLikePaywallOrBotWall } from "@/lib/rss/cleanContent";

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
/** Common bot-protection/rate-limit HTTP responses — worth remembering per host, unlike a generic network hiccup. */
const BOT_PROTECTION_STATUSES = new Set([403, 429, 503]);

/**
 * Hostnames that have already shown a paywall or bot-protection challenge
 * this process's lifetime — skipped without even attempting a fetch on
 * later calls, so a known-blocked site doesn't cost a fresh timeout on
 * every candidate-pool refresh. Resets on a serverless cold start, same as
 * the pool cache in the RSS route; that's fine, the first refresh after a
 * restart just re-learns it once.
 */
const blockedHostnames = new Set<string>();

const isDev = process.env.NODE_ENV !== "production";

/** Dev-only, mirrors the rejection logging in the RSS route — never spams production logs. */
function logBlocked(hostname: string, reason: string): void {
  if (!isDev) return;
  console.log(`[rss] scraping blocked for ${hostname} (remembered for this session) — ${reason}`);
}

export async function scrapeFullArticle(url: string): Promise<string | null> {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return null;
  }
  if (blockedHostnames.has(hostname)) return null;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LireReader/1.0)" },
      signal: AbortSignal.timeout(SCRAPE_TIMEOUT_MS),
    });
    if (!res.ok) {
      if (BOT_PROTECTION_STATUSES.has(res.status)) {
        blockedHostnames.add(hostname);
        logBlocked(hostname, `HTTP ${res.status}`);
      }
      return null;
    }

    const html = await res.text();
    if (!html || html.length > MAX_HTML_BYTES) return null;

    // Checked on the raw HTML first — a challenge page (Cloudflare, etc.)
    // sometimes has so little real markup that Readability can't extract
    // anything from it at all, which would otherwise look like "not an
    // article" rather than "blocked," and never get remembered per host.
    if (looksLikePaywallOrBotWall(html)) {
      blockedHostnames.add(hostname);
      logBlocked(hostname, "paywall or bot-protection page detected");
      return null;
    }

    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();
    if (!article?.content) return null;

    // Readability's `.content` is still HTML (with paragraph structure
    // intact, unlike `.textContent` which collapses it) — run it through
    // the same clean pipeline as feed-sourced HTML for consistent output.
    const cleaned = cleanRssText(article.content);
    if (!cleaned) return null;

    // A paywall snippet can also show up only inside the extracted article
    // itself (e.g. "...the rest of this article is for subscribers" tacked
    // onto an otherwise-real opening paragraph) rather than in surrounding
    // page chrome — worth a second check on the cleaned text specifically.
    if (looksLikePaywallOrBotWall(cleaned)) {
      blockedHostnames.add(hostname);
      logBlocked(hostname, "paywall prompt found inside the extracted article");
      return null;
    }

    return cleaned;
  } catch {
    // Network error, timeout, or non-HTML response — all just mean
    // "couldn't get more than the feed already gave us."
    return null;
  }
}
