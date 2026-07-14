import type { Difficulty } from "@/types";
import type { DictionaryEntry } from "@/lib/dictionary/types";
import { frEnDictionary } from "@/data/dictionaries/fr-en";
import { frEnGeneratedDictionary } from "@/data/dictionaries/generated/fr-en-generated";
import { markKnownBatch } from "@/lib/knownWords";

export const LEVEL_KNOWN_WORD_ESTIMATES: Record<Difficulty, number> = {
  A1: 500,
  A2: 1000,
  B1: 2000,
  B2: 3500,
  C1: 5500,
  C2: 8000,
};

const CEFR_NUMERIC: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
const LEVEL_NUMERIC: Record<Difficulty, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

function isSeedableLemma(lemma: string): boolean {
  return !!lemma && !lemma.includes(" ") && !lemma.includes("'") && !lemma.includes("’") && !lemma.includes("-");
}

function isProperNoun(entry: DictionaryEntry): boolean {
  return entry.partOfSpeech?.startsWith("proper noun") ?? false;
}

function addEntry(out: string[], seen: Set<string>, entry: DictionaryEntry): void {
  const lemma = entry.lemma.toLowerCase();
  if (!isSeedableLemma(lemma) || isProperNoun(entry) || seen.has(lemma)) return;
  seen.add(lemma);
  out.push(lemma);
}

export function knownWordEstimateForLevel(level: Difficulty): number {
  return LEVEL_KNOWN_WORD_ESTIMATES[level];
}

export function buildKnownWordBootstrapList(level: Difficulty): string[] {
  const target = knownWordEstimateForLevel(level);
  const levelNumber = LEVEL_NUMERIC[level];
  const seen = new Set<string>();
  const out: string[] = [];

  for (const entry of frEnDictionary) {
    const entryLevel = entry.cefr ? CEFR_NUMERIC[entry.cefr] : null;
    if (entryLevel && entryLevel <= levelNumber) addEntry(out, seen, entry);
  }

  const generated = [...frEnGeneratedDictionary]
    .filter((entry) => typeof entry.frequencyRank === "number")
    .sort((a, b) => (a.frequencyRank ?? Number.MAX_SAFE_INTEGER) - (b.frequencyRank ?? Number.MAX_SAFE_INTEGER));

  for (const entry of generated) {
    if (out.length >= target) break;
    addEntry(out, seen, entry);
  }

  return out.slice(0, target);
}

export function seedKnownWordsForLevel(level: Difficulty): { estimatedKnownWords: number; seededWords: number; totalKnownWords: number } {
  const words = buildKnownWordBootstrapList(level);
  const next = markKnownBatch(words);
  return {
    estimatedKnownWords: knownWordEstimateForLevel(level),
    seededWords: words.length,
    totalKnownWords: next.length,
  };
}
