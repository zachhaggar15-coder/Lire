// Logic tests for sessionRecord.ts — schema versioning/migration tolerance,
// cap-at-500, replace-on-recomplete, and practice-stat merging. Run with:
//   node --import ./scripts/register-alias-loader.mjs scripts/test-session-record.mjs
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
  getSessionRecords,
  getSessionRecordsForLevel,
  ratePer100Words,
  recordReadingSession,
  updateSessionPracticeStats,
  SESSION_RECORD_SCHEMA_VERSION,
} from "../src/lib/sessionRecord.ts";

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
    textId: "t-1",
    sourceType: "curriculum",
    estimatedLevel: "B1",
    wordCount: 200,
    totalLookupActions: 10,
    uniqueWordsLookedUp: 6,
    wordsSaved: 3,
    wordsUnsure: 1,
    wordsKnown: 0,
    openedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    activeReadingTimeMs: 60000,
    completionStatus: "completed",
    audioUsed: false,
    ...overrides,
  };
}

console.log("--- ratePer100Words ---");
check("basic rate", ratePer100Words(10, 200) === 5);
check("zero words guarded", ratePer100Words(10, 0) === 0);
check("rounds to one decimal", ratePer100Words(1, 3) === 33.3);

console.log("--- recordReadingSession / getSessionRecords ---");
store.clear();
recordReadingSession(baseInput());
{
  const all = getSessionRecords();
  check("one record persisted", all.length === 1, JSON.stringify(all));
  check("schemaVersion stamped", all[0].schemaVersion === SESSION_RECORD_SCHEMA_VERSION);
  check("lookupsPer100 derived correctly", all[0].lookupsPer100 === 5);
  check("uniqueLookupsPer100 derived correctly", all[0].uniqueLookupsPer100 === 3);
}

console.log("--- replace-on-recomplete ---");
recordReadingSession(baseInput({ totalLookupActions: 2, uniqueWordsLookedUp: 2 }));
{
  const all = getSessionRecords();
  check("re-completion replaces, not appends", all.length === 1, JSON.stringify(all));
  check("latest values win", all[0].totalLookupActions === 2);
}

console.log("--- practice stats merge and survive re-completion ---");
updateSessionPracticeStats("t-1", "clozeWord", true);
updateSessionPracticeStats("t-1", "clozeWord", false);
{
  const stats = getSessionRecords()[0].practice.clozeWord;
  check("practice attempts accumulate", stats.attempted === 2 && stats.correct === 1, JSON.stringify(stats));
}
recordReadingSession(baseInput());
{
  const stats = getSessionRecords()[0].practice.clozeWord;
  check("re-completion preserves prior practice stats", stats.attempted === 2 && stats.correct === 1, JSON.stringify(stats));
}
check("no-op update for an unrecorded textId does not throw or create a record", (() => {
  updateSessionPracticeStats("never-recorded", "paraphrase", true);
  return getSessionRecords().every((r) => r.textId !== "never-recorded");
})());

console.log("--- malformed/old rows never crash new code ---");
store.set("lire.sessionRecords.v1", JSON.stringify([{ garbage: true }, "not an object", null, 42]));
check("malformed rows are dropped, not thrown", getSessionRecords().length === 0);

console.log("--- old-schema records (missing a since-added exercise kind) stay usable ---");
{
  const legacyRecord = {
    ...baseInput({ textId: "legacy-text" }),
    schemaVersion: 1,
    lookupsPer100: 5,
    uniqueLookupsPer100: 3,
    practice: {
      // Simulates a record written before "paraphrase" existed as a kind.
      reconstruction: { attempted: 1, correct: 1 },
      clozeWord: { attempted: 0, correct: 0 },
      clozePhrase: { attempted: 0, correct: 0 },
    },
  };
  store.set("lire.sessionRecords.v1", JSON.stringify([legacyRecord]));
  const records = getSessionRecords();
  check("legacy record is kept, not dropped", records.length === 1, JSON.stringify(records));
  check(
    "missing practice kind is backfilled with zeroed stats, not crashing",
    records[0]?.practice?.paraphrase?.attempted === 0 && records[0]?.practice?.paraphrase?.correct === 0,
    JSON.stringify(records[0]?.practice)
  );
  check("existing practice kinds on the legacy record are preserved", records[0]?.practice?.reconstruction?.correct === 1);
}

console.log("--- level filtering ---");
store.clear();
recordReadingSession(baseInput({ textId: "a", estimatedLevel: "A2" }));
recordReadingSession(baseInput({ textId: "b", estimatedLevel: "B1" }));
check("getSessionRecordsForLevel filters by level", getSessionRecordsForLevel("B1").length === 1 && getSessionRecordsForLevel("B1")[0].textId === "b");

console.log("--- cap at 500 ---");
store.clear();
for (let i = 0; i < 510; i++) recordReadingSession(baseInput({ textId: `text-${i}` }));
check("store caps at 500 records", getSessionRecords().length === 500);

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
