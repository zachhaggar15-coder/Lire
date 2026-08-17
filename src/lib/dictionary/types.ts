/**
 * Local, offline dictionary architecture. Entries live in plain TS data
 * files under src/data/dictionaries/ today; the shape is deliberately
 * generic (lemma + forms + translations, no app-specific fields) so a
 * future downloaded/imported dictionary (e.g. a bigger community wordlist,
 * or a user-supplied JSON file) can be loaded the same way — anything that
 * satisfies `DictionaryEntry[]` works.
 */

export type Gender = "masculine" | "feminine" | "both" | null;
export type Cefr = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;

export interface DictionaryExample {
  fr: string;
  en: string;
}

export interface DictionaryEntry {
  /** Dictionary/citation form: infinitive for verbs, masculine singular for adjectives, etc. */
  lemma: string;
  /** Other inflected/elided forms that should resolve to this entry (conjugations, plurals, "l'..."). */
  forms?: string[];
  /** English translations, most common/useful first. */
  translations: string[];
  partOfSpeech?: string;
  gender?: Gender;
  /** Rough usage-frequency rank (1 = most common). Null/absent when unranked. */
  frequencyRank?: number | null;
  cefr?: Cefr;
  examples?: DictionaryExample[];
  notes?: string;
}

/**
 * Which data source answered a lookup.
 *
 * This is provenance, not preference order: it exists so a caller can tell a
 * hand-checked sense apart from a bulk-imported one. The generated layer is
 * WikDict-derived and its sense *ordering* carries no editorial judgement, so
 * its leading gloss is a guess at the contextual meaning rather than a
 * considered answer ("case" -> "double income, no kids"). Every other layer
 * had a person decide what should come first. resolveMeaning.ts turns that
 * distinction into confidence, which in turn decides whether Lire states a
 * meaning plainly, hedges it, or abstains.
 */
export type DictionaryLayer =
  | "phrase-bank"
  | "core"
  | "news"
  | "curated"
  | "proper-noun"
  | "custom"
  | "article-coverage"
  | "generated";

/** What a lookup returns — always this shape, whether or not an entry was found. */
export interface DictionaryLookupResult {
  input: string;
  lemma: string | null;
  translations: string[];
  partOfSpeech: string | null;
  /** Which dictionary layer supplied this entry, or null when nothing matched. See DictionaryLayer. */
  layer: DictionaryLayer | null;
  /**
   * True when the entry was reached by a rule-based lemma guess, so the stored
   * part of speech describes the lemma and may not describe the word actually
   * tapped — "murmura" (a verb form) strips to the noun "murmure". The value
   * is still useful to grammar heuristics, but shouldn't be shown to a reader
   * as fact. See withUncertainPartOfSpeech in dictionary/lookup.ts.
   */
  partOfSpeechUncertain?: boolean;
  gender: string | null;
  frequencyRank: number | null;
  cefr: string | null;
  examples: DictionaryExample[];
  source: "local" | "missing";
}
