/**
 * Minimal, dependency-free RSS 2.0 (with a light Atom fallback) parser.
 * It only extracts the fields we need — this is not a general XML parser,
 * just enough regex-based extraction to read real-world news feeds.
 */

export interface RssItem {
  title: string;
  link: string;
  /** Raw date string as found in the feed, or null if absent. */
  pubDate: string | null;
  description: string;
  /** Richer body (content:encoded / custom <body> / Atom <content>), if present. */
  contentEncoded: string | null;
  categories: string[];
}

function stripCdata(raw: string): string {
  const m = raw.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return (m ? m[1] : raw).trim();
}

/** Extracts the inner text of the first `<tag>...</tag>` match (tag may contain a namespace colon). */
function extractTag(itemXml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = itemXml.match(re);
  return m ? stripCdata(m[1]) : null;
}

/** Tries each tag in order, returning the first non-empty result. */
function extractFirst(itemXml: string, tags: string[]): string | null {
  for (const tag of tags) {
    const value = extractTag(itemXml, tag);
    if (value) return value;
  }
  return null;
}

/** RSS `<link>text</link>` or Atom `<link href="...">`. */
function extractLink(itemXml: string): string {
  const simple = extractTag(itemXml, "link");
  if (simple && !simple.includes("<")) return simple;
  const hrefMatch = itemXml.match(/<link[^>]*\shref=["']([^"']+)["'][^>]*\/?>/i);
  if (hrefMatch) return hrefMatch[1];
  return simple ?? "";
}

function extractCategories(itemXml: string): string[] {
  const tagMatches = itemXml.match(/<category[^>]*>([\s\S]*?)<\/category>/gi) ?? [];
  const fromTags = tagMatches
    .map((m) => stripCdata(m.replace(/<\/?category[^>]*>/gi, "")))
    .filter(Boolean);

  const termMatches = [...itemXml.matchAll(/<category[^>]*\sterm=["']([^"']+)["'][^>]*\/?>/gi)].map(
    (m) => m[1]
  );

  return [...new Set([...fromTags, ...termMatches])];
}

export function parseRssFeed(xml: string): RssItem[] {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];

  return blocks.map((block) => ({
    title: extractTag(block, "title") ?? "",
    link: extractLink(block),
    pubDate: extractFirst(block, ["pubDate", "published", "updated", "dc:date"]),
    description: extractFirst(block, ["description", "summary"]) ?? "",
    contentEncoded: extractFirst(block, ["content:encoded", "body", "content"]),
    categories: extractCategories(block),
  }));
}
