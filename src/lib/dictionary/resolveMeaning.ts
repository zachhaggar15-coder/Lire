import type { ArticleTranslationAlignmentSegment } from "@/lib/ai/types";
import {
  buildContextualTranslation,
  normaliseContextText,
  type ContextualTranslationConfidence,
  type ContextualTranslationGrammar,
  type ContextualTranslationResult,
} from "@/lib/dictionary/contextualTranslation";
import { validateAiSpan } from "@/lib/dictionary/aiSpan";
import { functionWordLemmaLabel, functionWordRole, surfaceGlossFor } from "@/lib/dictionary/surfaceGloss";
import { isContextAmbiguous, sensesAgree } from "@/lib/dictionary/ambiguity";
import {
  buildCandidateContext,
  generateCandidates,
  type CandidateContext,
  type CandidateInput,
  type MeaningCandidate,
} from "@/lib/dictionary/candidates";
import { lookupWord } from "@/lib/dictionary/lookup";
import {
  confidenceFromField,
  scoreEvidence,
  SOURCE_TRUST,
  SPECIFICITY,
} from "@/lib/dictionary/scoring";
import type { DictionaryExample, DictionaryLookupResult } from "@/lib/dictionary/types";
import { hashString } from "@/lib/hash";
import { findNaturalTranslationForToken } from "@/lib/translationAlignment";
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

/**
 * A whole sentence's natural English, kept in a wrapper of its own.
 *
 * The wrapper is the point. Sentence translations are genuinely useful and
 * should be shown — but a bare `string` field sitting next to `displayEnglish`
 * is an accident waiting to happen, and the accident already happened once: a
 * clause-sized translation ended up presented as a single word's meaning. A
 * distinct type means assigning one to the other cannot compile, so the two can
 * never be confused again by a future edit rather than merely by convention.
 */
export interface SentenceMeaning {
  readonly kind: "sentence-translation";
  /** The French sentence, exactly as the reader is reading it. */
  french: string;
  /** Natural English for the whole sentence. Never a word gloss. */
  english: string;
  /** Where this translation came from, so untrusted sources can be labelled or withheld. */
  source: "article-translation" | "cached-contextual" | "ai-sentence";
}

export function sentenceMeaning(
  french: string,
  english: string,
  source: SentenceMeaning["source"]
): SentenceMeaning {
  return { kind: "sentence-translation", french, english, source };
}

export interface ResolvedMeaning {
  /** Exactly what the reader tapped, for the "you tapped X" line. */
  tappedText: string;
  /** The French unit actually being explained — the word, or the expression it belongs to. */
  displayFrench: string;
  /**
   * What the tapped token or expression contributes *here* — the answer to
   * "what does this mean in this sentence?".
   *
   * For an inflected verb this is the inflected English ("has", "said"), not
   * the infinitive: the dictionary form lives in `lemmaGloss`. Empty string
   * only when `source` is "unresolved".
   */
  displayEnglish: string;
  lemma: string | null;
  /**
   * The dictionary definition of the lemma — "to have" for "a".
   *
   * Deliberately separate from displayEnglish. Conflating the two is what made
   * tapping the auxiliary in "il a dit" answer "to have", which is true of
   * `avoir` and unhelpful about the sentence. Shown under More.
   */
  lemmaGloss: string | null;
  /**
   * Short note on the token's grammatical job, when that explains why its
   * meaning and the sentence's meaning look mismatched. Null for ordinary
   * vocabulary, where it would be noise.
   */
  grammaticalRole: string | null;
  /**
   * Natural English for the whole sentence, when a trustworthy one exists.
   *
   * Supporting context shown under its own heading — never the headline
   * answer, and structurally incapable of becoming one. See SentenceMeaning.
   */
  sentenceTranslation: SentenceMeaning | null;
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
   * True when Sorlio could not settle on a meaning it trusts. The UI must say so
   * rather than showing displayEnglish, which is empty in this state. Teaching
   * a learner the wrong sense costs more than admitting a gap.
   */
  abstained: boolean;
  /** True when a targeted AI lookup is worth running for this tap. See shouldEscalateToAi. */
  wantsAiEscalation: boolean;
  /** Stable identity for caching and for deciding whether a later result is the same answer. */
  cacheKey: string;
}

/** One candidate with the score the weights gave it. */
export interface ScoredCandidate {
  candidate: MeaningCandidate;
  score: number;
}

