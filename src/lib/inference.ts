import type { DictionaryLookupResult } from "@/lib/dictionary/types";
import { lookupWord } from "@/lib/dictionary/lookup";

export interface InferenceChallenge {
  word: string;
  lemma: string;
  contextSentence: string;
  choices: string[];
  answerIndex: number;
  frenchSynonym: string | null;
  sentenceTranslation: string;
  directDefinition: string;
}

const SYNONYMS: Record<string, string> = {
  cependant: "pourtant",
  pourtant: "cependant",
  car: "parce que",
  donc: "alors",
  aussi: "\u00e9galement",
  "tr\u00e8s": "fort",
  grand: "important",
  difficile: "compliqu\u00e9",
  important: "essentiel",
  "d\u00e9cider": "choisir",
  "d\u00e9cision": "choix",
  risque: "danger",
  raison: "motif",
  objectif: "but",
  hausse: "augmentation",
  "pr\u00e9voir": "anticiper",
};

const GENERIC_DISTRACTORS = [
  "a reason or cause",
  "a sudden change",
  "a person or group",
  "a place or region",
  "a warning or risk",
  "a choice or decision",
  "a result or consequence",
  "a time or deadline",
];

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function directDefinition(lookup: DictionaryLookupResult): string {
  return lookup.translations[0] ?? "Not translated yet";
}

function distractorsFor(lookup: DictionaryLookupResult): string[] {
  const pos = lookup.partOfSpeech?.toLowerCase() ?? "";
  if (pos.includes("verb")) return ["to describe", "to prevent", "to decide", "to increase", ...GENERIC_DISTRACTORS];
  if (pos.includes("adverb")) return ["however", "therefore", "also", "often", ...GENERIC_DISTRACTORS];
  if (pos.includes("adjective")) return ["important", "uncertain", "critical", "possible", ...GENERIC_DISTRACTORS];
  return GENERIC_DISTRACTORS;
}

function stableIndex(value: string, modulo: number): number {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  return hash % modulo;
}

function placeAnswer(answer: string, distractors: string[], word: string): { choices: string[]; answerIndex: number } {
  const answerIndex = stableIndex(word.toLowerCase(), 3);
  const choices = distractors.slice(0, 2);
  choices.splice(answerIndex, 0, answer);
  return { choices, answerIndex };
}

export function buildInferenceChallenge(
  word: string,
  lookup: DictionaryLookupResult,
  contextSentence: string,
  sentenceTranslation: string
): InferenceChallenge | null {
  if (lookup.source !== "local" || lookup.translations.length === 0) return null;
  const answer = directDefinition(lookup);
  const distractors = unique(distractorsFor(lookup).filter((choice) => choice.toLowerCase() !== answer.toLowerCase()));
  if (distractors.length < 2) return null;
  const { choices, answerIndex } = placeAnswer(answer, distractors, word);
  return {
    word,
    lemma: lookup.lemma ?? word,
    contextSentence,
    choices,
    answerIndex,
    frenchSynonym: SYNONYMS[(lookup.lemma ?? word).toLowerCase()] ?? null,
    sentenceTranslation,
    directDefinition: answer,
  };
}

export function shouldOfferInference(word: string, selectedWords: Set<string>): boolean {
  const lookup = lookupWord(word);
  const key = (lookup.lemma ?? word).toLowerCase();
  return selectedWords.has(word.toLowerCase()) || selectedWords.has(key);
}
