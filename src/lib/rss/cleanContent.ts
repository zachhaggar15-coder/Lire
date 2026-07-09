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
    .replace(/<(script|style|noscript|iframe)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    // Image captions are usually their own <figcaption>/<figure> block —
    // drop the whole thing rather than leaving orphaned caption text
    // sitting in the middle of the article body.
    .replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n\n")
    .replace(/<\/(li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "");
}

/**
 * Known trailing/standalone boilerplate phrases — newsletter prompts,
 * cookie notices, WordPress's "the post X appeared first on Y" footer,
 * French "cet article a été publié" footers, etc. Removed as whole lines
 * rather than causing outright rejection, since they're usually appended
 * to otherwise-good content, not the whole story.
 */
const BOILERPLATE_LINE_PATTERNS = [
  /^the post .* appeared first on .*$/i,
  /^cet article (a été publié|est apparu) (sur|d'abord sur) .*$/i,
  /^abonnez[-\s]vous.*$/i,
  /^subscribe to (our|the) newsletter.*$/i,
  /^inscrivez[-\s]vous à (notre|la) newsletter.*$/i,
  /^(photo|image|credit|crédit)\s*:.*$/i,
  /^(cookies?|privacy policy|politique de confidentialit[ée]).*$/i,
  /^(click here|lire la suite|read more|continue reading)\.?$/i,
];

/** Removes whole lines that are just known site chrome, keeping the rest of the text intact. */
export function stripKnownBoilerplateLines(text: string): string {
  return text
    .split("\n")
    .filter((line) => !BOILERPLATE_LINE_PATTERNS.some((re) => re.test(line.trim())))
    .join("\n");
}

export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Full pipeline: strip tags, decode entities, drop known boilerplate lines, collapse whitespace. */
export function cleanRssText(raw: string): string {
  return normalizeWhitespace(stripKnownBoilerplateLines(decodeHtmlEntities(stripHtml(raw))));
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
 * Phrases that show up on a paywall prompt or a bot-protection/CAPTCHA
 * challenge page instead of real article content — used by
 * scrapeArticle.ts to reject a scrape that "succeeded" (200 response, some
 * extractable text) but didn't actually get the article. Either case means
 * the same thing: fall back to the feed's own teaser, same as a network
 * failure would.
 */
const PAYWALL_OR_BOTWALL_PATTERNS = [
  // Paywalls (French)
  /r[ée]serv[ée]s? aux abonn[ée]s/i,
  /abonnez-vous pour (lire|continuer)/i,
  /pour lire la suite,? abonnez-vous/i,
  /cet article est r[ée]serv[ée]/i,
  /contenu r[ée]serv[ée] aux abonn[ée]s/i,
  // Paywalls (English)
  /subscribe to (continue|read)/i,
  /this (content|article) is for subscribers/i,
  /to continue reading this article/i,
  // Bot-protection / challenge pages (Cloudflare, Akamai, Incapsula, generic CAPTCHA)
  /just a moment\.{3}/i,
  /checking your browser (before accessing|to see)/i,
  /verify you are (a )?human/i,
  /enable javascript and cookies to continue/i,
  /attention required[!.]?\s*\|\s*cloudflare/i,
  /ddos protection by/i,
  /request unsuccessful.{0,20}incapsula/i,
  /access denied\b/i,
  /pardon our interruption/i,
];

/** See PAYWALL_OR_BOTWALL_PATTERNS above. */
export function looksLikePaywallOrBotWall(text: string): boolean {
  return PAYWALL_OR_BOTWALL_PATTERNS.some((re) => re.test(text));
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
