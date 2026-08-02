// Sweeps the ENTIRE real curriculum corpus (every starter/core/public-domain
// text — ~1440 articles) through the exact synchronous logic a browser runs
// when a learner opens any article's practice page: buildPracticePlan, every
// sentence's paraphrase-eligibility check, and the paraphrase candidate
// picker. This is the class of test that would have caught the blank-screen
// bug (an uncaught throw from some real sentence shape in the corpus,
// triggered inside a synchronous effect) — hand-picking 2-3 articles for
// browser verification, or unit-testing only isolated pure functions with
// synthetic examples, never exercises the full range of real content shapes
// (dialogue, unusual punctuation, proper-noun-heavy sentences, very short/
// long paragraphs, etc.) actually present in the corpus.
//
// Run with:
//   node --import ./scripts/register-alias-loader.mjs scripts/test-practice-corpus-coverage.mjs
import { texts } from "../src/data/texts.ts";
import { buildPracticePlan } from "../src/lib/practice/session.ts";
import { allSentencesInText } from "../src/lib/practice/textSentences.ts";
import { isEligibleForParaphrase, pickParaphraseCandidateSentence } from "../src/lib/practice/paraphrase.ts";
import { isEligibleForReconstruction, buildReconstructionExercise, checkReconstruction } from "../src/lib/practice/sentenceReconstruction.ts";
import { buildWordCloze, buildPhraseCloze, distractorPoolFromBody } from "../src/lib/practice/cloze.ts";

let passed = 0;
let failed = 0;
function check(label, condition, detail = "") {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.log(`FAIL ${label}${detail ? ` - ${detail}` : ""}`);
  }
}

console.log(`--- sweeping ${texts.length} real curriculum texts through the full synchronous practice pipeline ---`);

const throwsByStage = {
  buildPracticePlan: [],
  allSentencesInText: [],
  isEligibleForParaphrase: [],
  pickParaphraseCandidateSentence: [],
  isEligibleForReconstruction: [],
  buildReconstructionExercise: [],
  checkReconstruction: [],
  distractorPoolFromBody: [],
  buildWordCloze: [],
  buildPhraseCloze: [],
};

let plansBuilt = 0;
let sentencesChecked = 0;
let reconstructionExercisesBuilt = 0;
let clozeExercisesBuilt = 0;
let malformedPlans = 0;

