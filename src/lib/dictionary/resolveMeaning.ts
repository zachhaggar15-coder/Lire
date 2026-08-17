import type { ArticleTranslationAlignmentSegment } from "@/lib/ai/types";
import {
  buildContextualTranslation,
  normaliseContextText,
  type ContextualTranslationConfidence,
  type ContextualTranslationGrammar,
  type ContextualTranslationResult,
} from "@/lib/dictionary/contextualTranslation";
import { isContextAmbiguous, sensesAgree } from "@/lib/dictionary/ambiguity";
import { lookupWord } from "@/lib/dictionary/lookup";
import type { DictionaryExample, DictionaryLookupResult } from "@/lib/dictionary/types";
import { hashString } from "@/lib/hash";
import {
  findNaturalTranslationForToken,
  isWordScopedAlignment,
  type ResolvedTranslationAlignment,
} from "@/lib/translationAlignment";
import type { Token } from "@/lib/words";

/**
 * The one place that decides what a tapped word means here.
 *
 * Before this module, three systems each had an opinion and the word sheet
 * showed all of them stacked: a natural article-translation span, a contextual
 * translation, and the raw dictionary list. A reader tapping "compte" inside
 * "se rend compte" could see "to realise", "account", and a clause-sized
 * English fragment at once, with nothing saying which was the answer. Deciding
 * in the UI also meant every surface decided differently.
 *
 * Everything that used to be a competing headline is now either *the* answer
 * or demoted to supporting detail on one ResolvedMeaning. Callers render what
 * they are given; they do not re-rank.
 */

export type MeaningSource =
  | "phrase"
  | "natural-alignment"
  | "context-rule"
  | "curated-dictionary"
  | "generated-dictionary"
  | "ai-contextual"
  | "unresolved";

export type MeaningConfidence = ContextualTranslationConfidence;

export interface ResolvedMeaning {
  /** Exactly what the reader tapped, for the "you tapped X" line. */
  tappedText: string;
  /** The French unit actually being explained — the word, or the expression it belongs to. */
  displayFrench: string;
  /** The single contextual English meaning. Empty string only when `source` is "unresolved". */
  displayEnglish: string;
  lemma: string | null;
  /** Set when the tapped word is only part of what's being translated, e.g. "se rendre compte". */
  partOfExpression: string | null;
  source: MeaningSource;
  confidence: MeaningConfidence;
  /** Other dictionary senses, for the More disclosure. Never shown as competing answers. */
  alternatives: string[];
  contextSentence: string;
  partOfSpeech: string | null;
  /** True when partOfSpeech describes a guessed lemma and may not fit the tapped form. */
  partOfSpeechUncertain: boolean;
  grammar: ContextualTranslationGrammar | null;
  examples: DictionaryExample[];
  /** Plain-language note on why this reading was chosen — supporting detail only. */
  explanation: string;
  /**
   * True when Lire could not settle on a meaning it trusts. The UI must say so
   * rather than showing displayEnglish, which is empty in this state. Teaching
   * a learner the wrong sense costs more than admitting a gap.
   */
  abstained: boolean;
  /** True when a targeted AI lookup is worth running for this tap. See shouldEscalateToAi. */
  wantsAiEscalation: boolean;
  /** Stable identity for caching and for deciding whether a later result is the same answer. */
  cacheKey: string;
}

export interface ResolveMeaningInput {
  tokens: Token[];
  tokenIndex: number;
  contextSentence: string;
  previousSentence?: string | null;
  nextSentence?: string | null;
  /** Natural article-translation alignments for this sentence, when the translation has loaded. */
  alignments?: ArticleTranslationAlignmentSegment[] | null;
  /** Pre-computed lookup, if the caller already has one. Saves a duplicate lookup on hot paths. */
  lookup?: DictionaryLookupResult;
  /** A previously fetched AI contextual meaning for this exact tap. See aiMeaningCacheKey. */
  aiMeaning?: AiContextualMeaning | null;
}