/** A resolution plus the field it was chosen from. Diagnostics only — the UI sees `meaning`. */
export interface ResolutionOutcome {
  meaning: ResolvedMeaning;
  candidates: ScoredCandidate[];
  /** Score of the best candidate that materially disagreed with the winner, if any. */
  runnerUpScore: number | null;
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
  /**
   * A trustworthy natural translation of the whole sentence, when one is
   * available. Passed in rather than derived: only the caller knows whether
   * the article translation has loaded, and a translation stitched together
   * from word glosses is exactly what must not appear here.
   */
  sentenceTranslation?: SentenceMeaning | null;
}

/** The shape resolveMeaning needs back from an AI contextual lookup. */
export interface AiContextualMeaning {
  translation: string;
  meaningInContext?: string | null;
  /**
   * The French span the model says this meaning belongs to, when it identified
   * a larger unit than the tapped word — "tenir le coup" for a tap on "coup".
   * Never trusted as given: validated against the real tokens before use.
   */
  semanticSpan?: string | null;
}



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
 * Delegates to resolveWithCandidates: every interpretation the sentence
 * supports is generated, scored against the evidence, and the strongest is
 * returned. There is no tier ladder any more — a reading wins by explaining
 * more of the sentence, not by being checked earlier.
 */
export function resolveMeaning(input: ResolveMeaningInput): ResolvedMeaning {
  return resolveWithCandidates(input).meaning;
}

/**
 * The full resolution, including the candidates that lost.
 *
 * Kept separate from resolveMeaning so diagnostics can inspect the whole field
 * without the production path paying for it or the UI ever seeing it.
 */
