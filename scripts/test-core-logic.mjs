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
  // preferences.ts, onboarding.ts, and interests.ts all fire a
  // window.dispatchEvent(...) after writing — a real DOM isn't needed to
  // exercise the read/write logic these tests care about, just something
  // that doesn't throw. Event/CustomEvent are real globals in modern Node.
  dispatchEvent: () => true,
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
import { translateParagraphsWithDictionary } from "../src/lib/dictionary/articleTranslation.ts";
import { saveCustomDictionaryEntry } from "../src/lib/dictionary/custom.ts";
import { properNounDictionary } from "../src/data/dictionaries/proper-nouns.ts";
import { tokenizeParagraphsToSentences } from "../src/lib/words.ts";
import { isAcceptableAsShortSnippet, isAcceptableReadingContent } from "../src/lib/rss/contentQuality.ts";
import {
  getHiddenSources,
  getSavedLaterIds,
  hideSource,
  isSavedForLater,
  isSourceHidden,
  removeFromSavedLater,
  saveForLater,
} from "../src/lib/recommendation/preferences.ts";
import {
  getOnboardingLevelNumeric,
  getOnboardingState,
  saveOnboarding,
  skipOnboarding,
} from "../src/lib/onboarding.ts";
import { itemTimestamp, mergeStoreValue } from "../src/lib/supabase/sync.ts";

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
{
  // e -> è stem change (acheter family) — "achète" doesn't round-trip
  // through the plain suffix table, since the real infinitive's stem
  // spelling ("achet") differs from the conjugated stem ("achèt").
  const result = lookupWord("achète");
  check("an e/è stem-changing verb resolves via the spelling-variant guess", result.lemma === "acheter", JSON.stringify(result));
}
{
  // é -> è stem change (préférer family).
  const result = lookupWord("préfère");
  check("an é/è stem-changing verb resolves via the spelling-variant guess", result.lemma === "préférer", JSON.stringify(result));
}
{
  // Doubled-consonant stem change (appeler/jeter family).
  const result = lookupWord("appelle");
  check("a doubled-consonant stem-changing verb resolves via the spelling-variant guess", result.lemma === "appeler", JSON.stringify(result));
}
{
  const result = lookupWord("jette");
  check("jeter's doubled-t stem resolves via the spelling-variant guess", result.lemma === "jeter", JSON.stringify(result));
}
{
  // y/i alternation (payer/envoyer family).
  const result = lookupWord("paie");
  check("a y/i stem-changing verb resolves via the spelling-variant guess", result.lemma === "payer", JSON.stringify(result));
}
{
  // ç/c restoration (commencer family) — imperfect form.
  const result = lookupWord("commençait");
  check("a ç-spelling verb's imperfect resolves via the spelling-variant guess", result.lemma === "commencer", JSON.stringify(result));
}
{
  // Compound of an irregular base verb via prefix-stripping (venir family).
  const result = lookupWord("revient");
  check("a prefixed irregular-verb compound resolves via stripKnownPrefix", result.lemma === "revenir", JSON.stringify(result));
}
{
  const result = lookupWord("deviendra");
  check("another venir compound (devenir) resolves via stripKnownPrefix", result.lemma === "devenir", JSON.stringify(result));
}
{
  const result = lookupWord("retiendra");
  check("a tenir compound (retenir) resolves via stripKnownPrefix", result.lemma === "retenir", JSON.stringify(result));
}
{
  // A newly-added base irregular verb, unrelated to any compound.
  const result = lookupWord("connaissait");
  check("connaître's imperfect resolves via the expanded irregular table", result.lemma === "connaître", JSON.stringify(result));
}

console.log("\n--- Fixed-phrase lookup context (à travers / de travers / en travers) ---");
{
  // Root cause of a real reported bug: "travers" tapped alone used to
  // resolve to WikDict's one narrow standalone sense ("ribs" — a butchery
  // cut), since that's genuinely the only entry the source data has for
  // the bare noun. Curated now, but still worth locking in the sensible
  // standalone meaning as a regression test.
  const bare = lookupWord("travers");
  check("a bare 'travers' (no context) no longer resolves to the butchery sense", !bare.translations.includes("ribs"), JSON.stringify(bare));
}
{
  const result = lookupWord("travers", { previousWord: "à" });
  check("'travers' preceded by 'à' resolves to the phrase à travers (through/across)", result.lemma === "à travers" && result.translations.includes("through"), JSON.stringify(result));
}
{
  const result = lookupWord("travers", { previousWord: "de" });
  check("'travers' preceded by 'de' resolves to the phrase de travers (askew)", result.lemma === "de travers", JSON.stringify(result));
}
{
  const result = lookupWord("travers", { previousWord: "en" });
  check("'travers' preceded by 'en' resolves to the phrase en travers (crosswise)", result.lemma === "en travers", JSON.stringify(result));
}
{
  // "donc chat zut" isn't a phrase in any dictionary layer, so this should
  // fall straight through to the plain single-word lookup unaffected.
  const withoutContext = lookupWord("chat");
  const withContext = lookupWord("chat", { previousWord: "donc", nextWord: "zut" });
  check(
    "an ordinary word with no matching adjacent phrase is unaffected by context",
    withContext.lemma === withoutContext.lemma && withContext.translations.join() === withoutContext.translations.join(),
    JSON.stringify({ withoutContext, withContext })
  );
}

