import { isContextAmbiguous, sensesAgree } from "@/lib/dictionary/ambiguity";
import { findContainingPhraseTranslationMatch } from "@/lib/dictionary/articleTranslation";
import { collectContextSenseCandidates } from "@/lib/dictionary/contextualTranslation";
import { lookupWord } from "@/lib/dictionary/lookup";
import { SPECIFICITY } from "@/lib/dictionary/scoring";
import type { DictionaryLookupResult } from "@/lib/dictionary/types";
import type { Token } from "@/lib/words";

/**
 * Turning one tap into every interpretation the sentence plausibly supports.
 *
 * The resolver used to work as a cascade: check for a phrase, else a context
 * rule, else grammar, else the dictionary — first thing to match wins. That
 * made the answer depend on the order the checks were written in, and it threw
 * away information, because a losing tier's opinion vanished instead of
 * counting as evidence against the winner.
 *
 * Here nothing wins by arriving first. Each source contributes candidates
 * carrying what supports them, and scoring.ts decides. A candidate that spans
 * more of the sentence, is corroborated by the article's own translation, and
 * fits the surrounding grammar beats one that merely happens to be a curated
 * dictionary entry — which is the behaviour the old cascade could not express.
 */

export type CandidateSource =
  | "expression"
  | "grammar"
  | "context-rule"
  | "curated-dictionary"
  | "generated-dictionary"
  | "natural-alignment";

export interface CandidateSpan {
  start: number;
  end: number;
}

export interface MeaningCandidate {
  /** The French unit this reading covers — the word, or the expression containing it. */
  french: string;
  english: string;
  lemma: string | null;
  source: CandidateSource;
  /** Where this reading sits on the specificity ladder. See SPECIFICITY. */
  specificity: number;
  /** Token span covered, when the reading covers more than the tapped word. */
  matchedSpan?: CandidateSpan;
  /** How much of the sentence a rule matched, in words. Feeds the score. */
  matchedWords: number;
  /** Human-readable reasons this candidate exists, for diagnostics. */
  evidence: string[];
  /** Other senses this reading displaces, kept for the More panel. */
  alternatives: string[];
  explanation: string;
  /** True when the entry was reached through a rule-based lemma guess. */
  viaLemmaGuess?: boolean;
  /** True when this is the dictionary's own leading sense. */
  leadingSense?: boolean;
  /** True when the span's meaning is not the sum of its parts. */
  idiomatic?: boolean;
  /**
   * True when this candidate's span contains a reflexive clitic.
   *
   * "se rendre compte" (to realise) and "rendre compte" (to report on) are
   * different verbs that share three words, and the only thing separating them
   * is whether the "se" is inside the span. Recording it lets the scorer use
   * the clitic as evidence instead of leaving the two tied.
   */
  includesReflexive?: boolean;
}

export interface CandidateInput {
  tokens: Token[];
  tokenIndex: number;
  sentence: string;
  lookup: DictionaryLookupResult;
  /** A word-scoped natural alignment for this token, when the article translation has loaded. */
  alignment?: { french: string; english: string; frenchWordCount: number; startIndex: number; endIndex: number } | null;
}

/** Prepositions that change what a verb means when it governs one. */
const GOVERNED_PREPOSITIONS = ["à", "a", "de", "d'", "sur", "par", "pour", "en", "avec", "contre", "dans", "vers", "chez"];

/** Clitics that mark a following verb as reflexive, where the reflexive form is often a different verb. */
const REFLEXIVE_CLITICS = ["se", "s'", "me", "m'", "te", "t'", "nous", "vous"];

/** How far either side of the tapped token a multiword candidate may reach. */
const CONTEXT_WINDOW = 4;

function wordPositions(tokens: Token[]): { index: number; clean: string }[] {
  return tokens
    .map((token, index) => ({ token, index }))
    .filter((item) => item.token.isWord)
    .map((item) => ({ index: item.index, clean: item.token.clean }));
}

function spanText(tokens: Token[], start: number, end: number): string {
  return tokens.slice(start, end + 1).map((token) => token.text).join("").trim();
}

/**
 * Whether a multiword reading actually says something its parts do not.
 *
 * This is the idiomaticity signal. "Tenir le coup" is not holding a blow, and
 * "tomber dans les pommes" has nothing to do with apples — in both, the
 * expression's English shares no content with the English of any component
 * word. When that is true, a literal composition of the parts is very likely
 * the wrong reading, which is a reason to prefer the span.
 */