export function resolveWithCandidates(input: ResolveMeaningInput): ResolutionOutcome {
  const token = input.tokens[input.tokenIndex];
  const tappedText = token?.clean || token?.text?.trim() || "";
  const contextSentence = input.contextSentence;

  const lookup = input.lookup ?? lookupWord(token?.text ?? tappedText, adjacentWords(input.tokens, input.tokenIndex));
  const alignment = input.alignments
    ? findNaturalTranslationForToken(input.tokens, input.tokenIndex, input.alignments)
    : null;

  // buildContextualTranslation still supplies the grammar description and the
  // examples shown under More; it no longer decides the answer.
  const contextual = buildContextualTranslation({
    tokens: input.tokens,
    tokenIndex: input.tokenIndex,
    contextSentence,
    previousSentence: input.previousSentence,
    nextSentence: input.nextSentence,
    lookup,
  });

  const candidateInput: CandidateInput = {
    tokens: input.tokens,
    tokenIndex: input.tokenIndex,
    sentence: contextSentence,
    lookup,
    alignment: alignment
      ? {
          french: alignment.french,
          english: alignment.english,
          frenchWordCount: alignment.frenchWordCount,
          startIndex: alignment.startIndex,
          endIndex: alignment.endIndex,
        }
      : null,
  };

  const context = buildCandidateContext(candidateInput);
  const candidates = generateCandidates(candidateInput);

  // Pronoun, contraction and grammar readings are worked out by
  // buildContextualTranslation's special-form pass rather than by the rule
  // corpus, so they enter the field from here. They are candidates like any
  // other: "en" as a pronoun has to out-argue "en" as a preposition rather
  // than win by being checked first.
  const specialForm = specialFormCandidate(contextual, tappedText);
  if (specialForm) candidates.push(specialForm);
  const scored = candidates
    .map((candidate) => ({ candidate, score: scoreCandidate(candidate, context, tappedText, lookup) }))
    .sort((a, b) => b.score - a.score);

  // The lemma's own dictionary definition, kept apart from whatever the token
  // contributes here. For "a" in "il a dit" this is "to have" — a true fact
  // about avoir, and the wrong answer to what the reader asked.
  const lemmaGloss = lookup.translations[0] ?? null;
  const surface = surfaceGlossFor({
    clean: tappedText,
    lemma: lookup.lemma,
    lemmaGloss,
    grammar: contextual.grammar,
    isAuxiliary: isServingAsAuxiliary(input.tokens, input.tokenIndex),
    partOfSpeech: lookup.partOfSpeech,
  });

  const base = {
    tappedText,
    lemma: contextual.lemma,
    lemmaGloss,
    grammaticalRole: surface?.role ?? functionWordRole(tappedText, contextSentence),
    sentenceTranslation: input.sentenceTranslation ?? null,
    contextSentence,
    partOfSpeech: lookup.partOfSpeech,
    partOfSpeechUncertain: !!lookup.partOfSpeechUncertain,
    grammar: contextual.grammar,
    examples: lookup.examples,
    cacheKey: meaningCacheKey({ tappedText, contextSentence, lemma: contextual.lemma }),
  };

  const best = scored[0] ?? null;
  const runnerUp = firstMateriallyDifferent(scored, best?.candidate.english ?? "");
  const confidence: MeaningConfidence = best ? confidenceFromField(best.score, runnerUp?.score ?? null) : "low";

  // An AI answer competes only where the local field failed to settle, so
  // ordinary vocabulary is never displaced by a network result.
  if (input.aiMeaning?.translation?.trim() && (!best || confidence === "low")) {
    const english = input.aiMeaning.translation.trim();
    // A span the model claims is only used once it has been found in the real
    // tokens and shown to contain the tap. An unverifiable span is discarded
    // and the answer falls back to describing the tapped word alone, which is
    // still useful and cannot mislabel what the reader touched.
    const span = validateAiSpan(input.tokens, input.tokenIndex, input.aiMeaning.semanticSpan);
    return {
      meaning: {
        ...base,
        displayFrench: span?.french ?? contextual.selectedText ?? tappedText,
        displayEnglish: english,
        partOfExpression: span && span.wordCount > 1 ? span.french : null,
        source: "ai-contextual",
        confidence: "medium",
        alternatives: dedupe(candidates.map((candidate) => candidate.english), english),
        explanation:
          input.aiMeaning.meaningInContext?.trim() ||
          "Worked out from this sentence when the offline dictionaries could not settle it.",
        abstained: false,
        wantsAiEscalation: false,
      },
      candidates: scored,
      runnerUpScore: runnerUp?.score ?? null,
    };
  }

  if (!best || !best.candidate.english) {
    return {
      meaning: {
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
      },
      candidates: scored,
      runnerUpScore: runnerUp?.score ?? null,
    };
  }

  const winner = best.candidate;
  const spansExpression = !!winner.matchedSpan && winner.matchedWords > 1;
  const expression = spansExpression ? winner.french : expressionMembership(contextual, tappedText);
  const partOfExpression =
    expression && expression.toLowerCase().replace(/\s+/g, " ") !== tappedText.toLowerCase() ? expression : null;

  // A single-word winner that is just the lemma's citation form gets inflected
  // into what the sentence is actually using: "to have" becomes "has", "to
  // say" becomes "said". Expressions are left alone — their citation form is
  // the unit being taught — and so is any reading a context rule or the
  // article translation already fitted to the sentence.
  // Exactly the two candidates that restate the lemma rather than choosing a
  // sense: the bare dictionary entry, and the grammar reading that describes
  // the form. A context rule that picked a *different* sense ("compte" ->
  // "matters") is left alone, since inflecting that would discard the choice
  // it made.
  const winnerIsBareLemmaGloss =
    !spansExpression && !!surface && (!!winner.leadingSense || winner.source === "grammar");
  const displayEnglish = winnerIsBareLemmaGloss ? surface.english : winner.english;

  return {
    meaning: {
      ...base,
      // An expression's lemma line would otherwise pair the *expression* with
      // the tapped word's own gloss — "se rendre compte de — account" — which
      // reads as a contradiction. The expression's meaning is already the
      // headline, so there is no separate dictionary form to show.
      //
      // The same problem in a different guise for homographs: once the
      // resolver has read "en" as a clitic pronoun, showing "en — in" beneath
      // it asserts the preposition's meaning as the word's dictionary form and
      // contradicts the answer above. A grammatical label agrees with the
      // analysis instead of undercutting it.
      lemmaGloss: spansExpression ? null : lemmaGlossForDisplay(tappedText, displayEnglish, base.lemmaGloss),
      displayFrench: expression ?? winner.french,
      displayEnglish,
      partOfExpression,
      source: toResolvedSource(winner),
      confidence,
      alternatives: dedupe(
        [...winner.alternatives, ...scored.slice(1).map((entry) => entry.candidate.english)],
        displayEnglish
      ),
      explanation: winner.explanation,
      abstained: false,
      // Escalate when the field could not settle: either nothing scored well
      // enough to assert, or two materially different readings stayed too
      // close together to choose between. Both are honest uncertainty rather
      // than a missing dictionary entry.
      wantsAiEscalation: confidence === "low",
    },
    candidates: scored,
    runnerUpScore: runnerUp?.score ?? null,
  };
}

/**
 * What the detail layer should show as this word's dictionary form.
 *
 * Normally the lemma's own gloss. But for a homograph the resolver has read as
 * a function word — "en" as a clitic pronoun rather than the preposition — the
 * gloss belongs to the *other* word, and printing it under an answer it
 * contradicts is worse than printing nothing. The grammatical label is
 * substituted only when the contextual answer genuinely disagrees with the
 * gloss, so an ordinary word keeps its real definition.
 */
