import type { DictionaryEntry, DictionaryLookupResult } from "@/lib/dictionary/types";
import { frEnDictionary } from "@/data/dictionaries/fr-en";
import { enFrDictionary } from "@/data/dictionaries/en-fr";
import { guessLemmas } from "@/lib/dictionary/lemmatize";

/**
 * Offline, instant word lookup. Never calls a network API — this is the
 * "Kindle-like" fast path: clean the word, check it as a lemma, then check
 * it against every entry's inflected forms, then fall back to a rule-based
 * lemma guess (see lemmatize.ts) for inflections no entry explicitly lists;
 * otherwise report it missing.
 */

const byLemma = new Map<string, DictionaryEntry>();
const byForm = new Map<string, DictionaryEntry>();

for (const entry of frEnDictionary) {
  byLemma.set(entry.lemma.toLowerCase(), entry);
  for (const form of entry.forms ?? []) {
    byForm.set(form.toLowerCase(), entry);
  }
}

const enByLemma = new Map<string, DictionaryEntry>();
const enByForm = new Map<string, DictionaryEntry>();

for (const entry of enFrDictionary) {
  enByLemma.set(entry.lemma.toLowerCase(), entry);
  for (const form of entry.forms ?? []) {
    enByForm.set(form.toLowerCase(), entry);
  }
}

function toResult(input: string, entry: DictionaryEntry | null): DictionaryLookupResult {
  if (!entry) {
    return {
      input,
      lemma: null,
      translations: [],
      partOfSpeech: null,
      gender: null,
      frequencyRank: null,
      cefr: null,
      examples: [],
      source: "missing",
    };
  }
  return {
    input,
    lemma: entry.lemma,
    translations: entry.translations,
    partOfSpeech: entry.partOfSpeech ?? null,
    gender: entry.gender ?? null,
    frequencyRank: entry.frequencyRank ?? null,
    cefr: entry.cefr ?? null,
    examples: entry.examples ?? [],
    source: "local",
  };
}

/**
 * Looks up a French word offline. Accepts either an already-cleaned word
 * or a raw one — cleaning here too keeps this usable as a standalone
 * module. Order: exact lemma match, then a match against any entry's
 * inflected/elided forms, then a rule-based lemma guess (see
 * lemmatize.ts) for inflections nothing explicitly lists; otherwise
 * "missing" (never falls back to AI).
 */
export function lookupWord(rawWord: string): DictionaryLookupResult {
  const clean = rawWord.trim().toLowerCase();
  if (!clean) return toResult(rawWord, null);

  const exact = byLemma.get(clean);
  if (exact) return toResult(rawWord, exact);

  const viaForm = byForm.get(clean);
  if (viaForm) return toResult(rawWord, viaForm);

  for (const guess of guessLemmas(clean)) {
    const viaGuess = byLemma.get(guess);
    if (viaGuess) return toResult(rawWord, viaGuess);
  }

  return toResult(rawWord, null);
}

/**
 * Looks up an English word against the (much smaller, not yet UI-wired)
 * English → French dictionary. Same exact-lemma → forms → missing order;
 * no lemmatiser fallback here since en-fr.ts is small and hand-curated.
 */
export function lookupEnglishWord(rawWord: string): DictionaryLookupResult {
  const clean = rawWord.trim().toLowerCase();
  if (!clean) return toResult(rawWord, null);

  const exact = enByLemma.get(clean);
  if (exact) return toResult(rawWord, exact);

  const viaForm = enByForm.get(clean);
  if (viaForm) return toResult(rawWord, viaForm);

  return toResult(rawWord, null);
}
