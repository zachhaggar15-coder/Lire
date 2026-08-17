/**
 * How competing interpretations of a tapped word are ranked.
 *
 * Everything numeric about resolution lives here. Scattering weights through
 * the resolver is how the previous design became untestable: each tier decided
 * its own confidence, so the only way to know why an answer won was to trace
 * the order the tiers happened to run in.
 *
 * The model is deliberately simple arithmetic rather than anything learned.
 * It has to be inspectable — when a reader reports a wrong translation, the
 * question "why did this candidate win?" must have a readable answer. See
 * explainResolution in diagnostics.ts.
 */

/**
 * How much of the sentence an interpretation claims to explain.
 *
 * This is the backbone of the whole model, and the thing that replaces rule
 * ordering. A reading built from a whole idiom accounts for more of what the
 * writer wrote than one built from a single dictionary entry, so it should win
 * on merit rather than because it was checked first.
 */
export const SPECIFICITY = {
  /** A complete fixed expression: "se rendre compte", "avoir besoin de". */
  expression: 6,
  /** A recognised syntactic construction, e.g. a verb with its governed preposition ("compter sur"). */
  construction: 5,
  /** A verb plus its complement, or a reflexive pattern. */
  complement: 4,
  /** A rule keyed on the sentence, weighted further by how much of it matched. */
  contextRule: 3,
  /** Part-of-speech or morphology inference — describes the form, not the sense. */
  morphology: 2,
  /** A general lexical rule with no sentence evidence behind it. */
  lexicalRule: 1,
  /** A bare dictionary sense. */
  dictionary: 0,
} as const;

/**
 * How far each source is trusted before any sentence evidence is considered.
 *
 * Calibrated so a clean dictionary answer with nothing competing against it
 * sits comfortably above MINIMUM_ASSERTABLE_SCORE. Source trust is a starting
 * point, not a verdict: a curated entry outranks a generated one, but either
 * can be pushed below the threshold by ambiguity or contradicted evidence, and
 * either can be beaten outright by a reading that explains more of the
 * sentence.
 */
export const SOURCE_TRUST: Record<string, number> = {
  expression: 0.62,
  "ai-contextual": 0.55,
  "context-rule": 0.52,
  "curated-dictionary": 0.5,
  "natural-alignment": 0.48,
  grammar: 0.44,
  "generated-dictionary": 0.42,
};

/**
 * Weights applied to each piece of evidence.
 *
 * Positive terms are reasons to believe a reading; negative terms are reasons
 * to doubt it. They are tuned so that no single signal can carry a candidate
 * on its own — a reading needs either strong specificity or corroboration from
 * an independent source to reach high confidence.
 */
export const WEIGHTS = {
  /** Per specificity step. The dominant term, by design. */
  specificity: 0.06,
  /** The article's own translation independently says the same thing. */
  alignmentAgrees: 0.2,
  /** A tightly-scoped alignment says something materially different. */
  alignmentConflicts: -0.25,
  /** Grammatical context positively supports this reading (determiner, auxiliary, reflexive, preposition). */
  grammaticalSupport: 0.12,
  /** Grammatical context points the other way. */
  grammaticalConflict: -0.18,
  /** The word offers several genuinely different meanings. */
  senseAmbiguity: -0.16,
  /** The token has more than one plausible grammatical analysis. */
  grammaticalAmbiguity: -0.12,
  /** Reached only through a rule-based lemma guess, which can cross word classes. */
  weakMorphology: -0.15,
  /** This span's meaning is not the sum of its parts, so a literal reading is suspect. */
  idiomaticity: 0.18,
  /** The dictionary itself marks this as the leading sense. */
  leadingSense: 0.05,
  /**
   * Extra demotion for an alignment that disagrees with the lexicon.
   *
   * A contested article translation is a reason to doubt, not a licence to
   * overrule: one mistranslated span should not rewrite what a word means.
   * Applied on top of the ordinary conflict penalty so the alignment drops
   * below the lexical reading, leaving the stabler source holding the headline
   * while the disagreement pushes the whole tap into escalation.
   */
  disputedAlignment: -0.25,
} as const;

