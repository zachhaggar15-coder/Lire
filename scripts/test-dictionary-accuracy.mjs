// Translation-accuracy regression tests.
//
// The reader only ever sees translations[0], so the *order* of senses matters
// as much as their presence. The generated WikDict layer stores senses in no
// meaningful order, which produced confidently wrong answers on some of the
// most common words in French: "sur" as "sour", "ne" as "NE", "moi" as "ego",
// "non" as "NOT", "vers" as "verse".
//
// These tests pin the first gloss for high-frequency vocabulary so a
// dictionary rebuild, a change to layer priority, or a new filter can't
// silently reintroduce those. Run with:
//   node --import ./scripts/register-alias-loader.mjs scripts/test-dictionary-accuracy.mjs

globalThis.window = {
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  dispatchEvent: () => true,
};

import { ensureGeneratedDictionary, lookupWord } from "../src/lib/dictionary/lookup.ts";
import { buildContextualTranslation } from "../src/lib/dictionary/contextualTranslation.ts";
import { tokenizeParagraphsToSentences } from "../src/lib/words.ts";
import { coreSenseDictionary } from "../src/data/dictionaries/core-senses.ts";
import { frEnDictionary } from "../src/data/dictionaries/fr-en.ts";

// The generated layer is fetched on demand rather than bundled, and these
// tests exercise the full curated -> generated chain.
await ensureGeneratedDictionary();

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

console.log("--- First gloss for high-frequency words ---");
{
  // Every one of these was wrong before the core-sense layer existed.
  const expected = [
    ["sur", "on"],
    ["ne", "not"],
    ["pas", "not"],
    ["moi", "me"],
    ["toi", "you"],
    ["non", "no"],
    ["oui", "yes"],
    ["ça", "that"],
    ["cela", "that"],
    ["vers", "towards"],
    ["comme", "like"],
    ["si", "if"],
    ["rien", "nothing"],
    ["peu", "little"],
    ["point", "point"],
    ["contre", "against"],
    ["sous", "under"],
    ["sans", "without"],
    ["chez", "at the home of"],
    ["fois", "time"],
    ["raison", "reason"],
    ["mieux", "better"],
    ["bien", "well"],
    ["enfin", "finally"],
    ["pièce", "room"],
    ["clair", "bright"],
    ["couleur", "colour"],
    ["voisin", "neighbour"],
    ["chose", "thing"],
    ["jour", "day"],
    ["femme", "woman"],
    ["fille", "girl"],
    ["chien", "dog"],
    ["monsieur", "sir"],
    ["madame", "madam"],
  ];
  for (const [word, want] of expected) {
    const got = lookupWord(word).translations[0];
    check(`"${word}" translates first as "${want}"`, got === want, `got "${got}"`);
  }
}

console.log("\n--- Inflected forms reach the right entry ---");
{
  const forms = [
    ["pièces", "room"],
    ["voisins", "neighbour"],
    ["jours", "day"],
    ["femmes", "woman"],
    ["claire", "bright"],
    ["n'", "not"],
  ];
  for (const [word, want] of forms) {
    const got = lookupWord(word).translations[0];
    check(`inflected "${word}" still gives "${want}"`, got === want, `got "${got}"`);
  }
}

console.log("\n--- Abbreviations and acronym expansions are not the headline gloss ---");
{
  // WikDict mixes codes ("SSE", "ICE", "DINK") in with ordinary senses. They
  // are kept, but must never sort first — see preferPlainGlosses in lookup.ts.
  const isBareAbbreviation = (t) => t.length <= 5 && /[A-Z]/.test(t) && /^[A-Z0-9.\-/]+$/.test(t);
  const words = ["glace", "pin", "tas", "ok", "case", "sol", "coq", "vis"];
  for (const word of words) {
    const first = lookupWord(word).translations[0] ?? "";
    check(`"${word}" does not lead with an abbreviation`, !isBareAbbreviation(first), `got "${first}"`);
  }
  const commaLed = ["case", "roc"];
  for (const word of commaLed) {
    const first = lookupWord(word).translations[0] ?? "";
    check(`"${word}" does not lead with an acronym expansion`, !first.includes(","), `got "${first}"`);
  }
}

console.log("\n--- Part of speech is not asserted when it was guessed ---");
{
  // "murmura" is a verb form; stripping to a lemma lands on the noun
  // "murmure", so the stored part of speech describes a different word class.
  const guessed = lookupWord("murmura");
  check("guessed lemma flags its part of speech as uncertain", guessed.partOfSpeechUncertain === true);
  check("guessed lemma still returns a translation", guessed.translations.length > 0);

  const exact = lookupWord("chien");
  check("exact match does not flag uncertainty", !exact.partOfSpeechUncertain);
  check("exact match keeps its part of speech", exact.partOfSpeech === "noun");
}

console.log("\n--- Reflexive verbs are only claimed when the pronoun really is reflexive ---");
{
  function reflexiveClaimFor(sentence, word) {
    const tokens = tokenizeParagraphsToSentences(sentence)[0][0].tokens;
    const index = tokens.findIndex((token) => token.isWord && token.clean === word);
    const result = buildContextualTranslation({
      tokens,
      tokenIndex: index,
      contextSentence: sentence,
      previousSentence: null,
      nextSentence: null,
    });
    return /reflexive/.test(result.grammar?.form ?? "");
  }

  // "vous"/"nous" are subject pronouns far more often than reflexive ones.
  // Claiming otherwise told readers that ordinary second-person verbs carried
  // a reflexive pronoun.
  check("subject \"vous\" is not read as reflexive", !reflexiveClaimFor("Vous croyez que je mens.", "croyez"));
  check("subject \"nous\" is not read as reflexive", !reflexiveClaimFor("Nous mangeons du pain.", "mangeons"));
  check("doubled \"vous vous\" is read as reflexive", reflexiveClaimFor("Vous vous levez tôt.", "levez"));
  check("doubled \"nous nous\" is read as reflexive", reflexiveClaimFor("Nous nous levons tôt.", "levons"));
  check("\"se\" is read as reflexive", reflexiveClaimFor("Il se lave les mains.", "lave"));
}

console.log("\n--- The core layer stays in its lane ---");
{
  // core-senses.ts exists to correct words the generated layer got wrong. It
  // must not shadow the richer hand-written entries in fr-en.ts, which carry
  // examples and CEFR data this layer doesn't.
  const richCurated = new Map();
  for (const entry of frEnDictionary) {
    if ((entry.examples ?? []).length > 0) richCurated.set(entry.lemma.toLowerCase(), entry);
  }
  const shadowed = coreSenseDictionary
    .map((entry) => entry.lemma.toLowerCase())
    .filter((lemma) => richCurated.has(lemma));
  check("core senses never shadow a curated entry that has examples", shadowed.length === 0, shadowed.join(", "));

  const duplicates = coreSenseDictionary
    .map((entry) => entry.lemma.toLowerCase())
    .filter((lemma, index, all) => all.indexOf(lemma) !== index);
  check("core sense lemmas are unique", duplicates.length === 0, duplicates.join(", "));

  const empty = coreSenseDictionary.filter((entry) => entry.translations.length === 0);
  check("every core sense entry has a translation", empty.length === 0, empty.map((e) => e.lemma).join(", "));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
