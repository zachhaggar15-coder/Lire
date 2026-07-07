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

/** What a lookup returns — always this shape, whether or not an entry was found. */
export interface DictionaryLookupResult {
  input: string;
  lemma: string | null;
  translations: string[];
  partOfSpeech: string | null;
  gender: string | null;
  frequencyRank: number | null;
  cefr: string | null;
  examples: DictionaryExample[];
  source: "local" | "missing";
}
