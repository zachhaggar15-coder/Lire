// Confirms paraphrase results actually land in sessionRecord.ts's history
// (the "results are included in lesson history" requirement) and that older
// records without paraphrase data don't crash readingPerformance.ts. Run:
//   node --import ./scripts/register-alias-loader.mjs scripts/test-paraphrase-session-integration.mjs
const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
  dispatchEvent: () => true,
};

import { getSessionRecords, recordReadingSession, updateSessionPracticeStats } from "../src/lib/sessionRecord.ts";
import { computeReadingPerformance, averagePracticeAccuracy } from "../src/lib/practice/readingPerformance.ts";

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

function baseInput(overrides = {}) {
  return {
    textId: "t-paraphrase",
    sourceType: "curriculum",
    estimatedLevel: "B1",
    wordCount: 200,
    totalLookupActions: 5,
    uniqueWordsLookedUp: 3,
    wordsSaved: 1,
    wordsUnsure: 0,
    wordsKnown: 0,
    openedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    activeReadingTimeMs: 60000,
    completionStatus: "completed",
    audioUsed: false,
    ...overrides,
  };
}

console.log("--- paraphrase results land in the session record ---");
store.clear();
recordReadingSession(baseInput());
updateSessionPracticeStats("t-paraphrase", "paraphrase", true);
updateSessionPracticeStats("t-paraphrase", "paraphrase", false);
updateSessionPracticeStats("t-paraphrase", "paraphrase", true);
{
  const record = getSessionRecords().find((r) => r.textId === "t-paraphrase");
  check("paraphrase attempts recorded", record?.practice.paraphrase.attempted === 3, JSON.stringify(record?.practice));
  check("paraphrase correct count recorded", record?.practice.paraphrase.correct === 2);
  const performance = computeReadingPerformance(record);
  check("readingPerformance surfaces paraphrase accuracy", Math.abs(performance.practiceAccuracyByType.paraphrase - 2 / 3) < 1e-9);
  check("average accuracy includes paraphrase", averagePracticeAccuracy(performance) !== null);
}

console.log("--- practice can be recorded across a separate later visit (practice page after completion) ---");
store.clear();
recordReadingSession(baseInput({ textId: "t-later-visit" }));
{
  // Simulates the reader completing the reading, then coming back to /practice separately.
  const beforePractice = getSessionRecords().find((r) => r.textId === "t-later-visit");
  check("fresh record starts with zero paraphrase attempts", beforePractice.practice.paraphrase.attempted === 0);
}
updateSessionPracticeStats("t-later-visit", "paraphrase", true);
{
  const afterPractice = getSessionRecords().find((r) => r.textId === "t-later-visit");
  check("a later practice-page visit updates the same record in place", afterPractice.practice.paraphrase.attempted === 1 && afterPractice.practice.paraphrase.correct === 1);
}

console.log("--- old records without paraphrase data don't crash readingPerformance ---");
{
  const legacyRecord = {
    ...baseInput({ textId: "t-legacy" }),
    schemaVersion: 1,
    lookupsPer100: 2.5,
    uniqueLookupsPer100: 1.5,
    practice: {
      reconstruction: { attempted: 0, correct: 0 },
      clozeWord: { attempted: 0, correct: 0 },
      clozePhrase: { attempted: 0, correct: 0 },
      // paraphrase intentionally omitted
    },
  };
  store.set("lire.sessionRecords.v1", JSON.stringify([legacyRecord]));
  const record = getSessionRecords().find((r) => r.textId === "t-legacy");
  let threw = false;
  let performance = null;
  try {
    performance = computeReadingPerformance(record);
  } catch {
    threw = true;
  }
  check("computeReadingPerformance does not throw on a legacy record", !threw);
  check("legacy record's missing paraphrase accuracy reads as null, not a crash", performance?.practiceAccuracyByType.paraphrase === null);
}

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
