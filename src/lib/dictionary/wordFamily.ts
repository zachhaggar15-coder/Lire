import { frEnDictionary } from "@/data/dictionaries/fr-en";
import { lookupWord } from "@/lib/dictionary/lookup";

export interface WordFamily {
  noun: string[];
  verb: string[];
  adjective: string[];
  adverb: string[];
  commonCollocations: string[];
  opposites: string[];
  relatedExpressions: string[];
}

const EMPTY_FAMILY: WordFamily = {
  noun: [],
  verb: [],
  adjective: [],
  adverb: [],
  commonCollocations: [],
  opposites: [],
  relatedExpressions: [],
};

const OVERRIDES: Record<string, Partial<WordFamily>> = {
  "décider": {
    noun: ["décision"],
    adjective: ["décisif", "indécis"],
    commonCollocations: ["prendre une décision", "décision difficile"],
    opposites: ["hésiter"],
    relatedExpressions: ["se décider", "être décidé à"],
  },
  "décision": {
    verb: ["décider"],
    adjective: ["décisif", "indécis"],
    commonCollocations: ["prendre une décision", "décision importante"],
    opposites: ["hésitation"],
  },
};

function rootFor(lemma: string): string {
  return lemma
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/(ement|ation|ition|sion|tion|er|ir|re|if|ive|al|ale|e|s)$/u, "")
    .slice(0, 6);
}

function bucketFor(partOfSpeech?: string): keyof Pick<WordFamily, "noun" | "verb" | "adjective" | "adverb"> | null {
  const pos = partOfSpeech?.toLowerCase() ?? "";
  if (pos.includes("noun")) return "noun";
  if (pos.includes("verb")) return "verb";
  if (pos.includes("adjective")) return "adjective";
  if (pos.includes("adverb")) return "adverb";
  return null;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].slice(0, 5);
}

export function getWordFamily(wordOrLemma: string): WordFamily {
  const lookup = lookupWord(wordOrLemma);
  const lemma = (lookup.lemma ?? wordOrLemma).toLowerCase();
  const root = rootFor(lemma);
  const family: WordFamily = { ...EMPTY_FAMILY, ...(OVERRIDES[lemma] ?? {}) };

  if (root.length >= 3) {
    for (const entry of frEnDictionary) {
      if (entry.lemma === lemma || !rootFor(entry.lemma).startsWith(root.slice(0, 4))) continue;
      const bucket = bucketFor(entry.partOfSpeech);
      if (bucket) family[bucket] = unique([...(family[bucket] ?? []), entry.lemma]);
      if (entry.lemma.includes(" ")) family.relatedExpressions = unique([...family.relatedExpressions, entry.lemma]);
    }
  }

  if (lemma.endsWith("er") || lemma.endsWith("ir") || lemma.endsWith("re")) family.verb = unique([lemma, ...family.verb]);
  if (lookup.partOfSpeech?.toLowerCase().includes("noun")) family.noun = unique([lemma, ...family.noun]);
  if (lookup.partOfSpeech?.toLowerCase().includes("adjective")) family.adjective = unique([lemma, ...family.adjective]);
  return {
    noun: unique(family.noun),
    verb: unique(family.verb),
    adjective: unique(family.adjective),
    adverb: unique(family.adverb),
    commonCollocations: unique(family.commonCollocations),
    opposites: unique(family.opposites),
    relatedExpressions: unique(family.relatedExpressions),
  };
}
