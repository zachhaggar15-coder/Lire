import { materiallyDistinctSenses } from "@/lib/dictionary/ambiguity";
import { findContainingPhraseTranslationMatch } from "@/lib/dictionary/articleTranslation";
import { lookupWord } from "@/lib/dictionary/lookup";
import type { DictionaryLookupResult } from "@/lib/dictionary/types";
import { hashString } from "@/lib/hash";
import type { Token } from "@/lib/words";

export type ContextualTranslationConfidence = "high" | "medium" | "low";

export interface ContextualTranslationGrammar {
  tense?: string;
  mood?: string;
  person?: string;
  number?: string;
  gender?: string;
  form?: string;
  negated?: boolean;
  note?: string;
}

export interface ContextualTranslationResult {
  selectedText: string;
  expandedPhrase: string | null;
  contextualTranslation: string;
  baseTranslation: string | null;
  literalTranslation: string | null;
  lemma: string | null;
  partOfSpeech: string | null;
  grammar: ContextualTranslationGrammar | null;
  alternativeMeanings: string[];
  confidence: ContextualTranslationConfidence;
  source: "phrasebank" | "context-rule" | "dictionary" | "proper-noun" | "contraction" | "pronoun" | "grammar" | "missing";
  explanation: string;
  cacheKey: string;
}

export interface BuildContextualTranslationInput {
  tokens: Token[];
  tokenIndex: number;
  contextSentence: string;
  previousSentence?: string | null;
  nextSentence?: string | null;
  lookup?: DictionaryLookupResult;
}

interface SenseSelection {
  translation: string;
  explanation: string;
  source: ContextualTranslationResult["source"];
  confidence: ContextualTranslationConfidence;
  alternativeMeanings?: string[];
}

const HTML_ENTITY_MAP: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  quot: "\"",
  apos: "'",
  rsquo: "'",
  lsquo: "'",
  rdquo: "\"",
  ldquo: "\"",
  eacute: "e",
  egrave: "e",
  ecirc: "e",
  agrave: "a",
  acirc: "a",
  ugrave: "u",
  ucirc: "u",
  icirc: "i",
  ocirc: "o",
  ccedil: "c",
};

const AUXILIARY_FORMS: Record<string, { lemma: "avoir" | "etre"; person: string; number: string; tense?: string }> = {
  ai: { lemma: "avoir", person: "first", number: "singular" },
  as: { lemma: "avoir", person: "second", number: "singular" },
  a: { lemma: "avoir", person: "third", number: "singular" },
  avons: { lemma: "avoir", person: "first", number: "plural" },
  avez: { lemma: "avoir", person: "second", number: "plural" },
  ont: { lemma: "avoir", person: "third", number: "plural" },
  suis: { lemma: "etre", person: "first", number: "singular" },
  es: { lemma: "etre", person: "second", number: "singular" },
  est: { lemma: "etre", person: "third", number: "singular" },
  sommes: { lemma: "etre", person: "first", number: "plural" },
  etes: { lemma: "etre", person: "second", number: "plural" },
  sont: { lemma: "etre", person: "third", number: "plural" },
  etait: { lemma: "etre", person: "third", number: "singular", tense: "imperfect" },
  etaient: { lemma: "etre", person: "third", number: "plural", tense: "imperfect" },
  avait: { lemma: "avoir", person: "third", number: "singular", tense: "imperfect" },
  avaient: { lemma: "avoir", person: "third", number: "plural", tense: "imperfect" },
};

const EXACT_GRAMMAR: Record<string, ContextualTranslationGrammar> = {
  ai: { tense: "present", mood: "indicative", person: "first", number: "singular", form: "conjugated verb" },
  as: { tense: "present", mood: "indicative", person: "second", number: "singular", form: "conjugated verb" },
  a: { tense: "present", mood: "indicative", person: "third", number: "singular", form: "conjugated verb" },
  avons: { tense: "present", mood: "indicative", person: "first", number: "plural", form: "conjugated verb" },
  avez: { tense: "present", mood: "indicative", person: "second", number: "plural", form: "conjugated verb" },
  ont: { tense: "present", mood: "indicative", person: "third", number: "plural", form: "conjugated verb" },
  suis: { tense: "present", mood: "indicative", person: "first", number: "singular", form: "conjugated verb" },
  es: { tense: "present", mood: "indicative", person: "second", number: "singular", form: "conjugated verb" },
  est: { tense: "present", mood: "indicative", person: "third", number: "singular", form: "conjugated verb" },
  sommes: { tense: "present", mood: "indicative", person: "first", number: "plural", form: "conjugated verb" },
  etes: { tense: "present", mood: "indicative", person: "second", number: "plural", form: "conjugated verb" },
  sont: { tense: "present", mood: "indicative", person: "third", number: "plural", form: "conjugated verb" },
  etais: { tense: "imperfect", mood: "indicative", person: "first/second", number: "singular", form: "conjugated verb" },
  etait: { tense: "imperfect", mood: "indicative", person: "third", number: "singular", form: "conjugated verb" },
  etaient: { tense: "imperfect", mood: "indicative", person: "third", number: "plural", form: "conjugated verb" },
  avais: { tense: "imperfect", mood: "indicative", person: "first/second", number: "singular", form: "conjugated verb" },
  avait: { tense: "imperfect", mood: "indicative", person: "third", number: "singular", form: "conjugated verb" },
  avaient: { tense: "imperfect", mood: "indicative", person: "third", number: "plural", form: "conjugated verb" },
  serai: { tense: "future", mood: "indicative", person: "first", number: "singular", form: "conjugated verb" },
  sera: { tense: "future", mood: "indicative", person: "third", number: "singular", form: "conjugated verb" },
  seront: { tense: "future", mood: "indicative", person: "third", number: "plural", form: "conjugated verb" },
  aurai: { tense: "future", mood: "indicative", person: "first", number: "singular", form: "conjugated verb" },
  aura: { tense: "future", mood: "indicative", person: "third", number: "singular", form: "conjugated verb" },
  auront: { tense: "future", mood: "indicative", person: "third", number: "plural", form: "conjugated verb" },
  serais: { tense: "conditional", mood: "conditional", person: "first/second", number: "singular", form: "conjugated verb" },
  serait: { tense: "conditional", mood: "conditional", person: "third", number: "singular", form: "conjugated verb" },
  auraient: { tense: "conditional", mood: "conditional", person: "third", number: "plural", form: "conjugated verb" },
  voudrais: { tense: "conditional", mood: "conditional", person: "first/second", number: "singular", form: "polite conditional" },
  voudrait: { tense: "conditional", mood: "conditional", person: "third", number: "singular", form: "conditional" },
  voudraient: { tense: "conditional", mood: "conditional", person: "third", number: "plural", form: "conditional" },
  soit: { tense: "present", mood: "subjunctive", person: "third", number: "singular", form: "subjunctive verb" },
  sois: { tense: "present", mood: "subjunctive/imperative", person: "first/second", number: "singular", form: "subjunctive or imperative verb" },
  soient: { tense: "present", mood: "subjunctive", person: "third", number: "plural", form: "subjunctive verb" },
  aie: { tense: "present", mood: "subjunctive/imperative", person: "first/second", number: "singular", form: "subjunctive or imperative verb" },
  ait: { tense: "present", mood: "subjunctive", person: "third", number: "singular", form: "subjunctive verb" },
  aient: { tense: "present", mood: "subjunctive", person: "third", number: "plural", form: "subjunctive verb" },
  fasse: { tense: "present", mood: "subjunctive", person: "first/third", number: "singular", form: "subjunctive verb" },
  puisse: { tense: "present", mood: "subjunctive", person: "first/third", number: "singular", form: "subjunctive verb" },
  viendra: { tense: "future", mood: "indicative", person: "third", number: "singular", form: "future simple" },
};

const PAST_ENGLISH_BY_LEMMA: Record<string, string> = {
  aller: "went / has gone",
  avoir: "had / has had",
  etre: "was / has been",
  faire: "did / has done",
  mettre: "put / has put",
  partir: "left / has left",
  prendre: "took / has taken",
  venir: "came / has come",
};

const PRONOUN_TRANSLATIONS: Record<string, SenseSelection> = {
  y: {
    translation: "there / to it",
    source: "pronoun",
    confidence: "high",
    explanation: "Here y is an adverbial pronoun: it normally replaces a place or an a/de-style idea already mentioned.",
  },
  en: {
    translation: "of it / about it / some",
    source: "pronoun",
    confidence: "medium",
    explanation: "Here en is likely a pronoun, standing in for a de-phrase or an unstated quantity, not the preposition in.",
  },
  le: {
    translation: "him / it",
    source: "pronoun",
    confidence: "medium",
    explanation: "Before a verb, le is a direct-object pronoun: him or it. Before a noun, it is the article the.",
  },
  la: {
    translation: "her / it",
    source: "pronoun",
    confidence: "medium",
    explanation: "Before a verb, la is a direct-object pronoun: her or it. Before a noun, it is the article the.",
  },
  lui: {
    translation: "to him / to her",
    source: "pronoun",
    confidence: "high",
    explanation: "Here lui is an indirect-object pronoun: to him or to her.",
  },
  leur: {
    translation: "to them",
    source: "pronoun",
    confidence: "medium",
    explanation: "Before a verb, leur is usually an indirect-object pronoun: to them. Before a noun, it means their.",
  },
};

export function normaliseContextText(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (_, entity: string) => decodeHtmlEntity(entity))
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function contextualTranslationCacheKey(input: {
  selectedText: string;
  sentence: string;
  expandedPhrase?: string | null;
  lemma?: string | null;
}): string {
  const raw = [
    normaliseForMatch(input.selectedText),
    normaliseForMatch(input.sentence),
    normaliseForMatch(input.expandedPhrase ?? ""),
    normaliseForMatch(input.lemma ?? ""),
  ].join("::");
  return `lire.contextualTranslation.v1.${hashString(raw)}`;
}

export function buildContextualTranslation(input: BuildContextualTranslationInput): ContextualTranslationResult {
  const token = input.tokens[input.tokenIndex];
  const selectedText = token?.text ?? "";
  const clean = token?.clean ?? selectedText.trim().toLowerCase();
  const sentence = normaliseContextText(input.contextSentence);
  const surroundingContext = [input.previousSentence, sentence, input.nextSentence]
    .filter((value): value is string => !!value)
    .map(normaliseContextText)
    .join(" ");
  const fallbackLookup = input.lookup ?? lookupWord(selectedText, adjacentWords(input.tokens, input.tokenIndex));
  const baseTranslation = fallbackLookup.translations[0] ?? null;
  const phrase = token?.isWord ? findContainingPhraseTranslationMatch(input.tokens, input.tokenIndex) : null;
  const grammar = mergeGrammar(
    inferGrammar(input.tokens, input.tokenIndex, fallbackLookup, sentence),
    inferAgreement(clean, fallbackLookup)
  );
  const cacheBase = {
    selectedText,
    sentence: surroundingContext,
    expandedPhrase: phrase?.phrase ?? null,
    lemma: fallbackLookup.lemma,
  };

  if (phrase) {
    const literalTranslation = baseTranslation && baseTranslation !== phrase.translation ? baseTranslation : null;
    return {
      selectedText,
      expandedPhrase: phrase.phrase,
      contextualTranslation: phrase.translation,
      baseTranslation,
      literalTranslation,
      lemma: phrase.lemma,
      partOfSpeech: phrase.partOfSpeech,
      grammar: mergeGrammar(grammar, { form: phrase.partOfSpeech ?? "fixed expression" }),
      alternativeMeanings: withoutPrimary(fallbackLookup.translations, phrase.translation),
      confidence: "high",
      source: "phrasebank",
      explanation: "This word is part of a local fixed expression, so the phrase meaning is more useful than the standalone word gloss.",
      cacheKey: contextualTranslationCacheKey(cacheBase),
    };
  }

  if (isPhraseLikeLookup(fallbackLookup) && baseTranslation) {
    return {
      selectedText,
      expandedPhrase: selectedText,
      contextualTranslation: baseTranslation,
      baseTranslation,
      literalTranslation: null,
      lemma: fallbackLookup.lemma,
      partOfSpeech: fallbackLookup.partOfSpeech,
      grammar: mergeGrammar(grammar, { form: fallbackLookup.partOfSpeech ?? "fixed expression" }),
      alternativeMeanings: withoutPrimary(fallbackLookup.translations, baseTranslation),
      confidence: "high",
      source: "phrasebank",
      explanation: "This tapped form is a fixed expression, so the expression meaning is more useful than splitting it into smaller pieces.",
      cacheKey: contextualTranslationCacheKey(cacheBase),
    };
  }

  const contextSense = selectContextSense(clean, fallbackLookup, input.tokens, input.tokenIndex, surroundingContext);
  const special = contextSense ? null : selectSpecialForm(clean, fallbackLookup, input.tokens, input.tokenIndex);
  const selectedSense = contextSense ?? special;
  if (selectedSense) {
    return {
      selectedText,
      expandedPhrase: special?.source === "contraction" ? selectedText : null,
      contextualTranslation: selectedSense.translation,
      baseTranslation,
      literalTranslation: baseTranslation && baseTranslation !== selectedSense.translation ? baseTranslation : null,
      lemma: fallbackLookup.lemma ?? clean,
      partOfSpeech: fallbackLookup.partOfSpeech,
      grammar,
      alternativeMeanings: selectedSense.alternativeMeanings ?? withoutPrimary(fallbackLookup.translations, selectedSense.translation),
      confidence: selectedSense.confidence,
      source: selectedSense.source,
      explanation: selectedSense.explanation,
      cacheKey: contextualTranslationCacheKey(cacheBase),
    };
  }

  if (isProperNounLookup(fallbackLookup)) {
    const translation = baseTranslation ?? selectedText;
    return {
      selectedText,
      expandedPhrase: null,
      contextualTranslation: translation,
      baseTranslation,
      literalTranslation: null,
      lemma: fallbackLookup.lemma,
      partOfSpeech: fallbackLookup.partOfSpeech,
      grammar,
      alternativeMeanings: [],
      confidence: "high",
      source: "proper-noun",
      explanation: "This is protected as a likely person, place, organisation, or acronym, so the app keeps the name instead of inventing a vocabulary gloss.",
      cacheKey: contextualTranslationCacheKey(cacheBase),
    };
  }

  if (fallbackLookup.source === "missing" || !baseTranslation) {
    return {
      selectedText,
      expandedPhrase: null,
      contextualTranslation: "No reliable local translation",
      baseTranslation: null,
      literalTranslation: null,
      lemma: fallbackLookup.lemma,
      partOfSpeech: fallbackLookup.partOfSpeech,
      grammar,
      alternativeMeanings: [],
      confidence: "low",
      source: "missing",
      explanation: "The local dictionary could not identify this form with enough confidence. Use the AI nuance button or add a correction if needed.",
      cacheKey: contextualTranslationCacheKey(cacheBase),
    };
  }

  const contextualTranslation = grammar ? grammarAwareTranslation(baseTranslation, fallbackLookup.lemma, clean, grammar) : baseTranslation;
  return {
    selectedText,
    expandedPhrase: null,
    contextualTranslation,
    baseTranslation,
    literalTranslation: null,
    lemma: fallbackLookup.lemma,
    partOfSpeech: fallbackLookup.partOfSpeech,
    grammar,
    alternativeMeanings: withoutPrimary(fallbackLookup.translations, contextualTranslation),
    confidence: dictionaryConfidence(fallbackLookup),
    source: grammar ? "grammar" : "dictionary",
    explanation: grammar
      ? "The dictionary meaning is combined with the visible verb/adjective form in this sentence."
      : "No stronger local context signal was found, so this is the base dictionary meaning.",
    cacheKey: contextualTranslationCacheKey(cacheBase),
  };
}

