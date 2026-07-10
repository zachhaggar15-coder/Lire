// Focused logic tests for the recommendation engine, difficulty estimation,
// and the full dictionary lookup chain (curated -> generated -> custom ->
// lemma-guess -> missing). Run with:
//   node scripts/test-core-logic.mjs
//
// custom.ts only activates with a real `window.localStorage`, so a minimal
// in-memory stub is installed below *before* any dictionary module is
// imported — every lookup.ts/custom.ts call checks for storage freshly, so
// import order doesn't matter, only call-time order does.
const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
};

import {
  contentQualityScore,
  difficultyMatchScore,
  freshnessScore,
  getStarRating,
  inferUserLevelNumeric,
  readingTimeScore,
  unknownWordTargetScore,
} from "../src/lib/recommendation/signals.ts";
import { estimateDifficulty } from "../src/lib/difficulty.ts";
import { lookupWord } from "../src/lib/dictionary/lookup.ts";
import { saveCustomDictionaryEntry } from "../src/lib/dictionary/custom.ts";

let passed = 0;
let failed = 0;

function check(label, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`OK ${label}`);
  } else {
    failed++;
    console.log(`FAIL ${label}${detail ? ` - ${detail}` : ""}`);
  }
}

console.log("--- Recommendation signals ---");
{
  const freshNow = freshnessScore(new Date().toISOString());
  const fiveDaysOld = freshnessScore(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString());
  check("a just-published article scores near 1", freshNow > 0.95, `got ${freshNow}`);
  check("a 5-day-old article scores lower than a fresh one", fiveDaysOld < freshNow);
  check("an undated (hardcoded) article scores neutral", freshnessScore(undefined) === 0.5);
}
{
  check("exact CEFR match scores 1", difficultyMatchScore("B1", 3) === 1);
  const farOff = difficultyMatchScore("C1", 1); // C1=5, level 1 -> distance 4
  check("a far-off CEFR match scores 0 (floored)", farOff === 0);
}
{
  check("unknownWordRatio inside the ideal band scores 1", unknownWordTargetScore(0.4) === 1);
  const below = unknownWordTargetScore(0.1);
  const above = unknownWordTargetScore(0.9);
  check("below the ideal band tapers down", below < 1 && below > 0, `got ${below}`);
  check("far above the ideal band tapers toward 0", above < below, `below=${below} above=${above}`);
}
{
  check("a 2-minute read scores 1 (comfortable length)", readingTimeScore(2) === 1);
  const long = readingTimeScore(20);
  check("a very long read tapers down but never below the floor", long >= 0.3 && long < 1, `got ${long}`);
}
{
  check("good content quality scores 1", contentQualityScore("good") === 1);
  check("poor content quality scores lowest", contentQualityScore("poor") < contentQualityScore("usable"));
}
{
  check("a brand-new reader (0 known words) infers level 1", inferUserLevelNumeric(0) === 1);
  check("a reader with many known words infers a higher level", inferUserLevelNumeric(500) === 5);
}
{
  const perfect = getStarRating(0.35);
  const hard = getStarRating(0.95);
  check("a well-matched ratio gets 5 stars", perfect.stars === 5, JSON.stringify(perfect));
  check("a very high ratio gets the fewest stars", hard.stars === 2, JSON.stringify(hard));
  check("star count only ever runs 2-5", perfect.stars <= 5 && hard.stars >= 2);
}

console.log("\n--- Difficulty estimation ---");
{
  const easy = estimateDifficulty("Le chat est noir. Le chien est grand. Elle est belle.");
  check("a short, simple, all-basic-word text estimates a low CEFR", ["A1", "A2"].includes(easy.cefr), easy.cefr);
  check("dictionary coverage is reported as a 0-1 fraction", easy.dictionaryCoverage >= 0 && easy.dictionaryCoverage <= 1);
}
{
  const empty = estimateDifficulty("");
  check("an empty text doesn't throw and returns a valid estimate", typeof empty.cefr === "string");
}
{
  // "zzznonexistentwordzzz" can't be in any dictionary layer — every
  // occurrence should count as unknown regardless of known-words state.
  const gibberish = estimateDifficulty("Zzznonexistentwordzzz zzzanotherfakewordzzz zzzthirdfakewordzzz.");
  check("text made entirely of unknown words has a high unknown ratio", gibberish.unknownWordRatio > 0.5, gibberish.unknownWordRatio);
}

console.log("\n--- Dictionary lookup chain ---");
{
  const result = lookupWord("bonjour");
  check("a common curated word resolves via the curated layer", result.source === "local" && result.translations.length > 0);
}
{
  const result = lookupWord("zzzznotarealfrenchwordzzzz");
  check("a nonsense word is reported missing", result.source === "missing");
  check("a missing word has no translations", result.translations.length === 0);
}
{
  // Round-trips through the same custom.ts flow Reader.tsx uses when an AI
  // backfill is saved — a fabricated word that isn't in any real
  // dictionary layer, so a hit here can only have come from the custom one.
  const fakeWord = "flouzeboupidon";
  const before = lookupWord(fakeWord);
  check("the fabricated test word starts out missing", before.source === "missing");

  saveCustomDictionaryEntry({
    lemma: fakeWord,
    translations: ["made-up test word"],
    partOfSpeech: "noun",
  });
  const after = lookupWord(fakeWord);
  check("after saving a custom entry, the same word resolves", after.source === "local");
  check("the custom entry's translation comes through", after.translations.includes("made-up test word"));
}
{
  // guessLemmas fallback path — a conjugated form not explicitly listed as
  // a `forms[]` entry anywhere, but guessable via the regular -er pattern.
  const result = lookupWord("mangerait");
  check("an unlisted conditional form resolves via lemma-guessing", result.source === "local", JSON.stringify(result));
}
{
  const result = lookupWord("vendrait");
  check("an unlisted -dre conditional resolves via lemma-guessing", result.lemma === "vendre", JSON.stringify(result));
}
{
  const result = lookupWord("lira");
  check("an unlisted -re future resolves via lemma-guessing", result.lemma === "lire", JSON.stringify(result));
}
{
  const result = lookupWord("s'appelle");
  check("an elided pronominal form resolves after the apostrophe", result.lemma === "appeler", JSON.stringify(result));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