/** The shape resolveMeaning needs back from an AI contextual lookup. */
export interface AiContextualMeaning {
  translation: string;
  meaningInContext?: string | null;
}

/**
 * Widest natural-alignment span that may stand in as the answer for a single
 * tapped word.
 *
 * The article translator aligns at whatever granularity reads well, so the
 * segment containing a tapped word can be a whole clause. A clause is a fine
 * thing to show *alongside* the French, but presenting it as the word's
 * meaning is how "mouillé" ended up glossed "Was a ship moored in some inland
 * port". Anything wider stays out of the headline.
 */
const MAX_ALIGNMENT_WORDS_AS_ANSWER = 3;

/**
 * Alignment spans this short are usually filler that carries no meaning on its
 * own ("the", "of"), so they lose to a real lexical answer.
 */
const MIN_USEFUL_ALIGNMENT_CHARS = 2;

export function meaningCacheKey(input: {
  tappedText: string;
  contextSentence: string;
  lemma?: string | null;
}): string {
  const raw = [
    input.tappedText.trim().toLowerCase(),
    normaliseContextText(input.contextSentence).toLowerCase(),
    (input.lemma ?? "").toLowerCase(),
  ].join("::");
  return `meaning.v1.${hashString(raw)}`;
}

/**
 * Cache key for an AI contextual lookup. Deliberately includes the sentence:
 * the whole point of a contextual meaning is that the same French word means
 * something different elsewhere, so a word-only key would leak one sentence's
 * sense into another.
 */
export function aiMeaningCacheKey(tappedText: string, contextSentence: string): string {
  return meaningCacheKey({ tappedText, contextSentence });
}

/**
 * Resolves one tapped token to one contextual meaning.
 *
 * Priority ladder, highest first. Each tier only wins when it genuinely
 * applies, so a tap falls through to the cheapest tier that can answer it and
 * the common case stays fully offline and instant:
 *
 *   1. Known expression / idiom containing the tapped word.
 *   2. A tightly-scoped natural article-translation alignment.
 *   3. Contextual lexical resolution (pronouns, contractions, polysemy,
 *      reflexives, conjugation, negation, function words).
 *   4. Trusted curated dictionary sense.
 *   5. Generated dictionary sense, hedged because its ordering is not editorial.
 *   6. AI contextual meaning, when the caller has already fetched one.
 *
 * Tiers 1 and 3-5 all come out of buildContextualTranslation, which already
 * runs them in this order; this function's job is to slot the natural
 * alignment in at the right height, grade the result, and decide between
 * answering and abstaining.
 */
