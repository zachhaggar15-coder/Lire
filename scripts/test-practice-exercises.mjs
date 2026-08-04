// Tests for the "Practice this text" feature: sentence reconstruction,
// cloze generation, grammar notes, and the lookup-rate calculation.
// Run via `node --import ./scripts/register-alias-loader.mjs scripts/test-practice-exercises.mjs`.

import assert from "node:assert/strict";
import {
  buildReconstructionChips,
  isEligibleForReconstruction,
  buildReconstructionExercise,
  checkReconstruction,
  shuffleChips,
} from "../src/lib/practice/sentenceReconstruction.ts";
import { buildWordCloze, buildPhraseCloze, distractorPoolFromBody } from "../src/lib/practice/cloze.ts";
import { buildGrammarNotes } from "../src/lib/practice/grammarNotes.ts";
import { lookupRatePer100Words } from "../src/lib/practice/lookupStats.ts";
import { allSentencesInText } from "../src/lib/practice/textSentences.ts";
import { tokenizeParagraphsToSentences } from "../src/lib/words.ts";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`OK ${name}`);
    passed += 1;
  } catch (err) {
    console.log(`FAIL ${name}`);
    console.log(`  ${err instanceof Error ? err.message : err}`);
    failed += 1;
  }
}

function sentenceFromText(text, index = 0) {
  const flat = tokenizeParagraphsToSentences(text).flat();
  const s = flat[index];
  return { index, text: s.text, tokens: s.tokens };
}

console.log("\n--- Sentence chip-building attaches punctuation and keeps elisions intact ---");

test("elided words stay one chip (j'habite, c'est)", () => {
  const chips = buildReconstructionChips("J'habite ici et c'est calme.");
  const displays = chips.map((c) => c.display);
  assert.ok(displays.some((d) => d.toLowerCase().startsWith("j'habite")), `expected an elided chip, got ${JSON.stringify(displays)}`);
  assert.ok(displays.some((d) => d.toLowerCase().startsWith("c'est")), `expected an elided chip, got ${JSON.stringify(displays)}`);
});

test("a lone punctuation piece attaches to the previous chip, not its own chip", () => {
  const chips = buildReconstructionChips('Il a dit : « Bonjour » et il est parti.');
  for (const chip of chips) {
    assert.ok(/[\p{L}\p{N}]/u.test(chip.display), `chip "${chip.display}" has no letters/digits — should have been folded`);
  }
});

test("duplicate visible chips get distinct stable ids", () => {
  const chips = buildReconstructionChips("Le chat regarde le chien dans le jardin.");
  const ids = chips.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, "chip ids must be unique even when display text repeats");
});

test("the final word chip does not include the sentence full stop", () => {
  const chips = buildReconstructionChips("Il se sent très fatigué.");
  assert.equal(chips.at(-1)?.display, "fatigué");
});

test("the displayed reconstruction answer does not include the sentence full stop", () => {
  const exercise = buildReconstructionExercise(sentenceFromText("Il se sent très fatigué aujourd'hui."));
  assert.equal(exercise.canonicalText, "Il se sent très fatigué aujourd'hui");
  const question = buildReconstructionExercise(sentenceFromText("Est-ce que tu viens avec nous ?"));
  assert.equal(question.canonicalText, "Est-ce que tu viens avec nous ?", "question marks should remain");
});

console.log("\n--- Sentence eligibility filter ---");

test("a well-formed 6-8 word sentence is eligible", () => {
  const s = sentenceFromText("Léa se lève à sept heures ce matin.");
  assert.equal(isEligibleForReconstruction(s), true);
});

test("a very short fragment is not eligible", () => {
  const s = sentenceFromText("Il pleut.");
  assert.equal(isEligibleForReconstruction(s), false);
});

test("a sentence dominated by numbers is not eligible", () => {
  const s = sentenceFromText("Il y a 12 34 56 78 90 chats là-bas.");
  assert.equal(isEligibleForReconstruction(s), false);
});

test("a sentence with three-plus repeats of the same word is not eligible", () => {
  const s = sentenceFromText("Le chat, le chat et le chat dorment ensemble toujours.");
  assert.equal(isEligibleForReconstruction(s), false);
});

console.log("\n--- Shuffle and validation ---");

test("shuffle changes the order for 2+ chips", () => {
  const exercise = buildReconstructionExercise(sentenceFromText("Léa se lève à sept heures ce matin."));
  const shuffled = shuffleChips(exercise.chips);
  const sameOrder = shuffled.every((c, i) => c.id === exercise.chips[i].id);
  assert.equal(sameOrder, false, "shuffle should reorder a 7+ chip sentence");
});

test("shuffle is not just the original sentence backwards", () => {
  const exercise = buildReconstructionExercise(sentenceFromText("Léa se lève à sept heures ce matin."));
  for (let attempt = 0; attempt < 20; attempt++) {
    const shuffled = shuffleChips(exercise.chips);
    const reversed = shuffled.every((chip, index) => chip.id === exercise.chips[exercise.chips.length - 1 - index].id);
    assert.equal(reversed, false, `shuffle ${attempt + 1} was a simple reversal`);
  }
});

