import { classifyRegister, isLearnerSafeGloss, leadingLearnerSense, type SenseRegister } from "@/lib/dictionary/register";
import { lookupWord } from "@/lib/dictionary/lookup";
import { resolveMeaning } from "@/lib/dictionary/resolveMeaning";
import { cleanWord, tokenize, type Token } from "@/lib/words";

/**
 * The English clue a practice question is allowed to teach.
 *
 * A word-completion exercise showed `oignons` with the clue "arse". Tracing it
 * back: the generated WikDict entry for `oignon` lists arse / buckeye / onion /
 * bulb / bunion, and the practice UI called `lookupWord(answer).translations[0]`
 * — reaching straight past the resolver into raw position one of an import
 * whose sense ordering carries no editorial judgement.
 *
 * The bug was not the ordering. It was that practice had its own private route
 * to a meaning, and that route applied a *lookup* standard to *teaching*
 * material. Exploratory lookup can afford to show a plausible answer and hedge
 * it; a exercise cannot hedge, because the learner takes whatever it says as
 * fact and may never see a correction.
 *
 * So exercises no longer choose meanings. They ask here, and this refuses when
 * it cannot find something worth teaching — a missing question being strictly
 * better than a wrong one.
 */

export type ExerciseGlossSource =
  | "contextual-resolver"
  | "canonical-curated"
  | "canonical-generated";

export interface ExerciseGloss {
  /** The French item, in its lexical form. */
  french: string;
  /** The English clue, safe to put in front of a learner. */
  english: string;
  source: ExerciseGlossSource;
  register: SenseRegister;
  confidence: "high" | "medium";
  /** Senses deliberately rejected, with why. Development diagnostics only. */
  rejected: { gloss: string; reason: string }[];
}

/** Dictionary layers whose sense ordering reflects a person's judgement. */
const CURATED_LAYERS = new Set(["phrase-bank", "core", "news", "curated", "custom"]);

/**
 * A gloss too vague to test against.
 *
 * "to be", "thing", "one" are all correct and all useless as the only clue for
 * a fill-in-the-blank, because dozens of words could satisfy them.
 */
const TOO_GENERIC = new Set([
  "thing", "one", "some", "any", "it", "that", "this", "there", "be", "to be",
  "do", "to do", "have", "to have", "make", "to make", "go", "to go", "very",
]);

function isTestableClue(gloss: string): boolean {
  const trimmed = gloss.trim().toLowerCase();
  if (trimmed.length < 2) return false;
  if (TOO_GENERIC.has(trimmed)) return false;
  // A clue containing the French answer gives the game away.
  return true;
}

/**
 * The clue for a word met in a specific sentence.
 *
 * The resolver already worked out what the word means *there*, so a
 * contextual exercise should teach that rather than a canonical sense that
 * may not be the one the reader encountered. Only a confident resolution
 * qualifies — an uncertain one is exactly what must not become teaching
 * material.
 */
export function contextualExerciseGloss(input: {
  french: string;
  sentence: string;
  tokens?: Token[];
  tokenIndex?: number;
}): ExerciseGloss | null {
  const tokens = input.tokens ?? tokenize(input.sentence);
  const target = cleanWord(input.french);
  const tokenIndex =
    input.tokenIndex ?? tokens.findIndex((token) => token.isWord && token.clean.toLowerCase() === target);
  if (tokenIndex < 0) return null;

  const meaning = resolveMeaning({ tokens, tokenIndex, contextSentence: input.sentence });
  if (meaning.abstained || meaning.confidence !== "high") return null;
  const english = meaning.displayEnglish.trim();
  if (!english || !isTestableClue(english)) return null;

  // A confidently-resolved context may legitimately be a slang or figurative
  // sense — if the article really says it, that is what the word means there,
  // and teaching it is correct. The register is still recorded so a caller can
  // decline if it wants only neutral material.
  return {
    french: tokens[tokenIndex].clean,
    english,
    source: "contextual-resolver",
    register: classifyRegister(english),
    confidence: "high",
    rejected: [],
  };
}

/**
 * The clue for a word being drilled on its own, with no sentence behind it.
 *
 * Without context there is nothing to disambiguate with, so the only
 * defensible answer is the sense a learner would meet first — and anything
 * vulgar, archaic or obscure is rejected outright rather than ranked.
 */
export function canonicalExerciseGloss(french: string): ExerciseGloss | null {
  // The lexical identity, not however the word happened to be printed: an
  // answer captured as "oignons," must resolve like "oignons".
  const lexical = cleanWord(french);
  if (!lexical) return null;
  const lookup = lookupWord(lexical);
  if (lookup.source === "missing" || lookup.translations.length === 0) return null;

  const rejected: { gloss: string; reason: string }[] = [];
  for (const gloss of lookup.translations) {
    if (!isLearnerSafeGloss(gloss)) rejected.push({ gloss, reason: `${classifyRegister(gloss)} register` });
    else if (!isTestableClue(gloss)) rejected.push({ gloss, reason: "too generic to test" });
  }

  const safe = leadingLearnerSense(lookup.translations);
  if (!safe || !isTestableClue(safe)) return null;

  const curated = CURATED_LAYERS.has(lookup.layer ?? "");
  // A guessed lemma may belong to a different word class than the form being
  // drilled — "murmura" strips to the noun "murmure". That is a reason to
  // claim less confidence, not to refuse: reaching a plural's singular is the
  // ordinary case and refusing it would silently drop most noun exercises.
  const viaGuess = !!lookup.partOfSpeechUncertain;
  return {
    french: lexical,
    english: safe,
    source: curated ? "canonical-curated" : "canonical-generated",
    register: classifyRegister(safe),
    // The generated layer can be right and often is, but its ordering is not
    // editorial, so a clue drawn from it is never claimed as high confidence.
    confidence: curated && !viaGuess ? "high" : "medium",
    rejected,
  };
}

/**
 * The one entry point exercises use.
 *
 * Prefers what the word meant where the learner actually met it, falls back to
 * the canonical learner sense, and returns null rather than reaching for
 * whatever gloss happens to be available.
 */
export function exerciseGlossFor(input: {
  french: string;
  sentence?: string | null;
  tokens?: Token[];
  tokenIndex?: number;
  /** Reject anything below this. Defaults to accepting medium. */
  minimumConfidence?: "high" | "medium";
}): ExerciseGloss | null {
  const minimum = input.minimumConfidence ?? "medium";

  if (input.sentence) {
    const contextual = contextualExerciseGloss({
      french: input.french,
      sentence: input.sentence,
      tokens: input.tokens,
      tokenIndex: input.tokenIndex,
    });
    if (contextual) return contextual;
  }

  const canonical = canonicalExerciseGloss(input.french);
  if (!canonical) return null;
  if (minimum === "high" && canonical.confidence !== "high") return null;
  return canonical;
}

/** Readable provenance for a chosen clue. Development diagnostics only. */
export function explainExerciseGloss(gloss: ExerciseGloss | null, french: string): string {
  if (!gloss) return `French: ${french}\nChosen exercise gloss: (none — question skipped)`;
  const lines = [
    `French: ${gloss.french}`,
    `Chosen exercise gloss: ${gloss.english}`,
    `Source: ${gloss.source}`,
    `Register: ${gloss.register}`,
    `Confidence: ${gloss.confidence}`,
  ];
  if (gloss.rejected.length > 0) {
    lines.push("", "Rejected senses:");
    for (const item of gloss.rejected) lines.push(`  ${item.gloss} — ${item.reason}`);
  }
  return lines.join("\n");
}
