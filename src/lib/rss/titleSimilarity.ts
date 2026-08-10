/**
 * Cross-source duplicate-story detection for the RSS candidate pool.
 * Exact URL/title matching (see dedupe() in api/rss-texts/route.ts) misses
 * a common case: regional/wire-syndicated French press running near-
 * identical headlines about the same event (a heatwave alert, a wire
 * story) with different wording per outlet — e.g. Midi Libre's "Vingt-deux
 * départements en vigilance orange" and France Bleu's "22 départements en
 * vigilance orange" are the same story, not exact-string duplicates. This
 * catches that via significant-token overlap between headlines instead.
 */

const HEADLINE_STOPWORDS = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "et", "a", "au", "aux",
  "en", "dans", "sur", "pour", "avec", "ce", "cet", "cette", "ces", "qui",
  "que", "est", "sont", "plus", "son", "sa", "ses", "leur", "leurs", "ou",
  "the", "and", "for", "with", "this", "that",
]);

function significantTokens(title: string): Set<string> {
  const normalised = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  const tokens = normalised.match(/[\p{L}\p{N}]+/gu) ?? [];
  return new Set(tokens.filter((token) => token.length > 2 && !HEADLINE_STOPWORDS.has(token)));
}

/**
 * Below this many significant tokens, overlap is too noisy to trust (a
 * short headline can share every token with an unrelated one by chance).
 */
const MIN_SIGNIFICANT_TOKENS = 3;

/**
 * Overlap coefficient (intersection / smaller set size) rather than
 * Jaccard (intersection / union) — headlines from different outlets are
 * often quite different lengths (a terse wire slug vs. a longer feature
 * title), and Jaccard penalises that length gap even when the shorter
 * headline is fully contained in the longer one's topic.
 */
const SIMILARITY_THRESHOLD = 0.5;

/** True when two headlines are different wordings of the same story. */
export function areNearDuplicateTitles(a: string, b: string): boolean {
  const tokensA = significantTokens(a);
  const tokensB = significantTokens(b);
  if (tokensA.size < MIN_SIGNIFICANT_TOKENS || tokensB.size < MIN_SIGNIFICANT_TOKENS) return false;

  let overlap = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) overlap++;
  }
  const smaller = Math.min(tokensA.size, tokensB.size);
  return overlap / smaller >= SIMILARITY_THRESHOLD;
}