function isNonCompositional(englishOfSpan: string, componentWords: string[]): boolean {
  const componentGlosses = componentWords
    .map((word) => lookupWord(word).translations[0])
    .filter((gloss): gloss is string => !!gloss);
  if (componentGlosses.length === 0) return false;
  return !componentGlosses.some((gloss) => sensesAgree(gloss, englishOfSpan));
}

/**
 * Multiword readings discovered from the sentence rather than from a static
 * phrase list.
 *
 * The phrase bank only contains what somebody thought to add. This walks a
 * bounded window around the tapped token and asks the dictionary whether any
 * contiguous span containing it is a real multiword entry — which finds
 * "compter sur", "faire face à" or "venir de" without anyone registering them
 * as phrases, provided the lexical data knows the construction.
 *
 * Deliberately conservative: a span only becomes a candidate when the
 * dictionary independently recognises it. Adjacency alone is never evidence,
 * because treating neighbouring words as an expression is how a resolver
 * starts inventing idioms that do not exist.
 */
function discoverMultiwordCandidates(input: CandidateInput): MeaningCandidate[] {
  const { tokens, tokenIndex } = input;
  const words = wordPositions(tokens);
  const tappedOrdinal = words.findIndex((word) => word.index === tokenIndex);
  if (tappedOrdinal === -1) return [];

  const found: MeaningCandidate[] = [];
  const seen = new Set<string>();

  const firstOrdinal = Math.max(0, tappedOrdinal - CONTEXT_WINDOW);
  const lastOrdinal = Math.min(words.length - 1, tappedOrdinal + CONTEXT_WINDOW);

  for (let start = firstOrdinal; start <= tappedOrdinal; start++) {
    for (let end = lastOrdinal; end >= tappedOrdinal; end--) {
      if (end <= start) continue;
      const parts = words.slice(start, end + 1);
      const key = parts.map((part) => part.clean).join(" ");
      if (seen.has(key)) continue;
      seen.add(key);

      const entry = lookupMultiword(key, parts);
      // Must be a genuine multiword entry, not a guess: lookupWord can reach a
      // single-word entry from a phrase key, and a lemma guess over a span is
      // exactly the hallucination this pass has to avoid.
      if (!entry) continue;
      const english = entry.translations[0];
      const expressionLemma = entry.lemma;
      if (!english || !expressionLemma) continue;

      const startIndex = parts[0].index;
      const endIndex = parts[parts.length - 1].index;
      const componentWords = parts.map((part) => part.clean);
      found.push({
        french: expressionLemma,
        english,
        lemma: expressionLemma,
        source: "expression",
        specificity: governedPrepositionSpan(parts) ? SPECIFICITY.construction : SPECIFICITY.expression,
        matchedSpan: { start: startIndex, end: endIndex },
        matchedWords: parts.length,
        evidence: [`dictionary knows the ${parts.length}-word construction "${expressionLemma}"`],
        alternatives: entry.translations.slice(1),
        explanation: `“${expressionLemma}” is a set construction, so its meaning is taken as a whole rather than word by word.`,
        idiomatic: isNonCompositional(english, componentWords),
        includesReflexive: componentWords.some((word) => REFLEXIVE_CLITICS.includes(word)),
      });
    }
  }

  return found;
}

/**
 * Looks a span up as a multiword entry, allowing for conjugation.
 *
 * Expressions are stored under their citation form, but readers meet them
 * conjugated: the phrase bank knows "passer un examen" while the sentence says
 * "elle passe un examen". Matching the surface form alone made a whole class of
 * expression invisible the moment its verb was inflected, which is a large part
 * of why so much had to be added to the phrase bank by hand.
 *
 * Only the head word is lemmatised, and the result still has to be a real
 * multiword entry — so this widens what can be recognised without letting
 * morphology invent spans that the lexicon does not contain.
 */
function lookupMultiword(key: string, parts: { clean: string }[]): DictionaryLookupResult | null {
  const direct = lookupWord(key);
  if (isUsableMultiword(direct)) return direct;

  const headLemma = lookupWord(parts[0].clean).lemma;
  if (!headLemma || headLemma === parts[0].clean || headLemma.includes(" ")) return null;
  const lemmatised = [headLemma, ...parts.slice(1).map((part) => part.clean)].join(" ");
  const viaLemma = lookupWord(lemmatised);
  return isUsableMultiword(viaLemma) ? viaLemma : null;
}

