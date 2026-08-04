import type { TextSentence } from "@/lib/practice/textSentences";

/**
 * Sentence-reconstruction exercise: the learner taps shuffled chips back into
 * the original order. A chip is a whitespace-separated "orthographic unit" —
 * this keeps elisions (j'habite, c'est), hyphenated words and accents intact
 * as single selectable pieces, matching how a French reader actually
 * perceives words, rather than a stricter linguistic tokenisation.
 *
 * A lone punctuation piece (e.g. a "«" separated from its word by a space)
 * is folded onto the neighbouring chip instead of floating as its own chip,
 * per the "don't make punctuation an awkward independent chip" rule.
 */
export interface ReconstructionChip {
  /** Stable, unique-per-exercise id — duplicate visible words still get distinct ids. */
  id: string;
  /** The text shown on the chip. */
  display: string;
}

export interface SentenceReconstructionExercise {
  sentenceIndex: number;
  /** The exact original sentence, used for validation and for showing the answer. */
  canonicalText: string;
  /** Chips in their correct (unshuffled) order — callers shuffle a copy for display. */
  chips: ReconstructionChip[];
}

const MIN_CHIPS = 5;
const MAX_CHIPS = 12;

function containsLetterOrDigit(piece: string): boolean {
  return /[\p{L}\p{N}]/u.test(piece);
}

function isPureDigits(piece: string): boolean {
  return /^[\d.,]+$/.test(piece);
}

/** Removes one ordinary sentence-ending full stop, while preserving an
 * ellipsis such as `fois...` (including before a closing quote). */
