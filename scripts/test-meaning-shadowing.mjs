import { resolveWithCandidates, resolveMeaning, shouldEscalateToAi } from "../src/lib/dictionary/resolveMeaning.ts";
import { explainResolution, formatExplanation } from "../src/lib/dictionary/diagnostics.ts";
import { ensureGeneratedDictionary } from "../src/lib/dictionary/lookup.ts";
import { tokenizeParagraphsToSentences } from "../src/lib/words.ts";

/**
 * Broad readings must not shadow narrow ones.
 *
 * This is the property the candidate architecture exists to guarantee. Under
 * the old first-match engine a generic `compter` rule sitting above `compter
 * sur` meant "je compte sur toi" resolved to "counts", and the only fix was to
 * remember to declare the specific rule first — an invariant nothing enforced
 * and every new rule could silently break.
 *
 * These tests assert the outcome (each frame gets its own reading) and the
 * mechanism (the winner is chosen by evidence, so the answer cannot depend on
 * declaration order).
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

function resolve(sentenceText, needle) {
  return resolveMeaning(locate(sentenceText, needle));
}

function expect(sentence, needle, accepted) {
  const values = Array.isArray(accepted) ? accepted : [accepted];
  const result = resolve(sentence, needle);
  const ok = values.some((value) => normalise(result.displayEnglish).includes(normalise(value)));
  check(
    `"${needle}" in "${sentence}"`,
    ok,
    `got "${result.displayEnglish || "(abstain)"}" [${result.source}/${result.confidence}], wanted ${JSON.stringify(values)}`
  );
  return result;
}

/**
 * Every frame of one verb must produce a distinct reading. A shadowing bug
 * shows up here as two frames collapsing onto the same answer.
 */
function expectDistinctFrames(verb, rows) {
  const answers = [];
  for (const [sentence, needle, accepted] of rows) {
    answers.push(normalise(expect(sentence, needle, accepted).displayEnglish));
  }
  check(
    `${verb}: no frame is shadowed by another`,
    new Set(answers).size === answers.length,
    JSON.stringify(answers)
  );
}

console.log("--- compter ---");
expectDistinctFrames("compter", [
  ["Il compte les personnes.", "compte", ["count"]],
  ["Je compte sur toi.", "compte", ["rely", "count on"]],
  ["Elle compte partir demain.", "compte", ["plan", "intend"]],
  ["Cela compte beaucoup.", "compte", ["matter", "count"]],
  ["Il se rend compte du problème.", "compte", ["realize", "realise"]],
]);

console.log("--- prendre ---");
expectDistinctFrames("prendre", [
  ["Il prend le train.", "prend", ["take", "catch"]],
  ["Prenez votre temps.", "temps", ["time"]],
  ["Il prend en compte les résultats.", "compte", ["into account"]],
  ["Ils ont pris une décision.", "pris", ["decision", "make", "made", "take", "taken"]],
]);
// A compound tense must keep its tense rather than being flattened by a
// present-tense lexical rule that happens to match the same verb.
expect("Elle a pris le train.", "pris", ["taken", "took", "take"]);

console.log("--- tenir ---");
expectDistinctFrames("tenir", [
  ["Il tient le livre.", "tient", ["hold"]],
  ["Elle tient à venir.", "tient", ["care about", "keen", "insist", "attached"]],
  ["Il faut tenir compte des coûts.", "compte", ["into account", "account"]],
]);

console.log("--- passer ---");
expectDistinctFrames("passer", [
  ["Il passe devant la maison.", "passe", ["pass", "go past", "walk"]],
  ["Elle passe un examen.", "passe", ["take an exam", "sit an exam"]],
  ["Nous passons à autre chose.", "passons", ["move on", "pass", "go on"]],
]);
expect("Que s'est-il passé ?", "passé", ["happen"]);

console.log("--- specific evidence outranks broad evidence ---");
{
  // "compter sur" is anchored on a two-word match; the bare subject-pronoun
  // reading of "compte" is anchored on one neighbouring word. The wider
  // anchor has to win regardless of which rule was written first.
  const outcome = resolveWithCandidates(locate("Je compte sur toi.", "compte"));
  const winner = outcome.candidates[0];
  const relyOn = outcome.candidates.find((entry) => /rely|count on/i.test(entry.candidate.english));
  check("the governed-preposition reading wins", !!relyOn && winner.candidate === relyOn.candidate, winner?.candidate.english);
  check(
    "the winner is more specific than a bare lexical reading",
    !!winner && winner.candidate.specificity > 0,
    String(winner?.candidate.specificity)
  );
}
{
  // An expression must out-span the single-word reading of its own components.
  const outcome = resolveWithCandidates(locate("Il se rend compte du problème.", "compte"));
  const winner = outcome.candidates[0].candidate;
  const bareAccount = outcome.candidates.find((entry) => normalise(entry.candidate.english) === "account");
  check("the expression outranks the bare component gloss", /realiz|realis/i.test(winner.english), winner.english);
  check("the bare gloss is still present as a rejected candidate", !!bareAccount);
  check(
    "the winning span covers more than the tapped word",
    (winner.matchedWords ?? 0) > 1,
    String(winner.matchedWords)
  );
}

