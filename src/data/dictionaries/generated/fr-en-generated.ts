import type { DictionaryEntry } from "@/lib/dictionary/types";
import generatedData from "./fr-en-generated.json";

/**
 * ~15,000 additional French->English entries generated from WikDict/
 * Wiktionary data — see NOTICE.md in this folder for source, license
 * (CC BY-SA 4.0), and how to regenerate via scripts/build-dictionary.mjs.
 *
 * This is a fallback layer, not the primary dictionary: src/lib/dictionary/
 * lookup.ts always checks the hand-curated src/data/dictionaries/fr-en.ts
 * first (better examples, CEFR levels, gender, conjugated forms), and only
 * falls back to this generated set for words the curated dictionary
 * doesn't have.
 */
export const frEnGeneratedDictionary: DictionaryEntry[] = generatedData as DictionaryEntry[];
