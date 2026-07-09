import type { DictionaryEntry, DictionaryLookupResult } from "@/lib/dictionary/types";
import { frEnDictionary } from "@/data/dictionaries/fr-en";
import { frEnGeneratedDictionary } from "@/data/dictionaries/generated/fr-en-generated";
import { enFrDictionary } from "@/data/dictionaries/en-fr";
import { guessLemmas } from "@/lib/dictionary/lemmatize";
import { getCustomDictionaryEntry } from "@/lib/dictionary/custom";

/**
 * Offline, instant word lookup. Never calls a network API — this is the
 * "Kindle-like" fast path. Two dictionary layers, checked in order:
 *   1. The hand-curated dictionary (fr-en.ts) — better examples, CEFR
 *      levels, gender, and explicitly-listed conjugated forms.
 *   2. The generated dictionary (generated/fr-en-generated.ts) — much
 *      broader coverage from WikDict/Wiktionary data, no forms/examples/
 *      CEFR, used only for words the curated dictionary doesn't have.
 * Within each layer: exact lemma, then inflected forms. If neither layer's
 * lemma/forms match, a rule-based lemma guess (lemmatize.ts) is tried
 * against both layers; otherwise the word is reported missing.
 */

const byLemma = new Map<string, DictionaryEntry>();
const byForm = new Map<string, DictionaryEntry>();

for (const entry of frEnDictionary) {
  byLemma.set(entry.lemma.toLowerCase(), entry);
  for (const form of entry.forms ?? []) {
    byForm.set(form.toLowerCase(), entry);
  }
}

const generatedByLemma = new Map<string, DictionaryEntry>();
const generatedByForm = new Map<string, DictionaryEntry>();

for (const entry of frEnGeneratedDictionary) {
  generatedByLemma.set(entry.lemma.toLowerCase(), entry);
  for (const form of entry.forms ?? []) {
    generatedByForm.set(form.toLowerCase(), entry);
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
 * module. Order: curated lemma, curated forms, generated lemma, generated
 * forms, then a rule-based lemma guess (lemmatize.ts) tried against both
 * layers; otherwise "missing" (never falls back to AI).
 */
export function lookupWord(rawWord: string): DictionaryLookupResult {
  const clean = rawWord.trim().toLowerCase();
  if (!clean) return toResult(rawWord, null);

  const exact = byLemma.get(clean);
  if (exact) return toResult(rawWord, exact);

  const viaForm = byForm.get(clean);
  if (viaForm) return toResult(rawWord, viaForm);

  const generatedExact = generatedByLemma.get(clean);
  if (generatedExact) return toResult(rawWord, generatedExact);

  const generatedViaForm = generatedByForm.get(clean);
  if (generatedViaForm) return toResult(rawWord, generatedViaForm);

  const customExact = getCustomDictionaryEntry(clean);
  if (customExact) return toResult(rawWord, customExact);

  for (const guess of guessLemmas(clean)) {
    const viaGuess = byLemma.get(guess) ?? generatedByLemma.get(guess) ?? getCustomDictionaryEntry(guess);
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