function isUsableMultiword(entry: DictionaryLookupResult): boolean {
  if (entry.source === "missing" || entry.partOfSpeechUncertain) return false;
  return !!entry.lemma?.includes(" ");
}

/** True when the span looks like a verb governing a preposition, which is a construction rather than an idiom. */
function governedPrepositionSpan(parts: { clean: string }[]): boolean {
  if (parts.length !== 2) return false;
  return GOVERNED_PREPOSITIONS.includes(parts[1].clean);
}

/**
 * Grammatical evidence for and against a reading.
 *
 * No parser here, just the high-value cues that are cheap and unambiguous: a
 * determiner in front makes a nominal reading much more likely, an auxiliary
 * makes a participle reading likely, a reflexive clitic changes which verb is
 * being used at all, and a governed preposition can change the meaning
 * outright.
 */
export interface GrammaticalContext {
  previous: string | null;
  next: string | null;
  hasDeterminerBefore: boolean;
  hasAuxiliaryBefore: boolean;
  hasReflexiveBefore: boolean;
  governedPreposition: string | null;
  followedByInfinitive: boolean;
}

const DETERMINERS = new Set([
  "le", "la", "les", "l'", "un", "une", "des", "du", "de", "d'", "au", "aux",
  "ce", "cet", "cette", "ces", "mon", "ma", "mes", "ton", "ta", "tes", "son",
  "sa", "ses", "notre", "nos", "votre", "vos", "leur", "leurs", "quel", "quelle",
]);

const AUXILIARIES = new Set([
  "ai", "as", "a", "avons", "avez", "ont", "avait", "avaient", "avais",
  "suis", "es", "est", "sommes", "êtes", "etes", "sont", "était", "etait",
  "étaient", "etaient", "étais", "etais", "sera", "seront", "aura", "auront",
]);

export function grammaticalContext(tokens: Token[], tokenIndex: number): GrammaticalContext {
  const wordBefore = (offset: number): string | null => {
    let seen = 0;
    for (let i = tokenIndex - 1; i >= 0; i--) {
      if (!tokens[i].isWord) continue;
      seen++;
      if (seen === offset) return tokens[i].clean;
    }
    return null;
  };
  const wordAfter = (offset: number): string | null => {
    let seen = 0;
    for (let i = tokenIndex + 1; i < tokens.length; i++) {
      if (!tokens[i].isWord) continue;
      seen++;
      if (seen === offset) return tokens[i].clean;
    }
    return null;
  };

  const previous = wordBefore(1);
  const next = wordAfter(1);
  const afterPreposition = wordAfter(2);

  return {
    previous,
    next,
    hasDeterminerBefore: !!previous && DETERMINERS.has(previous),
    hasAuxiliaryBefore: !!previous && AUXILIARIES.has(previous),
    // The clitic can sit immediately before the verb or before an auxiliary.
    hasReflexiveBefore: [previous, wordBefore(2)].some((word) => !!word && REFLEXIVE_CLITICS.includes(word)),
    governedPreposition: !!next && GOVERNED_PREPOSITIONS.includes(next) ? next : null,
    followedByInfinitive: !!afterPreposition && /(?:er|ir|re)$/.test(afterPreposition),
  };
}

/**
 * How many distinct grammatical analyses a token plausibly has.
 *
 * "parti" is both a noun (a political party) and a past participle (left), and
 * that structural ambiguity is a reason to doubt any reading until the
 * sentence picks one — independently of how many senses the dictionary lists.
 * This is what lets ambiguity be inferred for words nobody remembered to add
 * to a list.
 */
export function grammaticalAnalyses(clean: string, lookup: DictionaryLookupResult): string[] {
  const analyses = new Set<string>();
  const partOfSpeech = (lookup.partOfSpeech ?? "").toLowerCase();
  if (partOfSpeech) analyses.add(partOfSpeech.split("(")[0].trim());

  // A distinct entry under the bare surface form is a second analysis: looking
  // "parti" up directly gives the noun even when the tapped token resolved
  // through the verb partir.
  const direct = lookupWord(clean);
  const directPart = (direct.partOfSpeech ?? "").toLowerCase();
  if (direct.source === "local" && directPart) analyses.add(directPart.split("(")[0].trim());

  if (/(?:é|ée|és|ées)$/.test(clean)) analyses.add("participle");
  if (/(?:ant)$/.test(clean) && clean.length > 4) analyses.add("participle");
  return [...analyses].filter(Boolean);
}