/**
 * How much to trust a plain dictionary answer, based on which layer produced
 * it rather than on the fact that no context rule fired.
 *
 * The old rule graded *every* rule-less answer "low", which conflated two very
 * different situations: "sur" -> "on" came from core-senses.ts, where a person
 * decided that gloss should lead, while "case" -> "double income, no kids"
 * came from the bulk WikDict import, where nothing did. Treating both as low
 * confidence made the signal useless — and now that low confidence is what
 * triggers hedging and AI escalation in resolveMeaning.ts, it would have made
 * Sorlio hedge on the most common words in the language.
 *
 * A lemma guess drops the grade one step: the entry may describe a different
 * word class from the form actually tapped.
 */
function dictionaryConfidence(lookup: DictionaryLookupResult): ContextualTranslationConfidence {
  const base = baseLayerConfidence(lookup);
  if (!lookup.partOfSpeechUncertain) return base;
  return base === "high" ? "medium" : "low";
}

function baseLayerConfidence(lookup: DictionaryLookupResult): ContextualTranslationConfidence {
  switch (lookup.layer) {
    case "phrase-bank":
    case "core":
    case "news":
    case "curated":
    case "custom":
    case "proper-noun":
      return "high";
    case "article-coverage":
      return "medium";
    case "generated":
      // Sense order carries no editorial judgement here, so breadth is the only
      // guide to whether the leading gloss is a real choice. Counted by meaning
      // rather than by string: "chat" lists cat/tomcat/tag, which is one
      // obvious sense plus a variant plus an oddity, not three competing
      // answers — grading it low sent a concrete noun to the network on every
      // tap. See materiallyDistinctSenses.
      return materiallyDistinctSenses(lookup.translations) <= 2 ? "medium" : "low";
    default:
      return "low";
  }
}

function decodeHtmlEntity(entity: string): string {
  if (entity.startsWith("#x") || entity.startsWith("#X")) {
    const codePoint = Number.parseInt(entity.slice(2), 16);
    return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : `&${entity};`;
  }
  if (entity.startsWith("#")) {
    const codePoint = Number.parseInt(entity.slice(1), 10);
    return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : `&${entity};`;
  }
  return HTML_ENTITY_MAP[entity.toLowerCase()] ?? `&${entity};`;
}

