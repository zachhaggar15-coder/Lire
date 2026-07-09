import type { DictionaryEntry } from "@/lib/dictionary/types";
import generatedData from "./fr-en-generated.json";

/**
 * ~92,000 additional French->English entries generated from WikDict/
 * Wiktionary data — see NOTICE.md in this folder for source, license
 * (CC BY-SA 4.0), and how to regenerate via scripts/build-dictionary.mjs.
 * Essentially every clean entry WikDict's fr-en export has (uncapped,
 * modulo proper-noun/junk filtering) — raised from an earlier 15,000-entry
 * cap after real dictionary-lookup misses turned out to be a recurring
 * complaint.
 *
 * This is a fallback layer, not the primary dictionary: src/lib/dictionary/
 * lookup.ts always checks the hand-curated src/data/dictionaries/fr-en.ts
 * first (better examples, CEFR levels, gender, conjugated forms), and only
 * falls back to this generated set for words the curated dictionary
 * doesn't have.
 *
 * Every entry also carries a `cefr` estimate derived from its rank position
 * (see `CEFR_BUCKETS` in scripts/build-dictionary.mjs) — not real CEFR data
 * (WikDict doesn't have any), but a frequency-based proxy, the same
 * approach real frequency-based CEFR wordlists use. This is what
 * src/lib/difficulty.ts's article-difficulty estimate actually uses per
 * word; before this, every generated-dictionary hit was scored as one flat
 * "mid-frequency" placeholder regardless of how common the word actually
 * was.
 */
export const frEnGeneratedDictionary: DictionaryEntry[] = generatedData as DictionaryEntry[];
