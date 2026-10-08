import type { Difficulty, SavedWord } from "@/types";
import type { DictionaryEntry } from "@/lib/dictionary/types";
import { frEnDictionary } from "@/data/dictionaries/fr-en";
import { loadedGeneratedEntries } from "@/lib/dictionary/lookup";
import { getSelectedReadingLevel } from "@/lib/onboarding";
import { getSavedWords } from "@/lib/storage";
import { isMastered } from "@/lib/reviewMembership";
import { vocabularyEstimateForLevel } from "@/lib/vocabulary/levelEstimates";

/**
 * What the reader is *estimated* to know, for difficulty estimates, article
 * ranking and choosing practice words. Never for Review membership, and never
 * shown to the reader as "you know this word" (see reviewMembership.ts).
 *
 * Two parts:
 *   - the inferred baseline: the most common lemmas for the selected level
 *     (500 for A1 … 8,000 for C2). Choosing B1 means "roughly B1 vocabulary",
 *     not "knows these 2,000 words", so it is computed from the level each
 *     time and never stored. Changing level changes it at once, with nothing
 *     left behind; it cannot cross accounts because it is not data.
 *   - words the reader has mastered in Review (three correct in a row).
 *
 * It replaces seeding the baseline into lire.knownWords.v1 at onboarding,
 * where it was indistinguishable from words the reader had actually marked,
 * survived level changes, and made the reader show "Already known". That
 * store is no longer read or written (it stays synced so no data is lost).
 */

const CEFR_NUMERIC: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

function isBaselineLemma(entry: DictionaryEntry): boolean {
  const lemma = entry.lemma.toLowerCase();
  if (!lemma || /[\s'’-]/.test(lemma)) return false;
  return !(entry.partOfSpeech?.startsWith("proper noun") ?? false);
}

/**
 * The level's baseline: curated entries at or below the level, then the broad
 * dictionary by frequency once it has loaded (until then, the curated part
 * only — the same coverage every lookup has before that).
 */
export function buildInferredBaseline(level: Difficulty, generated: DictionaryEntry[] = loadedGeneratedEntries()): string[] {
  const target = vocabularyEstimateForLevel(level);
  const levelNumber = CEFR_NUMERIC[level];
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (entry: DictionaryEntry) => {
    const lemma = entry.lemma.toLowerCase();
    if (out.length >= target || seen.has(lemma) || !isBaselineLemma(entry)) return;
    seen.add(lemma);
    out.push(lemma);
  };
  for (const entry of frEnDictionary) {
    const entryLevel = entry.cefr ? CEFR_NUMERIC[entry.cefr] : null;
    if (entryLevel && entryLevel <= levelNumber) add(entry);
  }
  if (out.length < target) {
    const byFrequency = generated
      .filter((entry) => typeof entry.frequencyRank === "number")
      .sort((a, b) => (a.frequencyRank ?? 0) - (b.frequencyRank ?? 0));
    for (const entry of byFrequency) {
      if (out.length >= target) break;
      add(entry);
    }
  }
  return out;
}

let baselineCache: { level: Difficulty; generatedCount: number; lemmas: Set<string> } | null = null;

export function getInferredBaseline(level: Difficulty = getSelectedReadingLevel()): Set<string> {
  const generated = loadedGeneratedEntries();
  if (baselineCache?.level !== level || baselineCache.generatedCount !== generated.length) {
    baselineCache = { level, generatedCount: generated.length, lemmas: new Set(buildInferredBaseline(level, generated)) };
  }
  return baselineCache.lemmas;
}

/** The baseline plus every form and lemma of the reader's mastered cards. */
export function getEstimatedKnownVocabulary(
  level: Difficulty = getSelectedReadingLevel(),
  words: SavedWord[] = getSavedWords()
): Set<string> {
  const out = new Set(getInferredBaseline(level));
  for (const card of words) {
    if (!isMastered(card)) continue;
    out.add(card.word.toLowerCase());
    if (card.lemma) out.add(card.lemma.toLowerCase());
  }
  return out;
}
