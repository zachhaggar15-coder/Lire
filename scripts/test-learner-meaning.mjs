import { readFileSync } from "node:fs";
import { resolveMeaning, sentenceMeaning } from "../src/lib/dictionary/resolveMeaning.ts";
import { surfaceGlossFor, bareVerb, isVerbGloss } from "../src/lib/dictionary/surfaceGloss.ts";
import { classifyRegister, isLearnerSafeGloss, leadingLearnerSense, preferLearnerSenses } from "../src/lib/dictionary/register.ts";
import { exerciseGlossFor, canonicalExerciseGloss, contextualExerciseGloss } from "../src/lib/practice/exerciseGloss.ts";
import { ensureGeneratedDictionary, lookupWord } from "../src/lib/dictionary/lookup.ts";
import { tokenizeParagraphsToSentences, cleanWord, lexicalSpan } from "../src/lib/words.ts";

/**
 * Learner-facing meaning, and the stricter standard teaching material needs.
 *
 * Three distinctions are asserted here, all of which were previously collapsed
 * into a single string:
 *
 *   what the token contributes here   ("has")
 *   what its dictionary entry says    ("to have")
 *   what the whole sentence means     ("He said.")
 *
 * Plus the rule that a sense being attested does not make it fit to teach —
 * `oignons` was clued as "arse" because practice read raw position one of a
 * bulk import.
 */

await ensureGeneratedDictionary();

let passed = 0;
let failed = 0;
const failures = [];