/** Builds the full candidate field for one tap. */
export function generateCandidates(input: CandidateInput): MeaningCandidate[] {
  const { tokens, tokenIndex, lookup, sentence } = input;
  const token = tokens[tokenIndex];
  const clean = token?.clean ?? "";
  const candidates: MeaningCandidate[] = [];

  // 1. The phrase bank, which stays the most trusted source of expressions.
  const phrase = token?.isWord ? findContainingPhraseTranslationMatch(tokens, tokenIndex) : null;
  if (phrase) {
    const componentWords = tokens
      .slice(phrase.startIndex, phrase.endIndex + 1)
      .filter((item) => item.isWord)
      .map((item) => item.clean);
    candidates.push({
      french: phrase.lemma ?? phrase.phrase,
      english: phrase.translation,
      lemma: phrase.lemma,
      source: "expression",
      specificity: SPECIFICITY.expression,
      matchedSpan: { start: phrase.startIndex, end: phrase.endIndex },
      matchedWords: componentWords.length,
      evidence: ["matched a known expression in the phrase bank"],
      alternatives: [],
      explanation: "This word is part of a fixed expression, so the phrase meaning is what the sentence actually says.",
      idiomatic: isNonCompositional(phrase.translation, componentWords),
      includesReflexive: componentWords.some((word) => REFLEXIVE_CLITICS.includes(word)),
    });
  }

  // 2. Expressions discovered from the dictionary rather than the phrase bank.
  candidates.push(...discoverMultiwordCandidates(input));

  // 3. Every contextual rule that applies, each carrying its own evidence.
  for (const ruleCandidate of collectContextSenseCandidates(clean, lookup, tokens, tokenIndex, sentence)) {
    const isConstruction = ruleCandidate.matchedWords >= 2;
    candidates.push({
      french: token?.text ?? clean,
      english: ruleCandidate.sense.translation,
      lemma: lookup.lemma,
      source: "context-rule",
      specificity: isConstruction ? SPECIFICITY.construction : ruleCandidate.matchedWords === 1 ? SPECIFICITY.contextRule : SPECIFICITY.lexicalRule,
      matchedWords: ruleCandidate.matchedWords,
      evidence: ruleCandidate.evidence.length
        ? ruleCandidate.evidence.map((needle) => `sentence contains “${needle}”`)
        : ["a contextual rule for this word applied"],
      alternatives: ruleCandidate.sense.alternativeMeanings ?? [],
      explanation: ruleCandidate.sense.explanation,
    });
  }

  // 4. The natural article translation, when it is scoped to this word.
  if (input.alignment && input.alignment.frenchWordCount <= 3 && input.alignment.english.trim().length > 2) {
    candidates.push({
      french: input.alignment.french,
      english: input.alignment.english.trim(),
      lemma: lookup.lemma,
      source: "natural-alignment",
      specificity: input.alignment.frenchWordCount > 1 ? SPECIFICITY.complement : SPECIFICITY.morphology,
      matchedSpan: { start: input.alignment.startIndex, end: input.alignment.endIndex },
      matchedWords: input.alignment.frenchWordCount,
      evidence: ["this article's own English translation covers exactly these words"],
      alternatives: [],
      explanation: "Taken from this article's own English translation of the phrase this word sits in.",
    });
  }

  // 5. The bare dictionary sense, which is a candidate like any other rather
  //    than the thing everything else has to beat.
  const leading = lookup.translations[0];
  if (leading) {
    candidates.push({
      french: token?.text ?? clean,
      english: leading,
      lemma: lookup.lemma,
      source: lookup.layer === "generated" ? "generated-dictionary" : "curated-dictionary",
      specificity: SPECIFICITY.dictionary,
      matchedWords: 0,
      evidence: [`${lookup.layer ?? "dictionary"} entry for “${lookup.lemma ?? clean}”`],
      alternatives: lookup.translations.slice(1),
      explanation: "The dictionary's leading sense for this word.",
      viaLemmaGuess: lookup.partOfSpeechUncertain,
      leadingSense: true,
    });
  }

  return dedupeCandidates(candidates);
}

