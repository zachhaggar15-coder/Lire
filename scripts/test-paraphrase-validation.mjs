// Logic tests for paraphraseValidation.ts — the gate that decides whether a
// generated paraphrase set is ever shown to a learner. Run with:
//   node --import ./scripts/register-alias-loader.mjs scripts/test-paraphrase-validation.mjs
import { validateParaphraseSet } from "../src/lib/practice/paraphraseValidation.ts";

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

const SOURCE = "Elle s'est réveillée tard ce matin-là à cause de la tempête.";

function goodOptions() {
  return [
    { text: "Elle s'est levée tard ce jour-là en raison du mauvais temps.", isCorrect: true, distinction: null, feedback: "" },
    {
      text: "Il s'est réveillé tard ce matin-là à cause de la tempête.",
      isCorrect: false,
      distinction: "reversed-agent",
      feedback: "The subject changes from 'she' to 'he'.",
    },
    {
      text: "Elle s'est réveillée tôt ce matin-là malgré la tempête.",
      isCorrect: false,
      distinction: "changed-time",
      feedback: "'Tôt' (early) reverses the original 'tard' (late).",
    },
  ];
}

console.log("--- exactly one correct answer enforced ---");
check("a valid set with exactly one correct option passes", validateParaphraseSet(SOURCE, goodOptions()).ok === true);
{
  const zeroCorrect = goodOptions().map((o) => ({ ...o, isCorrect: false }));
  const result = validateParaphraseSet(SOURCE, zeroCorrect);
  check("zero correct options is rejected", result.ok === false, JSON.stringify(result));
}
{
  const twoCorrect = goodOptions();
  twoCorrect[1] = { ...twoCorrect[1], isCorrect: true };
  const result = validateParaphraseSet(SOURCE, twoCorrect);
  check("two correct options is rejected", result.ok === false, JSON.stringify(result));
}

console.log("--- structural requirements ---");
check("wrong option count (2) is rejected", validateParaphraseSet(SOURCE, goodOptions().slice(0, 2)).ok === false);
check("wrong option count (4) is rejected", validateParaphraseSet(SOURCE, [...goodOptions(), goodOptions()[1]]).ok === false);
{
  const missingDistinction = goodOptions();
  missingDistinction[1] = { ...missingDistinction[1], distinction: null };
  const result = validateParaphraseSet(SOURCE, missingDistinction);
  check("incorrect option missing a distinction reason is rejected", result.ok === false, JSON.stringify(result));
}
{
  const missingFeedback = goodOptions();
  missingFeedback[1] = { ...missingFeedback[1], feedback: "" };
  const result = validateParaphraseSet(SOURCE, missingFeedback);
  check("incorrect option missing feedback is rejected", result.ok === false, JSON.stringify(result));
}

console.log("--- duplicate / near-identical detection ---");
{
  const duplicated = goodOptions();
  duplicated[1] = { ...duplicated[1], text: duplicated[0].text };
  const result = validateParaphraseSet(SOURCE, duplicated);
  check("two identical option texts are rejected", result.ok === false, JSON.stringify(result));
}
{
  const nearDuplicate = goodOptions();
  nearDuplicate[1] = { ...nearDuplicate[1], text: nearDuplicate[0].text + "." };
  const result = validateParaphraseSet(SOURCE, nearDuplicate);
  check("near-identical option texts are rejected", result.ok === false, JSON.stringify(result));
}

console.log("--- correct answer too close to the source sentence ---");
{
  const echoesSource = goodOptions();
  echoesSource[0] = { ...echoesSource[0], text: SOURCE };
  const result = validateParaphraseSet(SOURCE, echoesSource);
  check("correct option identical to the source sentence is rejected", result.ok === false, JSON.stringify(result));
}

console.log("--- degenerate short options ---");
{
  const tooShort = goodOptions();
  tooShort[0] = { ...tooShort[0], text: "Oui." };
  const result = validateParaphraseSet(SOURCE, tooShort);
  check("a too-short option is rejected", result.ok === false, JSON.stringify(result));
}

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
