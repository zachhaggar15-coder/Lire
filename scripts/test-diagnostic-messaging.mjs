// Logic tests for diagnosticMessaging.ts — the 8 spec example patterns and,
// critically, the non-contradiction invariant across the full label matrix
// (no combination can call a text both comfortable and too difficult). Run:
//   node --import ./scripts/register-alias-loader.mjs scripts/test-diagnostic-messaging.mjs
import { selectDiagnosticMessage } from "../src/lib/practice/diagnosticMessaging.ts";

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

const CHALLENGE_LABELS = ["Comfortable", "Appropriate", "Good challenge", "Stretch", "Likely too difficult"];
const TOLERANCE_BANDS = ["below", "within", "above", null];

function performance(overrides = {}) {
  return {
    lookupsPer100: 5,
    uniqueLookupsPer100: 3,
    totalLookupActions: 10,
    uniqueWordsLookedUp: 6,
    percentLookedUpWordsSaved: 0.3,
    completionStatus: "completed",
    activeReadingTimeMs: 60000,
    practiceAccuracyByType: { reconstruction: null, clozeWord: null, clozePhrase: null, paraphrase: null },
    audioUsed: false,
    ...overrides,
  };
}

function baseline(overrides = {}) {
  return {
    baselineSource: "personal",
    baselineRate: 6,
    currentRate: 5,
    toleranceBand: "within",
    trend: "Stable",
    sampleSize: 5,
    minimumSampleMet: true,
    ...overrides,
  };
}

function challenge(label) {
  return { label, explanation: `explanation for ${label}` };
}

console.log("--- spec example patterns ---");
{
  const msg = selectDiagnosticMessage({
    challenge: challenge("Good challenge"),
    performance: performance({ practiceAccuracyByType: { reconstruction: 0.9, clozeWord: null, clozePhrase: null, paraphrase: null } }),
    baseline: baseline({ toleranceBand: "below" }),
  });
  check("low lookup rate + high accuracy -> understood with little support", msg.headline.includes("understood this text with little support"), msg.headline);
}
{
  const msg = selectDiagnosticMessage({
    challenge: challenge("Good challenge"),
    performance: performance({ practiceAccuracyByType: { reconstruction: 0.3, clozeWord: null, clozePhrase: null, paraphrase: null } }),
    baseline: baseline({ toleranceBand: "below" }),
  });
  check("low lookup rate + low accuracy -> some sentence meanings may need another pass", msg.headline.includes("another pass"), msg.headline);
}
{
  const msg = selectDiagnosticMessage({
    challenge: challenge("Good challenge"),
    performance: performance({ practiceAccuracyByType: { reconstruction: 0.9, clozeWord: null, clozePhrase: null, paraphrase: null } }),
    baseline: baseline({ toleranceBand: "above" }),
  });
  check("high lookup rate + high accuracy -> comprehension remained strong", msg.headline.includes("comprehension remained strong"), msg.headline);
}
{
  const msg = selectDiagnosticMessage({
    challenge: challenge("Likely too difficult"),
    performance: performance({ practiceAccuracyByType: { reconstruction: 0.2, clozeWord: null, clozePhrase: null, paraphrase: null } }),
    baseline: baseline({ toleranceBand: "above" }),
  });
  check("high lookup rate + low accuracy + hard challenge -> above your level", msg.headline.includes("above your comfortable reading level"), msg.headline);
}
{
  const msg = selectDiagnosticMessage({
    challenge: challenge("Good challenge"),
    performance: performance({ totalLookupActions: 8, uniqueWordsLookedUp: 2 }),
    baseline: baseline({ toleranceBand: "within" }),
  });
  check("few unique words behind many lookups -> recurring words", msg.headline.includes("recurring words"), msg.headline);
}
{
  const msg = selectDiagnosticMessage({
    challenge: challenge("Good challenge"),
    performance: performance({ uniqueLookupsPer100: 12, totalLookupActions: 1, uniqueWordsLookedUp: 1 }),
    baseline: baseline({ toleranceBand: "within" }),
  });
  check("high unique-lookups rate -> broad range of unfamiliar vocabulary", msg.headline.includes("broad range"), msg.headline);
}
{
  const msg = selectDiagnosticMessage({
    challenge: challenge("Appropriate"),
    performance: performance(),
    baseline: baseline({ minimumSampleMet: false, toleranceBand: null }),
  });
  check("insufficient data -> explicit not-enough-data message, no fabricated comparison", msg.headline.toLowerCase().includes("not enough data"), msg.headline);
}

console.log("--- non-contradiction invariant across the full label matrix ---");
let contradictions = 0;
for (const label of CHALLENGE_LABELS) {
  for (const band of TOLERANCE_BANDS) {
    for (const accuracy of [0.1, 0.5, 0.9, null]) {
      const msg = selectDiagnosticMessage({
        challenge: challenge(label),
        performance: performance({ practiceAccuracyByType: { reconstruction: accuracy, clozeWord: null, clozePhrase: null, paraphrase: null } }),
        baseline: baseline({ toleranceBand: band, minimumSampleMet: band !== null }),
      });
      const callsTooHard = msg.headline.toLowerCase().includes("above your comfortable reading level");
      const isComfortableLabel = label === "Comfortable" || label === "Appropriate";
      if (callsTooHard && isComfortableLabel) {
        contradictions++;
        console.log(`FAIL contradiction: label=${label} band=${band} accuracy=${accuracy} -> "${msg.headline}"`);
      }
    }
  }
}
check("no combination ever calls a Comfortable/Appropriate text 'above your level'", contradictions === 0);

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
