import { cleanWord, tokenize, type Token } from "@/lib/words";

/**
 * Validating a semantic span the model claims to have found.
 *
 * Escalation asks the model a better question than "what does this word
 * mean?": it is given the sentence and the tapped token and allowed to answer
 * about a larger unit, so a reader who taps "coup" in "il tient le coup" can
 * be told about "tenir le coup". That freedom is the point — and it is also
 * the risk, because a model asked for a span will happily return one that
 * isn't in the sentence, doesn't contain the tapped word, or quietly expands
 * to the whole clause.
 *
 * Nothing here trusts the returned text. A span is accepted only if it can be
 * located in the original tokens, contains the tap, and stays within a size a
 * real expression could plausibly have.
 */

/** Widest span an expression may claim. Beyond this it is a clause, not a lexical unit. */
const MAX_SPAN_WORDS = 6;

export interface ValidatedSpan {
  /** The span exactly as it appears in the sentence. */
  french: string;
  startIndex: number;
  endIndex: number;
  wordCount: number;
}

function normalise(value: string): string {
  return cleanWord(value.replace(/[’‘]/g, "'"))
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function wordPositions(tokens: Token[]): { index: number; key: string }[] {
  return tokens
    .map((token, index) => ({ token, index }))
    .filter((item) => item.token.isWord)
    .map((item) => ({ index: item.index, key: normalise(item.token.clean) }))
    .filter((item) => !!item.key);
}

/**
 * Locates a claimed span in the sentence, or returns null.
 *
 * Rejects, in order: spans that are empty or too wide to be a lexical unit;
 * spans whose words do not appear contiguously in the sentence; and spans that
 * do not actually contain the word the reader tapped — the last being the
 * subtlest failure, since a model can return a real, correctly-translated
 * expression from elsewhere in the sentence that has nothing to do with the tap.
 */
export function validateAiSpan(
  tokens: Token[],
  tappedIndex: number,
  claimedFrench: string | null | undefined
): ValidatedSpan | null {
  const claimed = claimedFrench?.trim();
  if (!claimed) return null;

  const claimedWords = tokenize(claimed)
    .filter((token) => token.isWord)
    .map((token) => normalise(token.clean))
    .filter(Boolean);
  if (claimedWords.length === 0 || claimedWords.length > MAX_SPAN_WORDS) return null;

  const positions = wordPositions(tokens);
  for (let start = 0; start + claimedWords.length <= positions.length; start++) {
    const matches = claimedWords.every((word, offset) => positions[start + offset].key === word);
    if (!matches) continue;

    const startIndex = positions[start].index;
    const endIndex = positions[start + claimedWords.length - 1].index;
    if (tappedIndex < startIndex || tappedIndex > endIndex) continue;

    return {
      french: tokens.slice(startIndex, endIndex + 1).map((token) => token.text).join("").trim(),
      startIndex,
      endIndex,
      wordCount: claimedWords.length,
    };
  }
  return null;
}

/**
 * The context handed to the model when a tap escalates.
 *
 * Sending the sentence, the tapped token and the readings already considered
 * turns escalation into a disambiguation question rather than a dictionary
 * lookup — the model is being asked which of these the sentence supports, or
 * what was missed, not what the word means in the abstract.
 */
export interface AiEscalationContext {
  sentence: string;
  tappedText: string;
  lemma: string | null;
  /** Candidate readings the local resolver could not choose between. */
  consideredMeanings: string[];
  /** Grammatical description of the tapped form, when known. */
  grammarNote: string | null;
}

export function buildEscalationContext(input: {
  sentence: string;
  tappedText: string;
  lemma: string | null;
  consideredMeanings: string[];
  grammarNote?: string | null;
}): AiEscalationContext {
  return {
    sentence: input.sentence,
    tappedText: input.tappedText,
    lemma: input.lemma,
    // Deduplicated and capped: a long list of near-identical glosses is noise
    // that makes the question harder to answer, not context that helps.
    consideredMeanings: [...new Set(input.consideredMeanings.map((meaning) => meaning.trim()).filter(Boolean))].slice(0, 5),
    grammarNote: input.grammarNote ?? null,
  };
}
