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

/** Split a paragraph into sentences, keeping trailing punctuation. */
export function splitSentences(paragraph: string): string[] {
  return paragraph
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

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
