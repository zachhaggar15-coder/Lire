/**
 * Word cleaning + tokenisation helpers.
 * Kept dependency-free so they can run on server or client.
 */

export interface Token {
  /** The raw text as it appears (word or punctuation/space run). */
  text: string;
  /** True when this token is a tappable word. */
  isWord: boolean;
  /** Clean lowercase form, only present when isWord is true. */
  clean: string;
}

export interface SentenceGroup {
  /** The sentence's exact text, trimmed — used as the translation lookup key. */
  text: string;
  /** The sentence broken into tappable word/punctuation tokens. */
  tokens: Token[];
}

/**
 * Normalise a word to its clean, lowercase key form:
 * lowercased, with surrounding punctuation and quotes stripped.
 * Keeps letters (incl. accents), inner apostrophes and hyphens.
 */
export function cleanWord(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/[^\p{L}\p{N}]+$/u, "")
    .trim();
}

/**
 * The lexical identity of a multi-word span, as opposed to how it is printed.
 *
 * `cleanWord` handles single tokens, but a span is assembled by joining raw
 * token text, so it carries whatever punctuation happened to fall inside and
 * at its edges: a phrase ending before a comma arrived as "a besoin de," and
 * that string then reached display, lookup keys and saved vocabulary.
 *
 * The distinction that matters is the same one `cleanWord` draws, applied
 * across a range. Quotes, commas, terminal marks and guillemets are typography
 * belonging to the sentence; the apostrophe in "aujourd'hui" and the hyphens
 * in "va-t-il" are part of the word and must survive. Collapses whitespace so
 * a span broken across a line break still matches one written inline.
 *
 * Display of the article itself never uses this — readers keep their
 * punctuation. Only lookup, matching, caching and stored vocabulary do.
 */
export function lexicalSpan(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/[^\p{L}\p{N}]+$/u, "")
    .trim();
}

/**
 * Split a string into an ordered list of tokens, preserving punctuation
 * and whitespace so the original text can be reconstructed exactly.
 * A "word" is a run of letters/numbers plus inner apostrophes or hyphens.
 */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  // Match word-like runs (letters/numbers with inner ' or -) OR everything else.
  const re = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*|[^\p{L}\p{N}]+/gu;
  const matches = text.match(re) ?? [];

  for (const m of matches) {
    const isWord = /[\p{L}\p{N}]/u.test(m);
    tokens.push({
      text: m,
      isWord,
      clean: isWord ? cleanWord(m) : "",
    });
  }
  return tokens;
}

/**
 * Split a paragraph into sentences, keeping trailing punctuation.
 *
 * French dialogue closes with a guillemet after a space (« ... . »), and
 * the terminal punctuation sits *before* that space and the closing mark —
 * e.g. "il dit : « on gagne. »". Splitting on any [.!?…] followed by
 * whitespace, with no other guard, cut right after "gagne." and left the
 * closing "»" behind as its own bare "sentence" (no letters at all — which
 * then made a following AI translation request come back with one fewer
 * real sentence than requested, since there's nothing to translate). The
 * negative lookahead keeps the terminal punctuation and its closing quote
 * mark together as one sentence.
 */
export function splitSentences(paragraph: string): string[] {
  const pieces = paragraph
    // A sentence also ends after its closing quote: "... gagne. » Puis ..."
    // (a dialogue tag that follows in lowercase is rejoined below).
    .split(/(?<=[.!?…])\s+(?!["'»”])|(?<=[.!?…]\s?[»”"])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  // A full stop after a title or an initial does not end the sentence:
  // "Et M. Omont la congédia." is one sentence, not "Et M." + "Omont...".
  // Splitting there also made AI translation fail outright, because the
  // model (correctly) returns one sentence where two were sent.
  const merged: string[] = [];
  for (const piece of pieces) {
    const previous = merged[merged.length - 1];
    const continues =
      previous !== undefined &&
      (ENDS_WITH_ABBREVIATION.test(previous) ||
        // French dialogue tags continue the sentence after ! ? or …:
        // « Viens ! » dit le sergent. / « Ah ! mon père, dit Franz… »
        /^[a-zà-ÿœæ]/.test(piece) ||
        // A bare list number ("1.") belongs to what follows it.
        /^\d{1,3}\.$/.test(previous) ||
        // A quotation that opens with a pause ("bonjour: «... Crés cochons")
        // has not ended at the ellipsis.
        /«\s*(?:\.{3}|…)$/.test(previous));
    if (continues) merged[merged.length - 1] = `${previous} ${piece}`;
    else merged.push(piece);
  }
  return merged;
}

/**
 * Titles and hyphenated initials whose full stop is not a sentence end. A
 * lone capital ("J.") is not listed: "... B qui cause A." ends sentences more
 * often than initials start names in these texts. "etc." often ends a
 * sentence too, so it is not listed either.
 */
const ENDS_WITH_ABBREVIATION = /(?:^|[\s(«"'’-])(?:M|MM|Mme|Mmes|Mlle|Mlles|Mr|Mrs|Ms|Dr|Pr|Me|Mgr|St|Ste|[A-ZÀ-Ý]\.-[A-ZÀ-Ý])\.$/u;

/**
 * Tokenise body text into paragraphs of sentence groups, each sentence
 * already split into tappable word/punctuation tokens. Paragraphs are
 * blank-line separated; empty paragraphs are dropped.
 */
export function tokenizeParagraphsToSentences(body: string): SentenceGroup[][] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((paragraph) =>
      splitSentences(paragraph).map((sentence) => ({
        text: sentence,
        tokens: tokenize(sentence),
      }))
    );
}