export function resolveMeaning(input: ResolveMeaningInput): ResolvedMeaning {
  const token = input.tokens[input.tokenIndex];
  const tappedText = token?.clean || token?.text?.trim() || "";
  const contextSentence = input.contextSentence;

  const lookup = input.lookup ?? lookupWord(token?.text ?? tappedText, adjacentWords(input.tokens, input.tokenIndex));
  const contextual = buildContextualTranslation({
    tokens: input.tokens,
    tokenIndex: input.tokenIndex,
    contextSentence,
    previousSentence: input.previousSentence,
    nextSentence: input.nextSentence,
    lookup,
  });

  const alignment = input.alignments
    ? findNaturalTranslationForToken(input.tokens, input.tokenIndex, input.alignments)
    : null;

  const base = {
    tappedText,
    lemma: contextual.lemma,
    contextSentence,
    partOfSpeech: lookup.partOfSpeech,
    partOfSpeechUncertain: !!lookup.partOfSpeechUncertain,
    grammar: contextual.grammar,
    examples: lookup.examples,
    cacheKey: meaningCacheKey({ tappedText, contextSentence, lemma: contextual.lemma }),
  };

  // Tier 1 — a known expression containing this word. This outranks even a
  // natural alignment: the phrase bank names the whole idiom ("se rendre
  // compte"), which is the unit a learner needs, while an alignment segment
  // may cut across it.
  if (contextual.source === "phrasebank") {
    // The citation form, not the inflected span: a reader who taps "compte" in
    // "elle se rend compte" should be shown "se rendre compte", which is the
    // unit they can look for again and save, rather than "se rend compte du".
    const expression = expressionMembership(contextual, tappedText);
    return {
      ...base,
      displayFrench: expression ?? contextual.selectedText,
      displayEnglish: contextual.contextualTranslation,
      partOfExpression: expression,
      source: "phrase",
      confidence: contextual.confidence,
      alternatives: contextual.alternativeMeanings,
      explanation: contextual.explanation,
      abstained: false,
      wantsAiEscalation: false,
    };
  }

  const localSource = toMeaningSource(contextual, lookup);
  const localConfidence = contextual.confidence;
  const localAnswered = contextual.source !== "missing" && !!contextual.contextualTranslation;

  // Tier 2 — a natural alignment, but only when it is scoped to this word
  // rather than to the clause around it, and only when the local answer is not
  // already a confident one. A perfectly good curated sense should not be
  // displaced just because the article translation happened to finish loading.
  if (usableAsAnswer(alignment) && (!localAnswered || localConfidence !== "high")) {
    return {
      ...base,
      displayFrench: alignment.french,
      displayEnglish: alignment.english,
      partOfExpression: alignment.frenchWordCount > 1 ? alignment.french : null,
      source: "natural-alignment",
      confidence: "high",
      alternatives: dedupe([contextual.contextualTranslation, ...contextual.alternativeMeanings], alignment.english),
      explanation: "Taken from this article's own English translation of the phrase this word sits in.",
      abstained: false,
      wantsAiEscalation: false,
    };
  }

  // Tier 6 — an AI contextual meaning the caller fetched for this exact tap.
  // Only consulted once local tiers have failed to produce something trusted,
  // so ordinary vocabulary never waits on the network.
  if (input.aiMeaning?.translation?.trim() && (!localAnswered || localConfidence === "low")) {
    return {
      ...base,
      displayFrench: contextual.selectedText || tappedText,
      displayEnglish: input.aiMeaning.translation.trim(),
      partOfExpression: null,
      source: "ai-contextual",
      confidence: "medium",
      alternatives: dedupe(
        [contextual.contextualTranslation, ...contextual.alternativeMeanings],
        input.aiMeaning.translation.trim()
      ),
      explanation: input.aiMeaning.meaningInContext?.trim() || "Worked out from this sentence when the offline dictionaries could not settle it.",
      abstained: false,
      wantsAiEscalation: false,
    };
  }

  // Tiers 3-5 — whatever contextual resolution settled on locally, after
  // asking whether a bare lexical answer is actually trustworthy for this word.
  const graded = gradeLocalAnswer(contextual, lookup, tappedText, alignment, localConfidence);

  if (localAnswered && graded !== "low") {
    return {
      ...base,
      displayFrench: contextual.expandedPhrase ?? contextual.selectedText,
      displayEnglish: contextual.contextualTranslation,
      partOfExpression: expressionMembership(contextual, tappedText),
      source: localSource,
      confidence: graded,
      alternatives: contextual.alternativeMeanings,
      explanation: contextual.explanation,
      abstained: false,
      wantsAiEscalation: false,
    };
  }

  // A low-confidence local answer is still shown — hedged, and flagged for an
  // AI upgrade — because a plausible lead gloss with a caveat helps more than
  // a blank. Nothing at all is the only case Lire refuses to guess at.
  if (localAnswered && localConfidence !== "low" && graded === "low") {
    // Downgraded by ambiguity or source disagreement rather than by the
    // dictionary itself. Same treatment: shown, hedged, escalated.
    return {
      ...base,
      displayFrench: contextual.expandedPhrase ?? contextual.selectedText,
      displayEnglish: contextual.contextualTranslation,
      partOfExpression: expressionMembership(contextual, tappedText),
      source: localSource,
      confidence: "low",
      alternatives: contextual.alternativeMeanings,
      explanation: contextual.explanation,
      abstained: false,
      wantsAiEscalation: true,
    };
  }

  if (localAnswered) {
    return {
      ...base,
      displayFrench: contextual.expandedPhrase ?? contextual.selectedText,
      displayEnglish: contextual.contextualTranslation,
      partOfExpression: expressionMembership(contextual, tappedText),
      source: localSource,
      confidence: "low",
      alternatives: contextual.alternativeMeanings,
      explanation: contextual.explanation,
      abstained: false,
      wantsAiEscalation: true,
    };
  }

  return {
    ...base,
    displayFrench: contextual.selectedText || tappedText,
    displayEnglish: "",
    partOfExpression: null,
    source: "unresolved",
    confidence: "low",
    alternatives: [],
    explanation: "No offline layer recognised this form in this sentence.",
    abstained: true,
    wantsAiEscalation: true,
  };
}