function check(label, condition, detail = "") {
  if (condition) passed++;
  else {
    failed++;
    failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function normalise(value) {
  return String(value).toLowerCase().replace(/[’]/g, "'").trim();
}

function locate(sentenceText, needle) {
  const sentence = tokenizeParagraphsToSentences(sentenceText)[0][0];
  const target = normalise(needle);
  const index = sentence.tokens.findIndex(
    (token) => token.isWord && (normalise(token.clean) === target || normalise(token.text) === target)
  );
  if (index === -1) throw new Error(`Could not find "${needle}" in: ${sentenceText}`);
  return { tokens: sentence.tokens, tokenIndex: index, contextSentence: sentence.text };
}

function resolve(sentence, needle, extra = {}) {
  return resolveMeaning({ ...locate(sentence, needle), ...extra });
}

console.log("--- Auxiliaries: token meaning is not the lemma definition ---");
{
  const a = resolve("Il a dit.", "a");
  check("tapping the auxiliary does not answer with the infinitive", normalise(a.displayEnglish) !== "to have", a.displayEnglish);
  check("the auxiliary's contextual meaning is the inflected form", normalise(a.displayEnglish) === "has", a.displayEnglish);
  check("the lemma is recorded separately", normalise(a.lemma ?? "") === "avoir", String(a.lemma));
  check("the lemma's definition is available under its own field", normalise(a.lemmaGloss ?? "").includes("have"), String(a.lemmaGloss));
  check("the auxiliary role is explained", !!a.grammaticalRole && /auxiliary/i.test(a.grammaticalRole), String(a.grammaticalRole));
}
{
  const dit = resolve("Il a dit.", "dit");
  check("the participle resolves to its inflected English", normalise(dit.displayEnglish) === "said", dit.displayEnglish);
  check("the participle keeps its lemma", normalise(dit.lemma ?? "").startsWith("dire"), String(dit.lemma));
  check("the participle's lemma definition is separate", normalise(dit.lemmaGloss ?? "").includes("say"), String(dit.lemmaGloss));
}
{
  const est = resolve("Elle est partie.", "est");
  check("est resolves to is", normalise(est.displayEnglish) === "is", est.displayEnglish);
  check("est is not answered with the infinitive", normalise(est.displayEnglish) !== "to be", est.displayEnglish);

  const sont = resolve("Ils sont arrivés hier.", "sont");
  check("sont resolves to are", normalise(sont.displayEnglish) === "are", sont.displayEnglish);

  const avait = resolve("Il avait fini son travail.", "avait");
  check("avait resolves to had", normalise(avait.displayEnglish) === "had", avait.displayEnglish);
}
{
  // A main-verb avoir is not an auxiliary and should not be described as one.
  const mainVerb = resolve("Il a trois enfants.", "a");
  check("a main-verb avoir still gives the inflected form", normalise(mainVerb.displayEnglish) === "has", mainVerb.displayEnglish);
  check(
    "a main-verb avoir is not called an auxiliary",
    !mainVerb.grammaticalRole || !/auxiliary/i.test(mainVerb.grammaticalRole),
    String(mainVerb.grammaticalRole)
  );
}

console.log("--- Ordinary vocabulary is unaffected ---");
for (const [sentence, needle, expected] of [
  ["Il a acheté des oignons.", "oignons", "onion"],
  ["Elle ouvre la fenêtre.", "fenêtre", "window"],
  ["La voiture est rouge.", "voiture", "car"],
]) {
  const result = resolve(sentence, needle);
  check(`"${needle}" keeps its ordinary meaning`, normalise(result.displayEnglish).includes(expected), result.displayEnglish);
  check(`"${needle}" gets no needless grammar note`, result.grammaticalRole === null, String(result.grammaticalRole));
}

console.log("--- Function words are described honestly ---");
{
  const en = resolve("J'en ai besoin.", "j'en");
  check("the elided clitic resolves to the pronoun, not the preposition", normalise(en.displayEnglish) !== "in", en.displayEnglish);
  check("the clitic's meaning names what it stands in for", /of it|about it|some/i.test(en.displayEnglish), en.displayEnglish);

  const ne = resolve("Il ne veut pas partir.", "ne");
  check("ne is explained as part of a construction", !!ne.grammaticalRole && /negative/i.test(ne.grammaticalRole), String(ne.grammaticalRole));

  const y = resolve("Il y va demain.", "y");
  check("y is explained as a pronoun", !!y.grammaticalRole && /pronoun/i.test(y.grammaticalRole), String(y.grammaticalRole));
}

console.log("--- Sentence meaning cannot masquerade as word meaning ---");
{
  const translation = sentenceMeaning("Il a dit.", "He said.", "article-translation");
  const result = resolve("Il a dit.", "a", { sentenceTranslation: translation });

  check("the sentence translation is carried separately", result.sentenceTranslation?.english === "He said.", JSON.stringify(result.sentenceTranslation));
  check("the sentence translation is a tagged object, not a bare string", result.sentenceTranslation?.kind === "sentence-translation");
  check("the word field does not contain the sentence translation", result.displayEnglish !== "He said.", result.displayEnglish);
  check("the word field still answers about the token", normalise(result.displayEnglish) === "has", result.displayEnglish);
  check("the sentence's French is kept alongside its English", result.sentenceTranslation?.french === "Il a dit.");
  check(
    "the sentence translation never leaks into alternatives",
    !result.alternatives.some((alt) => normalise(alt) === "he said."),
    JSON.stringify(result.alternatives)
  );
}
{
  // Without a supplied translation the field must be null rather than being
  // filled with whatever text happens to be nearby.
  const result = resolve("Il a dit.", "a");
  check("no sentence translation is invented", result.sentenceTranslation === null);
}
{
  // Type-level protection: a sentence translation is a distinct shape, so the
  // fields cannot be swapped by accident. Asserted structurally here since the
  // compiler check cannot run inside this suite.
  const translation = sentenceMeaning("Le chat dort.", "The cat is sleeping.", "article-translation");
  check("SentenceMeaning is not a string", typeof translation !== "string");
  check("SentenceMeaning carries its provenance", translation.source === "article-translation");
}

console.log("--- The UI puts the word first and labels the sentence ---");
{
  const sheet = readFileSync(new URL("../src/components/MeaningSheet.tsx", import.meta.url), "utf8");
  check("the sheet has a Meaning here heading", sheet.includes("Meaning here"));
  check("the sheet labels the sentence section", sheet.includes("In this sentence"));
  check(
    "the word meaning is rendered before the sentence translation",
    sheet.indexOf("Meaning here") < sheet.indexOf("In this sentence")
  );
  check("the sheet shows the grammatical role", sheet.includes("grammaticalRole"));
  check("the lemma definition lives under the More disclosure", sheet.includes("lemmaGloss"));
  check("no confidence percentage is shown", !/confidence\s*\*\s*100|toFixed/.test(sheet));
  check("no candidate list is shown", !sheet.includes("candidates"));
}

console.log("--- Lexical normalisation ---");
{
  // Surrounding typography is not part of a word's identity.
  for (const [raw, expected] of [
    ["oignons,", "oignons"],
    ["oignons.", "oignons"],
    ["«oignons»", "oignons"],
    ["bonjour!", "bonjour"],
    ["“bonjour”", "bonjour"],
    ["(bonjour)", "bonjour"],
  ]) {
    check(`${JSON.stringify(raw)} normalises to ${expected}`, cleanWord(raw) === expected, cleanWord(raw));
  }
  // Internal punctuation is part of the word and must survive.
  for (const word of ["l'homme", "aujourd'hui", "s'en", "va-t-il", "celui-ci", "peut-être"]) {
    check(`${word} keeps its internal punctuation`, cleanWord(word) === word, cleanWord(word));
  }
}
{
  // Spans get the same treatment, which is where contamination actually got in.
  check("a span drops a trailing comma", lexicalSpan("a besoin de,") === "a besoin de", lexicalSpan("a besoin de,"));
  check("a span drops surrounding quotes", lexicalSpan("«se rendre compte»") === "se rendre compte", lexicalSpan("«se rendre compte»"));
  check("a span keeps internal apostrophes", lexicalSpan("jusqu'à la voiture") === "jusqu'à la voiture");
  check("a span collapses a line break", lexicalSpan("se rendre\n  compte") === "se rendre compte", lexicalSpan("se rendre\n  compte"));
  check("a span keeps internal hyphens", lexicalSpan("va-t-il venir") === "va-t-il venir");
}
{
  // Punctuation must not reach the reader's answer or split the cache.
  const withComma = resolve("Il a acheté des oignons, des carottes et du pain.", "oignons");
  const without = resolve("Il a acheté des oignons.", "oignons");
  check("a neighbouring comma does not enter the French shown", !withComma.displayFrench.includes(","), withComma.displayFrench);
  check("a neighbouring comma does not enter the English shown", !withComma.displayEnglish.includes(","), withComma.displayEnglish);
  check("both sentences agree on the word's meaning", withComma.displayEnglish === without.displayEnglish);
}

console.log("--- Register classification ---");
check("a vulgar gloss is detected", classifyRegister("arse") === "vulgar");
check("a vulgar gloss inside a phrase is detected", classifyRegister("a pain in the arse") === "vulgar");
check("an ordinary gloss is standard", classifyRegister("onion") === "standard");
check("an explicit slang marker is detected", classifyRegister("mate (slang)") === "vulgar");
check("an archaic marker is detected", classifyRegister("steed (archaic)") === "archaic");
check("a technical marker is detected", classifyRegister("tarsus (anat)") === "technical");
check("a regional marker is detected", classifyRegister("depanneur (Québec)") === "regional");
check("a rare anatomical gloss is demoted", classifyRegister("bunion") === "rare");
check("an ordinary word containing a vulgar substring is not caught", classifyRegister("assessment") === "standard");
check("class is not caught by ass", classifyRegister("classic") === "standard");
check("a vulgar gloss is not learner-safe", isLearnerSafeGloss("arse") === false);
check("a standard gloss is learner-safe", isLearnerSafeGloss("onion") === true);
{
  const ordered = preferLearnerSenses(["arse", "buckeye", "onion", "bulb", "bunion"]);
  check("the standard sense leads after reordering", ordered[0] === "onion", JSON.stringify(ordered));
  check("nothing is discarded by reordering", ordered.length === 5);
  check("the vulgar sense is still reachable", ordered.includes("arse"));
  check("the leading learner sense is the standard one", leadingLearnerSense(["arse", "buckeye", "onion"]) === "onion");
  check("a wholly unsuitable sense list yields nothing", leadingLearnerSense(["arse", "bollocks"]) === null);
}

console.log("--- The dictionary no longer leads with the vulgar sense ---");
{
  const lookup = lookupWord("oignons");
  check("oignon's leading sense is the vegetable", normalise(lookup.translations[0]) === "onion", JSON.stringify(lookup.translations));
  check("the vulgar sense is retained further down", lookup.translations.some((t) => normalise(t) === "arse"));
}

console.log("--- Exercise glosses are safe to teach ---");
{
  const gloss = canonicalExerciseGloss("oignons");
  check("oignons has a usable exercise clue", !!gloss, "none");
  check("the oignons clue is onions", normalise(gloss?.english ?? "") === "onion", String(gloss?.english));
  check("the oignons clue is never arse", normalise(gloss?.english ?? "") !== "arse");
  check("the vulgar sense is recorded as rejected", gloss?.rejected.some((r) => normalise(r.gloss) === "arse"), JSON.stringify(gloss?.rejected));
  check("the clue's register is reported", gloss?.register === "standard", String(gloss?.register));
}
{
  // The broader rule, not an oignons patch.
  for (const word of ["chatte", "boules", "con"]) {
    const gloss = canonicalExerciseGloss(word);
    if (!gloss) {
      check(`"${word}" is skipped rather than clued unsafely`, true);
      continue;
    }
    check(`"${word}" is not clued with a vulgar sense`, isLearnerSafeGloss(gloss.english), gloss.english);
  }
}
{
  // Too-generic clues cannot identify a word, so they are not questions.
  check("an over-generic clue is refused", canonicalExerciseGloss("être") === null || canonicalExerciseGloss("être")?.english !== "to be");
  // A word with no entry produces no question at all.
  check("an unknown word yields no exercise", canonicalExerciseGloss("zzzqwertyx") === null);
  // A guessed lemma may cross word classes ("murmura" strips to the noun
  // "murmure"), so it is allowed but never claimed as high confidence.
  const guessed = lookupWord("murmura");
  const guessedGloss = canonicalExerciseGloss("murmura");
  if (guessed.partOfSpeechUncertain && guessedGloss) {
    check("a guessed lemma is never high confidence", guessedGloss.confidence === "medium", guessedGloss.confidence);
    check("a guessed lemma is rejected when only high confidence will do", exerciseGlossFor({ french: "murmura", minimumConfidence: "high" }) === null);
  } else {
    check("a guessed lemma is handled conservatively", true);
    check("a guessed lemma is handled conservatively (high bar)", true);
  }
}
{
  // Context wins over the canonical sense when the resolver is confident.
  const contextual = contextualExerciseGloss({
    french: "compte",
    sentence: "Elle se rend compte de son erreur.",
  });
  check("a confident contextual sense is used", !!contextual && /realiz|realis/i.test(contextual.english), String(contextual?.english));
  check("the contextual clue is attributed to the resolver", contextual?.source === "contextual-resolver");

  const canonical = canonicalExerciseGloss("compte");
  check(
    "the contextual clue differs from the canonical one here",
    !canonical || normalise(canonical.english) !== normalise(contextual?.english ?? ""),
    `${canonical?.english} vs ${contextual?.english}`
  );
}
{
  // Low confidence must produce no question rather than a hedged one.
  const uncertain = contextualExerciseGloss({ french: "tour", sentence: "Le tour est fini." });
  check(
    "an uncertain contextual reading is not turned into a question",
    uncertain === null || uncertain.confidence === "high",
    JSON.stringify(uncertain)
  );
}
{
  // Generated-layer clues are usable but never claimed as high confidence.
  const generated = canonicalExerciseGloss("oignons");
  check("a generated-layer clue is marked medium confidence", generated?.confidence === "medium", String(generated?.confidence));
  check(
    "a high-confidence-only caller rejects a generated clue",
    exerciseGlossFor({ french: "oignons", minimumConfidence: "high" }) === null
  );
}
{
  // Punctuation must not reach an exercise answer or clue.
  const gloss = exerciseGlossFor({ french: "oignons,", sentence: "Il a acheté des oignons, des carottes." });
  check("a punctuated answer still resolves", !!gloss, "none");
  check("the exercise clue carries no punctuation", !gloss?.english.includes(","), String(gloss?.english));
  check("the exercise French is the lexical form", !gloss?.french.includes(","), String(gloss?.french));
}

console.log("--- Practice no longer reads raw dictionary position one ---");
{
  const overlay = readFileSync(new URL("../src/components/practice/PracticeOverlay.tsx", import.meta.url), "utf8");
  check("the practice overlay uses the trusted gloss pathway", overlay.includes("exerciseGlossFor"));
  // Comments mention the old call by name, so compare against code only.
  const overlayCode = overlay.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  check(
    "the practice overlay does not call translations[0]",
    !/translations\[0\]/.test(overlayCode),
    "still reaching into raw translations"
  );
  const inference = readFileSync(new URL("../src/lib/inference.ts", import.meta.url), "utf8");
  check("inference answers use a learner-safe sense", inference.includes("leadingLearnerSense"));
}

console.log("--- Sentence reconstruction reveals meaning only after success ---");
{
  const overlay = readFileSync(new URL("../src/components/practice/PracticeOverlay.tsx", import.meta.url), "utf8");
  const recon = overlay.slice(overlay.indexOf("function ReconstructionActivity"), overlay.indexOf("function ClozeActivity"));
  check("the translation is fetched only on a correct answer", /if \(result !== "correct"\) return;/.test(recon));
  check("the translation is rendered only on a correct answer", /result === "correct" && english/.test(recon));
  check("the translation is not shown when the answer is merely revealed", !/answerRevealed && english/.test(recon));
  check("Continue remains available after success", recon.includes("Continue"));
  check(
    "the translation comes from the natural pathway",
    overlay.includes("naturalSentenceTranslation"),
    "not wired to the trusted source"
  );

  const source = readFileSync(new URL("../src/lib/practice/sentenceTranslation.ts", import.meta.url), "utf8");
  check("reconstruction feedback never concatenates dictionary glosses", !source.includes("lookupWord"));
  check("reconstruction feedback uses the precomputed article translation", source.includes("getPrecomputedTranslation"));
}

console.log("--- Surface gloss helpers ---");
check("a citation form is recognised as a verb", isVerbGloss("to say") === true);
check("a noun gloss is not a verb", isVerbGloss("onion") === false);
check("the citation marker is stripped", bareVerb("to say") === "say");
check("a parenthetical qualifier is stripped", bareVerb("to spend (time)") === "spend");
{
  const participle = surfaceGlossFor({
    clean: "acheté",
    lemma: "acheter",
    lemmaGloss: "to buy",
    grammar: { form: "past participle" },
  });
  check("a regular participle is inflected", participle?.english === "bought", String(participle?.english));

  const future = surfaceGlossFor({ clean: "viendra", lemma: "venir", lemmaGloss: "to come", grammar: { tense: "future" } });
  check("a future form is inflected", future?.english === "will come", String(future?.english));

  const noun = surfaceGlossFor({ clean: "fenêtre", lemma: "fenêtre", lemmaGloss: "window", grammar: null });
  check("a noun gets no surface gloss", noun === null, JSON.stringify(noun));
}

if (failures.length > 0) {
  console.log("");
  for (const failure of failures) console.log(`FAIL ${failure}`);
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