for (const text of texts) {
  // Stage 1: exactly what buildPracticePlan(text) does today (reconstruction/cloze, synchronous).
  let plan = null;
  try {
    plan = buildPracticePlan(text);
    plansBuilt++;
  } catch (err) {
    throwsByStage.buildPracticePlan.push({ id: text.id, error: String(err) });
    continue; // Can't proceed to the plan-dependent checks below for this text.
  }

  // Structural sanity on the plan itself — every activity's sentenceIndex
  // must be in range and never repeated (the round-robin builder's `used`
  // set is supposed to guarantee this).
  if (!Array.isArray(plan.activities)) {
    malformedPlans++;
    throwsByStage.buildPracticePlan.push({ id: text.id, error: "activities is not an array" });
  } else {
    const seenIndices = new Set();
    for (const activity of plan.activities) {
      if (!activity || typeof activity.exercise?.sentenceIndex !== "number") {
        malformedPlans++;
        throwsByStage.buildPracticePlan.push({ id: text.id, error: `activity missing a valid sentenceIndex: ${JSON.stringify(activity)}` });
        continue;
      }
      if (seenIndices.has(activity.exercise.sentenceIndex)) {
        malformedPlans++;
        throwsByStage.buildPracticePlan.push({ id: text.id, error: `sentenceIndex ${activity.exercise.sentenceIndex} used by more than one activity` });
      }
      seenIndices.add(activity.exercise.sentenceIndex);
    }
  }

  // Stage 2: exactly what PracticeOverlay's paraphrase effect does — tokenize
  // every sentence, run the eligibility check on each, then pick a candidate
  // from whatever the sync plan already used.
  let sentences = null;
  try {
    sentences = allSentencesInText(text);
  } catch (err) {
    throwsByStage.allSentencesInText.push({ id: text.id, error: String(err) });
    continue;
  }

  for (const sentence of sentences) {
    sentencesChecked++;
    try {
      isEligibleForParaphrase(sentence);
    } catch (err) {
      throwsByStage.isEligibleForParaphrase.push({ id: text.id, sentence: sentence.text, error: String(err) });
    }
  }

  const usedIndices = new Set((plan.activities ?? []).map((a) => a.exercise?.sentenceIndex).filter((i) => typeof i === "number"));
  try {
    pickParaphraseCandidateSentence(sentences, usedIndices);
  } catch (err) {
    throwsByStage.pickParaphraseCandidateSentence.push({ id: text.id, error: String(err) });
  }

  // Stage 3: the reconstruction/cloze generators themselves, run against
  // EVERY sentence (not just the ones buildPracticePlan happened to pick),
  // so an eligibility-check bug that lets through a sentence the builder
  // then can't actually handle gets caught too.
  for (const sentence of sentences) {
    let eligible = false;
    try {
      eligible = isEligibleForReconstruction(sentence);
    } catch (err) {
      throwsByStage.isEligibleForReconstruction.push({ id: text.id, sentence: sentence.text, error: String(err) });
      continue;
    }
    if (eligible) {
      try {
        const exercise = buildReconstructionExercise(sentence);
        reconstructionExercisesBuilt++;
        // The canonical (correct) order must always validate as correct — a
        // reconstruction exercise that can't be solved by its own answer key
        // is exactly as broken as one that throws.
        const correct = checkReconstruction(exercise, exercise.chips.map((c) => c.id));
        if (!correct) {
          throwsByStage.checkReconstruction.push({ id: text.id, sentence: sentence.text, error: "canonical chip order did not validate as correct" });
        }
      } catch (err) {
        throwsByStage.buildReconstructionExercise.push({ id: text.id, sentence: sentence.text, error: String(err) });
      }
    }

    let pool = null;
    try {
      pool = distractorPoolFromBody(text.body, sentence.index, sentences);
    } catch (err) {
      throwsByStage.distractorPoolFromBody.push({ id: text.id, sentence: sentence.text, error: String(err) });
      continue;
    }
    try {
      const wordCloze = buildWordCloze(sentence, pool);
      if (wordCloze) {
        clozeExercisesBuilt++;
        if (!wordCloze.options.includes(wordCloze.answer)) {
          throwsByStage.buildWordCloze.push({ id: text.id, sentence: sentence.text, error: "answer not present in its own options" });
        }
      }
    } catch (err) {
      throwsByStage.buildWordCloze.push({ id: text.id, sentence: sentence.text, error: String(err) });
    }
    try {
      const phraseCloze = buildPhraseCloze(sentence, pool);
      if (phraseCloze) {
        clozeExercisesBuilt++;
        if (!phraseCloze.options.includes(phraseCloze.answer)) {
          throwsByStage.buildPhraseCloze.push({ id: text.id, sentence: sentence.text, error: "answer not present in its own options" });
        }
      }
    } catch (err) {
      throwsByStage.buildPhraseCloze.push({ id: text.id, sentence: sentence.text, error: String(err) });
    }
  }
}

console.log(`Swept ${plansBuilt}/${texts.length} texts through buildPracticePlan without a fatal stop.`);
console.log(`Checked ${sentencesChecked} real sentences through the paraphrase eligibility path.`);
console.log(`Built ${reconstructionExercisesBuilt} reconstruction exercises and ${clozeExercisesBuilt} cloze exercises from real corpus sentences.`);

for (const [stage, throws] of Object.entries(throwsByStage)) {
  check(`${stage}: zero throws/failures across the full corpus`, throws.length === 0, `${throws.length} failure(s) — first: ${JSON.stringify(throws[0])}`);
  if (throws.length > 0) {
    for (const t of throws.slice(0, 10)) console.log(`  - [${stage}] ${t.id}: ${t.error}${t.sentence ? ` (sentence: "${t.sentence}")` : ""}`);
    if (throws.length > 10) console.log(`  ...and ${throws.length - 10} more`);
  }
}

check("every text produced a structurally valid plan (no malformed activities)", malformedPlans === 0, `${malformedPlans} malformed`);
check("the corpus is non-trivially sized (sanity check on the sweep itself)", texts.length > 500, `only ${texts.length} texts — is the corpus import broken?`);
check("at least some sentences were exercised", sentencesChecked > 1000, `only ${sentencesChecked}`);

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