/**
 * Whether a freshly-resolved meaning should replace one already on screen.
 *
 * Data arrives at different times — the generated dictionary streams in, the
 * article translation lands later, an AI lookup later still — and a sheet whose
 * headline answer swaps while the reader is looking at it reads as a system
 * that does not know what it thinks. So a replacement has to actually be
 * better: more confident, or an escape from abstaining. An equally-confident
 * different wording is not an improvement and is left alone.
 */
export function isMeaningUpgrade(current: ResolvedMeaning | null, next: ResolvedMeaning): boolean {
  if (!current) return true;
  if (current.cacheKey !== next.cacheKey) return true;
  if (current.abstained) return !next.abstained;
  if (next.abstained) return false;
  return confidenceRank(next.confidence) > confidenceRank(current.confidence);
}

/**
 * Whether this tap justifies a network call.
 *
 * Deliberately narrow. Escalating on anything less than a genuine local
 * failure would put an API round-trip behind ordinary words like "sur" and
 * "depuis", which the offline layers answer correctly and instantly.
 */
export function shouldEscalateToAi(meaning: ResolvedMeaning): boolean {
  return meaning.wantsAiEscalation && !meaning.partOfExpression;
}

function confidenceRank(confidence: MeaningConfidence): number {
  return confidence === "high" ? 3 : confidence === "medium" ? 2 : 1;
}

/**
 * Contextual sources that actually *chose a sense*, as opposed to merely
 * describing the word's form.
 *
 * The distinction matters more than it looks. Grammar inference can tell you
 * "fait" is third-person singular present without telling you whether the
 * sentence means "does", "makes", or the noun "fact" — so a grammar-only
 * result is still a bare lexical answer wearing a context label, and must not
 * inherit a context rule's confidence.
 */
const SENSE_SELECTING_SOURCES = new Set<ContextualTranslationResult["source"]>([
  "phrasebank",
  "context-rule",
  "pronoun",
  "contraction",
  "proper-noun",
]);

/**
 * Final confidence for a locally-resolved answer, combining three signals the
 * old source-trust-only model ignored.
 *
 * 1. Did anything actually select a sense? A phrase match or a context rule
 *    did; a dictionary lookup or a bare grammar reading did not.
 * 2. Is this a word whose meaning genuinely turns on the sentence? See
 *    ambiguity.ts — this is what stopped `tour` from confidently meaning
 *    "tower" in "c'est son tour", and what lets `chat` stay local.
 * 3. Do the independent sources agree? Corroboration is evidence; material
 *    disagreement is a reason to doubt whichever one happened to win.
 *
 * Only the grade changes. The UI still receives exactly one meaning — the
 * extra sophistication decides how sure Lire claims to be and whether it
 * quietly asks for help, never what the reader is shown competing against.
 */
