// Logic tests for baselineComparison.ts — insufficient-sample states,
// short-text suppression, pooled-rate math, and trend calculation. Run with:
//   node --import ./scripts/register-alias-loader.mjs scripts/test-baseline-comparison.mjs
import {
  BASELINE_THRESHOLDS,
  compareToLevelBand,
  compareToPersonalBaseline,
  computeRollingLookupRate,
} from "../src/lib/practice/baselineComparison.ts";

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

let idCounter = 0;
function record(overrides = {}) {
  idCounter++;
  return {
    schemaVersion: 1,
    textId: overrides.textId ?? `t-${idCounter}`,
    sourceType: "curriculum",
    estimatedLevel: "B1",
    wordCount: 300,
    totalLookupActions: 15,
    uniqueWordsLookedUp: 8,
    lookupsPer100: 5,
    uniqueLookupsPer100: 2.7,
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
      clozeWord: { attempted: 0, correct: 0 },
      clozePhrase: { attempted: 0, correct: 0 },
      paraphrase: { attempted: 0, correct: 0 },
    },
    ...overrides,
  };
}

console.log("--- computeRollingLookupRate ---");
{
  const records = [record({ totalLookupActions: 10, wordCount: 200 }), record({ totalLookupActions: 20, wordCount: 200 })];
  const rolling = computeRollingLookupRate(records, "all-time");
  check("pools sum of lookups over sum of words, not average of rates", rolling.rate === 7.5, JSON.stringify(rolling));
}
check("empty history -> null rate, not a crash", computeRollingLookupRate([], 5).rate === null);

console.log("--- insufficient-sample states ---");
{
  const current = record({ textId: "current" });
  const comparison = compareToPersonalBaseline(current, []);
  check("no history -> minimumSampleMet is false", comparison.minimumSampleMet === false);
  check("no history -> toleranceBand is null, not a fabricated guess", comparison.toleranceBand === null);
}
{
  const current = record({ textId: "current" });
  const twoOthers = [record(), record()];
  const comparison = compareToPersonalBaseline(current, twoOthers);
  check(
    `fewer than minimumSampleForTrend (${BASELINE_THRESHOLDS.minimumSampleForTrend}) -> insufficient`,
    comparison.minimumSampleMet === false
  );
}

console.log("--- short-text suppression ---");
{
  const shortCurrent = record({ textId: "current", wordCount: BASELINE_THRESHOLDS.shortTextWordFloor - 1 });
  const plentyOfHistory = Array.from({ length: 10 }, () => record());
  const comparison = compareToPersonalBaseline(shortCurrent, plentyOfHistory);
  check("short text suppresses the comparison even with enough history", comparison.minimumSampleMet === false, JSON.stringify(comparison));
}

console.log("--- personal vs level-band selection ---");
{
  const current = record({ textId: "current", estimatedLevel: "B1" });
  const history = Array.from({ length: 5 }, () => record({ estimatedLevel: "A2" }));
  const personal = compareToPersonalBaseline(current, history);
  const levelBand = compareToLevelBand(current, history);
  check("personal comparison is tagged 'personal'", personal.baselineSource === "personal");
  check("level-band comparison is tagged 'levelBand'", levelBand.baselineSource === "levelBand");
}

console.log("--- tolerance band direction: lower lookup rate than baseline is favourable ---");
{
  const current = record({ textId: "current", totalLookupActions: 2, wordCount: 200, lookupsPer100: 1 });
  const history = Array.from({ length: 5 }, () => record({ totalLookupActions: 20, wordCount: 200 }));
  const comparison = compareToPersonalBaseline(current, history);
  check("markedly lower rate than baseline reads as 'below'", comparison.toleranceBand === "below", JSON.stringify(comparison));
}
{
  const current = record({ textId: "current", totalLookupActions: 40, wordCount: 200, lookupsPer100: 20 });
  const history = Array.from({ length: 5 }, () => record({ totalLookupActions: 4, wordCount: 200 }));
  const comparison = compareToPersonalBaseline(current, history);
  check("markedly higher rate than baseline reads as 'above'", comparison.toleranceBand === "above", JSON.stringify(comparison));
}

console.log("--- trend labels ---");
{
  // 5 recent low-lookup sessions vs 5 older high-lookup sessions -> improving.
  const recent = Array.from({ length: 5 }, (_, i) =>
    record({ totalLookupActions: 2, wordCount: 200, completedAt: new Date(2026, 0, 20 + i).toISOString() })
  );
  const older = Array.from({ length: 5 }, (_, i) =>
    record({ totalLookupActions: 20, wordCount: 200, completedAt: new Date(2026, 0, 1 + i).toISOString() })
  );
  const current = record({ textId: "current" });
  const comparison = compareToPersonalBaseline(current, [...recent, ...older]);
  check("recent-lower-than-older reads as Improving", comparison.trend === "Improving", JSON.stringify(comparison));
}
{
  const current = record({ textId: "current" });
  const tooFewForTrend = [record(), record(), record()];
  const comparison = compareToPersonalBaseline(current, tooFewForTrend);
  check("not enough history for two windows -> 'Not enough data'", comparison.trend === "Not enough data");
}

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