/** Score below which a winning candidate is not worth asserting. */
export const MINIMUM_ASSERTABLE_SCORE = 0.34;

/**
 * How far ahead the winner must be to count as settled.
 *
 * This is the measure the old design lacked entirely. Asking only "which
 * source won" says nothing about whether the runner-up was equally plausible:
 * 0.91 against 0.42 is a decision, 0.72 against 0.69 is a coin flip wearing a
 * winner's label. Two materially different readings this close together are
 * escalated rather than guessed between.
 */
export const CONFIDENT_MARGIN = 0.12;
export const CLEAR_MARGIN = 0.24;

export interface ScoredEvidence {
  specificity: number;
  sourceTrust: number;
  alignmentAgrees?: boolean;
  alignmentConflicts?: boolean;
  grammaticalSupport?: boolean;
  grammaticalConflict?: boolean;
  senseAmbiguity?: boolean;
  grammaticalAmbiguity?: boolean;
  weakMorphology?: boolean;
  idiomatic?: boolean;
  leadingSense?: boolean;
  /** This candidate *is* an alignment that the lexicon contradicts. */
  disputedAlignment?: boolean;
  /** Extra specificity earned by how much of the sentence a rule actually matched. */
  matchedWords?: number;
}

/**
 * Runs the weights over one candidate's evidence.
 *
 * Floored at zero but deliberately not capped. An upper clamp destroyed the
 * signal the margin depends on: "se rendre compte" and "rendre compte" both
 * saturated at 1.0, so the reflexive clitic separating them became invisible
 * and every tap on "compte" escalated as a tie. Scores are only ever compared
 * with each other, so the absolute ceiling never mattered.
 */
export function scoreEvidence(evidence: ScoredEvidence): number {
  let score = evidence.sourceTrust;
  score += evidence.specificity * WEIGHTS.specificity;
  score += Math.min(evidence.matchedWords ?? 0, 4) * WEIGHTS.specificity;
  if (evidence.alignmentAgrees) score += WEIGHTS.alignmentAgrees;
  if (evidence.alignmentConflicts) score += WEIGHTS.alignmentConflicts;
  if (evidence.grammaticalSupport) score += WEIGHTS.grammaticalSupport;
  if (evidence.grammaticalConflict) score += WEIGHTS.grammaticalConflict;
  if (evidence.senseAmbiguity) score += WEIGHTS.senseAmbiguity;
  if (evidence.grammaticalAmbiguity) score += WEIGHTS.grammaticalAmbiguity;
  if (evidence.weakMorphology) score += WEIGHTS.weakMorphology;
  if (evidence.idiomatic) score += WEIGHTS.idiomaticity;
  if (evidence.leadingSense) score += WEIGHTS.leadingSense;
  if (evidence.disputedAlignment) score += WEIGHTS.disputedAlignment;
  return Math.max(0, score);
}

export type ResolutionConfidence = "high" | "medium" | "low";

/**
 * Turns the shape of the candidate field into a confidence.
 *
 * Both halves matter. A winner can be strong in absolute terms and still be
 * uncertain because something else explains the sentence nearly as well, and a
 * lone candidate with nothing to compete against is not thereby correct.
 */
export function confidenceFromField(bestScore: number, runnerUpScore: number | null): ResolutionConfidence {
  if (bestScore < MINIMUM_ASSERTABLE_SCORE) return "low";
  const margin = runnerUpScore === null ? Number.POSITIVE_INFINITY : bestScore - runnerUpScore;
  if (margin < CONFIDENT_MARGIN) return "low";
  if (margin >= CLEAR_MARGIN && bestScore >= 0.6) return "high";
  if (bestScore >= 0.72) return "high";
  return "medium";
}
