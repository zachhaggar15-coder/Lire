// Logic tests for paraphrase.ts — eligibility, candidate selection, and the
// generation/validation/fallback contract (a failed or invalid generation
// must return null, never throw, and must never poison the cache). Run:
//   node --import ./scripts/register-alias-loader.mjs scripts/test-paraphrase-fallback.mjs
const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
  dispatchEvent: () => true,
};

import {
  buildParaphraseExercise,
  isEligibleForParaphrase,
  pickParaphraseCandidateSentence,
} from "../src/lib/practice/paraphrase.ts";

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

function sentence(index, text) {
  return { index, text, tokens: [] };
}

console.log("--- isEligibleForParaphrase ---");
check(
  "a real, moderate-length sentence is eligible",
  isEligibleForParaphrase(sentence(0, "Elle s'est réveillée tard ce matin-là à cause de la tempête."))
);
check("a too-short fragment is not eligible", !isEligibleForParaphrase(sentence(0, "Elle dort.")));
check(
  "an excessively long sentence is not eligible",
  !isEligibleForParaphrase(
    sentence(
      0,
      "Elle s'est réveillée tard ce matin-là, à cause de la tempête qui avait fait rage toute la nuit, si bien qu'elle a dû se dépêcher pour attraper le train, ce qui ne lui était jamais arrivé auparavant durant toute cette longue et difficile année scolaire."
    )
  )
);
check(
  "a name-heavy sentence is not eligible",
  !isEligibleForParaphrase(sentence(0, "Marie, Jean, Paul et Sophie sont allés à Paris avec Antoine et Claire."))
);
check("a fragment not starting like a sentence is not eligible", !isEligibleForParaphrase(sentence(0, "tard ce matin-là à cause de la tempête.")));

console.log("--- pickParaphraseCandidateSentence ---");
{
  const sentences = [
    sentence(0, "Elle s'est réveillée tard ce matin-là à cause de la tempête."),
    sentence(1, "Il fait beau."),
    sentence(2, "Le chat dort sur le canapé du salon depuis ce matin."),
  ];
  const picked = pickParaphraseCandidateSentence(sentences, new Set());
  check("picks an eligible sentence when available", picked !== null && isEligibleForParaphrase(picked));
  const noneLeft = pickParaphraseCandidateSentence(sentences, new Set([0, 2]));
  check("returns null once all eligible sentences are already used", noneLeft === null, JSON.stringify(noneLeft));
  const noneEligible = pickParaphraseCandidateSentence([sentence(0, "Il fait beau.")], new Set());
  check("returns null when nothing in the text is eligible", noneEligible === null);
}

console.log("--- generation/validation/fallback contract ---");
{
  const originalFetch = globalThis.fetch;
  let callCount = 0;
  globalThis.fetch = async () => {
    callCount++;
    return { ok: false };
  };
  const result = await buildParaphraseExercise(sentence(0, "Elle s'est réveillée tard ce matin-là à cause de la tempête."), null, "B1 French learner");
  check("a failed HTTP response resolves to null, not a throw", result === null);
  check("a failed generation retries exactly once (2 total attempts)", callCount === 2, `callCount=${callCount}`);
  globalThis.fetch = originalFetch;
}
{
  let callCount = 0;
  globalThis.fetch = async () => {
    callCount++;
    // Structurally present but semantically invalid (only 1 option) — the
    // API route's own shape assertion would normally catch this, but the
    // client-side validation must independently reject it too.
    return { ok: true, json: async () => ({ options: [{ text: "Only one option here somehow.", isCorrect: true, distinction: null, feedback: "" }] }) };
  };
  const result = await buildParaphraseExercise(sentence(1, "Le chat dort sur le canapé du salon depuis ce matin."), null, "B1 French learner");
  check("an invalid (wrong option count) result resolves to null, not a throw", result === null);
  check("invalid output is retried once, same as a hard failure", callCount === 2, `callCount=${callCount}`);
  check("an invalid result is never cached (next call still hits the network)", store.size === 0 || [...store.keys()].every((k) => !k.includes("paraphrase")));
}
{
  globalThis.fetch = async () => {
    throw new Error("network unreachable");
  };
  let threw = false;
  let result = null;
  try {
    result = await buildParaphraseExercise(sentence(2, "Il neige beaucoup cette année dans les montagnes du nord."), "Test article", "B1 French learner");
  } catch {
    threw = true;
  }
  check("a network error never throws out of buildParaphraseExercise", !threw);
  check("a network error resolves to null", result === null);
}
{
  const validOptions = [
    { text: "Elle s'est levée tard ce jour-là en raison du mauvais temps.", isCorrect: true, distinction: null, feedback: "" },
    { text: "Il s'est réveillé tard ce matin-là à cause de la tempête.", isCorrect: false, distinction: "reversed-agent", feedback: "The subject changes." },
    { text: "Elle s'est réveillée tôt ce matin-là malgré la tempête.", isCorrect: false, distinction: "changed-time", feedback: "Early vs late is reversed." },
  ];
  let callCount = 0;
  globalThis.fetch = async () => {
    callCount++;
    return { ok: true, json: async () => ({ options: validOptions }) };
  };
  const target = sentence(3, "Elle s'est réveillée tard ce matin-là à cause de la tempête.");
  const first = await buildParaphraseExercise(target, null, "B1 French learner");
  check("a valid result produces exactly 3 options", first?.options?.length === 3, JSON.stringify(first));
  check("exactly one option is marked correct", first?.options?.filter((o) => o.isCorrect).length === 1);
  const second = await buildParaphraseExercise(target, null, "B1 French learner");
  check("a second call for the same sentence is served from cache (no extra fetch)", callCount === 1, `callCount=${callCount}`);
  check("cached result still has exactly 3 options", second?.options?.length === 3);
}

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
