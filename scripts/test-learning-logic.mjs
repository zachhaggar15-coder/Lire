// Focused logic tests for the learning layer. Run with:
//   node scripts/test-learning-logic.mjs
import { guessLemmas } from "../src/lib/dictionary/lemmatize.ts";
import {
  buildReviewQueue,
  computeNextSchedule,
  getReviewStats,
} from "../src/lib/spacedRepetition.ts";

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

function word(overrides) {
  return {
    word: "base",
    lemma: null,
    translations: ["base"],
    primaryTranslation: "base",
    partOfSpeech: null,
    gender: null,
    cefr: null,
    frequencyRank: null,
    articleContextSentence: "",
    exampleSentenceFr: "",
    exampleSentenceEn: "",
    sourceTextTitle: "",
    savedAt: "2026-07-01T09:00:00.000Z",
    reviewCount: 0,
    lastReviewedAt: null,
    status: "learning",
    ease: 1,
    nextReviewAt: null,
    correctCount: 0,
    incorrectCount: 0,
    lastReviewResult: null,
    ...overrides,
  };
}

console.log("--- Lemma guesses ---");
check("common irregular etre form resolves", guessLemmas("étaient").includes("être"));
check("regular -ir future resolves", guessLemmas("finiraient").includes("finir"));
check("feminine plural -al adjective resolves", guessLemmas("nationales").includes("national"));
check("feminine -if adjective resolves", guessLemmas("sportive").includes("sportif"));

console.log("\n--- Spaced repetition ---");
{
  const first = computeNextSchedule(word({ word: "bonjour" }), "correct", new Date("2026-07-09T10:00:00.000Z"));
  check("first correct schedules at least one day out", new Date(first.nextReviewAt).getTime() >= new Date("2026-07-10T10:00:00.000Z").getTime());
  check("first correct increments streak", first.correctCount === 1);
  check("first correct nudges ease up", first.ease > 1);
}
{
  const missed = computeNextSchedule(
    word({ word: "difficile", correctCount: 3, incorrectCount: 1, ease: 1.2 }),
    "incorrect",
    new Date("2026-07-09T10:00:00.000Z")
  );
  check("incorrect answer is due immediately", missed.nextReviewAt === "2026-07-09T10:00:00.000Z");
  check("incorrect answer resets streak", missed.correctCount === 0);
  check("incorrect answer increments miss count", missed.incorrectCount === 2);
}
{
  const now = new Date("2026-07-09T10:00:00.000Z").getTime();
  const words = [
    word({ word: "newer", reviewCount: 0, savedAt: "2026-07-09T09:00:00.000Z" }),
    word({ word: "overdue", reviewCount: 2, nextReviewAt: "2026-07-07T09:00:00.000Z", savedAt: "2026-07-01T09:00:00.000Z" }),
    word({ word: "known", status: "known", reviewCount: 0 }),
    word({ word: "later", reviewCount: 1, nextReviewAt: "2026-07-20T09:00:00.000Z" }),
  ];
  const stats = getReviewStats(words, now);
  const queue = buildReviewQueue(words, now);
  check("review stats exclude known words", stats.totalLearning === 3);
  check("review queue puts overdue before new cards", queue[0]?.word === "overdue", `first was ${queue[0]?.word}`);
  check("future scheduled cards are not due", !queue.some((item) => item.word === "later"));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