/**
 * Collapses candidates that say the same thing about the same span.
 *
 * The phrase bank and dictionary discovery both find "se rendre compte", and a
 * duplicated reading is not extra evidence — it just makes the field harder to
 * read in diagnostics. The widest span survives, since it explains the most.
 */
function dedupeCandidates(candidates: MeaningCandidate[]): MeaningCandidate[] {
  const bySense = new Map<string, MeaningCandidate>();
  for (const candidate of candidates) {
    const key = `${candidate.english.trim().toLowerCase()}::${candidate.matchedSpan?.start ?? "-"}::${candidate.matchedSpan?.end ?? "-"}`;
    const existing = bySense.get(key);
    if (!existing || candidate.matchedWords > existing.matchedWords || candidate.specificity > existing.specificity) {
      bySense.set(key, candidate);
    }
  }
  return dropContainedSpans([...bySense.values()]);
}

/**
 * Removes multiword readings wholly contained inside a longer one.
 *
 * A sub-span of a recognised expression is not a rival interpretation, it is a
 * fragment of the same one. "Tenir compte de" is the expression; "tenir
 * compte" is the first two thirds of it, and the generated layer happens to
 * gloss that fragment as "pay attention". Letting the two compete meant the
 * fragment could outscore the whole — and even when the whole won, the
 * fragment sat in the runner-up slot and collapsed the margin, so a perfectly
 * clear idiom escalated as though it were ambiguous.
 *
 * Only spans lose this way. A single-word reading is a genuine alternative to
 * an expression and always keeps competing, because deciding whether the
 * writer meant the idiom at all is exactly the judgement being made.
 */
function dropContainedSpans(candidates: MeaningCandidate[]): MeaningCandidate[] {
  const spans = candidates.filter((candidate) => !!candidate.matchedSpan && candidate.matchedWords > 1);
  return candidates.filter((candidate) => {
    const span = candidate.matchedSpan;
    if (!span || candidate.matchedWords <= 1) return true;
    return !spans.some((other) => {
      if (other === candidate) return false;
      const otherSpan = other.matchedSpan;
      if (!otherSpan) return false;
      const contains = otherSpan.start <= span.start && otherSpan.end >= span.end;
      const strictlyWider = other.matchedWords > candidate.matchedWords;
      return contains && strictlyWider;
    });
  });
}

/** Everything the scorer needs to know about the tap, computed once. */
export interface CandidateContext {
  grammar: GrammaticalContext;
  /** Several genuinely different meanings are available for this word. */
  senseAmbiguous: boolean;
  /** More than one plausible grammatical analysis of the token. */
  grammaticallyAmbiguous: boolean;
  alignmentEnglish: string | null;
  alignmentIsTight: boolean;
  /**
   * A tightly-scoped article translation disagrees with the dictionary's own
   * leading sense.
   *
   * When that happens neither side is established, so both are penalised
   * rather than one being crowned. Letting the alignment simply win would make
   * a single mistranslated span overrule a curated entry; letting the
   * dictionary simply win would ignore the one source that actually read the
   * sentence. Pushing both down is what turns the disagreement into an
   * escalation, which is the honest outcome.
   */
  alignmentDisputed: boolean;
}

export function buildCandidateContext(input: CandidateInput): CandidateContext {
  const clean = input.tokens[input.tokenIndex]?.clean ?? "";
  const analyses = grammaticalAnalyses(clean, input.lookup);
  const alignmentEnglish = input.alignment?.english?.trim() ?? null;
  const alignmentIsTight = !!input.alignment && input.alignment.frenchWordCount <= 3;
  const leadingSense = input.lookup.translations[0] ?? null;
  return {
    grammar: grammaticalContext(input.tokens, input.tokenIndex),
    // Deliberately the same judgement the rest of the resolver uses, so a
    // curated ordering is not second-guessed by raw sense counting — see
    // isContextAmbiguous.
    senseAmbiguous: isContextAmbiguous(input.lookup, clean),
    grammaticallyAmbiguous: analyses.length > 1,
    alignmentEnglish,
    alignmentIsTight,
    alignmentDisputed: !!alignmentEnglish && alignmentIsTight && !!leadingSense && !sensesAgree(leadingSense, alignmentEnglish),
  };
}

export function spanTextFor(tokens: Token[], span: CandidateSpan): string {
  return spanText(tokens, span.start, span.end);
}