console.log("\n--- Idiom/phrase dictionary batch ---");
{
  // Reflexive verbs whose meaning genuinely diverges from the plain verb —
  // the same class of bug as the "travers" fix, just for a whole family of
  // very common pronominal verbs.
  const cases = [
    ["s'agit", {}, "s'agir"],
    ["rend", { previousWord: "se", nextWord: "compte" }, "se rendre compte"],
    ["rend", { previousWord: "se" }, "se rendre"],
    ["passe", { previousWord: "se" }, "se passer"],
    ["passe", { previousWord: "se", nextWord: "de" }, "se passer de"],
    ["trouve", { previousWord: "se" }, "se trouver"],
    ["demande", { previousWord: "se" }, "se demander"],
    ["sens", { previousWord: "me" }, "se sentir"],
    ["trompe", { previousWord: "se" }, "se tromper"],
    ["souviens", { previousWord: "me" }, "se souvenir"],
    // "s'aperçoit"/"s'occupe"/"s'ennuient" tokenize as one apostrophe-joined
    // token (like "s'agit" above), so these resolve directly via a forms
    // match with no adjacent-word context needed at all.
    ["s'aperçoit", {}, "s'apercevoir"],
    ["s'occupe", {}, "s'occuper"],
    ["s'ennuient", {}, "s'ennuyer"],
    ["moque", { previousWord: "se" }, "se moquer"],
    ["débrouille", { previousWord: "se" }, "se débrouiller"],
    ["déroule", { previousWord: "se" }, "se dérouler"],
  ];
  for (const [word, ctx, expectedLemma] of cases) {
    const result = lookupWord(word, ctx);
    check(`'${word}' with context ${JSON.stringify(ctx)} resolves to ${expectedLemma}`, result.lemma === expectedLemma, JSON.stringify(result));
  }
}
{
  // avoir/faire/être idioms — the base verb is basic, but the whole phrase
  // means something a literal, word-by-word reading would never guess.
  const cases = [
    ["lieu", { previousWord: "a" }, "avoir lieu"],
    ["l'air", { previousWord: "a" }, "avoir l'air"],
    ["besoin", { previousWord: "ai", nextWord: "de" }, "avoir besoin de"],
    ["beau", { previousWord: "a" }, "avoir beau"],
    ["mal", { previousWord: "du", nextWord: "à" }, "avoir du mal à"],
    ["marre", { previousWord: "ai", nextWord: "de" }, "en avoir marre"],
    ["semblant", { previousWord: "fait", nextWord: "de" }, "faire semblant de"],
    ["mieux", { previousWord: "son" }, "faire de son mieux"],
    ["train", { previousWord: "en", nextWord: "de" }, "être en train de"],
    ["mesure", { previousWord: "en", nextWord: "de" }, "être en mesure de"],
    ["y", { previousWord: "il", nextWord: "a" }, "il y a"],
    ["vaut", { previousWord: "il", nextWord: "mieux" }, "il vaut mieux"],
  ];
  for (const [word, ctx, expectedLemma] of cases) {
    const result = lookupWord(word, ctx);
    check(`'${word}' with context ${JSON.stringify(ctx)} resolves to ${expectedLemma}`, result.lemma === expectedLemma, JSON.stringify(result));
  }
}
{
  // Common connector/adverb phrases and the "coup" family, including the
  // 3-word-beats-2-word disambiguation between "à coup sûr" and "tout à coup".
  const cases = [
    ["vient", { nextWord: "de" }, "venir de"],
    ["coup", { previousWord: "du" }, "du coup"],
    ["coup", { previousWord: "à" }, "tout à coup"],
    ["coup", { previousWord: "à", nextWord: "sûr" }, "à coup sûr"],
    ["coup", {}, "coup"],
    ["place", { previousWord: "en" }, "mettre en place"],
    ["œuvre", { previousWord: "en" }, "mettre en œuvre"],
    ["compte", { previousWord: "tient", nextWord: "de" }, "tenir compte de"],
  ];
  for (const [word, ctx, expectedLemma] of cases) {
    const result = lookupWord(word, ctx);
    check(`'${word}' with context ${JSON.stringify(ctx)} resolves to ${expectedLemma}`, result.lemma === expectedLemma, JSON.stringify(result));
  }
  // "coup" alone (no phrase context) must not be swallowed by any of the
  // "coup de ..." idioms it's curated alongside — it should show its own
  // real, correct standalone sense.
  const bareCoup = lookupWord("coup");
  check("bare 'coup' keeps its own standalone translation", bareCoup.translations.includes("blow"), JSON.stringify(bareCoup));
}
{
  // Found via scripts/lint-dictionary.mjs's triage pass — same shape of bug
  // as "travers": the generated dictionary's one WikDict sense was too
  // narrow/literal for how the word is actually used.
  const issu = lookupWord("issu");
  check("'issu' resolves to its common 'descended from' sense, not just 'issued'", issu.translations.includes("descended from"), JSON.stringify(issu));
  const muni = lookupWord("munie");
  check("'muni' (as 'munie') resolves to 'equipped with'", muni.lemma === "muni" && muni.translations.includes("equipped with"), JSON.stringify(muni));
}