function gradeLocalAnswer(
  contextual: ContextualTranslationResult,
  lookup: DictionaryLookupResult,
  tappedText: string,
  alignment: ResolvedTranslationAlignment | null,
  localConfidence: MeaningConfidence
): MeaningConfidence {
  const senseWasSelected = SENSE_SELECTING_SOURCES.has(contextual.source);
  const answer = contextual.contextualTranslation;

  // A natural article translation is independent evidence even when its span
  // is too wide to *be* the answer, so it is consulted here regardless of
  // whether it passed usableAsAnswer above.
  const alignmentEnglish = alignment?.english ?? null;
  const corroborated = !!alignmentEnglish && sensesAgree(answer, alignmentEnglish);
  const contradicted = !!alignmentEnglish && !corroborated && isWordScopedAlignment(alignment);

  if (senseWasSelected) {
    // A rule picked the sense and the article's own translation agrees: the
    // strongest local evidence available short of asking a model.
    if (corroborated) return "high";
    // A rule picked one sense and a tightly-scoped alignment picked another.
    // Neither is authoritative enough to overrule the other, so say less.
    if (contradicted) return "low";
    return localConfidence;
  }

  // Nothing chose a sense. For a word whose meaning depends on the sentence,
  // that is precisely the case where a leading gloss is a coin flip.
  if (isContextAmbiguous(lookup, tappedText)) return "low";
  if (contradicted) return "low";
  if (corroborated) return "high";
  return localConfidence;
}

/**
 * The expression a tapped word belongs to, or null when the word *is* the
 * whole unit.
 *
 * Prefers the dictionary lemma over the span as it appears in the sentence,
 * so the reader is shown the form they can look up and study ("avoir besoin
 * de") rather than this sentence's conjugation of it ("a besoin de").
 */
function expressionMembership(contextual: ContextualTranslationResult, tappedText: string): string | null {
  // A multi-word proper noun is not an expression a learner "belongs to" —
  // "Macron" is part of "Emmanuel Macron" in a trivial sense that would read as
  // a grammar note if surfaced like an idiom.
  if (contextual.source === "proper-noun") return null;
  const phrase = (contextual.lemma?.includes(" ") ? contextual.lemma : contextual.expandedPhrase)?.trim();
  if (!phrase) return null;
  const normalisedPhrase = phrase.toLowerCase().replace(/\s+/g, " ");
  const normalisedTap = tappedText.toLowerCase().trim();
  if (!normalisedPhrase || normalisedPhrase === normalisedTap) return null;
  return phrase;
}

function toMeaningSource(contextual: ContextualTranslationResult, lookup: DictionaryLookupResult): MeaningSource {
  switch (contextual.source) {
    case "phrasebank":
      return "phrase";
    case "context-rule":
    case "pronoun":
    case "contraction":
    case "grammar":
    case "proper-noun":
      return "context-rule";
    case "missing":
      return "unresolved";
    default:
      return lookup.layer === "generated" ? "generated-dictionary" : "curated-dictionary";
  }
}

function usableAsAnswer(
  alignment: ResolvedTranslationAlignment | null
): alignment is ResolvedTranslationAlignment {
  if (!alignment) return false;
  if (!isWordScopedAlignment(alignment)) return false;
  if (alignment.frenchWordCount > MAX_ALIGNMENT_WORDS_AS_ANSWER) return false;
  return alignment.english.trim().length > MIN_USEFUL_ALIGNMENT_CHARS;
}

function dedupe(values: (string | null | undefined)[], exclude: string): string[] {
  const seen = new Set([exclude.trim().toLowerCase()]);
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

function adjacentWords(tokens: Token[], index: number): { previousWord: string | null; nextWord: string | null } {
  let previousWord: string | null = null;
  for (let i = index - 1; i >= 0; i--) {
    if (tokens[i].isWord) {
      previousWord = tokens[i].clean;
      break;
    }
  }
  let nextWord: string | null = null;
  for (let i = index + 1; i < tokens.length; i++) {
    if (tokens[i].isWord) {
      nextWord = tokens[i].clean;
      break;
    }
  }
  return { previousWord, nextWord };
}
