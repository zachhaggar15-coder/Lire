import type { DictionaryEntry } from "@/lib/dictionary/types";

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
 *
 * ---
 *
 * LOAD IT WITH `loadGeneratedDictionary()`, NOT A STATIC IMPORT.
 *
 * The backing JSON is ~11 MB. A static `import` of it anywhere in a module
 * graph that reaches a client component put the whole thing in the shared
 * client bundle — it was being downloaded and parsed on *every* page,
 * including Settings and Words, which don't look up a single French word.
 * That was ~1.8 MB gzipped and many seconds of parse plus ~92k Map
 * insertions before first interaction on a mid-range phone.
 *
 * Keeping this behind a dynamic import lets the bundler split it into its
 * own chunk that's only fetched when something actually needs a broad
 * lookup. The curated dictionary (~156 KB) stays statically imported, so
 * common words still resolve instantly with no await anywhere.
 */
let cached: Promise<DictionaryEntry[]> | null = null;

export function loadGeneratedDictionary(): Promise<DictionaryEntry[]> {
  if (!cached) {
    cached = import("./fr-en-generated.json").then(
      (module) => (module.default ?? module) as unknown as DictionaryEntry[]
    );
  }
  return cached;
}
