/**
 * The broad dictionary recovers after a failed chunk load (audit C05).
 *
 * The generated dictionary is a lazily imported chunk. If that fetch failed
 * once (offline, flaky network), the rejected promise used to be cached for
 * the life of the page, so lookups stayed on curated-only coverage until a
 * reload. This fails the load once, restores it, and checks lookups recover
 * in the same session.
 */

import { createRunner } from "./lib/fakeBrowser.mjs";

globalThis.window ??= {};
const t = createRunner("dictionary recovery");
const generated = await import("../src/data/dictionaries/generated/fr-en-generated.ts");
const lookup = await import("../src/lib/dictionary/lookup.ts");

const WORD = "zzqmotdetest";
let calls = 0;
let online = false;
generated.__setGeneratedDictionaryImporterForTests(async () => {
  calls += 1;
  if (!online) throw new TypeError("Failed to fetch dynamically imported module");
  return { default: [{ lemma: WORD, translations: ["test word"], partOfSpeech: "noun", frequencyRank: 1001, cefr: "C2" }] };
});

await t.section("first load fails", async () => {
  await lookup.ensureGeneratedDictionary();
  t.check("broad layer not ready after a failed load", lookup.isGeneratedDictionaryReady() === false);
  t.check("lookup of a broad-only word misses (curated only)", lookup.lookupWord(WORD).lemma === null);
  let rejected = false;
  try {
    await generated.loadGeneratedDictionary();
  } catch {
    rejected = true;
  }
  t.check("a direct retry while still offline fails again (it really retried)", rejected && calls === 2);
});

await t.section("connection returns: same session recovers", async () => {
  online = true;
  await lookup.ensureGeneratedDictionary();
  t.check("retry fetched the chunk again", calls === 3);
  t.check("broad layer ready without a reload", lookup.isGeneratedDictionaryReady() === true);
  const result = lookup.lookupWord(WORD);
  t.check("broad-only word now resolves", result.lemma === WORD && result.translations.includes("test word"));
  await lookup.ensureGeneratedDictionary();
  await generated.loadGeneratedDictionary();
  t.check("a successful load is cached (no further fetches)", calls === 3);
});

t.finish();
