// Logic tests for readingPerformance.ts — zero-lookup guards, audio-neutral
// behaviour, and old-record (missing practice field) tolerance. Run with:
//   node --import ./scripts/register-alias-loader.mjs scripts/test-reading-performance.mjs
import { computeReadingPerformance } from "../src/lib/practice/readingPerformance.ts";

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

function baseRecord(overrides = {}) {
  return {
    schemaVersion: 1,
    textId: "t-1",
    sourceType: "curriculum",
    estimatedLevel: "B1",
    wordCount: 200,
    totalLookupActions: 10,
    uniqueWordsLookedUp: 5,
    lookupsPer100: 5,
    uniqueLookupsPer100: 2.5,
    wordsSaved: 2,
    wordsUnsure: 0,
    wordsKnown: 0,
    openedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    activeReadingTimeMs: 60000,
    completionStatus: "completed",
    audioUsed: false,
    practice: {
      reconstruction: { attempted: 0, correct: 0 },
      clozeWord: { attempted: 2, correct: 1 },
      clozePhrase: { attempted: 0, correct: 0 },
      paraphrase: { attempted: 0, correct: 0 },
    },
    ...overrides,
  };
}

console.log("--- basic derivation ---");
{
  const perf = computeReadingPerformance(baseRecord());
  check("component metrics pass through from the record", perf.lookupsPer100 === 5 && perf.uniqueLookupsPer100 === 2.5);
  check("percentLookedUpWordsSaved computed correctly", perf.percentLookedUpWordsSaved === 0.4, JSON.stringify(perf));
  check("attempted exercise type gets a real accuracy", perf.practiceAccuracyByType.clozeWord === 0.5);
  check("unattempted exercise type is null, not zero", perf.practiceAccuracyByType.reconstruction === null);
  check("audioUsed passes through as a neutral fact", perf.audioUsed === false);
}

console.log("--- zero-lookup guard ---");
{
  const perf = computeReadingPerformance(baseRecord({ uniqueWordsLookedUp: 0, wordsSaved: 0 }));
  check("no lookups -> percentLookedUpWordsSaved is null, not a division error", perf.percentLookedUpWordsSaved === null, JSON.stringify(perf));
}

console.log("--- audio is never penalised regardless of other inputs ---");
{
  const perfLowPerformance = computeReadingPerformance(
    baseRecord({ audioUsed: true, lookupsPer100: 50, practice: { reconstruction: { attempted: 3, correct: 0 }, clozeWord: { attempted: 0, correct: 0 }, clozePhrase: { attempted: 0, correct: 0 }, paraphrase: { attempted: 0, correct: 0 } } })
  );
  check("audioUsed stays a plain boolean fact, not folded into a penalty score", perfLowPerformance.audioUsed === true);
  check("no combined penalising index exists on the returned shape", !("score" in perfLowPerformance) && !("index" in perfLowPerformance));
}

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
