import { tokenize } from "@/lib/words";
import { lookupWord } from "@/lib/dictionary/lookup";
import type { DictionaryLookupResult } from "@/lib/dictionary/types";

/**
 * A simple, heuristic difficulty estimator — not academically rigorous CEFR
 * classification, just a useful-enough signal for "should I read this
 * today." Replaces the old fixed "B1 for every RSS text" assumption.
 */

export type EstimatedCefr = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type LearnerLabel = "Easy" | "Good level" | "Stretch" | "Hard";

export interface DifficultyEstimate {
  cefr: EstimatedCefr;
  label: LearnerLabel;
  wordCount: number;
  avgSentenceLength: number;
  /** Fraction (0-1) of unique words found in the local dictionary (curated or generated). */
  dictionaryCoverage: number;
  /**
   * Fraction (0-1) of unique words that might trip a reader up. Common A1/
   * A2 function words never count here, even before any known-words data
   * exists (see isBasicWord) — otherwise a brand-new reader with zero saved
   * words would see a meaningless ~100% every time. Once the reader has
   * enough known words saved, this personalises using them; until then it
   * falls back to "not found, or found but not a basic word."
   */
  unknownWordRatio: number;
}

/** How CEFR-ish each dictionary outcome is treated as, on the same 1-6 scale as real CEFR levels (A1=1 ... C2=6). */
const CEFR_NUMERIC: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
/** A generated-dictionary hit has no CEFR data — treat it as solidly mid-frequency rather than basic or rare. */
const GENERATED_HIT_NUMERIC = 3.5;
/** A word with no dictionary entry at all reads as rare/advanced vocabulary. */
const MISSING_NUMERIC = 5.5;

const CEFR_BY_ROUNDED_SCORE: EstimatedCefr[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

/** A1/A2 curated words (articles, common pronouns/verbs, etc.) never count as "might be unfamiliar," regardless of known-words state. */
function isBasicWord(cefr: string | null): boolean {
  return cefr === "A1" || cefr === "A2";
}

/**
 * At or above this CEFR level, a word counts as "might be unfamiliar" for a
 * reader we know nothing about yet.
 *
 * This used to be "missing from the dictionary, or found with no CEFR at
 * all," which quietly stopped meaning anything: the generated dictionary now
 * covers ~92k words and gives *every* entry a frequency-derived CEFR, so
 * essentially nothing satisfied either condition. The public-domain bank is
 * additionally curated for full dictionary coverage, so every one of those
 * texts reported "0% of words may be unfamiliar" and "A2 / Easy" — to a
 * brand-new reader, on Madame Bovary. Judging by how advanced the word is
 * restores a signal that actually varies with the text.
 */
const UNFAMILIAR_CEFR_THRESHOLD = 4; // B2 and above

/** Whether a word is advanced enough to plausibly trip up a reader with no known-words history. */
function isBaselineUnfamiliar(result: DictionaryLookupResult): boolean {
  if (result.source === "missing") return true;
  if (!result.cefr) return true;
  return (CEFR_NUMERIC[result.cefr] ?? 0) >= UNFAMILIAR_CEFR_THRESHOLD;
}

function isProperNoun(result: DictionaryLookupResult): boolean {
  return result.partOfSpeech?.startsWith("proper noun") ?? false;
}

/** Minimum saved known words before personalising unknownWordRatio — below this, known-words data is too sparse to be a useful signal. */
const MIN_KNOWN_WORDS_FOR_PERSONALIZATION = 5;

/**
 * Estimates reading difficulty from the text alone, optionally personalised
 * by the reader's own known-words set. Works gracefully with an empty (or
 * missing) `knownWords` — the estimate just falls back to a pure
 * dictionary-coverage/CEFR-metadata signal, which is exactly what a
 * brand-new reader with nothing saved yet needs.
 */
export function estimateDifficulty(body: string, knownWords: Set<string> = new Set()): DifficultyEstimate {
  const tokens = tokenize(body).filter((t) => t.isWord && t.clean);
  const wordCount = tokens.length;
  const sentenceCount = Math.max(1, (body.match(/[.!?…]+(?:\s|$)/g) ?? []).length);
  const avgSentenceLength = wordCount / sentenceCount;

  const uniqueWords = new Map<string, string>();
  for (const token of tokens) {
    const existing = uniqueWords.get(token.clean);
    if (!existing || token.text !== token.text.toLowerCase()) uniqueWords.set(token.clean, token.text);
  }
  const personalize = knownWords.size >= MIN_KNOWN_WORDS_FOR_PERSONALIZATION;

  let foundCount = 0;
  let lexicalCount = 0;
  let cefrScoreSum = 0;
  let baselineUnfamiliarCount = 0;
  let personalUnfamiliarCount = 0;

  for (const [word, lookupText] of uniqueWords) {
    const result = lookupWord(lookupText);
    if (isProperNoun(result)) continue;

    lexicalCount++;
    const basic = isBasicWord(result.cefr);

    let numeric: number;
    if (result.source === "missing") {
      numeric = MISSING_NUMERIC;
    } else {
      foundCount++;
      numeric = result.cefr && result.cefr in CEFR_NUMERIC ? CEFR_NUMERIC[result.cefr] : GENERATED_HIT_NUMERIC;
    }
    cefrScoreSum += numeric;

    if (!basic) {
      if (isBaselineUnfamiliar(result)) baselineUnfamiliarCount++;
      if (personalize && !knownWords.has(word)) personalUnfamiliarCount++;
    }
  }

  const uniqueCount = Math.max(1, lexicalCount);
  const dictionaryCoverage = foundCount / uniqueCount;

  let score = cefrScoreSum / uniqueCount;
  if (avgSentenceLength > 25) score += 0.3;
  else if (avgSentenceLength > 18) score += 0.15;
  else if (avgSentenceLength < 10) score -= 0.15;

  if (personalize) {
    // The more of the "usually tricky" words this reader already knows,
    // the easier the text should feel to them specifically.
    const personalUnknownRatio = personalUnfamiliarCount / uniqueCount;
    const baselineUnknownRatio = baselineUnfamiliarCount / uniqueCount;
    score -= (baselineUnknownRatio - personalUnknownRatio) * 1.5;
  }

  const roundedIndex = Math.max(1, Math.min(6, Math.round(score))) - 1;
  const cefr = CEFR_BY_ROUNDED_SCORE[roundedIndex];

  let label: LearnerLabel;
  if (score <= 2) label = "Easy";
  else if (score <= 3.3) label = "Good level";
  else if (score <= 4.5) label = "Stretch";
  else label = "Hard";

  const unknownWordRatio = personalize ? personalUnfamiliarCount / uniqueCount : baselineUnfamiliarCount / uniqueCount;

  return {
    cefr,
    label,
    wordCount,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    dictionaryCoverage,
    unknownWordRatio,
  };
}