function lemmaGlossForDisplay(
  tappedText: string,
  displayEnglish: string,
  lemmaGloss: string | null
): string | null {
  const label = functionWordLemmaLabel(tappedText);
  if (!label) return lemmaGloss;
  if (lemmaGloss && sensesAgree(displayEnglish, lemmaGloss)) return lemmaGloss;
  return label;
}

/** Forms of avoir and être, which are auxiliaries far more often than they are main verbs. */
const AUXILIARY_FORMS = new Set([
  "ai", "as", "a", "avons", "avez", "ont", "avais", "avait", "avions", "aviez", "avaient",
  "aura", "aurai", "auront", "aurait", "auraient",
  "suis", "es", "est", "sommes", "êtes", "etes", "sont",
  "étais", "etais", "était", "etait", "étaient", "etaient", "sera", "seront", "serait",
]);

/**
 * Words that end like a participle but never are one.
 *
 * The participle test is a suffix check, and French numerals and determiners
 * collide with it — "trois" ends in "is", so "il a trois enfants" looked like a
 * compound tense and a main-verb avoir was described as an auxiliary.
 */
const NEVER_PARTICIPLES = new Set([
  "trois", "six", "dix", "puis", "depuis", "mais", "tres", "très", "apres", "après",
  "fois", "mois", "pays", "fils", "avis", "prix", "choix", "vous", "nous", "plus",
  "lui", "ici", "aussi", "ainsi", "parmi", "demi", "midi", "merci", "celui", "qui",
  "tout", "tous", "quelques", "certains", "plusieurs", "plusieurs",
]);

/** Clitics and adverbs that may sit between an auxiliary and its participle. */
const INTERVENING_BEFORE_PARTICIPLE = new Set([
  "ne", "pas", "plus", "jamais", "bien", "toujours", "déjà", "deja",
  "en", "y", "se", "me", "te", "nous", "vous", "tout", "vraiment",
]);

/**
 * Is this form working as the auxiliary of a compound tense?
 *
 * The test is whether a past participle follows, which is what separates "il a
 * dit" (auxiliary plus participle) from "il a un livre" (avoir as a main verb
 * meaning to have). It decides whether the reader is told "has - auxiliary
 * forming the past tense" or simply "has", and getting it wrong in either
 * direction produces a confusing note rather than a wrong meaning.
 */
function isServingAsAuxiliary(tokens: Token[], tokenIndex: number): boolean {
  const clean = tokens[tokenIndex]?.clean?.toLowerCase() ?? "";
  if (!AUXILIARY_FORMS.has(clean)) return false;
  for (let i = tokenIndex + 1; i < tokens.length; i++) {
    if (!tokens[i].isWord) continue;
    const next = tokens[i].clean.toLowerCase();
    if (INTERVENING_BEFORE_PARTICIPLE.has(next)) continue;
    if (NEVER_PARTICIPLES.has(next) || /^\d/.test(next)) return false;
    return next.length > 2 && /(?:é|ée|és|ées|i|ie|is|it|u|ue|us)$/.test(next);
  }
  return false;
}


/**
 * The strongest candidate that actually disagrees with the winner.
 *
 * Two candidates saying the same thing in different words are corroboration,
 * not competition, so the margin is measured against the best genuinely
 * different reading. Otherwise "to realise" and "realises" would look like a
 * dead heat and every idiom would escalate.
 */
function firstMateriallyDifferent(
  scored: ScoredCandidate[],
  winnerEnglish: string
): ScoredCandidate | null {
  return scored.slice(1).find((entry) => !sensesAgree(entry.candidate.english, winnerEnglish)) ?? null;
}

/**
 * The pronoun / contraction / grammar reading, as a candidate.
 *
 * These are genuine contextual analyses — "en" before a verb is a pronoun, not
 * the preposition — so they sit above bare morphology on the specificity
 * ladder, but below an expression that spans several words.
 */
function specialFormCandidate(
  contextual: ContextualTranslationResult,
  tappedText: string
): MeaningCandidate | null {
  const selecting: ContextualTranslationResult["source"][] = ["pronoun", "contraction", "proper-noun", "grammar"];
  if (!selecting.includes(contextual.source) || !contextual.contextualTranslation) return null;
  const isGrammarOnly = contextual.source === "grammar";
  return {
    french: contextual.selectedText || tappedText,
    english: contextual.contextualTranslation,
    lemma: contextual.lemma,
    source: isGrammarOnly ? "grammar" : "context-rule",
    // Grammar describes the form rather than choosing a sense, so it ranks
    // below the analyses that genuinely disambiguate.
    specificity: isGrammarOnly ? SPECIFICITY.morphology : SPECIFICITY.contextRule,
    matchedWords: 0,
    evidence: [`${contextual.source} analysis of this form`],
    alternatives: contextual.alternativeMeanings,
    explanation: contextual.explanation,
  };
}