console.log("\n--- Expanded news and civic vocabulary ---");
{
  const cases = [
    ["cependant", {}, "cependant"],
    ["prévoit", {}, "prévoir"],
    ["réforme", {}, "réforme"],
    ["hausse", {}, "hausse"],
    ["raison", { previousWord: "en", nextWord: "de" }, "en raison de"],
    ["objectif", {}, "objectif"],
    ["incendie", {}, "incendie"],
  ];
  for (const [word, ctx, expectedLemma] of cases) {
    const result = lookupWord(word, ctx);
    check(`expanded dictionary resolves '${word}' to ${expectedLemma}`, result.lemma === expectedLemma, JSON.stringify(result));
  }
}

console.log("\n--- Proper names and places ---");
{
  const cases = [
    ["Paris", {}, "Paris", "proper noun (place)"],
    ["Macron", {}, "Emmanuel Macron", "proper noun (person)"],
    ["Monde", { previousWord: "le" }, "Le Monde", "proper noun (media)"],
    ["européenne", { previousWord: "union" }, "Union européenne", "proper noun (institution)"],
    ["Zach", {}, "Zach", "proper noun"],
  ];
  for (const [word, ctx, expectedLemma, expectedPart] of cases) {
    const result = lookupWord(word, ctx);
    check(
      `proper-name lookup resolves '${word}' to ${expectedLemma}`,
      result.lemma === expectedLemma && result.partOfSpeech === expectedPart,
      JSON.stringify(result)
    );
  }
  const ordinary = lookupWord("français");
  check("proper-noun list does not override ordinary dictionary words", ordinary.partOfSpeech === "adjective", JSON.stringify(ordinary));
  const properNames = new Map();
  for (const entry of properNounDictionary) properNames.set(entry.lemma.toLowerCase(), (properNames.get(entry.lemma.toLowerCase()) ?? 0) + 1);
  const duplicates = [...properNames.entries()].filter(([, count]) => count > 1);
  check("proper-noun dictionary has no duplicate lemmas", duplicates.length === 0, JSON.stringify(duplicates));
}

console.log("\n--- Dictionary article translation ---");
{
  const paragraphs = tokenizeParagraphsToSentences("Le chat mange une pomme.\n\nElle lit un livre.");
  const translated = translateParagraphsWithDictionary(paragraphs);
  check("dictionary translation preserves paragraph count", translated.length === 2, JSON.stringify(translated));
  check("dictionary translation uses local English glosses", translated[0].toLowerCase().includes("cat"), translated[0]);
  check("dictionary translation keeps punctuation", translated[0].endsWith("."), translated[0]);
}

console.log("\n--- Short snippets content-quality tier ---");
{
  const clean =
    "Le marché a rouvert ce matin après plusieurs semaines de travaux. Les habitants du quartier sont revenus nombreux faire leurs courses habituelles. Les commerçants se disent très satisfaits de cette reprise et tout semblait enfin calme dans les allées.";
  check(
    "a short but clean multi-sentence text fails the main quality bar",
    !isAcceptableReadingContent(clean),
    `wordCount ~${clean.split(/\s+/).length}`
  );
  check("but passes the lower short-snippet bar", isAcceptableAsShortSnippet(clean));
}
{
  const tooShort = "Un mot. Deux mots.";
  check("a genuinely tiny fragment still fails the short-snippet bar", !isAcceptableAsShortSnippet(tooShort));
}
{
  const truncated = "Le marché a rouvert ce matin après plusieurs semaines de travaux et de fermeture...";
  check(
    "a truncated teaser still fails the short-snippet bar even if short-word-count-wise it would pass",
    !isAcceptableAsShortSnippet(truncated)
  );
}

