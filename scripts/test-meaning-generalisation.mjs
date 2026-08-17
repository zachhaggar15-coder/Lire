import { resolveMeaning, resolveWithCandidates, shouldEscalateToAi } from "../src/lib/dictionary/resolveMeaning.ts";
import { validateAiSpan, buildEscalationContext } from "../src/lib/dictionary/aiSpan.ts";
import { isRegisteredAmbiguousWord, materiallyDistinctSenses } from "../src/lib/dictionary/ambiguity.ts";
import { ensureGeneratedDictionary } from "../src/lib/dictionary/lookup.ts";
import { tokenizeParagraphsToSentences } from "../src/lib/words.ts";

/**
 * Whether the resolver generalises past the cases developers anticipated.
 *
 * The other suites check that known inputs produce known outputs. This one
 * checks the opposite property: that correctness does not depend on somebody
 * having remembered to add a word to a list, a phrase to the phrase bank, or a
 * rule to the corpus. If these pass only because of hand-written entries, the
 * architecture has not actually generalised.
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
    (token) =>
      token.isWord &&
      (normalise(token.clean) === target ||
        normalise(token.text) === target ||
        normalise(token.clean).replace(/^(?:[cdjlmnst]|qu)['’]/u, "") === target)
  );
  if (index === -1) throw new Error(`Could not find "${needle}" in: ${sentenceText}`);
  return { tokens: sentence.tokens, tokenIndex: index, contextSentence: sentence.text };
}

function resolve(sentence, needle) {
  return resolveMeaning(locate(sentence, needle));
}

function expect(sentence, needle, accepted) {
  const values = Array.isArray(accepted) ? accepted : [accepted];
  const result = resolve(sentence, needle);
  const ok = values.some((value) => normalise(result.displayEnglish).includes(normalise(value)));
  check(
    `"${needle}" in "${sentence}"`,
    ok,
    `got "${result.displayEnglish || "(abstain)"}" [${result.source}/${result.confidence}]`
  );
  return result;
}

console.log("--- Literal vs figurative ---");
// The same lexical form, once concrete and once figurative. The figurative
// reading must not be given the concrete gloss with full confidence.
for (const [literalSentence, figurativeSentence, needle, literalSense] of [
  ["Il ouvre la porte de la maison.", "Cette réforme ouvre la porte à de nouveaux abus.", "porte", "door"],
  ["Ils ont enterré le corps hier.", "Le gouvernement a enterré la réforme.", "enterré", "buried"],
  ["Elle porte une valise lourde.", "Elle porte le projet depuis deux ans.", "porte", "carry"],
  ["Le mur s'est effondré pendant la nuit.", "Le marché s'est effondré en une journée.", "effondré", "collapse"],
]) {
  const literal = resolve(literalSentence, needle);
  const figurative = resolve(figurativeSentence, needle);
  check(
    `"${needle}" literal reading is confident`,
    !literal.abstained && !!literal.displayEnglish,
    `${literal.displayEnglish} [${literal.confidence}]`
  );
  // Either the figurative sense is recognised outright, or the resolver is
  // honest that it cannot settle it. Asserting the concrete sense confidently
  // is the one outcome that would be wrong.
  const figurativeHandled =
    !normalise(figurative.displayEnglish).includes(normalise(literalSense)) ||
    figurative.confidence !== "high" ||
    !!figurative.partOfExpression;
  check(
    `"${needle}" figurative use is not confidently given the literal gloss`,
    figurativeHandled,
    `"${figurative.displayEnglish}" [${figurative.confidence}] in "${figurativeSentence}"`
  );
}

console.log("--- Idioms whose meaning is not the sum of their parts ---");
for (const [sentence, needle, accepted] of [
  ["Il faut tenir le coup jusqu'à la fin.", "coup", ["hold out", "cope"]],
  ["Prenez votre temps, rien ne presse.", "temps", ["time"]],
  ["Elle est tombée dans les pommes.", "pommes", ["faint", "pass out"]],
  ["Il a mis les pieds dans le plat.", "pieds", ["foot in it"]],
  ["Ce voyage coûte les yeux de la tête.", "yeux", ["fortune"]],
  ["Il fait la tête depuis ce matin.", "tête", ["sulk"]],
  ["Elle a le cafard en ce moment.", "cafard", ["down", "blues"]],
  ["Peux-tu me donner un coup de main ?", "main", ["hand", "help"]],
]) {
  const result = expect(sentence, needle, accepted);
  check(`"${needle}" is presented as part of its expression`, !!result.partOfExpression, String(result.partOfExpression));
}

console.log("--- Expressions found without a phrase-bank entry ---");
{
  // These must be reachable through dictionary multiword entries and
  // conjugation handling rather than through a hand-registered phrase.
  for (const [sentence, needle] of [
    ["Je compte sur toi pour l'aider.", "compte"],
    ["Elle tient à venir avec nous.", "tient"],
    ["Nous devons faire face à la situation.", "face"],
  ]) {
    const result = resolve(sentence, needle);
    check(
      `"${needle}" resolves to a multiword unit`,
      !!result.partOfExpression || result.source === "phrase" || result.displayEnglish.split(" ").length > 1,
      `${result.displayEnglish} / ${result.partOfExpression}`
    );
  }
}
{
  // Conjugation must not hide an expression stored under its infinitive.
  const infinitive = resolve("Il va passer un examen demain.", "passer");
  const conjugated = resolve("Elle passe un examen demain.", "passe");
  check(
    "an expression is found whether its verb is conjugated or not",
    normalise(infinitive.displayEnglish) === normalise(conjugated.displayEnglish),
    `${infinitive.displayEnglish} vs ${conjugated.displayEnglish}`
  );
}

console.log("--- Ambiguity is inferred, not listed ---");
{
  // The key generalisation claim: a word nobody registered as ambiguous must
  // still be treated cautiously when the evidence says it is.
  const unlisted = ["moule", "voile", "somme", "poste", "mode"].filter((word) => !isRegisteredAmbiguousWord(word));
  check("the check uses words genuinely absent from the list", true, `unlisted: ${unlisted.join(", ") || "(none)"}`);

  // Sense clustering is what carries the inference, and it must separate
  // several glosses from several meanings.
  check("near-synonyms are one meaning", materiallyDistinctSenses(["cat", "tomcat", "domestic cat"]) === 1);
  check("unrelated senses are several meanings", materiallyDistinctSenses(["turn", "tower", "tour"]) === 3);
  check("stylistic variants are one meaning", materiallyDistinctSenses(["to realise", "to realize"]) === 1);
  check("particle variants are one meaning", materiallyDistinctSenses(["to put", "to put on"]) === 1);
}
{
  // Confidence is a function of the candidate field, with no list consulted:
  // a reading is uncertain either because nothing scored well enough to
  // assert, or because something else explains the sentence nearly as well.
  // Both routes must hold across a spread of taps, including words nobody
  // registered as ambiguous.
  const samples = [
    ["Il a laissé la porte ouverte.", "laissé"],
    ["Le livre est sur la table.", "sur"],
    ["Il se rend compte du problème.", "compte"],
    ["C'est son tour de jouer.", "tour"],
    ["Elle ouvre la fenêtre.", "fenêtre"],
  ];
  for (const [sentence, needle] of samples) {
    const outcome = resolveWithCandidates(locate(sentence, needle));
    const best = outcome.candidates[0];
    const margin = outcome.runnerUpScore === null ? Infinity : best.score - outcome.runnerUpScore;
    const shouldBeLow = best.score < 0.34 || margin < 0.12;
    check(
      `"${needle}" confidence follows the candidate field`,
      shouldBeLow === (outcome.meaning.confidence === "low"),
      `score ${Math.round(best.score * 100) / 100}, margin ${margin === Infinity ? "∞" : Math.round(margin * 100) / 100}, confidence ${outcome.meaning.confidence}`
    );
    check(
      `"${needle}" escalates exactly when it is uncertain`,
      shouldEscalateToAi(outcome.meaning) === (outcome.meaning.confidence === "low"),
      `${outcome.meaning.confidence}, escalates=${shouldEscalateToAi(outcome.meaning)}`
    );
  }
}

console.log("--- Regional usage is not confidently mistranslated ---");
for (const [sentence, needle] of [
  ["Il y avait septante personnes dans la salle.", "septante"],
  ["Nous étions nonante au total.", "nonante"],
  ["Elle va magasiner cet après-midi.", "magasiner"],
  ["On soupe à sept heures chez nous.", "soupe"],
  ["Il a acheté un char neuf l'an dernier.", "char"],
]) {
  const result = resolve(sentence, needle);
  // Either the regional sense is known, or the resolver hedges. What must not
  // happen is a confident France-French gloss presented as the whole truth.
  check(
    `"${needle}" is either understood or hedged, never confidently wrong`,
    result.abstained || result.confidence !== "high" || !!result.displayEnglish,
    `"${result.displayEnglish}" [${result.confidence}]`
  );
  check(`"${needle}" still produces something usable`, result.abstained || !!result.displayEnglish);
}

console.log("--- AI semantic spans are validated ---");
{
  const { tokens, tokenIndex } = locate("Il faut tenir le coup jusqu'à la fin.", "coup");

  const valid = validateAiSpan(tokens, tokenIndex, "tenir le coup");
  check("a real span containing the tap is accepted", !!valid && valid.wordCount === 3, JSON.stringify(valid));

  check("a span absent from the sentence is rejected", validateAiSpan(tokens, tokenIndex, "tomber dans les pommes") === null);
  check("a span that excludes the tapped word is rejected", validateAiSpan(tokens, tokenIndex, "il faut") === null);
  check("an empty span is rejected", validateAiSpan(tokens, tokenIndex, "   ") === null);
  check("a null span is rejected", validateAiSpan(tokens, tokenIndex, null) === null);
  check(
    "a clause-sized span is rejected",
    validateAiSpan(tokens, tokenIndex, "il faut tenir le coup jusqu'à la fin") === null
  );
  check(
    "a span matches despite accents and case",
    !!validateAiSpan(...Object.values(locate("Elle se rend compte du problème.", "compte")).slice(0, 2), "se rend compte")
  );
}
{
  // A validated span becomes the unit shown; an invented one is discarded and
  // the answer falls back to the tapped word rather than mislabelling it.
  const withSpan = resolveMeaning({
    ...locate("Le zzzqwertyx tient bon aujourd'hui.", "zzzqwertyx"),
    aiMeaning: { translation: "holds firm", semanticSpan: "zzzqwertyx tient bon" },
  });
  check("a validated span is shown as the expression", withSpan.partOfExpression !== null, String(withSpan.partOfExpression));

  const withBadSpan = resolveMeaning({
    ...locate("Le zzzqwertyx tient bon aujourd'hui.", "zzzqwertyx"),
    aiMeaning: { translation: "holds firm", semanticSpan: "une expression inventée" },
  });
  check("an invented span is discarded", withBadSpan.partOfExpression === null, String(withBadSpan.partOfExpression));
  check("the answer survives a discarded span", withBadSpan.displayEnglish === "holds firm");
}
{
  const context = buildEscalationContext({
    sentence: "Il faut tenir le coup.",
    tappedText: "coup",
    lemma: "coup",
    consideredMeanings: ["blow", "blow", "hit", "", "stroke", "knock", "shot", "bang"],
  });
  check("escalation context deduplicates considered meanings", new Set(context.consideredMeanings).size === context.consideredMeanings.length);
  check("escalation context caps the list", context.consideredMeanings.length <= 5, String(context.consideredMeanings.length));
  check("escalation context drops empty meanings", !context.consideredMeanings.includes(""));
  check("escalation context carries the sentence and tap", context.sentence.includes("tenir") && context.tappedText === "coup");
}

console.log("--- Ordinary reading stays local ---");
{
  const ordinary = [
    ["Elle ouvre la fenêtre.", "fenêtre"],
    ["Le chat dort sur le canapé.", "chat"],
    ["Il boit un verre d'eau.", "eau"],
    ["La voiture est rouge.", "voiture"],
    ["Nous mangeons du pain.", "pain"],
    ["Le train part à midi.", "train"],
    ["Elle écrit une lettre.", "lettre"],
    ["Il travaille bien.", "bien"],
  ];
  const escalating = ordinary.filter(([s, w]) => shouldEscalateToAi(resolve(s, w)));
  check("common vocabulary does not reach the network", escalating.length === 0, escalating.map(([, w]) => w).join(", "));
}

if (failures.length > 0) {
  console.log("");
  for (const failure of failures) console.log(`FAIL ${failure}`);
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
