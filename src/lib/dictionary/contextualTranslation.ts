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
    confidence: grammar ? "medium" : "low",
    source: grammar ? "grammar" : "dictionary",
    explanation: grammar
      ? "The dictionary meaning is combined with the visible verb/adjective form in this sentence."
      : "No stronger local context signal was found, so this is the base dictionary meaning.",
    cacheKey: contextualTranslationCacheKey(cacheBase),
  };
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

function wordWindow(tokens: Token[], index: number, radius: number): string[] {
  const words: string[] = [];
  for (let i = Math.max(0, index - radius); i <= Math.min(tokens.length - 1, index + radius); i++) {
    if (tokens[i].isWord) words.push(normaliseForMatch(tokens[i].clean));
  }
  return words;
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

  if (previous && ["me", "m'", "te", "t'", "se", "s'", "nous", "vous"].includes(previous) && isVerbLookup(lookup)) {
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
    if (has(["cuisine", "plat", "ingredient", "gateau", "restaurant"])) {
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
