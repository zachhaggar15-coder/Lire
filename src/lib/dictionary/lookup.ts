import type { DictionaryEntry, DictionaryLookupResult } from "@/lib/dictionary/types";
import { frEnDictionary } from "@/data/dictionaries/fr-en";

/**
 * Offline, instant word lookup. Never calls a network API — this is the
 * "Kindle-like" fast path: clean the word, check it as a lemma, then check
 * it against every entry's inflected forms, otherwise report it missing.
 */

const byLemma = new Map<string, DictionaryEntry>();
const byForm = new Map<string, DictionaryEntry>();

for (const entry of frEnDictionary) {
  byLemma.set(entry.lemma.toLowerCase(), entry);
  for (const form of entry.forms ?? []) {
    byForm.set(form.toLowerCase(), entry);
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
 * inflected/elided forms; otherwise "missing" (never falls back to AI).
 */
export function lookupWord(rawWord: string): DictionaryLookupResult {
  const clean = rawWord.trim().toLowerCase();
  if (!clean) return toResult(rawWord, null);

  const exact = byLemma.get(clean);
  if (exact) return toResult(rawWord, exact);

  const viaForm = byForm.get(clean);
  if (viaForm) return toResult(rawWord, viaForm);

  return toResult(rawWord, null);
}