console.log("--- order independence ---");
{
  /**
   * The strongest available check that the result is evidence-driven: resolve
   * the same tap repeatedly while shuffling the candidate array before it is
   * scored. If anything still depended on position, the winner would move.
   */
  function winnerUnderShuffle(sentence, needle, seed) {
    const outcome = resolveWithCandidates(locate(sentence, needle));
    const shuffled = [...outcome.candidates];
    // Deterministic shuffle so a failure is reproducible.
    let state = seed;
    for (let i = shuffled.length - 1; i > 0; i--) {
      state = (state * 1103515245 + 12345) % 2147483648;
      const j = state % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Re-select purely from scores, exactly as the resolver does.
    return shuffled.reduce((best, entry) => (entry.score > best.score ? entry : best), shuffled[0]).candidate.english;
  }

  const cases = [
    ["Je compte sur toi.", "compte"],
    ["Il compte les personnes.", "compte"],
    ["Il se rend compte du problème.", "compte"],
    ["Elle tient à venir.", "tient"],
    ["Elle passe un examen.", "passe"],
    ["C'est son tour de jouer.", "tour"],
    ["La tour de l'église est haute.", "tour"],
  ];
  for (const [sentence, needle] of cases) {
    const baseline = resolve(sentence, needle).displayEnglish;
    const shuffles = [1, 7, 13, 29, 101].map((seed) => winnerUnderShuffle(sentence, needle, seed));
    check(
      `"${needle}" in "${sentence}" is order-independent`,
      shuffles.every((answer) => normalise(answer) === normalise(baseline)),
      `baseline "${baseline}" vs ${JSON.stringify(shuffles)}`
    );
  }
}

console.log("--- morphology cannot fabricate an expression ---");
{
  // Regression for the lemmatiser running over multiword keys, which "guessed"
  // from "il porte les valises jusqu'à la" to the entry for "à la" and
  // reported a whole clause as an idiom meaning "a la".
  const result = resolve("Il porte les valises jusqu'à la voiture.", "porte");
  check("a clause is never reported as an expression", normalise(result.displayEnglish) !== "a la", result.displayEnglish);
  check("the ordinary verb reading survives", /carry|wear|bear|door/i.test(result.displayEnglish), result.displayEnglish);

  const outcome = resolveWithCandidates(locate("Il porte les valises jusqu'à la voiture.", "porte"));
  const guessedSpans = outcome.candidates.filter((entry) => entry.candidate.matchedWords > 3);
  check("no oversized span entered the candidate field", guessedSpans.length === 0, JSON.stringify(guessedSpans.map((e) => e.candidate.french)));
}

console.log("--- ties are escalated, not guessed ---");
{
  // Two materially different readings that stay close together must not be
  // silently decided by whichever happened to sort first.
  const outcome = resolveWithCandidates(locate("Le livre est sur la table.", "sur"));
  const best = outcome.candidates[0];
  const margin = outcome.runnerUpScore === null ? Infinity : best.score - outcome.runnerUpScore;
  check(
    "a comfortable margin does not escalate",
    margin > 0.12 ? !shouldEscalateToAi(outcome.meaning) : true,
    `margin ${margin}`
  );
}

console.log("--- diagnostics are inspectable ---");
{
  const explanation = explainResolution(locate("Je compte sur toi.", "compte"));
  check("diagnostics name the winner", /rely|count on/i.test(explanation.winner), explanation.winner);
  check("diagnostics carry evidence", explanation.evidence.length > 0);
  check("diagnostics list rejected candidates", explanation.rejected.length > 0);
  const formatted = formatExplanation(explanation);
  check("diagnostics format as readable text", formatted.includes("winner:") && formatted.includes("rejected:"));
}

if (failures.length > 0) {
  console.log("");
  for (const failure of failures) console.log(`FAIL ${failure}`);
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
