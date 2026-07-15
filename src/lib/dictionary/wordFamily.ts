import { frEnDictionary } from "@/data/dictionaries/fr-en";
import { newsSenseDictionary } from "@/data/dictionaries/news-senses";
import { phraseBankDictionary } from "@/data/dictionaries/phrase-bank";
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
    noun: ["décision", "décideur", "indécision"],
    verb: ["décider", "se décider", "hésiter"],
    adjective: ["décisif", "indécis", "décidé"],
    adverb: ["décisivement"],
    commonCollocations: ["prendre une décision", "décision difficile", "décision importante"],
    opposites: ["hésiter", "hésitation", "indécision"],
    relatedExpressions: ["se décider", "être décidé à", "prise de décision"],
  },
  "décision": {
    noun: ["décision", "décideur", "indécision"],
    verb: ["décider", "se décider"],
    adjective: ["décisif", "indécis", "décidé"],
    commonCollocations: ["prendre une décision", "décision importante", "décision finale"],
    opposites: ["hésitation", "indécision"],
    relatedExpressions: ["prise de décision", "se décider"],
  },
  hausse: {
    noun: ["hausse", "augmentation"],
    verb: ["augmenter", "hausser"],
    adjective: ["élevé", "croissant"],
    commonCollocations: ["hausse des prix", "en hausse", "forte hausse"],
    opposites: ["baisse", "recul", "diminution"],
  },
  baisse: {
    noun: ["baisse", "recul", "diminution"],
    verb: ["baisser", "diminuer", "reculer"],
    commonCollocations: ["en baisse", "forte baisse", "baisse du chômage"],
    opposites: ["hausse", "augmentation"],
  },
  réforme: {
    noun: ["réforme", "réformateur"],
    verb: ["réformer"],
    adjective: ["réformé"],
    commonCollocations: ["projet de réforme", "réforme importante", "entrée en vigueur"],
    relatedExpressions: ["mettre en œuvre", "projet de loi"],
  },
  accord: {
    noun: ["accord", "désaccord"],
    verb: ["accorder", "s'accorder"],
    adjective: ["d'accord"],
    commonCollocations: ["trouver un accord", "accord de principe", "parvenir à un accord"],
    opposites: ["désaccord", "refus"],
  },
  soutien: {
    noun: ["soutien"],
    verb: ["soutenir"],
    adjective: ["soutenu"],
    commonCollocations: ["apporter son soutien", "soutien public", "mesures de soutien"],
    opposites: ["opposition", "critique"],
  },
};

const FAMILY_DICTIONARIES = [...frEnDictionary, ...newsSenseDictionary, ...phraseBankDictionary];

const FAMILY_SEEDS: Record<string, string[]> = {
  decid: ["décider", "décision", "décisif", "indécis", "indécision", "décidé"],
  augment: ["augmenter", "augmentation", "hausse"],
  baiss: ["baisser", "baisse", "diminuer", "diminution", "recul"],
  reform: ["réformer", "réforme", "réformé"],
  sout: ["soutenir", "soutien", "soutenu"],
  elect: ["élection", "électeur", "électoral", "élire"],
  gouvern: ["gouvernement", "gouverner", "gouvernemental"],
  secur: ["sécurité", "sécuriser", "sécurisé"],
  pollu: ["pollution", "polluer", "polluant"],
  expliqu: ["expliquer", "explication", "explicatif"],
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

function addToFamily(family: WordFamily, value: string) {
  const lookup = lookupWord(value);
  const bucket = bucketFor(lookup.partOfSpeech ?? undefined);
  const target =
    bucket ??
    (value.endsWith("ment")
      ? "adverb"
      : value.endsWith("er") || value.endsWith("ir") || value.endsWith("re")
        ? "verb"
        : null);
  if (target) family[target] = unique([...family[target], lookup.lemma ?? value]);
}

export function getWordFamily(wordOrLemma: string): WordFamily {
  const lookup = lookupWord(wordOrLemma);
  const lemma = (lookup.lemma ?? wordOrLemma).toLowerCase();
  const root = rootFor(lemma);
  const family: WordFamily = { ...EMPTY_FAMILY, ...(OVERRIDES[lemma] ?? {}) };
  const normalizedLemma = lemma.normalize("NFD").replace(/\p{Diacritic}/gu, "");

  for (const [seed, values] of Object.entries(FAMILY_SEEDS)) {
    if (normalizedLemma.startsWith(seed) || root.startsWith(seed.slice(0, 4))) {
      for (const value of values) addToFamily(family, value);
    }
  }

  if (root.length >= 3) {
    for (const entry of FAMILY_DICTIONARIES) {
      if (entry.lemma === lemma || !rootFor(entry.lemma).startsWith(root.slice(0, 4))) continue;
      const bucket = bucketFor(entry.partOfSpeech);
      if (bucket) family[bucket] = unique([...(family[bucket] ?? []), entry.lemma]);
      if (entry.lemma.includes(" ")) family.relatedExpressions = unique([...family.relatedExpressions, entry.lemma]);
      for (const form of entry.forms ?? []) {
        if (form.includes(" ") && rootFor(form).startsWith(root.slice(0, 4))) {
          family.commonCollocations = unique([...family.commonCollocations, form]);
        }
      }
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