test("correct order validates as correct", () => {
  const exercise = buildReconstructionExercise(sentenceFromText("Léa se lève à sept heures ce matin."));
  const ok = checkReconstruction(exercise, exercise.chips.map((c) => c.id));
  assert.equal(ok, true);
});

test("wrong order is rejected", () => {
  const exercise = buildReconstructionExercise(sentenceFromText("Léa se lève à sept heures ce matin."));
  const reversed = [...exercise.chips].reverse().map((c) => c.id);
  const ok = checkReconstruction(exercise, reversed);
  assert.equal(ok, false);
});

test("punctuation spacing differences don't break a correct answer", () => {
  const exercise = buildReconstructionExercise(sentenceFromText("Ça va bien, merci beaucoup !"));
  const ok = checkReconstruction(exercise, exercise.chips.map((c) => c.id));
  assert.equal(ok, true);
});

test("removing a final full stop preserves an ellipsis inside closing dialogue punctuation", () => {
  const exercise = buildReconstructionExercise(sentenceFromText("La première ramène à soi : « Ah, moi aussi, la dernière fois... »."));
  assert.ok(exercise.chips.some((chip) => chip.display.includes("...")), "the meaningful ellipsis should remain visible");
  assert.equal(checkReconstruction(exercise, exercise.chips.map((chip) => chip.id)), true);
});

console.log("\n--- Cloze exercises ---");

const clozeArticleBody = "Léa habite dans une grande maison avec ses parents.\n\nElle aime beaucoup lire des histoires le soir avant de dormir.";
const clozeSentences = allSentencesInText({ body: clozeArticleBody });

test("word cloze blanks a real content word and offers the correct answer among options", () => {
  const sentence = clozeSentences[0];
  const pool = distractorPoolFromBody(clozeArticleBody, sentence.index, clozeSentences);
  const exercise = buildWordCloze(sentence, pool);
  assert.ok(exercise, "expected a word cloze to be generated");
  assert.ok(exercise.prompt.includes("___"), "prompt should contain a blank");
  assert.ok(exercise.options.includes(exercise.answer), "options must include the correct answer");
  assert.ok(exercise.options.length >= 2, "should have at least 2 options");
  assert.equal(new Set(exercise.options.map((o) => o.toLowerCase())).size, exercise.options.length, "no duplicate options");
});

test("phrase cloze blanks a two-word span and preserves surrounding text", () => {
  const sentence = clozeSentences[1];
  const pool = distractorPoolFromBody(clozeArticleBody, sentence.index, clozeSentences);
  const exercise = buildPhraseCloze(sentence, pool);
  assert.ok(exercise, "expected a phrase cloze to be generated");
  assert.ok(exercise.answer.trim().split(/\s+/).length >= 1, "answer should be a real span");
  assert.ok(exercise.prompt.includes("___"));
});

test("cloze on a very short sentence with no eligible words returns null rather than crashing", () => {
  const s = sentenceFromText("Il va.");
  const result = buildWordCloze(s, []);
  assert.equal(result, null);
});

test("distractor pool falls back to whole-body tokens for a very short article", () => {
  const shortBody = "Il fait beau.";
  const sentences = allSentencesInText({ body: shortBody });
  const pool = distractorPoolFromBody(shortBody, -1, sentences);
  assert.ok(Array.isArray(pool));
});

console.log("\n--- Grammar notes ---");

test("detects an indirect question with si, grounded in the real sentence", () => {
  const notes = buildGrammarNotes(allSentencesInText({ body: "On me demande souvent si j'aime ça." }));
  const note = notes.find((n) => n.title === "Indirect question with si");
  assert.ok(note, "expected the si-question rule to fire");
  assert.ok(note.sourceSentence.includes(note.highlight), "highlighted span must exist in the source sentence");
});

test("detects a reflexive verb construction", () => {
  const notes = buildGrammarNotes(allSentencesInText({ body: "Elle se lève tôt tous les matins pour aller courir." }));
  assert.ok(notes.some((n) => n.title === "Reflexive verb"));
});

test("returns no notes, not a crash, for text with no matching constructions", () => {
  const notes = buildGrammarNotes(allSentencesInText({ body: "Chat. Chien. Table." }));
  assert.deepEqual(notes, []);
});

test("never returns more notes than the requested limit", () => {
  const body =
    "On me demande si j'aime ça. Il faut que tu viennes. Elle se lave. Il est allé. C'est plus grand que ça. Je vais manger.";
  const notes = buildGrammarNotes(allSentencesInText({ body }), 2);
  assert.ok(notes.length <= 2);
});

console.log("\n--- Lookup rate calculation ---");

test("basic rate calculation", () => {
  assert.equal(lookupRatePer100Words(5, 100), 5);
  assert.equal(lookupRatePer100Words(3, 50), 6);
});

test("division by zero is guarded", () => {
  assert.equal(lookupRatePer100Words(4, 0), 0);
});

test("rounds to one decimal place", () => {
  assert.equal(lookupRatePer100Words(1, 3), 33.3);
});

test("zero lookups on a real text gives zero rate", () => {
  assert.equal(lookupRatePer100Words(0, 200), 0);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