function stripTerminalFullStop(text: string): string {
  return text.replace(/(^|[^.])\.(?:(["'’»\)\]]*))$/u, "$1$2");
}

/** Splits a sentence into chips, folding stray punctuation-only pieces onto a neighbour. */
export function buildReconstructionChips(sentenceText: string): ReconstructionChip[] {
  const pieces = sentenceText.trim().split(/\s+/).filter(Boolean);
  const raw: string[] = [];
  for (const piece of pieces) {
    if (!containsLetterOrDigit(piece) && raw.length > 0) {
      // Standalone punctuation (a lone quote mark, dash, etc.) — attach to the previous chip.
      raw[raw.length - 1] = raw[raw.length - 1] + piece;
      continue;
    }
    raw.push(piece);
  }
  // Sentence punctuation belongs to the sentence, not to the final word the
  // learner is trying to order. Keep commas/quotes that affect reading, but
  // do not render a full stop as part of a selectable word chip.
  if (raw.length > 0) {
    raw[raw.length - 1] = stripTerminalFullStop(raw[raw.length - 1]);
  }
  return raw.map((display, i) => ({ id: `chip-${i}`, display }));
}

/**
 * Whether a sentence is a reasonable candidate for a reconstruction exercise:
 * a self-contained, moderately sized sentence without excessive numbers,
 * punctuation, or ambiguous repeated chips.
 */
export function isEligibleForReconstruction(sentence: TextSentence): boolean {
  const text = sentence.text.trim();
  if (!/[.!?…]["'’»)]?$/.test(text)) return false; // must end like a real sentence
  if (!/^[\p{Lu}«"'(]/u.test(text)) return false; // must start like a real sentence, not a fragment

  const chips = buildReconstructionChips(text);
  if (chips.length < MIN_CHIPS || chips.length > MAX_CHIPS) return false;

  const digitChips = chips.filter((c) => isPureDigits(c.display.replace(/[.,!?;:]+$/, ""))).length;
  if (digitChips > 1) return false;

  const punctuationOnlyChips = chips.filter((c) => !containsLetterOrDigit(c.display)).length;
  if (punctuationOnlyChips > 0) return false; // every chip should carry a real word after folding

  // Ambiguity guard: reject sentences with more than one distinct chip that repeats,
  // or any chip repeating 3+ times — multiple identical-looking chips make more than
  // one valid ordering plausible.
  const counts = new Map<string, number>();
  for (const chip of chips) {
    const key = chip.display.toLowerCase().replace(/[.,!?;:"'’»«]+$/g, "").replace(/^[.,!?;:"'’»«]+/g, "");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let repeatedPairs = 0;
  for (const count of counts.values()) {
    if (count >= 3) return false;
    if (count === 2) repeatedPairs += 1;
  }
  if (repeatedPairs > 1) return false;

  return true;
}

/** Builds a reconstruction exercise from an eligible sentence (caller must have checked eligibility). */
export function buildReconstructionExercise(sentence: TextSentence): SentenceReconstructionExercise {
  return {
    sentenceIndex: sentence.index,
    canonicalText: sentence.text.trim(),
    chips: buildReconstructionChips(sentence.text),
  };
}

/** Deterministic-shape, non-deterministic-order shuffle (Fisher-Yates). Guarantees a different
 * order than the input when there are 2+ chips, so the exercise never opens "already solved". */
export function shuffleChips(chips: ReconstructionChip[]): ReconstructionChip[] {
  if (chips.length < 2) return [...chips];
  let attempt = [...chips];
  let tries = 0;
  do {
    const arr = [...chips];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    attempt = arr;
    tries += 1;
  } while (tries < 24 && !isUsefulShuffle(chips, attempt));

  if (isUsefulShuffle(chips, attempt)) return attempt;
  // Extremely unlikely deterministic fallback: rotate by roughly half. It
  // cannot be the original order or the simple backwards-order puzzle that
  // was too easy to solve by visual pattern alone.
  const offset = Math.max(1, Math.floor(chips.length / 2));
  return [...chips.slice(offset), ...chips.slice(0, offset)];
}

function isUsefulShuffle(original: ReconstructionChip[], shuffled: ReconstructionChip[]): boolean {
  const unchanged = shuffled.every((chip, index) => chip.id === original[index]?.id);
  if (unchanged) return false;
  if (original.length < 4) return true;
  const simplyReversed = shuffled.every((chip, index) => chip.id === original[original.length - 1 - index]?.id);
  if (simplyReversed) return false;
  const displaced = shuffled.filter((chip, index) => chip.id !== original[index]?.id).length;
  return displaced >= Math.ceil(original.length / 2);
}

/**
 * Normalises punctuation spacing so "va ?" and "va?" compare equal — chip
 * attachment is a display choice, not a meaningful difference for grading.
 *
 * Strips whitespace on BOTH sides of punctuation (not just before it) —
 * buildReconstructionChips folds any run of consecutive punctuation-only
 * "words" onto a single preceding chip (e.g. a dialogue line's "changement
 * : « Ils" collapses the space-colon-space-guillemet run into one
 * "changement:«" chip). The canonical sentence text still has its original
 * French typographic spacing around ":"/"«"/"»", so comparing without also
 * normalising space *after* punctuation made the exercise's own correct
 * answer fail its own check for any dialogue-heavy sentence — found via a
 * full-corpus sweep (scripts/test-practice-corpus-coverage.mjs) that
 * exercised every real sentence in the curriculum rather than a handful of
 * hand-picked examples.
 */
function normalizeForCompare(text: string): string {
  return text
    .normalize("NFC")
    .trim()
    .replace(/(^|[^.])\.(?:(["'’»\)\]]*))$/u, "$1$2")
    .replace(/\s+/g, " ")
    // Strip whitespace on both sides of any punctuation or symbol character
    // (Unicode \p{P}/\p{S} — covers ?!;:.,»«—, currency symbols, etc.), not
    // just a hand-enumerated list: any non-letter/non-digit "word" is what
    // buildReconstructionChips folds onto a neighbouring chip without
    // preserving its original spacing, so comparison needs to be blind to
    // spacing around ALL of them, not just the ones a first pass happened
    // to test against.
    .replace(/\s*([\p{P}\p{S}])\s*/gu, "$1");
}

/** Whether an ordered arrangement of chip ids reconstructs the canonical sentence. */
export function checkReconstruction(exercise: SentenceReconstructionExercise, orderedChipIds: string[]): boolean {
  const byId = new Map(exercise.chips.map((chip) => [chip.id, chip]));
  const attempt = orderedChipIds.map((id) => byId.get(id)?.display ?? "").join(" ");
  return normalizeForCompare(attempt) === normalizeForCompare(exercise.canonicalText);
}