console.log("\n--- Recommendation preferences (hide source / save for later) ---");
{
  check("a source starts out not hidden", !isSourceHidden("Le Testeur"));
  hideSource("Le Testeur");
  check("hideSource marks it hidden", isSourceHidden("Le Testeur"));
  check("getHiddenSources includes it", getHiddenSources().includes("Le Testeur"));
}
{
  check("an article starts out not saved for later", !isSavedForLater("test-article-1"));
  saveForLater("test-article-1");
  check("saveForLater marks it saved", isSavedForLater("test-article-1"));
  check("getSavedLaterIds includes it", getSavedLaterIds().includes("test-article-1"));
  removeFromSavedLater("test-article-1");
  check("removeFromSavedLater unmarks it", !isSavedForLater("test-article-1"));
}

console.log("\n--- Onboarding ---");
{
  check("onboarding numeric level is null before completion (this test's store is fresh for this key)", getOnboardingLevelNumeric() === null);
  const state = saveOnboarding("B1", ["culture", "science"]);
  check("saveOnboarding marks it completed", state.completed === true);
  const stored = getOnboardingState();
  check(
    "getOnboardingState round-trips the chosen level and topics",
    stored?.level === "B1" && !!stored?.topics.includes("culture") && !!stored?.topics.includes("science"),
    JSON.stringify(stored)
  );
  check("getOnboardingLevelNumeric maps B1 to 3 once completed", getOnboardingLevelNumeric() === 3);
}
{
  const state = skipOnboarding();
  check("skipOnboarding still marks completed (so the prompt never nags again)", state.completed === true);
  check("skipOnboarding defaults to A2", state.level === "A2");
}

console.log("\n--- Supabase sync merge logic ---");
{
  check("itemTimestamp reads the latest of several timestamp-ish fields", itemTimestamp({ savedAt: "2020-01-01", lastReviewedAt: "2024-06-01" }) > itemTimestamp({ savedAt: "2020-01-01" }));
  check("itemTimestamp is 0 for a value with no timestamp fields", itemTimestamp({ word: "chat" }) === 0);
  check("itemTimestamp is 0 for non-objects", itemTimestamp("just a string") === 0 && itemTimestamp(null) === 0);
}
{
  const config = { key: "lire.knownWords.v1", kind: "list-of-strings" };
  const merged = mergeStoreValue(config, ["chat", "chien"], ["chien", "oiseau"]);
  check(
    "list-of-strings merge is a deduped union of local and remote",
    merged.length === 3 && ["chat", "chien", "oiseau"].every((w) => merged.includes(w)),
    JSON.stringify(merged)
  );
}
{
  const config = { key: "lire.savedWords.v1", kind: "list-by-id", idField: "word" };
  const local = [{ word: "chat", savedAt: "2024-01-01T00:00:00Z", reviewCount: 1 }];
  const remote = [{ word: "chat", savedAt: "2024-06-01T00:00:00Z", reviewCount: 5 }];
  const merged = mergeStoreValue(config, local, remote);
  check(
    "list-by-id merge keeps whichever side has the newer timestamp for a shared id",
    merged.length === 1 && merged[0].reviewCount === 5,
    JSON.stringify(merged)
  );
}
{
  const config = { key: "lire.savedWords.v1", kind: "list-by-id", idField: "word" };
  const local = [{ word: "chat", savedAt: "2024-06-01T00:00:00Z", reviewCount: 9 }];
  const remote = [{ word: "chat", savedAt: "2024-01-01T00:00:00Z", reviewCount: 1 }];
  const merged = mergeStoreValue(config, local, remote);
  check(
    "list-by-id merge keeps the local side when it's the newer one",
    merged.length === 1 && merged[0].reviewCount === 9,
    JSON.stringify(merged)
  );
}
{
  const config = { key: "lire.savedWords.v1", kind: "list-by-id", idField: "word" };
  const local = [{ word: "chat" }];
  const remote = [{ word: "chien" }];
  const merged = mergeStoreValue(config, local, remote);
  check(
    "list-by-id merge keeps distinct ids from both sides",
    merged.length === 2,
    JSON.stringify(merged)
  );
}
{
  const config = { key: "lire.progress.v1", kind: "record" };
  const local = { "id-1": { status: "completed", completedAt: "2024-06-01T00:00:00Z" } };
  const remote = { "id-1": { status: "in-progress", completedAt: "2024-01-01T00:00:00Z" }, "id-2": { status: "unread" } };
  const merged = mergeStoreValue(config, local, remote);
  check(
    "record merge keeps the newer entry per key and adds remote-only keys",
    merged["id-1"].status === "completed" && merged["id-2"].status === "unread",
    JSON.stringify(merged)
  );
}
{
  check("mergeStoreValue returns local as-is when remote is null", mergeStoreValue({ key: "k", kind: "object" }, { a: 1 }, null).a === 1);
  check("mergeStoreValue returns remote as-is when local is null", mergeStoreValue({ key: "k", kind: "object" }, null, { a: 1 }).a === 1);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