function normaliseForMatch(text: string): string {
  return normaliseContextText(text)
    .replace(/[’‘]/g, "'")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function adjacentWords(tokens: Token[], index: number): { previousWord: string | null; nextWord: string | null } {
  return {
    previousWord: rawWordAt(tokens, index, -1),
    nextWord: rawWordAt(tokens, index, 1),
  };
}

function rawWordAt(tokens: Token[], index: number, direction: -1 | 1): string | null {
  for (let i = index + direction; i >= 0 && i < tokens.length; i += direction) {
    if (tokens[i].isWord) return tokens[i].clean;
  }
  return null;
}

function wordAt(tokens: Token[], index: number, direction: -1 | 1): string | null {
  for (let i = index + direction; i >= 0 && i < tokens.length; i += direction) {
    if (tokens[i].isWord) return normaliseForMatch(tokens[i].clean);
  }
  return null;
}

/** The nth word before `index`, skipping punctuation. n = 1 is the immediately preceding word. */
function nthWordBefore(tokens: Token[], index: number, n: number): string | null {
  let remaining = n;
  for (let i = index - 1; i >= 0; i--) {
    if (!tokens[i].isWord) continue;
    remaining--;
    if (remaining === 0) return normaliseForMatch(tokens[i].clean);
  }
  return null;
}

function wordWindow(tokens: Token[], index: number, radius: number): string[] {
  const left: string[] = [];
  for (let i = index - 1; i >= 0 && left.length < radius; i--) {
    if (tokens[i].isWord) left.unshift(normaliseForMatch(tokens[i].clean));
  }

  const center = tokens[index]?.isWord ? [normaliseForMatch(tokens[index].clean)] : [];
  const right: string[] = [];
  for (let i = index + 1; i < tokens.length && right.length < radius; i++) {
    if (tokens[i].isWord) right.push(normaliseForMatch(tokens[i].clean));
  }

  return [...left, ...center, ...right];
}

function inferGrammar(
  tokens: Token[],
  tokenIndex: number,
  lookup: DictionaryLookupResult,
  sentence: string
): ContextualTranslationGrammar | null {
  const token = tokens[tokenIndex];
  if (!token?.isWord) return null;
  const clean = normaliseForMatch(token.clean);
  const lemma = normaliseForMatch(lookup.lemma ?? "");
  const partOfSpeech = (lookup.partOfSpeech ?? "").toLowerCase();
  const previous = wordAt(tokens, tokenIndex, -1);
  const next = wordAt(tokens, tokenIndex, 1);
  const previousAux = previous ? AUXILIARY_FORMS[previous] : undefined;
  let grammar: ContextualTranslationGrammar | null = null;

  if (previousAux && (partOfSpeech.includes("participle") || looksLikePastParticiple(clean))) {
    grammar = {
      tense: previousAux.tense ? `compound ${previousAux.tense}` : "passe compose",
      mood: "indicative",
      person: previousAux.person,
      number: previousAux.number,
      form: `past participle with ${previousAux.lemma}`,
    };
  } else if (clean.includes("-")) {
    grammar = inferHyphenatedGrammar(clean, lookup) ?? grammar;
  } else if (EXACT_GRAMMAR[clean]) {
    grammar = { ...EXACT_GRAMMAR[clean] };
  } else if (isVerbLookup(lookup)) {
    grammar = inferRegularVerbGrammar(clean, tokenIndex, tokens);
  }

  // "me/te/se" before a verb can only be an object clitic, so they mark a
  // pronominal verb. "nous" and "vous" cannot: they are far more often the
  // subject — "vous croyez" is "you believe", not a reflexive — and they only
  // read as reflexive when doubled, as in "vous vous levez". Treating them as
  // reflexive unconditionally told readers that ordinary second-person verbs
  // carried a reflexive pronoun, which is simply wrong.
  const unambiguousReflexive = ["me", "m'", "te", "t'", "se", "s'"];
  const ambiguousReflexive = ["nous", "vous"];
  const beforePrevious = nthWordBefore(tokens, tokenIndex, 2);
  const isReflexive =
    !!previous &&
    isVerbLookup(lookup) &&
    (unambiguousReflexive.includes(previous) ||
      (ambiguousReflexive.includes(previous) && previous === beforePrevious));

  if (isReflexive) {
    grammar = mergeGrammar(grammar, {
      form: grammar?.form ? `${grammar.form}, reflexive/pronominal` : "reflexive/pronominal verb",
      note: "The preceding reflexive pronoun changes how the verb is read.",
    });
  }

  if (next && ["moi", "toi", "le", "la", "les", "lui", "leur", "en", "y"].includes(next) && clean.includes("-")) {
    grammar = mergeGrammar(grammar, { form: "imperative with attached pronoun", mood: "imperative" });
  }

  if (isNegated(tokens, tokenIndex)) {
    grammar = mergeGrammar(grammar, { negated: true, note: "The nearby ne ... pas/plus/jamais pattern negates this verb." });
  }

  if (lemma === "etre" && normaliseForMatch(sentence).includes("qu'il soit")) {
    grammar = mergeGrammar(grammar, { mood: "subjunctive", tense: "present", person: "third", number: "singular", form: "subjunctive verb" });
  }

  return grammar;
}

function inferHyphenatedGrammar(clean: string, lookup: DictionaryLookupResult): ContextualTranslationGrammar | null {
  const parts = clean.split("-").filter(Boolean);
  const first = parts[0];
  if (!first) return null;
  const subject = parts.at(-1);
  const firstLookup = lookupWord(first);
  const base = EXACT_GRAMMAR[first] ?? (firstLookup.lemma ? EXACT_GRAMMAR[normaliseForMatch(first)] : null);
  const inversionSubject = subject && ["je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles"].includes(subject);
  if (inversionSubject) {
    return {
      ...(base ?? {}),
      mood: "interrogative",
      form: "subject-verb inversion question",
      note: `${first} is inverted with ${subject}; the -t- is only a pronunciation bridge when present.`,
    };
  }
  if (isVerbLookup(lookup) || isVerbLookup(firstLookup)) {
    return { mood: "imperative", form: "imperative with attached pronoun" };
  }
  return null;
}

function inferRegularVerbGrammar(clean: string, tokenIndex: number, tokens: Token[]): ContextualTranslationGrammar | null {
  if (/rais$/.test(clean)) return { tense: "conditional", mood: "conditional", person: "first/second", number: "singular", form: "conditional" };
  if (/rait$/.test(clean)) return { tense: "conditional", mood: "conditional", person: "third", number: "singular", form: "conditional" };
  if (/rions$/.test(clean)) return { tense: "conditional", mood: "conditional", person: "first", number: "plural", form: "conditional" };
  if (/riez$/.test(clean)) return { tense: "conditional", mood: "conditional", person: "second", number: "plural", form: "conditional" };
  if (/raient$/.test(clean)) return { tense: "conditional", mood: "conditional", person: "third", number: "plural", form: "conditional" };

  if (/ais$/.test(clean)) return { tense: "imperfect", mood: "indicative", person: "first/second", number: "singular", form: "imperfect" };
  if (/ait$/.test(clean)) return { tense: "imperfect", mood: "indicative", person: "third", number: "singular", form: "imperfect" };
  if (/ions$/.test(clean)) return { tense: "imperfect", mood: "indicative/subjunctive", person: "first", number: "plural", form: "imperfect or subjunctive" };
  if (/iez$/.test(clean)) return { tense: "imperfect", mood: "indicative/subjunctive", person: "second", number: "plural", form: "imperfect or subjunctive" };
  if (/aient$/.test(clean)) return { tense: "imperfect", mood: "indicative", person: "third", number: "plural", form: "imperfect" };

  if (/rai$/.test(clean)) return { tense: "future", mood: "indicative", person: "first", number: "singular", form: "future simple" };
  if (/ras$/.test(clean)) return { tense: "future", mood: "indicative", person: "second", number: "singular", form: "future simple" };
  if (/ra$/.test(clean)) return { tense: "future", mood: "indicative", person: "third", number: "singular", form: "future simple" };
  if (/rons$/.test(clean)) return { tense: "future", mood: "indicative", person: "first", number: "plural", form: "future simple" };
  if (/rez$/.test(clean)) return { tense: "future", mood: "indicative", person: "second", number: "plural", form: "future simple" };
  if (/ront$/.test(clean)) return { tense: "future", mood: "indicative", person: "third", number: "plural", form: "future simple" };

  if (/ez$/.test(clean) && isSentenceInitialImperative(tokens, tokenIndex)) {
    return { tense: "present", mood: "imperative", person: "second", number: "plural/formal", form: "imperative" };
  }

  return null;
}

function inferAgreement(clean: string, lookup: DictionaryLookupResult): ContextualTranslationGrammar | null {
  const partOfSpeech = (lookup.partOfSpeech ?? "").toLowerCase();
  if (!partOfSpeech.includes("adjective") && !partOfSpeech.includes("participle")) return null;
  const lemma = normaliseForMatch(lookup.lemma ?? "");
  if (!lemma || clean === lemma) return null;
  if (clean.endsWith("es")) return { gender: "feminine", number: "plural", form: "agreed adjective/past participle" };
  if (clean.endsWith("e")) return { gender: "feminine", number: "singular", form: "agreed adjective/past participle" };
  if (partOfSpeech.includes("adjective") && !partOfSpeech.includes("participle") && (clean.endsWith("s") || clean.endsWith("x"))) {
    return { number: "plural", form: "agreed adjective" };
  }
  return null;
}

function selectSpecialForm(
  clean: string,
  lookup: DictionaryLookupResult,
  tokens: Token[],
  tokenIndex: number
): SenseSelection | null {
  const normalised = normaliseForMatch(clean);
  const previous = wordAt(tokens, tokenIndex, -1);
  const next = wordAt(tokens, tokenIndex, 1);

  if (normalised === "j'ai") {
    return {
      translation: "I have",
      source: "contraction",
      confidence: "high",
      explanation: "J'ai is je + ai: the subject I plus avoir in the present. Before a past participle, it helps form the passe compose.",
    };
  }
  if (normalised === "c'est") {
    return {
      translation: "it is / this is",
      source: "contraction",
      confidence: "high",
      explanation: "C'est is ce + est: it is or this is. It is a whole expression, not the standalone letter c.",
    };
  }
  if (normalised === "qu'il") {
    return {
      translation: "that he / that it",
      source: "contraction",
      confidence: "high",
      explanation: "Qu'il is que + il: that he or that it. The apostrophe is elision before a vowel.",
    };
  }
  if (normalised === "qu'elle") {
    return {
      translation: "that she / that it",
      source: "contraction",
      confidence: "high",
      explanation: "Qu'elle is que + elle: that she or that it. The apostrophe is elision before a vowel.",
    };
  }
  if (normalised === "d'accord") {
    return {
      translation: "okay / agreed",
      source: "contraction",
      confidence: "high",
      explanation: "D'accord is a fixed everyday expression meaning okay, agreed, or in agreement.",
    };
  }
  if (normalised === "au") {
    return {
      translation: "to the / at the",
      source: "contraction",
      confidence: "high",
      explanation: "Au is a contraction of a + le. It points to a masculine singular noun or place.",
    };
  }
  if (normalised === "aux") {
    return {
      translation: "to the / at the",
      source: "contraction",
      confidence: "high",
      explanation: "Aux is a contraction of a + les. It points to a plural noun or place.",
    };
  }
  if (normalised === "du") {
    return {
      translation: "of the / from the",
      source: "contraction",
      confidence: "high",
      explanation: "Du is a contraction of de + le. It can also be partitive, meaning some.",
    };
  }
  if (normalised === "des") {
    return {
      translation: "of the / some",
      source: "contraction",
      confidence: "medium",
      explanation: "Des can be de + les (of/from the) or an indefinite/partitive plural article (some). The sentence decides which reading is strongest.",
    };
  }

  const elidedArticle = normalised.match(/^l'(.+)$/);
  if (elidedArticle) {
    const tailLookup = lookupWord(elidedArticle[1]);
    const noun = tailLookup.translations[0] ?? lookup.translations[0];
    return {
      translation: noun ? `the ${stripLeadingTo(noun)}` : "the ...",
      source: "contraction",
      confidence: noun ? "high" : "medium",
      explanation: "L' is the elided definite article le/la before a vowel or silent h, so the tapped token includes both the and the noun.",
    };
  }

  if (normalised.includes("-")) {
    if (normalised.endsWith("-en")) {
      return {
        translation: `${verbBaseEnglish(lookup.translations[0] ?? "speak")} about it`,
        source: "grammar",
        confidence: "medium",
        explanation: "The hyphen attaches the pronoun en to an imperative verb: do the action about it/of it.",
      };
    }
    if (/(?:^|-)t-(?:il|elle|on)$/.test(normalised) || /-(?:il|elle|on|ils|elles|nous|vous|tu|je)$/.test(normalised)) {
      const questionTranslation = normalised.startsWith("a-t-il") || normalised.startsWith("a-t-elle") || normalised.startsWith("a-t-on")
        ? "has he/she/it...?"
        : `${verbBaseEnglish(lookup.translations[0] ?? "have")} he/she/it...?`;
      return {
        translation: questionTranslation,
        source: "grammar",
        confidence: "medium",
        explanation: "This is subject-verb inversion for a question. The -t- is a pronunciation bridge, not a separate word.",
      };
    }
  }

  if (PRONOUN_TRANSLATIONS[normalised] && shouldPreferPronoun(normalised, previous, next)) return PRONOUN_TRANSLATIONS[normalised];
  return null;
}

interface ContextSenseRuleContext {
  selectedKey: string;
  lemmaKey: string;
  sentenceKey: string;
  words: string[];
  previous: string | null;
  next: string | null;
  hasNegationCue: boolean;
  has: (needles: string[]) => boolean;
  around: (needles: string[]) => boolean;
}

interface ContextSenseRule {
  keys?: string[];
  lemmas?: string[];
  when?: (context: ContextSenseRuleContext) => boolean;
  sense: SenseSelection;
}

/**
 * A rule that fired, plus what made it fire.
 *
 * Rules used to return an answer directly and the first one to match won,
 * which made correctness depend on declaration order: the generic `compter`
 * rule sitting above `compter sur` meant "je compte sur toi" resolved to
 * "counts". Rules now produce evidence instead, and the scorer decides.
 *
 * `evidence` is the list of needles that actually matched — recorded by the
 * instrumented `has`/`around` helpers rather than declared by hand, so
 * specificity is derived from what the sentence really supported. A rule that
 * fired because the two-word "compter sur" was present is measurably more
 * specific than one that fired on a bare determiner check, without anyone
 * having to annotate either.
 */
export interface ContextSenseCandidate {
  sense: SenseSelection;
  evidence: string[];
  /** Longest matched needle in words; 0 when the rule matched on word identity alone. */
  matchedWords: number;
  /** Declaration order, used only as a stable tie-break between equally specific rules. */
  order: number;
}

const HUMAN_OBJECT_WORDS = [
  "autorites",
  "habitants",
  "parents",
  "public",
  "lecteurs",
  "clients",
  "salariés",
  "salaries",
  "eleves",
  "enfants",
  "patients",
  "police",
  "secours",
];

const MONEY_WORDS = ["euro", "euros", "dollar", "dollars", "livre", "livres", "argent", "somme", "budget", "prix", "cout", "coût", "revenu", "salaire"];
const TRANSPORT_WORDS = ["bus", "autocar", "gare", "route", "transport", "train", "voiture", "camion", "chauffeur", "passagers"];
const POLITICAL_WORDS = ["gouvernement", "ministre", "parlement", "depute", "député", "election", "élection", "parti", "vote", "loi", "senat", "sénat", "politique"];
const LEGAL_WORDS = ["justice", "tribunal", "plainte", "enquete", "enquête", "juge", "police", "condamne", "condamné", "proces", "procès", "loi"];
const WORK_WORDS = ["emploi", "poste", "travail", "entreprise", "salarie", "salarié", "salaries", "salariés", "contrat", "carriere", "carrière", "candidat", "recrutement"];
const SCHOOL_WORDS = ["ecole", "école", "classe", "professeur", "universite", "université", "cours", "eleves", "élèves", "etudiants", "étudiants"];
const WEATHER_WORDS = ["pluie", "neige", "soleil", "meteo", "météo", "vent", "orage", "temperature", "température", "nuage"];

/**
 * Words that mark what follows as a noun phrase. Several French words are a
 * noun and a verb form at once — "sens" is both "meaning" and "I feel", "place"
 * is both "square/room" and "I place" — and the dictionary can only store one
 * of them as the leading gloss. A determiner immediately before the word is the
 * single strongest available signal that the noun reading is the right one.
 */
const DETERMINERS = [
  "le", "la", "les", "l'", "un", "une", "des", "du", "de", "d'", "au", "aux",
  "ce", "cet", "cette", "ces", "mon", "ma", "mes", "ton", "ta", "tes",
  "son", "sa", "ses", "notre", "nos", "votre", "vos", "leur", "leurs",
  "quel", "quelle", "chaque", "tout", "toute", "meme", "autre",
];

/** Subject pronouns that mark what follows as a conjugated verb rather than a noun. */
const SUBJECT_PRONOUNS = ["je", "j'", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles"];

/** Forms of être plus other state verbs, after which "encore" reads as "still" rather than "again". */
const STATE_VERB_FORMS = [
  "est", "sont", "etait", "etaient", "suis", "es", "sommes", "etes",
  "sera", "seront", "reste", "restent", "restait", "demeure", "a", "ont", "avait",
];

const CONTEXT_SENSE_RULES: ContextSenseRule[] = [
  {
    keys: ["actuellement"],
    sense: {
      translation: "currently / at present",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["now"],
      explanation: "Actuellement is a false-friend trap: it means currently or at present, not actually.",
    },
  },
  {
    keys: ["eventuel", "eventuelle", "eventuels", "eventuelles"],
    lemmas: ["eventuel"],
    sense: {
      translation: "possible / potential",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["possible future"],
      explanation: "Eventuel means possible or potential, not eventual in the English sense of inevitable later outcome.",
    },
  },
  {
    keys: ["effectivement"],
    sense: {
      translation: "indeed / actually",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["in fact"],
      explanation: "Effectivement usually confirms something: indeed or actually, not effectively in the practical-method sense.",
    },
  },
  {
    keys: ["finalement"],
    sense: {
      translation: "in the end / after all",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["ultimately"],
      explanation: "Finalement normally means in the end or after all; it is often not the same as finally in a sequence of steps.",
    },
  },
  {
    keys: ["deception", "deceptions"],
    lemmas: ["deception"],
    sense: {
      translation: "disappointment",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["letdown"],
      explanation: "Deception is a false friend: French deception means disappointment, not deceit.",
    },
  },
  {
    keys: ["decoit", "decoivent", "decevra", "decevront", "decu", "decue", "decus", "decues"],
    lemmas: ["decevoir"],
    sense: {
      translation: "disappoint",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["let down"],
      explanation: "Decevoir means to disappoint or let someone down, not to deceive.",
    },
  },
  {
    keys: ["location", "locations"],
    lemmas: ["location"],
    sense: {
      translation: "rental / hire",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["letting"],
      explanation: "Location is usually a rental or hire arrangement. The place where something is located is an emplacement or lieu.",
    },
  },
  {
    keys: ["preservatif", "preservatifs"],
    lemmas: ["preservatif"],
    sense: {
      translation: "condom",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["contraceptive"],
      explanation: "Preservatif is a false friend: it means condom, not a food preservative.",
    },
  },
  {
    keys: ["avertissement", "avertissements"],
    lemmas: ["avertissement"],
    sense: {
      translation: "warning",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["notice"],
      explanation: "Avertissement means a warning. Advertisement is publicite.",
    },
  },
  {
    keys: ["publicite", "publicites"],
    lemmas: ["publicite"],
    sense: {
      translation: "advertising / advert",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["ad"],
      explanation: "Publicite usually means advertising or an advert, not publicity in the reputation sense.",
    },
  },
  {
    keys: ["sympathique", "sympa", "sympathiques"],
    lemmas: ["sympathique"],
    sense: {
      translation: "nice / friendly",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["pleasant"],
      explanation: "Sympathique or sympa usually means nice or friendly, not sympathetic in the emotional-support sense.",
    },
  },
  {
    lemmas: ["assumer"],
    sense: {
      translation: "take responsibility for / accept",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["own up to", "shoulder"],
      explanation: "Assumer usually means to take on, accept, or take responsibility for something, not to suppose.",
    },
  },
  {
    lemmas: ["blesser"],
    sense: {
      translation: "injure / hurt",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["wound"],
      explanation: "Blesser means to injure, wound, or hurt someone.",
    },
  },
  {
    keys: ["injure", "injures"],
    lemmas: ["injure"],
    sense: {
      translation: "insult / abusive remark",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["abuse"],
      explanation: "In French, injure is normally an insult or abusive remark. Physical injury is blessure.",
    },
  },
  {
    keys: ["agenda", "agendas"],
    lemmas: ["agenda"],
    sense: {
      translation: "diary / schedule",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["planner"],
      explanation: "Agenda often means a diary, planner, or schedule. The hidden-motive sense is usually ordre du jour or intentions.",
    },
  },
  {
    keys: ["lecture", "lectures"],
    lemmas: ["lecture"],
    sense: {
      translation: "reading",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["interpretation"],
      explanation: "Lecture normally means reading. An academic lecture is more often un cours or une conference.",
    },
  },
  {
    keys: ["delai", "delais"],
    lemmas: ["delai"],
    sense: {
      translation: "deadline / time limit / period",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["delay"],
      explanation: "Delai usually means the time allowed, a deadline, or a waiting period. Delay in the sense of lateness is retard.",
    },
  },
  {
    keys: ["retard", "retards"],
    lemmas: ["retard"],
    sense: {
      translation: "delay / lateness",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["being late"],
      explanation: "Retard is the ordinary French noun for delay or lateness.",
    },
  },
  {
    keys: ["stage", "stages"],
    lemmas: ["stage"],
    sense: {
      translation: "internship / training course",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["work placement"],
      explanation: "Stage is a common learner trap: in French it usually means an internship, placement, or training course, not a theatre stage.",
    },
  },
  {
    keys: ["car"],
    when: (context) => context.around(TRANSPORT_WORDS),
    sense: {
      translation: "coach / bus",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["because"],
      explanation: "Transport context makes car mean a coach or bus.",
    },
  },
  {
    keys: ["car"],
    sense: {
      translation: "because",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["coach / bus"],
      explanation: "Outside transport context, car is usually the formal conjunction because.",
    },
  },
  {
    lemmas: ["demander"],
    when: (context) =>
      !["demande", "demandes"].includes(context.selectedKey) ||
      !["la", "une", "sa", "cette", "leur", "les", "des"].includes(context.previous ?? ""),
    sense: {
      translation: "ask / request",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["ask for"],
      explanation: "Demander means to ask or request. Demand in the stronger English sense is usually exiger.",
    },
  },
  {
    keys: ["demande", "demandes"],
    lemmas: ["demande"],
    when: (context) => context.has(["offre et demande", "la demande augmente", "demande baisse", "forte demande", "demande du marche", "demande du marché"]),
    sense: {
      translation: "demand",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["request", "application"],
      explanation: "Economic context makes demande mean market demand.",
    },
  },
  {
    keys: ["demande", "demandes"],
    lemmas: ["demande"],
    sense: {
      translation: "request / application",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["demand"],
      explanation: "Outside economics, demande is usually a request or application rather than a forceful demand.",
    },
  },
  {
    keys: ["avis"],
    when: (context) => context.has(["avis de", "avis favorable", "avis defavorable", "avis défavorable", "son avis", "mon avis", "a mon avis", "à mon avis"]),
    sense: {
      translation: "opinion / notice",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["view"],
      explanation: "Avis is an opinion, notice, or formal view. Personal advice is conseil.",
    },
  },
  {
    keys: ["chance", "chances"],
    lemmas: ["chance"],
    when: (context) => context.has(["bonne chance", "malchance", "par chance"]),
    sense: {
      translation: "luck",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["opportunity"],
      explanation: "In expressions such as bonne chance or par chance, chance means luck.",
    },
  },
  {
    keys: ["chance", "chances"],
    lemmas: ["chance"],
    when: (context) => context.has(["chance de", "chances de", "donner sa chance"]),
    sense: {
      translation: "chance / opportunity",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["luck"],
      explanation: "With de plus an infinitive/noun, chance can mean an opportunity or probability.",
    },
  },
  {
    keys: ["coin", "coins"],
    lemmas: ["coin"],
    when: (context) => context.around(MONEY_WORDS),
    sense: {
      translation: "coin",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["corner"],
      explanation: "Money context can make coin the literal coin sense.",
    },
  },
  {
    keys: ["coin", "coins"],
    lemmas: ["coin"],
    sense: {
      translation: "corner / area",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["coin"],
      explanation: "In everyday French, coin usually means a corner, nook, or local area.",
    },
  },
  {
    keys: ["monnaie", "monnaies"],
    lemmas: ["monnaie"],
    sense: {
      translation: "change / currency / coins",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["money"],
      explanation: "Monnaie covers small change, coins, or a currency depending on context.",
    },
  },
  {
    keys: ["temps"],
    lemmas: ["temps"],
    // "quel temps fait-il" carries no weather vocabulary at all — the giveaway
    // is the impersonal "faire" frame that only ever asks about weather.
    when: (context) => context.around(WEATHER_WORDS) || context.has(["quel temps", "temps qu'il fait", "beau temps", "mauvais temps"]),
    sense: {
      translation: "weather",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["time"],
      explanation: "Weather context makes temps mean weather, as in il fait beau temps.",
    },
  },
  {
    keys: ["temps"],
    lemmas: ["temps"],
    sense: {
      translation: "time",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["weather"],
      explanation: "Without weather cues, temps usually means time.",
    },
  },
  // "sens" is a noun (meaning, direction) and a conjugated form of sentir (I/you
  // feel) at once, and the dictionary stores only the verb. Without a rule here
  // a reader tapping "le sens de la phrase" was told the word meant "to feel".
  {
    keys: ["sens"],
    when: (context) => !!context.previous && SUBJECT_PRONOUNS.includes(normaliseForMatch(context.previous)),
    sense: {
      translation: "feel",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["meaning", "direction"],
      explanation: "After a subject pronoun, sens is the verb sentir: I feel or you feel.",
    },
  },
  {
    keys: ["sens"],
    when: (context) =>
      context.around(["circulation", "route", "rue", "aiguilles", "montre", "interdit", "unique", "inverse", "giratoire", "marche", "direction"]),
    sense: {
      translation: "direction",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["meaning", "way"],
      explanation: "In a traffic or movement context, sens is the direction something runs in — sens unique, sens interdit.",
    },
  },
  {
    keys: ["sens"],
    when: (context) => !!context.previous && DETERMINERS.includes(normaliseForMatch(context.previous)),
    sense: {
      translation: "meaning",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["sense", "direction"],
      explanation: "After a determiner, sens is the noun: the meaning or sense of something.",
    },
  },
  // Bare "même" before a noun phrase is the concessive "even"; it only means
  // "same" when a determiner introduces it (le même jour, la même chose).
  {
    keys: ["meme"],
    when: (context) => !!context.previous && DETERMINERS.includes(normaliseForMatch(context.previous)),
    sense: {
      translation: "same",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["even", "itself"],
      explanation: "After a determiner, même means same — le même jour, la même chose.",
    },
  },
  {
    keys: ["meme"],
    sense: {
      translation: "even",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["same"],
      explanation: "With no determiner in front, même is usually the emphasiser even — même les enfants comprennent.",
    },
  },

  // ---------------------------------------------------------------------
  // Frames for the words ambiguity.ts marks as context-dependent.
  //
  // Without these, every tap on "tour", "droit", "compte" and friends would
  // fall through to an escalation, because a bare gloss for them is a coin
  // flip. These rules read the frame the word sits in — its determiner, its
  // object, the verb governing it — so the common cases resolve locally,
  // instantly and correctly, and only genuinely unclear uses reach the model.
  // ---------------------------------------------------------------------

  // tour: masculine "un tour" (a turn, a trip) vs feminine "la tour" (a tower).
  // The article is the whole signal, which is why the dictionary's frequency
  // ordering can never settle it.
  {
    keys: ["tour"],
    when: (context) => context.has(["son tour", "mon tour", "ton tour", "votre tour", "notre tour", "leur tour", "chacun son tour", "a tour de role"]),
    sense: {
      translation: "turn",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["tower", "trip"],
      explanation: "With a possessive, tour is a turn in a sequence — c'est son tour means it is his or her turn.",
    },
  },
  {
    keys: ["tour"],
    when: (context) => context.has(["faire un tour", "fait un tour", "faire le tour", "fait le tour", "un tour en", "un petit tour"]),
    sense: {
      translation: "a trip / a walk around",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["tower", "turn"],
      explanation: "Faire un tour is to go for a short trip or walk, not to build a tower.",
    },
  },
  {
    keys: ["tour"],
    when: (context) => ["la", "une", "cette", "l'"].includes(normaliseForMatch(context.previous ?? "")),
    sense: {
      translation: "tower",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["turn", "trip"],
      explanation: "Feminine la tour is a tower; masculine le tour is a turn or a trip.",
    },
  },
  {
    keys: ["tour"],
    when: (context) => ["le", "un", "ce"].includes(normaliseForMatch(context.previous ?? "")),
    sense: {
      translation: "turn / trip",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["tower"],
      explanation: "Masculine le tour is a turn or a circuit; the tower sense is feminine la tour.",
    },
  },

  // droit: an entitlement, the academic subject, or the adverb "straight".
  {
    keys: ["droit"],
    when: (context) => context.has(["tout droit"]),
    sense: {
      translation: "straight ahead",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["right", "law"],
      explanation: "Tout droit is the direction straight ahead, unrelated to rights or law.",
    },
  },
  {
    keys: ["droit"],
    when: (context) => context.around(["etudie", "etudier", "etudiant", "faculte", "avocat", "juriste", "licence", "master", "cours", "universite", "professeur"]),
    sense: {
      translation: "law",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["right", "straight"],
      explanation: "In an academic context le droit is the subject of law — il étudie le droit.",
    },
  },
  {
    keys: ["droit"],
    when: (context) => context.has(["le droit de", "a le droit", "ont le droit", "avoir le droit", "mon droit", "son droit", "ses droits", "leurs droits", "droits de"]),
    sense: {
      translation: "right / entitlement",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["law", "straight"],
      explanation: "Here droit is an entitlement — avoir le droit de means to have the right to.",
    },
  },

  // place: a square, a seat, or room to fit into.
  {
    keys: ["place", "places"],
    when: (context) => context.has(["plus de place", "pas de place", "de la place", "assez de place", "prend de la place", "manque de place"]),
    sense: {
      translation: "room / space",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["square", "seat"],
      explanation: "With a quantity expression, place is room or space rather than a location.",
    },
  },
  {
    keys: ["place", "places"],
    when: (context) => context.has(["sur la place", "place publique", "grande place", "place du", "place de la"]),
    sense: {
      translation: "square",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["room", "seat"],
      explanation: "La place is the public square at the centre of a French town.",
    },
  },
  {
    keys: ["place", "places"],
    when: (context) => context.has(["a ma place", "a ta place", "a sa place", "a votre place", "a leur place", "sur place"]),
    sense: {
      translation: "in someone's position / on the spot",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["square", "room"],
      explanation: "À sa place means in his or her position; sur place means on the spot.",
    },
  },
  {
    keys: ["place", "places"],
    when: (context) => context.around(["reserve", "reserver", "train", "avion", "cinema", "theatre", "concert", "spectacle", "billet", "billets"]),
    sense: {
      translation: "seat",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["square", "room"],
      explanation: "When booking travel or a show, une place is a seat.",
    },
  },

  // fait: the noun "fact" vs the verb faire, whose own sense depends on what
  // follows it. "Il fait beau" is about the weather and has no English "make".
  {
    keys: ["fait"],
    when: (context) =>
      context.has(["il fait", "il faisait", "il fera"]) &&
      context.around(["beau", "chaud", "froid", "mauvais", "nuit", "jour", "gris", "doux", "frais", "soleil", "sombre", "humide", "degres"]),
    sense: {
      translation: "it is (weather)",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["does", "makes", "fact"],
      explanation: "Il fait + a weather word is the impersonal weather frame: il fait beau means the weather is fine.",
    },
  },
  {
    keys: ["fait", "faits"],
    when: (context) => ["un", "le", "les", "des", "ce", "ces", "certains"].includes(normaliseForMatch(context.previous ?? "")),
    sense: {
      translation: "fact",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["does", "makes"],
      explanation: "After a determiner, fait is the noun a fact — un fait important.",
    },
  },
  {
    keys: ["fait"],
    when: (context) => !!context.previous && SUBJECT_PRONOUNS.includes(normaliseForMatch(context.previous)),
    sense: {
      translation: "does / makes",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["fact"],
      explanation: "After a subject pronoun, fait is the verb faire: does or makes.",
    },
  },

  // compte: an account, the act of counting, intending to do something, or
  // mattering. Four unrelated meanings behind one very common form.
  {
    keys: ["compte", "comptes"],
    when: (context) => context.around(["bancaire", "banque", "epargne", "courant", "client", "utilisateur", "ouvrir", "ouvre", "virement"]),
    sense: {
      translation: "account",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["count", "matters"],
      explanation: "In a banking or sign-up context, un compte is an account.",
    },
  },
  {
    keys: ["compte", "comptent"],
    when: (context) => context.has(["compte partir", "compte aller", "compte faire", "compte venir", "compte rester", "comptent partir", "compte se", "compte y"]),
    sense: {
      translation: "plans to / intends to",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["counts", "account"],
      explanation: "Compter followed by an infinitive means to plan or intend to do something.",
    },
  },
  {
    keys: ["compte", "comptent"],
    when: (context) => context.has(["compte beaucoup", "compte pour", "ca compte", "cela compte", "compte vraiment", "comptent beaucoup", "ce qui compte"]),
    sense: {
      translation: "matters / counts",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["account", "counts"],
      explanation: "Cela compte beaucoup means it matters a great deal.",
    },
  },
  {
    keys: ["compte", "comptent"],
    // "compter sur" (to rely on) has its own rule further down and must not be
    // swallowed by the generic subject-pronoun reading.
    when: (context) =>
      !!context.previous &&
      SUBJECT_PRONOUNS.includes(normaliseForMatch(context.previous)) &&
      normaliseForMatch(context.next ?? "") !== "sur",
    sense: {
      translation: "counts",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["account", "matters"],
      explanation: "After a subject pronoun with an object, compte is the verb to count.",
    },
  },
  {
    keys: ["compte", "comptes"],
    when: (context) => ["un", "le", "mon", "ton", "son", "votre", "leur", "des", "les"].includes(normaliseForMatch(context.previous ?? "")),
    sense: {
      translation: "account",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["count", "matters"],
      explanation: "After a determiner, compte is normally the noun an account.",
    },
  },

  // prendre: the verb is almost meaningless without its object.
  // Deliberately not matching the past participle "pris": in a compound tense
  // the grammar path produces the tense-correct "has taken", and a flat
  // present-tense gloss here would throw that away.
  {
    keys: ["prend", "prends", "prennent", "prendre"],
    lemmas: ["prendre"],
    when: (context) => context.around(["train", "bus", "avion", "metro", "voiture", "taxi", "velo", "bateau", "ascenseur"]),
    sense: {
      translation: "takes (transport)",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["takes", "has"],
      explanation: "With a means of transport, prendre is to take or catch it.",
    },
  },
  {
    keys: ["prend", "prends", "prennent", "prendre"],
    lemmas: ["prendre"],
    when: (context) => context.around(["cafe", "the", "verre", "petit-dejeuner", "dejeuner", "diner", "repas", "biere", "medicament"]),
    sense: {
      translation: "has (food or drink)",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["takes"],
      explanation: "With food or drink, prendre means to have — il prend un café.",
    },
  },
  {
    keys: ["prend", "prends", "prennent", "prendre"],
    lemmas: ["prendre"],
    when: (context) => context.around(["decision", "decisions", "risque", "risques", "rendez-vous", "mesures", "photo", "note", "notes"]),
    sense: {
      translation: "makes / takes",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["takes"],
      explanation: "Prendre une décision is to make a decision; French takes where English makes.",
    },
  },

  // mettre: to put, to put on, or to take a length of time.
  {
    keys: ["met", "mets", "mettent", "mettre"],
    lemmas: ["mettre"],
    when: (context) => context.around(["manteau", "chapeau", "chaussures", "robe", "veste", "pull", "lunettes", "gants", "echarpe", "costume", "uniforme"]),
    sense: {
      translation: "puts on (clothing)",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["puts"],
      explanation: "With clothing, mettre is to put on rather than simply to put.",
    },
  },
  {
    keys: ["met", "mets", "mettent", "mettre", "mis"],
    lemmas: ["mettre"],
    when: (context) => context.has(["met une heure", "met deux heures", "met du temps", "mettre du temps", "met trois heures", "met une demi"]),
    sense: {
      translation: "takes (an amount of time)",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["puts"],
      explanation: "Mettre with a duration means to take that long — il met une heure pour venir.",
    },
  },

  // suivre: to follow, or to take a course.
  {
    keys: ["suit", "suis", "suivent", "suivre", "suivi"],
    lemmas: ["suivre"],
    when: (context) => context.around(["cours", "formation", "etudes", "stage", "classe", "regime", "traitement", "lecon"]),
    sense: {
      translation: "takes (a course or programme)",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["follows"],
      explanation: "Suivre un cours is to take a class, not to follow it around.",
    },
  },

  // trouver: to find, or to think something is a certain way.
  {
    keys: ["trouve", "trouves", "trouvent", "trouver"],
    lemmas: ["trouver"],
    when: (context) => context.has(["se trouve", "se trouvent", "se trouvait"]),
    sense: {
      translation: "is located",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["finds"],
      explanation: "Se trouver describes where something is located.",
    },
  },
  {
    keys: ["trouve", "trouves", "trouvent"],
    lemmas: ["trouver"],
    // Deliberately not keyed on "je trouve" alone: "je trouve la clé" is an
    // ordinary find. The opinion reading needs a complement clause or an
    // evaluative adjective.
    when: (context) =>
      context.has(["trouve que", "trouve ca", "trouve cela", "trouvent que", "trouve qu'"]) ||
      context.around(["interessant", "difficile", "facile", "beau", "bizarre", "etrange", "bon", "mauvais", "joli", "cher", "long"]),
    sense: {
      translation: "thinks / finds (an opinion)",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["finds"],
      explanation: "Trouver que introduces an opinion — je trouve cela difficile means I think that is hard.",
    },
  },

  // depuis: "since" a point in time, "for" a duration. English splits what
  // French does not, so the complement decides which word is correct.
  {
    keys: ["depuis"],
    when: (context) =>
      /depuis (?:\d+|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|quelques|plusieurs|longtemps|peu)\b/.test(context.sentenceKey) &&
      !/depuis (?:19|20)\d\d/.test(context.sentenceKey),
    sense: {
      translation: "for",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["since"],
      explanation: "Before a length of time, depuis is English for — depuis trois ans means for three years.",
    },
  },
  {
    keys: ["depuis"],
    sense: {
      translation: "since",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["for", "from"],
      explanation: "Before a point in time, depuis is since — depuis 2010, depuis hier.",
    },
  },

  // bien: the adverb "well", the intensifier "quite", or the noun "good".
  {
    keys: ["bien"],
    when: (context) => ["le", "du", "un", "les", "des"].includes(normaliseForMatch(context.previous ?? "")),
    sense: {
      translation: "good / goods",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["well"],
      explanation: "After a determiner, bien is a noun: the good, or goods and property.",
    },
  },
  {
    keys: ["bien"],
    when: (context) => context.has(["bien des", "bien plus", "bien mieux", "bien trop", "bien avant", "bien apres"]),
    sense: {
      translation: "much / far",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["well"],
      explanation: "Before a comparative or quantity, bien intensifies it — bien plus means far more.",
    },
  },
  {
    keys: ["bien"],
    sense: {
      translation: "well",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["quite", "indeed", "good"],
      explanation: "As an adverb after a verb, bien means well — il travaille bien.",
    },
  },

  // passer: "se passer" is to happen, which shares no English word with the
  // ordinary "to pass" the dictionary leads with.
  {
    keys: ["passe", "passer", "passait", "passent"],
    lemmas: ["passer"],
    // Inversion keeps the pronoun between the auxiliary and the participle
    // ("que s'est-il passé"), so the plain "s'est passé" string never matches.
    when: (context) =>
      context.has(["se passe", "s'est passe", "se passait", "se passent", "il se passe", "que se passe"]) ||
      /s'est-\w+ passe|se passe-t-il|se sont passe/.test(context.sentenceKey),
    sense: {
      translation: "happens / happened",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["passes", "spends"],
      explanation: "Se passer means to happen — que s'est-il passé means what happened.",
    },
  },

  // arriver: to arrive somewhere, or for something to happen.
  {
    keys: ["arrive", "arrives", "arrivent", "arriver", "arrivait"],
    lemmas: ["arriver"],
    when: (context) =>
      context.around(["demain", "hier", "matin", "soir", "heure", "heures", "gare", "aeroport", "train", "avion", "midi", "tard", "tot", "bientot"]),
    sense: {
      translation: "arrives",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["happens"],
      explanation: "With a time or a place, arriver is to arrive.",
    },
  },

  // personne: a person, or nobody under negation.
  {
    keys: ["personne"],
    when: (context) => context.hasNegationCue && !["une", "la", "cette", "des", "les", "quelques"].includes(normaliseForMatch(context.previous ?? "")),
    sense: {
      translation: "nobody / anyone",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["person"],
      explanation: "With ne, personne is the negative pronoun nobody — il n'y a personne.",
    },
  },
  {
    keys: ["personne", "personnes"],
    when: (context) => ["une", "la", "cette", "des", "les", "quelques", "deux", "trois"].includes(normaliseForMatch(context.previous ?? "")),
    sense: {
      translation: "person",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["nobody"],
      explanation: "After a determiner, personne is the ordinary noun a person.",
    },
  },

  // pas: the negator, or a footstep.
  {
    keys: ["pas"],
    when: (context) => ["un", "le", "les", "des", "ce", "mes", "ses", "premiers", "grands"].includes(normaliseForMatch(context.previous ?? "")),
    sense: {
      translation: "step",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["not"],
      explanation: "After a determiner, pas is the noun a step — un pas en avant.",
    },
  },
  {
    keys: ["pas"],
    when: (context) => context.hasNegationCue,
    sense: {
      translation: "not",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["step"],
      explanation: "Paired with ne, pas is the second half of the standard French negative.",
    },
  },

  // livre: a book, or a pound.
  {
    keys: ["livre", "livres"],
    when: (context) => context.around(["sterling", "euros", "kilo", "grammes", "poids", "beurre", "farine"]) || ["une", "deux"].includes(normaliseForMatch(context.previous ?? "")),
    sense: {
      translation: "pound",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["book"],
      explanation: "Feminine une livre is a pound in weight or currency; masculine un livre is a book.",
    },
  },
  {
    keys: ["livre", "livres"],
    sense: {
      translation: "book",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["pound"],
      explanation: "Masculine le livre is a book, which is overwhelmingly the reading sense.",
    },
  },
  {
    keys: ["histoire", "histoires"],
    lemmas: ["histoire"],
    when: (context) => context.has(["raconte", "roman", "personnage", "conte", "mensonge"]),
    sense: {
      translation: "story",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["history"],
      explanation: "Narrative context makes histoire mean a story.",
    },
  },
  {
    keys: ["histoire", "histoires"],
    lemmas: ["histoire"],
    sense: {
      translation: "history / story",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["story"],
      explanation: "Histoire can mean history or story; without a strong cue, both readings remain possible.",
    },
  },
  {
    keys: ["milieu", "milieux"],
    lemmas: ["milieu"],
    when: (context) => context.has(["au milieu", "en plein milieu"]),
    sense: {
      translation: "middle",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["environment", "sector"],
      explanation: "Au milieu means in the middle.",
    },
  },
  {
    keys: ["milieu", "milieux"],
    lemmas: ["milieu"],
    when: (context) => context.has(["milieu naturel", "milieu marin", "environnement"]),
    sense: {
      translation: "environment / habitat",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["middle", "sector"],
      explanation: "Environmental context makes milieu mean environment or habitat.",
    },
  },
  {
    keys: ["milieu", "milieux"],
    lemmas: ["milieu"],
    when: (context) => context.has(["milieu politique", "milieu economique", "milieu économique", "milieu artistique"]),
    sense: {
      translation: "circle / sector",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["middle", "environment"],
      explanation: "Social or professional context makes milieu mean a circle, sector, or community.",
    },
  },
  {
    keys: ["moyen", "moyens", "moyenne", "moyennes"],
    lemmas: ["moyen"],
    when: (context) => context.has(["moyen de", "moyens de", "par tous les moyens"]),
    sense: {
      translation: "means / way",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["average"],
      explanation: "Moyen de means a means or way of doing something.",
    },
  },
  {
    keys: ["moyen", "moyens", "moyenne", "moyennes"],
    lemmas: ["moyen"],
    when: (context) => context.has(["age moyen", "âge moyen", "prix moyen", "niveau moyen", "taille moyenne"]),
    sense: {
      translation: "average",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["means", "medium"],
      explanation: "With measurements, moyen/moyenne means average.",
    },
  },
  {
    keys: ["reste", "restes"],
    lemmas: ["reste", "rester"],
    when: (context) => context.has(["il reste", "reste a", "reste à", "reste encore"]),
    sense: {
      translation: "remains / is left",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["rest"],
      explanation: "Il reste or reste a/à usually means something remains or is still left to do.",
    },
  },
  {
    keys: ["reste", "restes"],
    lemmas: ["reste"],
    when: (context) => context.has(["le reste", "du reste", "reste de"]),
    sense: {
      translation: "rest / remainder",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["remains"],
      explanation: "Le reste or reste de means the rest or remainder.",
    },
  },
  {
    keys: ["juste", "justes"],
    lemmas: ["juste"],
    when: (context) => context.has(["pas juste", "decision juste", "décision juste", "prix juste"]),
    sense: {
      translation: "fair / just",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["only", "exactly"],
      explanation: "Fairness context makes juste mean fair or just.",
    },
  },
  {
    keys: ["juste"],
    lemmas: ["juste"],
    when: (context) => context.has(["juste avant", "juste apres", "juste après", "juste a cote", "juste à côté"]),
    sense: {
      translation: "right / just",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["fair", "only"],
      explanation: "Before time or place expressions, juste often means right or just, as in right before.",
    },
  },
  {
    keys: ["droit", "droits", "droite"],
    lemmas: ["droit"],
    when: (context) => context.has(["droits de", "droit de", "droits humains", "droits de l'homme"]),
    sense: {
      translation: "right / legal entitlement",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["law", "straight"],
      explanation: "In rights language, droit means a right or legal entitlement.",
    },
  },
  {
    keys: ["droit", "droits"],
    lemmas: ["droit"],
    when: (context) => context.around(LEGAL_WORDS),
    sense: {
      translation: "law / legal right",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["straight", "right-hand"],
      explanation: "Legal context makes droit mean law or legal right.",
    },
  },
  {
    keys: ["droite"],
    when: (context) => /\ba droite\b|\bmain droite\b/.test(context.sentenceKey),
    sense: {
      translation: "right / right-hand side",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["political right"],
      explanation: "Spatial context makes droite mean the right side.",
    },
  },
  {
    keys: ["droite"],
    when: (context) => context.previous === "la" || context.around(POLITICAL_WORDS),
    sense: {
      translation: "the right / right wing",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["right-hand side"],
      explanation: "Political context makes la droite mean the right or right wing.",
    },
  },
  {
    lemmas: ["comprendre"],
    when: (context) => context.has(["y compris"]),
    sense: {
      translation: "including",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["understand"],
      explanation: "Y compris is the fixed expression including.",
    },
  },
  {
    lemmas: ["comprendre"],
    when: (context) => context.has(["comprend plusieurs", "comprend des", "comprend notamment", "comprend trois", "comprend deux"]),
    sense: {
      translation: "include / comprise",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["understand"],
      explanation: "With lists or components, comprendre can mean include or comprise.",
    },
  },
  {
    keys: ["porte", "portent", "portait", "portaient"],
    lemmas: ["porter"],
    when: (context) => context.has(["porte sur", "portent sur"]),
    sense: {
      translation: "concern / be about",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["wear", "carry"],
      explanation: "Porter sur means to concern or be about a topic.",
    },
  },
  {
    keys: ["porte", "portent", "portait", "portaient", "porte", "portee"],
    lemmas: ["porter"],
    when: (context) => context.has(["robe", "manteau", "chemise", "vetement", "vêtement", "masque"]),
    sense: {
      translation: "wear",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["carry"],
      explanation: "Clothing context makes porter mean to wear.",
    },
  },
  {
    keys: ["porte", "portent", "portait", "portaient", "porte", "portee"],
    lemmas: ["porter"],
    when: (context) => context.has(["sac", "valise", "enfant", "charge", "colis"]),
    sense: {
      translation: "carry",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["wear"],
      explanation: "Object or load context makes porter mean to carry.",
    },
  },
  {
    keys: ["pose", "posent", "posait", "posaient", "pose", "posee"],
    lemmas: ["poser"],
    when: (context) => context.has(["question", "probleme", "problème"]),
    sense: {
      translation: "ask / raise",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["put down", "pose"],
      explanation: "Poser une question means to ask a question; poser un probleme means to raise or pose a problem.",
    },
  },
  {
    keys: ["pose", "posent", "posait", "posaient", "pose", "posee"],
    lemmas: ["poser"],
    when: (context) => context.has(["table", "sol", "bureau", "main"]),
    sense: {
      translation: "put down / place",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["ask"],
      explanation: "Physical-object context makes poser mean to put down or place.",
    },
  },
  {
    lemmas: ["conduire"],
    when: (context) => context.has(["conduit a", "conduit à", "mene a", "mène à"]),
    sense: {
      translation: "lead to",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["drive"],
      explanation: "Conduire a/à means to lead to a result.",
    },
  },
  {
    lemmas: ["conduire"],
    when: (context) => context.around(TRANSPORT_WORDS),
    sense: {
      translation: "drive",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["lead"],
      explanation: "Vehicle context makes conduire mean to drive.",
    },
  },
  {
    lemmas: ["arriver"],
    // Only before an infinitive: "il arrive à finir" is managing, while
    // "le train arrive à huit heures" is plain arrival. Matching bare
    // "arrive à" conflated the two.
    when: (context) => /\barrive(?:nt)? a \w+(?:er|ir|re)\b/.test(context.sentenceKey),
    sense: {
      translation: "manage to / succeed in",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["arrive", "happen"],
      explanation: "Arriver a/à plus an infinitive means to manage to do something.",
    },
  },
  {
    lemmas: ["arriver"],
    when: (context) => context.has(["ce qui arrive", "cela arrive", "il arrive que", "arrive souvent", "arrive parfois"]),
    sense: {
      translation: "happen / occur",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["arrive"],
      explanation: "Event context makes arriver mean to happen or occur.",
    },
  },
  {
    lemmas: ["tomber"],
    when: (context) => context.has(["tomber malade", "tombe malade", "tombe enceinte"]),
    sense: {
      translation: "become",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["fall"],
      explanation: "Tomber malade/enceinte means to become ill/pregnant.",
    },
  },
  {
    lemmas: ["tomber"],
    when: (context) => context.has(["tomber sur", "tombe sur"]),
    sense: {
      translation: "come across / run into",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["fall"],
      explanation: "Tomber sur means to come across or run into something/someone.",
    },
  },
  {
    keys: ["compte", "comptes", "comptent", "comptait", "comptaient"],
    lemmas: ["compter"],
    when: (context) => context.has(["compter sur", "compte sur", "comptent sur"]),
    sense: {
      translation: "count on / rely on",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["count"],
      explanation: "Compter sur means to count on or rely on someone.",
    },
  },
  {
    keys: ["compte", "comptes", "comptent", "comptait", "comptaient"],
    lemmas: ["compter"],
    when: (context) => context.has(["compte faire", "compte bien", "comptent faire"]),
    sense: {
      translation: "intend / plan",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["count"],
      explanation: "Compter plus an infinitive often means to intend or plan to do something.",
    },
  },
  {
    lemmas: ["gagner"],
    when: (context) => context.around(MONEY_WORDS),
    sense: {
      translation: "earn",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["win", "gain"],
      explanation: "Money context makes gagner mean to earn.",
    },
  },
  {
    lemmas: ["gagner"],
    when: (context) => context.has(["match", "election", "élection", "course", "victoire", "championnat"]),
    sense: {
      translation: "win",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["earn", "gain"],
      explanation: "Sport or election context makes gagner mean to win.",
    },
  },
  {
    lemmas: ["sortir"],
    when: (context) => context.has(["livre", "film", "album", "rapport", "version"]),
    sense: {
      translation: "come out / be released",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["go out", "leave"],
      explanation: "Publication or media context makes sortir mean to come out or be released.",
    },
  },
  {
    lemmas: ["sortir"],
    when: (context) => context.has(["de la maison", "du batiment", "du bâtiment", "sortir avec", "sort le soir"]),
    sense: {
      translation: "go out / leave",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["release"],
      explanation: "Movement or social context keeps sortir in the go out/leave sense.",
    },
  },
  {
    lemmas: ["rentrer"],
    when: (context) => context.has(["chez lui", "chez elle", "a la maison", "à la maison", "rentre chez"]),
    sense: {
      translation: "go back / come home",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["enter", "fit"],
      explanation: "Home context makes rentrer mean to go back or come home.",
    },
  },
  {
    lemmas: ["rentrer"],
    when: (context) => context.has(["rentre dans", "rentrent dans"]),
    sense: {
      translation: "fit into / enter",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["come home"],
      explanation: "Rentrer dans can mean to fit into or enter something.",
    },
  },
  {
    keys: ["releve", "releves", "relevent", "relevait", "relevaient"],
    lemmas: ["relever"],
    when: (context) => context.has(["releve de", "relève de", "relevent de", "relèvent de"]),
    sense: {
      translation: "come under / be a matter of",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["raise", "point out"],
      explanation: "Relever de means to come under, fall within, or be a matter of something.",
    },
  },
  {
    keys: ["releve", "releves", "relevent", "relevait", "relevaient"],
    lemmas: ["relever"],
    when: (context) => context.has(["relever le defi", "relever le défi", "releve le defi", "relève le défi"]),
    sense: {
      translation: "take up / meet",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["raise"],
      explanation: "Relever le defi means to take up or meet a challenge.",
    },
  },
  {
    lemmas: ["retenir"],
    when: (context) => context.has(["retenir que", "retenu que", "nom", "information"]),
    sense: {
      translation: "remember / note",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["hold back", "select"],
      explanation: "Information context makes retenir mean to remember, note, or keep in mind.",
    },
  },
  {
    lemmas: ["retenir"],
    when: (context) => context.has(["candidat", "option", "solution", "retenu pour"]),
    sense: {
      translation: "select / keep",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["remember", "detain"],
      explanation: "Selection context makes retenir mean to select or keep.",
    },
  },
  {
    lemmas: ["disposer"],
    when: (context) => context.has(["dispose de", "disposent de", "disposer de"]),
    sense: {
      translation: "have / have at one's disposal",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["arrange"],
      explanation: "Disposer de means to have or have at one's disposal.",
    },
  },
  {
    lemmas: ["convenir"],
    when: (context) => context.around(HUMAN_OBJECT_WORDS) || context.has(["convient a", "convient à"]),
    sense: {
      translation: "suit / be suitable for",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["agree"],
      explanation: "Convenir a/à someone means to suit them or be suitable.",
    },
  },
  {
    keys: ["rapport", "rapports"],
    lemmas: ["rapport"],
    when: (context) => context.has(["rapport publie", "rapport publié", "rapport annuel", "selon le rapport", "rapport de"]),
    sense: {
      translation: "report",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["relationship", "ratio"],
      explanation: "Publication context makes rapport mean a report.",
    },
  },
  {
    keys: ["rapport", "rapports"],
    lemmas: ["rapport"],
    when: (context) => context.has(["rapport entre", "rapports entre", "en rapport avec"]),
    sense: {
      translation: "relationship / connection",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["report"],
      explanation: "Relational context makes rapport mean a relationship or connection.",
    },
  },
  {
    keys: ["plan", "plans"],
    lemmas: ["plan"],
    when: (context) => context.has(["plan de relance", "plan d'action", "plan climat", "plan de paix", "plan annonce"]),
    sense: {
      translation: "plan / programme",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["map", "level"],
      explanation: "Policy context makes plan mean a plan or programme.",
    },
  },
  {
    keys: ["plan", "plans"],
    lemmas: ["plan"],
    when: (context) => context.has(["sur le plan", "au premier plan", "second plan"]),
    sense: {
      translation: "level / plane / foreground",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["plan", "map"],
      explanation: "In expressions such as sur le plan or premier plan, plan means level, plane, or foreground.",
    },
  },
  {
    keys: ["affaire", "affaires"],
    lemmas: ["affaire"],
    when: (context) => context.around(LEGAL_WORDS),
    sense: {
      translation: "case / affair",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["business", "matter"],
      explanation: "Legal or investigative context makes affaire mean a case or affair.",
    },
  },
  {
    keys: ["affaire", "affaires"],
    lemmas: ["affaire"],
    when: (context) => context.has(["chiffre d'affaires", "homme d'affaires", "femme d'affaires", "monde des affaires"]),
    sense: {
      translation: "business",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["case", "matter"],
      explanation: "Business expressions make affaires mean business.",
    },
  },
  {
    keys: ["piece", "pieces"],
    lemmas: ["piece"],
    when: (context) => context.has(["piece d'identite", "pièce d'identité", "piece jointe", "pièce jointe", "dossier"]),
    sense: {
      translation: "document / attachment",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["room", "piece"],
      explanation: "Administrative context makes piece mean a document, item of evidence, or attachment.",
    },
  },
  {
    keys: ["piece", "pieces"],
    lemmas: ["piece"],
    when: (context) => context.has(["appartement", "maison", "chambre", "cuisine", "salon"]),
    sense: {
      translation: "room",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["piece", "document"],
      explanation: "Housing context makes piece mean a room.",
    },
  },
  {
    keys: ["bureau", "bureaux"],
    lemmas: ["bureau"],
    when: (context) => context.has(["au bureau", "bureau de vote", "ministere", "ministère", "administration", "entreprise"]),
    sense: {
      translation: "office",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["desk"],
      explanation: "Work, voting, or administration context makes bureau mean office.",
    },
  },
  {
    keys: ["bureau", "bureaux"],
    lemmas: ["bureau"],
    when: (context) => context.has(["sur le bureau", "chaise", "tiroir"]),
    sense: {
      translation: "desk",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["office"],
      explanation: "Furniture context makes bureau mean desk.",
    },
  },
  {
    keys: ["course", "courses"],
    lemmas: ["course"],
    when: (context) => context.has(["faire les courses", "fait les courses", "supermarche", "supermarché", "magasin"]),
    sense: {
      translation: "shopping / groceries",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["race", "course"],
      explanation: "Faire les courses means to do the shopping or buy groceries.",
    },
  },
  {
    keys: ["course", "courses"],
    lemmas: ["course"],
    when: (context) => context.has(["arrivee", "arrivée", "coureurs", "marathon", "cycliste"]),
    sense: {
      translation: "race",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["shopping"],
      explanation: "Sport context makes course mean a race.",
    },
  },
  {
    keys: ["poste", "postes"],
    lemmas: ["poste"],
    when: (context) => context.around(WORK_WORDS),
    sense: {
      translation: "job / position",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["post office", "station"],
      explanation: "Work context makes poste mean a job or position.",
    },
  },
  {
    keys: ["poste", "postes"],
    lemmas: ["poste"],
    when: (context) => context.has(["poste de police", "bureau de poste", "la poste"]),
    sense: {
      translation: "station / post office",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["job"],
      explanation: "Institutional expressions make poste mean station or post office.",
    },
  },
  {
    keys: ["essence"],
    lemmas: ["essence"],
    when: (context) => context.has(["station-service", "voiture", "prix de l'essence", "litre", "carburant"]),
    sense: {
      translation: "petrol / gasoline",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["essence", "nature"],
      explanation: "Vehicle or fuel-price context makes essence mean petrol or gasoline.",
    },
  },
  {
    keys: ["solde", "soldes"],
    lemmas: ["solde"],
    when: (context) => context.has(["compte bancaire", "banque", "solde du compte"]),
    sense: {
      translation: "balance",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["sales"],
      explanation: "Banking context makes solde mean account balance.",
    },
  },
  {
    keys: ["solde", "soldes"],
    lemmas: ["solde"],
    when: (context) => context.has(["magasin", "prix", "hiver", "ete", "été", "soldes"]),
    sense: {
      translation: "sale / discounted goods",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["balance"],
      explanation: "Retail context makes soldes mean sales or discounted goods.",
    },
  },
  {
    keys: ["bande", "bandes"],
    lemmas: ["bande"],
    when: (context) => context.has(["bande dessinee", "bande dessinée", "bd"]),
    sense: {
      translation: "comic strip / comic book",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["band", "group"],
      explanation: "Bande dessinee is the standard term for a comic strip or comic book.",
    },
  },
  {
    keys: ["bande", "bandes"],
    lemmas: ["bande"],
    when: (context) => context.has(["bande de jeunes", "bande armee", "bande armée", "groupe"]),
    sense: {
      translation: "group / gang",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["strip", "band"],
      explanation: "People context makes bande mean a group or gang.",
    },
  },
  {
    keys: ["chaine", "chaines"],
    lemmas: ["chaine"],
    when: (context) => context.has(["chaine de television", "chaîne de télévision", "chaine info", "chaîne info", "journal televise", "journal télévisé"]),
    sense: {
      translation: "TV channel",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["chain"],
      explanation: "Media context makes chaine mean a TV channel.",
    },
  },
  {
    keys: ["journal", "journaux"],
    lemmas: ["journal"],
    when: (context) => context.has(["journal televise", "journal télévisé"]),
    sense: {
      translation: "news bulletin",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["newspaper", "diary"],
      explanation: "Journal televise means a TV news bulletin.",
    },
  },
  {
    keys: ["journal", "journaux"],
    lemmas: ["journal"],
    when: (context) => context.has(["quotidien", "article", "redaction", "rédaction", "journal publie", "journal publié"]),
    sense: {
      translation: "newspaper / paper",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["diary", "news bulletin"],
      explanation: "Press context makes journal mean newspaper or paper.",
    },
  },
  {
    keys: ["numero", "numeros"],
    lemmas: ["numero"],
    when: (context) => context.has(["numero de telephone", "numéro de téléphone", "numero d'urgence", "numéro d'urgence"]),
    sense: {
      translation: "number",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["issue"],
      explanation: "Telephone or administrative context makes numero mean number.",
    },
  },
  {
    keys: ["numero", "numeros"],
    lemmas: ["numero"],
    when: (context) => context.has(["dernier numero", "dernier numéro", "numero du magazine", "numéro du magazine"]),
    sense: {
      translation: "issue",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["number"],
      explanation: "Magazine or periodical context makes numero mean an issue.",
    },
  },
  {
    keys: ["formation", "formations"],
    lemmas: ["formation"],
    when: (context) => context.around(SCHOOL_WORDS) || context.around(WORK_WORDS),
    sense: {
      translation: "training / education",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["formation", "group"],
      explanation: "School or work context makes formation mean training or education.",
    },
  },
  {
    keys: ["formation", "formations"],
    lemmas: ["formation"],
    when: (context) => context.around(POLITICAL_WORDS),
    sense: {
      translation: "party / grouping",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["training"],
      explanation: "Political context can make formation mean a party, grouping, or formation.",
    },
  },
  {
    keys: ["manifestation", "manifestations"],
    lemmas: ["manifestation"],
    when: (context) => context.has(["police", "rue", "manifestants", "cortège", "cortege", "greve", "grève"]),
    sense: {
      translation: "demonstration / protest",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["event", "manifestation"],
      explanation: "Street or policing context makes manifestation mean a demonstration or protest.",
    },
  },
  {
    keys: ["manifestation", "manifestations"],
    lemmas: ["manifestation"],
    when: (context) => context.has(["culturelle", "sportive", "festival", "evenement", "événement"]),
    sense: {
      translation: "event",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["protest"],
      explanation: "Cultural or sport context makes manifestation mean an event.",
    },
  },
  {
    keys: ["frais", "fraiche", "fraîche", "fraiches", "fraîches"],
    lemmas: ["frais"],
    when: (context) => context.around(MONEY_WORDS) || context.has(["frais de", "sans frais"]),
    sense: {
      translation: "fees / costs",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["fresh", "cool"],
      explanation: "Money context makes frais mean fees or costs.",
    },
  },
  {
    keys: ["frais", "fraiche", "fraîche", "fraiches", "fraîches"],
    lemmas: ["frais"],
    when: (context) => context.has(["produit frais", "legumes frais", "légumes frais", "air frais"]),
    sense: {
      translation: "fresh / cool",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["fees"],
      explanation: "Food or air context keeps frais in the fresh or cool sense.",
    },
  },
  {
    keys: ["projet", "projets"],
    lemmas: ["projet"],
    when: (context) => context.has(["projet de loi", "projets de loi"]),
    sense: {
      translation: "bill / draft law",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["project", "plan"],
      explanation: "Projet de loi means a bill or draft law, not a generic project.",
    },
  },
  {
    keys: ["exercice", "exercices"],
    lemmas: ["exercice"],
    when: (context) => context.has(["exercice budgetaire", "exercice budgétaire", "exercice fiscal", "cloture de l'exercice", "clôture de l'exercice"]),
    sense: {
      translation: "financial year / fiscal year",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["exercise"],
      explanation: "Budget/accounting context makes exercice mean a fiscal or financial year.",
    },
  },
  {
    keys: ["critique", "critiques"],
    lemmas: ["critique"],
    when: (context) => context.has(["situation critique", "etat critique", "état critique", "phase critique"]),
    sense: {
      translation: "critical / serious",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["criticism", "review"],
      explanation: "Risk or severity context makes critique mean critical or serious.",
    },
  },
  {
    keys: ["critique", "critiques"],
    lemmas: ["critique"],
    when: (context) => context.has(["critique du film", "critique litteraire", "critique littéraire", "journal"]),
    sense: {
      translation: "review / critic",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["critical", "criticism"],
      explanation: "Arts or media context makes critique mean a review or critic.",
    },
  },
  {
    keys: ["grave", "graves"],
    lemmas: ["grave"],
    when: (context) => context.has(["accident", "crise", "maladie", "probleme", "problème", "faute", "menace"]),
    sense: {
      translation: "serious / severe",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["low-pitched"],
      explanation: "Problem, illness, or risk context makes grave mean serious or severe.",
    },
  },
  {
    keys: ["sensible", "sensibles"],
    lemmas: ["sensible"],
    when: (context) => context.has(["donnees sensibles", "données sensibles", "sujet sensible", "information sensible", "zone sensible"]),
    sense: {
      translation: "sensitive",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["noticeable"],
      explanation: "Data, topic, or security context makes sensible mean sensitive.",
    },
  },
];

/**
 * Every declarative rule that applies, not just the first.
 *
 * Each rule is evaluated against its own freshly-instrumented context so the
 * evidence recorded belongs to that rule alone; sharing one context would
 * attribute an earlier rule's matched needles to a later one.
 */
function collectDeclarativeContextCandidates(
  base: Omit<ContextSenseRuleContext, "has" | "around">
): ContextSenseCandidate[] {
  const candidates: ContextSenseCandidate[] = [];

  CONTEXT_SENSE_RULES.forEach((rule, order) => {
    const keyMatch = (rule.keys ?? []).some((key) => normaliseForMatch(key) === base.selectedKey);
    const lemmaMatch = (rule.lemmas ?? []).some((lemma) => normaliseForMatch(lemma) === base.lemmaKey);
    if (!keyMatch && !lemmaMatch) return;

    const evidence: string[] = [];
    const context: ContextSenseRuleContext = {
      ...base,
      has: (needles) => {
        const hit = needles.find((needle) => base.sentenceKey.includes(normaliseForMatch(needle)));
        if (hit) evidence.push(normaliseForMatch(hit));
        return !!hit;
      },
      around: (needles) => {
        const hit = needles.find((needle) => base.words.includes(normaliseForMatch(needle)));
        if (hit) evidence.push(normaliseForMatch(hit));
        return !!hit;
      },
    };

    if (rule.when && !rule.when(context)) return;
    candidates.push({
      sense: rule.sense,
      evidence,
      matchedWords: evidence.reduce((widest, needle) => Math.max(widest, needle.split(" ").length), 0),
      order,
    });
  });

  return candidates;
}

/**
 * Ranks rule candidates by how much of the sentence they actually explain.
 *
 * A rule anchored on a longer matched phrase beats one anchored on a shorter
 * phrase, which beats one that merely tested a neighbouring word, which beats
 * a bare default with no `when` at all. Declaration order only breaks ties
 * between rules with identical support.
 */
function rankContextCandidates(candidates: ContextSenseCandidate[]): ContextSenseCandidate[] {
  return [...candidates].sort((a, b) => {
    if (b.matchedWords !== a.matchedWords) return b.matchedWords - a.matchedWords;
    if (b.evidence.length !== a.evidence.length) return b.evidence.length - a.evidence.length;
    return a.order - b.order;
  });
}

function selectDeclarativeContextSense(context: ContextSenseRuleContext): SenseSelection | null {
  const base = { ...context } as Omit<ContextSenseRuleContext, "has" | "around">;
  return rankContextCandidates(collectDeclarativeContextCandidates(base))[0]?.sense ?? null;
}

/**
 * Every contextual reading the rule corpus supports for this tap, best-first.
 *
 * This is the entry point candidates.ts uses to fold rule evidence into the
 * wider candidate pool. Exposing the whole ranked list rather than a single
 * answer is what lets a governed-preposition reading compete with a bare
 * lexical one on evidence instead of on file position.
 */
export function collectContextSenseCandidates(
  clean: string,
  lookup: DictionaryLookupResult,
  tokens: Token[],
  tokenIndex: number,
  sentence: string
): ContextSenseCandidate[] {
  const sentenceKey = normaliseForMatch(sentence);
  const base = {
    selectedKey: normaliseForMatch(clean),
    lemmaKey: normaliseForMatch(lookup.lemma ?? clean),
    sentenceKey,
    words: wordWindow(tokens, tokenIndex, 4),
    previous: wordAt(tokens, tokenIndex, -1),
    next: wordAt(tokens, tokenIndex, 1),
    hasNegationCue: /\bne\b|n'/.test(sentenceKey),
  };
  const declarative = rankContextCandidates(collectDeclarativeContextCandidates(base));

  // The imperative chain below still short-circuits internally, so it
  // contributes a single reading. It is offered as one more candidate rather
  // than as an override, which is what stops the two chains from shadowing
  // each other the way they used to.
  const imperative = selectContextSense(clean, lookup, tokens, tokenIndex, sentence);
  if (imperative && !declarative.some((candidate) => candidate.sense.translation === imperative.translation)) {
    declarative.push({ sense: imperative, evidence: [], matchedWords: 0, order: CONTEXT_SENSE_RULES.length });
  }
  return declarative;
}

function selectContextSense(
  clean: string,
  lookup: DictionaryLookupResult,
  tokens: Token[],
  tokenIndex: number,
  sentence: string
): SenseSelection | null {
  const selectedKey = normaliseForMatch(clean);
  const lemmaKey = normaliseForMatch(lookup.lemma ?? clean);
  const sentenceKey = normaliseForMatch(sentence);
  const words = wordWindow(tokens, tokenIndex, 4);
  const has = (needles: string[]) => needles.some((needle) => sentenceKey.includes(normaliseForMatch(needle)));
  const around = (needles: string[]) => needles.some((needle) => words.includes(normaliseForMatch(needle)));
  const previous = wordAt(tokens, tokenIndex, -1);
  const next = wordAt(tokens, tokenIndex, 1);
  const hasNegationCue = /\bne\b|n'/.test(sentenceKey);
  const declarativeSense = selectDeclarativeContextSense({
    selectedKey,
    lemmaKey,
    sentenceKey,
    words,
    previous,
    next,
    hasNegationCue,
    has,
    around,
  });
  if (declarativeSense) return declarativeSense;

  if (selectedKey === "actuel" || lemmaKey === "actuel") {
    return {
      translation: "current / present",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["present", "up-to-date"],
      explanation: "Actuel is a false-friend trap: in normal French it means current or present, not actual in the English sense of real.",
    };
  }

  if (selectedKey === "eventuellement" || lemmaKey === "eventuellement") {
    return {
      translation: "possibly / if needed",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["potentially"],
      explanation: "Éventuellement is a false friend: it means possibly or if needed, not eventually.",
    };
  }

  if (selectedKey === "librairie" || lemmaKey === "librairie") {
    return {
      translation: "bookshop / bookstore",
      source: "context-rule",
      confidence: "high",
      alternativeMeanings: ["bookseller"],
      explanation: "Librairie is normally a bookshop or bookstore. The English library is bibliothèque.",
    };
  }

  if (selectedKey === "plus" || lemmaKey === "plus") {
    if (hasNegationCue || has(["pas plus", "non plus"])) {
      return {
        translation: "no longer / not anymore",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["more"],
        explanation: "With ne or another negative cue, plus usually means no longer or not anymore rather than more.",
      };
    }
    if (has(["de plus en plus", "plus de", "plus que"])) {
      return {
        translation: "more",
        source: "context-rule",
        confidence: "medium",
        alternativeMeanings: ["no longer"],
        explanation: "Without negation, plus normally keeps the positive sense more.",
      };
    }
  }

  if (selectedKey === "personne" || lemmaKey === "personne") {
    if (hasNegationCue || has(["personne ne"])) {
      return {
        translation: "nobody / no one",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["person"],
        explanation: "In a negative construction, personne means nobody or no one, not a person.",
      };
    }
    return {
      translation: "person",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["nobody / no one"],
      explanation: "Without a negative cue, personne is the ordinary noun person.",
    };
  }

  if (selectedKey === "jamais" || lemmaKey === "jamais") {
    return {
      translation: hasNegationCue ? "never" : "ever / never",
      source: "context-rule",
      confidence: hasNegationCue ? "high" : "medium",
      explanation: hasNegationCue
        ? "With ne, jamais means never."
        : "Without ne, jamais often means ever, though some fixed expressions still read as never.",
    };
  }

  if (selectedKey === "encore" || lemmaKey === "encore") {
    if (has(["pas encore"])) {
      return {
        translation: "not yet",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["again", "still"],
        explanation: "Pas encore is the fixed negative expression not yet.",
      };
    }
    if (has(["encore une fois"])) {
      return {
        translation: "again",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["still"],
        explanation: "Encore une fois means once again.",
      };
    }
    if (next && ["un", "une", "du", "de", "des", "deux", "trois", "plus"].includes(normaliseForMatch(next))) {
      return {
        translation: "another / more",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["still", "again"],
        explanation: "Before a quantity, encore adds to it: encore un café is another coffee.",
      };
    }
    if (previous && STATE_VERB_FORMS.includes(normaliseForMatch(previous))) {
      return {
        translation: "still",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["again", "yet"],
        explanation: "After a state verb, encore says the situation is continuing: il est encore là means he is still there.",
      };
    }
    // Genuinely ambiguous without a cue. Naming both readings is more honest
    // than picking one, and it is what the reader needs to disambiguate from
    // the sentence themselves.
    return {
      translation: "still / again",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["yet", "more"],
      explanation: "Encore covers both still (continuing) and again (repeated); the surrounding sentence decides which.",
    };
  }

  if (selectedKey === "toujours" || lemmaKey === "toujours") {
    if (has(["toujours pas"])) {
      return {
        translation: "still not",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["always"],
        explanation: "Toujours pas means still not.",
      };
    }
    if (has(["pas toujours"])) {
      return {
        translation: "not always",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["still", "always"],
        explanation: "Pas toujours means not always.",
      };
    }
  }

  if (selectedKey === "parti" || lemmaKey === "partir") {
    if (has(["parti politique", "le parti", "un parti", "son parti", "parti annonce", "parti propose", "programme du parti"])) {
      return {
        translation: "political party",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["left / departed"],
        explanation: "With article/political-programme context, parti is the noun political party, not the past participle of partir.",
      };
    }
    if (around(["est", "sont", "parti", "hier", "deja", "partir"])) {
      return {
        translation: "left / departed",
        source: "context-rule",
        confidence: "medium",
        alternativeMeanings: ["political party"],
        explanation: "Here parti is read as the past participle of partir: left or departed.",
      };
    }
  }

  if (selectedKey.startsWith("manqu") || lemmaKey === "manquer" || lemmaKey === "manque") {
    if (has(["manque de", "manquent de", "manques de", "faute de"])) {
      return {
        translation: "lack / be short of",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["miss"],
        explanation: "Manquer de means to lack or be short of something.",
      };
    }
    if (around(["me", "te", "lui", "nous", "vous", "leur"])) {
      return {
        translation: "miss / be missed by",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["lack"],
        explanation: "With an object pronoun, manquer uses French's reverse structure: tu me manques means I miss you.",
      };
    }
  }

  if (lemmaKey === "passer") {
    if (has(["passer du temps", "passe du temps", "passent du temps"])) {
      return {
        translation: "spend time",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["pass", "happen"],
        explanation: "Passer du temps means to spend time.",
      };
    }
    if (has(["passer par", "passe par", "passent par"])) {
      return {
        translation: "go through / pass by",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["spend", "happen"],
        explanation: "Passer par means to go through, pass by, or use a route.",
      };
    }
    if (has(["passer a", "passe a", "passent a"])) {
      return {
        translation: "move on to / switch to",
        source: "context-rule",
        confidence: "medium",
        alternativeMeanings: ["pass", "spend"],
        explanation: "Passer à often means to move on to the next thing.",
      };
    }
  }

  if (selectedKey.startsWith("vol") || lemmaKey === "voler") {
    if (has(["oiseau", "avion", "aile", "ciel", "pilote"])) {
      return {
        translation: "fly",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["steal"],
        explanation: "Air/animal context makes voler mean to fly.",
      };
    }
    if (has(["argent", "bijou", "velo", "voiture", "magasin", "portefeuille", "police"])) {
      return {
        translation: "steal / rob",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["fly"],
        explanation: "Crime/property context makes voler mean to steal or rob.",
      };
    }
  }

  if (selectedKey.startsWith("lou") || lemmaKey === "louer") {
    if (has(["appartement", "maison", "voiture", "chambre", "loyer", "bail"])) {
      return {
        translation: "rent / rent out",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["praise"],
        explanation: "Housing, cars, or payment context makes louer mean to rent or rent out.",
      };
    }
    if (has(["merite", "qualite", "courage", "efforts", "louanges"])) {
      return {
        translation: "praise",
        source: "context-rule",
        confidence: "medium",
        alternativeMeanings: ["rent"],
        explanation: "Praise/merit context makes louer mean to praise.",
      };
    }
  }

  if (lemmaKey === "assister") {
    if (next === "a" || has(["assister a", "assiste a", "assistent a"])) {
      return {
        translation: "attend / witness",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["assist", "help"],
        explanation: "Assister à means to attend or witness, not to assist.",
      };
    }
    if (has(["aide", "secours", "assistance"])) {
      return {
        translation: "assist / help",
        source: "context-rule",
        confidence: "medium",
        alternativeMeanings: ["attend"],
        explanation: "Help/assistance context keeps the assist meaning.",
      };
    }
  }

  if (lemmaKey === "apprendre") {
    if (around(["lui", "leur"]) || has(["aux enfants", "a ses eleves", "a son fils", "a sa fille"])) {
      return {
        translation: "teach",
        source: "context-rule",
        confidence: "medium",
        alternativeMeanings: ["learn"],
        explanation: "With an indirect object, apprendre can mean to teach someone something.",
      };
    }
    return {
      translation: "learn",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["teach"],
      explanation: "Without an indirect object, apprendre usually means to learn.",
    };
  }

  if (lemmaKey === "defendre") {
    if (has(["defend de", "defendu de", "interdit de"])) {
      return {
        translation: "forbid",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["defend"],
        explanation: "Défendre de means to forbid someone from doing something.",
      };
    }
    return {
      translation: "defend",
      source: "context-rule",
      confidence: "medium",
      alternativeMeanings: ["forbid"],
      explanation: "Without de introducing a prohibited action, défendre usually means to defend.",
    };
  }

  if (lemmaKey === "prevenir") {
    if (has(["risque", "accident", "maladie", "incendie", "crise"])) {
      return {
        translation: "prevent",
        source: "context-rule",
        confidence: "medium",
        alternativeMeanings: ["warn", "notify"],
        explanation: "With risks, accidents, or crises, prévenir usually means to prevent.",
      };
    }
    if (has(["secours", "police", "autorites", "parents", "habitants", "public"])) {
      return {
        translation: "warn / notify",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["prevent"],
        explanation: "With people or authorities as the object, prévenir means to warn or notify.",
      };
    }
  }

  if (selectedKey === "propre" || lemmaKey === "propre") {
    if (["mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses", "notre", "nos", "votre", "vos", "leur", "leurs"].includes(previous ?? "")) {
      return {
        translation: "own",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["clean"],
        explanation: "After a possessive, propre usually means own: ses propres mots = his/her own words.",
      };
    }
    if (has(["linge", "chambre", "maison", "sale", "nettoyer"])) {
      return {
        translation: "clean",
        source: "context-rule",
        confidence: "medium",
        alternativeMeanings: ["own"],
        explanation: "Cleaning or hygiene context makes propre mean clean.",
      };
    }
  }

  if (selectedKey.startsWith("ancien") || lemmaKey === "ancien") {
    if (["ministre", "president", "presidente", "maire", "directeur", "dirigeant", "responsable"].includes(next ?? "")) {
      return {
        translation: "former",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["old"],
        explanation: "Before a role or title, ancien usually means former.",
      };
    }
    if (has(["chateau ancien", "batiment ancien", "ville ancienne", "langue ancienne"])) {
      return {
        translation: "old / ancient",
        source: "context-rule",
        confidence: "medium",
        alternativeMeanings: ["former"],
        explanation: "With buildings, places, or historical things, ancien keeps the old/ancient sense.",
      };
    }
  }

  if (selectedKey === "sensible" || lemmaKey === "sensible") {
    if (has(["hausse", "baisse", "amelioration", "recul", "difference", "effet"])) {
      return {
        translation: "noticeable / significant",
        source: "context-rule",
        confidence: "medium",
        alternativeMeanings: ["sensitive"],
        explanation: "With changes or effects, sensible often means noticeable or significant.",
      };
    }
  }

  if (selectedKey === "occasion" || lemmaKey === "occasion") {
    if (has(["voiture d'occasion", "vehicule d'occasion", "objet d'occasion"])) {
      return {
        translation: "used / second-hand",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["opportunity"],
        explanation: "D'occasion after a product means used or second-hand.",
      };
    }
    if (has(["a l'occasion", "occasion de", "bonne occasion"])) {
      return {
        translation: "opportunity / occasion",
        source: "context-rule",
        confidence: "medium",
        alternativeMeanings: ["used / second-hand"],
        explanation: "Event or chance context makes occasion mean opportunity or occasion.",
      };
    }
  }

  if (selectedKey === "issue" || lemmaKey === "issu") {
    if (has(["issue du match", "issue de la crise", "issue du vote", "issue du scrutin"])) {
      return {
        translation: "outcome / result",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["stemming from"],
        explanation: "As a noun in event context, issue means outcome or result.",
      };
    }
  }

  if (lemmaKey === "devoir") {
    if (has(["euros", "dollars", "livres", "somme", "argent"])) {
      return {
        translation: "owe",
        source: "context-rule",
        confidence: "medium",
        alternativeMeanings: ["must", "have to"],
        explanation: "With money or a sum, devoir can mean to owe.",
      };
    }
  }

  if (lemmaKey === "realiser") {
    if (has(["realise que", "realiser que"])) {
      return {
        translation: "realize",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["carry out", "make"],
        explanation: "Réaliser que means to realize that something is true.",
      };
    }
    if (has(["projet", "film", "travaux", "objectif", "enquete"])) {
      return {
        translation: "carry out / make",
        source: "context-rule",
        confidence: "medium",
        alternativeMeanings: ["realize"],
        explanation: "With projects, films, work, or goals, réaliser often means to carry out, make, or achieve.",
      };
    }
  }

  if (selectedKey === "recette" || selectedKey === "recettes" || lemmaKey === "recette") {
    if (has(["fisc", "budget", "impot", "tax", "revenu", "etat", "collectivite", "econom"])) {
      return {
        translation: "revenue / income",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["recipe"],
        explanation: "In fiscal or budget context, recette means revenue or income, not a cooking recipe.",
      };
    }
    if (has(["cuisine", "cuisiner", "plat", "ingredient", "épice", "epice", "tajine", "gâteau", "gateau", "four", "farine", "restaurant"])) {
      return {
        translation: "recipe",
        source: "context-rule",
        confidence: "high",
        alternativeMeanings: ["revenue", "income"],
        explanation: "Food context makes recette the cooking sense: recipe.",
      };
    }
  }

  if (lemmaKey === "attendre") {
    if (has(["bus", "train", "gare", "arrivee", "depuis", "file d'attente"])) {
      return {
        translation: "wait for",
        source: "context-rule",
        confidence: "high",
        explanation: "With transport, time, or queue context, attendre means to wait for.",
      };
    }
    if (has(["resultat", "decision", "rapport", "annonce", "s'attend"])) {
      return {
        translation: "expect",
        source: "context-rule",
        confidence: "medium",
        explanation: "With outcomes such as a result, decision, or announcement, attendre can mean expect.",
      };
    }
  }

  if (lemmaKey === "entendre") {
    if (has(["bruit", "voix", "son", "crier", "ecouter"])) {
      return {
        translation: "hear",
        source: "context-rule",
        confidence: "high",
        explanation: "Sound context makes entendre the physical sense: to hear.",
      };
    }
    if (has(["par la", "entend par", "comprendre", "dire que", "veut dire"])) {
      return {
        translation: "mean / understand",
        source: "context-rule",
        confidence: "medium",
        explanation: "In phrasing such as entendre par la, entendre means mean or understand rather than hear.",
      };
    }
  }

  if (lemmaKey === "servir") {
    if (around(["a", "de"]) || has(["sert a", "servent a", "sert de", "servir a"])) {
      return {
        translation: "be used for",
        source: "context-rule",
        confidence: "high",
        explanation: "Servir a/de means to be used for or to serve as, not literally to serve a person.",
      };
    }
    if (has(["restaurant", "repas", "client", "equipe", "public"])) {
      return {
        translation: "serve",
        source: "context-rule",
        confidence: "medium",
        explanation: "Food, customer, team, or public-service context keeps the ordinary serve sense.",
      };
    }
  }

  if (selectedKey === "cours" || lemmaKey === "cours" || lemmaKey === "courir") {
    if (has(["en cours", "au cours de"])) {
      return {
        translation: "in progress / during",
        source: "context-rule",
        confidence: "high",
        explanation: "Cours inside en cours or au cours de is part of a fixed time/progress expression.",
      };
    }
    if (has(["ecole", "classe", "professeur", "universite", "mathematiques"])) {
      return {
        translation: "course / class",
        source: "context-rule",
        confidence: "medium",
        explanation: "School context makes cours mean a lesson, course, or class.",
      };
    }
    if (has(["bourse", "action", "euro", "dollar", "prix", "marche"])) {
      return {
        translation: "price / rate",
        source: "context-rule",
        confidence: "medium",
        explanation: "Market or finance context makes cours mean price, rate, or market quotation.",
      };
    }
  }

  if (selectedKey === "tour" || lemmaKey === "tour") {
    if (has(["a son tour", "chacun son tour", "mon tour", "ton tour"])) {
      return {
        translation: "turn",
        source: "context-rule",
        confidence: "high",
        explanation: "Possessive or sequence context makes tour mean someone's turn.",
      };
    }
    if (has(["tour eiffel", "haute tour", "immeuble", "chateau"])) {
      return {
        translation: "tower",
        source: "context-rule",
        confidence: "high",
        explanation: "Building context makes tour mean tower.",
      };
    }
    if (has(["tour de france", "visite", "voyage", "concert"])) {
      return {
        translation: "tour / trip",
        source: "context-rule",
        confidence: "medium",
        explanation: "Travel, sport, or performance context makes tour the tour/trip sense.",
      };
    }
  }

  if (selectedKey === "marche" || lemmaKey === "marche") {
    if (has(["marche financier", "prix", "bourse", "investisseur"])) {
      return {
        translation: "market",
        source: "context-rule",
        confidence: "medium",
        explanation: "Economic context makes marche/marche the market sense rather than the verb to walk.",
      };
    }
  }

  return null;
}

/**
 * The clitic-pronoun reading of a bare form, when it has one.
 *
 * Exposed so candidate generation can apply it to the lexical tail of an
 * elision. Tokenisation keeps "j'en" as one token, so the pronoun table never
 * saw the "en" inside it and a tap answered with the preposition ("in")
 * instead of the pronoun ("of it"). See the elision candidate in candidates.ts.
 */
export function cliticPronounReading(form: string): { translation: string; explanation: string } | null {
  const entry = PRONOUN_TRANSLATIONS[normaliseForMatch(form)];
  return entry ? { translation: entry.translation, explanation: entry.explanation } : null;
}

function shouldPreferPronoun(clean: string, previous: string | null, next: string | null): boolean {
  if (["y", "en", "lui"].includes(clean)) return true;
  if (clean === "leur") return !!next && !["ami", "amis", "maison", "parents", "enfants", "livre", "nom"].includes(next);
  if (clean === "le" || clean === "la") return !!next && !looksLikeNounContext(previous, next);
  return false;
}

function looksLikeNounContext(previous: string | null, next: string | null): boolean {
  if (!next) return true;
  const nextLookup = lookupWord(next);
  if ((nextLookup.partOfSpeech ?? "").toLowerCase().includes("verb")) return false;
  return !previous || ["dans", "sur", "avec", "pour", "de", "a", "chez"].includes(previous);
}

function grammarAwareTranslation(
  baseTranslation: string,
  lemma: string | null,
  clean: string,
  grammar: ContextualTranslationGrammar
): string {
  const lemmaKey = normaliseForMatch(lemma ?? "");
  if (grammar.tense?.includes("passe compose") || grammar.tense?.startsWith("compound")) {
    return PAST_ENGLISH_BY_LEMMA[lemmaKey] ?? (clean === "pris" ? "took / has taken" : baseTranslation);
  }
  if (grammar.tense === "future") return `will ${verbBaseEnglish(baseTranslation)}`;
  if (grammar.tense === "conditional") {
    if (lemmaKey === "vouloir") return "would like / would want";
    return `would ${verbBaseEnglish(baseTranslation)}`;
  }
  if (grammar.tense === "imperfect") return `was/were ${toGerund(verbBaseEnglish(baseTranslation))}`;
  if (grammar.mood === "imperative") return verbBaseEnglish(baseTranslation);
  if (grammar.mood === "subjunctive") return verbBaseEnglish(baseTranslation);
  return baseTranslation;
}

function verbBaseEnglish(translation: string): string {
  return stripLeadingTo(translation.split(",")[0].split("/")[0].trim());
}

function stripLeadingTo(translation: string): string {
  return translation.replace(/^to\s+/i, "");
}

function toGerund(verb: string): string {
  if (verb.endsWith("ie")) return `${verb.slice(0, -2)}ying`;
  if (verb.endsWith("e") && !verb.endsWith("ee")) return `${verb.slice(0, -1)}ing`;
  return `${verb}ing`;
}

function isVerbLookup(lookup: DictionaryLookupResult): boolean {
  return (lookup.partOfSpeech ?? "").toLowerCase().includes("verb");
}

function isProperNounLookup(lookup: DictionaryLookupResult): boolean {
  return (lookup.partOfSpeech ?? "").toLowerCase().includes("proper noun");
}

function isPhraseLikeLookup(lookup: DictionaryLookupResult): boolean {
  if (lookup.source === "missing" || isProperNounLookup(lookup)) return false;
  const partOfSpeech = (lookup.partOfSpeech ?? "").toLowerCase();
  return (
    !!lookup.lemma?.includes(" ") ||
    partOfSpeech.includes("phrase") ||
    partOfSpeech.includes("connector") ||
    partOfSpeech.includes("idiom") ||
    partOfSpeech.includes("expression")
  );
}

function looksLikePastParticiple(clean: string): boolean {
  return /(e|i|is|it|u|us|ut|ert|ort|is|ise|ises|ee|ees|es)$/.test(clean);
}

function isSentenceInitialImperative(tokens: Token[], tokenIndex: number): boolean {
  for (let i = tokenIndex - 1; i >= 0; i--) {
    if (tokens[i].isWord) return false;
    if (/[.!?]/.test(tokens[i].text)) return true;
  }
  return true;
}

function isNegated(tokens: Token[], tokenIndex: number): boolean {
  const left: string[] = [];
  for (let i = tokenIndex - 1; i >= 0 && left.length < 3; i--) {
    if (tokens[i].isWord) left.push(normaliseForMatch(tokens[i].clean));
  }
  const right: string[] = [];
  for (let i = tokenIndex + 1; i < tokens.length && right.length < 4; i++) {
    if (tokens[i].isWord) right.push(normaliseForMatch(tokens[i].clean));
  }
  return left.some((word) => word === "ne" || word === "n" || word === "n'") && right.some((word) => ["pas", "plus", "jamais", "rien", "personne"].includes(word));
}

function mergeGrammar(
  first: ContextualTranslationGrammar | null,
  second: ContextualTranslationGrammar | null
): ContextualTranslationGrammar | null {
  if (!first) return second;
  if (!second) return first;
  return {
    ...first,
    ...second,
    note: [first.note, second.note].filter(Boolean).join(" "),
  };
}

function withoutPrimary(translations: string[], primary: string): string[] {
  const primaryKey = normaliseForMatch(primary);
  return translations.filter((translation) => normaliseForMatch(translation) !== primaryKey).slice(0, 4);
}