function toResolvedSource(candidate: MeaningCandidate): MeaningSource {
  switch (candidate.source) {
    case "expression":
      return "phrase";
    case "natural-alignment":
      return "natural-alignment";
    case "context-rule":
    case "grammar":
      return "context-rule";
    case "generated-dictionary":
      return "generated-dictionary";
    default:
      return "curated-dictionary";
  }
}

/** Applies the weights in scoring.ts to one candidate, given the tap's context. */
function scoreCandidate(
  candidate: MeaningCandidate,
  context: CandidateContext,
  tappedText: string,
  lookup: DictionaryLookupResult
): number {
  // The alignment cannot corroborate itself. Without this exclusion the
  // alignment candidate scored its own text as independent agreement and
  // collected a bonus for it, which let a single mistranslated span outrank
  // the dictionary it was supposed to be checked against.
  const alignmentAgrees =
    candidate.source !== "natural-alignment" &&
    !!context.alignmentEnglish &&
    sensesAgree(candidate.english, context.alignmentEnglish);
  // A disputed alignment penalises *both* sides, including the alignment
  // itself. Exempting it would just move the overconfidence: a single
  // mistranslated span would overrule a curated entry instead of the other way
  // round. Neither is established, so neither gets to assert.
  const alignmentConflicts = context.alignmentDisputed
    ? candidate.source === "natural-alignment" || !!candidate.leadingSense
    : !!context.alignmentEnglish && context.alignmentIsTight && !alignmentAgrees && candidate.source !== "natural-alignment";

  return scoreEvidence({
    specificity: candidate.specificity,
    sourceTrust: SOURCE_TRUST[candidate.source] ?? 0.2,
    matchedWords: candidate.matchedWords,
    alignmentAgrees,
    alignmentConflicts,
    grammaticalSupport: hasGrammaticalSupport(candidate, context),
    grammaticalConflict: hasGrammaticalConflict(candidate, context),
    // Ambiguity counts only against readings that did not themselves resolve
    // it: an expression or a governed construction has already chosen a sense.
    senseAmbiguity: context.senseAmbiguous && candidate.specificity <= SPECIFICITY.contextRule,
    grammaticalAmbiguity: context.grammaticallyAmbiguous && candidate.specificity <= SPECIFICITY.morphology,
    weakMorphology: candidate.viaLemmaGuess,
    disputedAlignment: context.alignmentDisputed && candidate.source === "natural-alignment",
    idiomatic: candidate.idiomatic,
    leadingSense: candidate.leadingSense && !isContextAmbiguous(lookup, tappedText),
  });
}

/**
 * Does the surrounding grammar point towards this reading?
 *
 * A multiword candidate the sentence structure actually licenses — a governed
 * preposition, a reflexive clitic — is far more likely to be what the writer
 * meant than one that merely happens to sit next to the tapped word.
 */
function hasGrammaticalSupport(candidate: MeaningCandidate, context: CandidateContext): boolean {
  // A reflexive clitic in the sentence licenses the reading that contains it.
  // "Se rendre compte" (to realise) and "rendre compte" (to report on) are
  // different verbs sharing three words, and the "se" is the only thing that
  // tells them apart — without this they scored identically and every tap on
  // "compte" escalated.
  if (context.grammar.hasReflexiveBefore && candidate.includesReflexive) return true;
  if (candidate.matchedWords > 1 && context.grammar.governedPreposition) return true;
  if (candidate.source === "context-rule" && candidate.matchedWords >= 2) return true;
  return false;
}

/**
 * Does the surrounding grammar point away from this reading?
 *
 * The clearest case is a determiner in front: "le parti" is a noun phrase, so
 * a verbal reading of "parti" is fighting the sentence rather than explaining
 * it.
 */
function hasGrammaticalConflict(candidate: MeaningCandidate, context: CandidateContext): boolean {
  // A multiword reading that steps around a reflexive clitic the sentence
  // actually contains is analysing a verb that isn't there.
  if (context.grammar.hasReflexiveBefore && candidate.matchedWords > 1 && !candidate.includesReflexive) return true;
  const english = candidate.english.toLowerCase();
  const looksVerbal = english.startsWith("to ") || /^(?:is|are|was|were)\b/.test(english);
  return context.grammar.hasDeterminerBefore && looksVerbal && candidate.matchedWords <= 1;
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
