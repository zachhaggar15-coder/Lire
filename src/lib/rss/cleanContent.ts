/**
 * Utilities for turning raw RSS field text into clean, readable French —
 * stripping markup, decoding entities, and normalising whitespace. Kept
 * dependency-free (no HTML-entity or XML package) since feed text only
 * needs a bounded, well-known set of transforms.
 */

/** Common named HTML entities, focused on punctuation and French usage. */
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  eacute: "é",
  egrave: "è",
  ecirc: "ê",
  agrave: "à",
  acirc: "â",
  ccedil: "ç",
  ocirc: "ô",
  ucirc: "û",
  ugrave: "ù",
  icirc: "î",
  iuml: "ï",
  uuml: "ü",
  euml: "ë",
  auml: "ä",
  ouml: "ö",
  oelig: "œ",
  aelig: "æ",
};

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (match, name) => NAMED_ENTITIES[name] ?? match);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "");
}

export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Full pipeline: strip tags, decode entities, collapse whitespace. */
export function cleanRssText(raw: string): string {
  return normalizeWhitespace(decodeHtmlEntities(stripHtml(raw)));
}

export function isTextLongEnough(text: string, minWords = 12): boolean {
  const words = text.split(/\s+/).filter(Boolean);
  return words.length >= minWords;
}

/** Phrases that indicate the "content" is really nav/cookie/legal boilerplate, not a reading text. */
const BOILERPLATE_PATTERNS = [
  /cookies?/i,
  /politique de confidentialit[ée]/i,
  /privacy policy/i,
  /accept(er)?\s+(all\s+|tous\s+les\s+)?cookies?/i,
  /subscribe to (our|the) newsletter/i,
  /abonnez-vous/i,
  /tous droits r[ée]serv[ée]s/i,
  /all rights reserved/i,
  /read more/i,
  /lire la suite/i,
  /click here/i,
  /gdpr|rgpd/i,
  /unsubscribe/i,
  /se d[ée]sinscrire/i,
];

/**
 * Heuristic check for RSS "content" that's actually navigation, a cookie
 * banner, or other site chrome rather than real reading material: short
 * text containing any boilerplate phrase, or text with several such
 * phrases regardless of length (a real article rarely mentions more than
 * one of these).
 */
export function looksLikeBoilerplate(text: string): boolean {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount === 0) return true;
  const hits = BOILERPLATE_PATTERNS.filter((re) => re.test(text)).length;
  return (wordCount < 40 && hits > 0) || hits >= 3;
}

/**
 * Some feeds leak unresolved CMS template syntax into their title/body when
 * the site's template is broken (e.g. `$content.TitleNoTags`, `{{ title }}`,
 * `#set(...)`). That's malformed content, not real reading material.
 */
export function hasBrokenTemplateSyntax(text: string): boolean {
  return /\$content\.|\$\{|\{\{|#set\(|<%[=#]?/i.test(text);
}

/** ~200 words/minute, rounded, minimum 1 minute. */
export function estimateReadingMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Cuts to a sentence boundary near maxLen when possible, otherwise hard-cuts with an ellipsis. */
export function truncateAtSentence(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const slice = text.slice(0, maxLen);
  const boundary = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  if (boundary > maxLen * 0.4) return slice.slice(0, boundary + 1).trim();
  return slice.trim() + "…";
}
