// Logic tests for personalChallenge.ts — band boundaries, the single-nudge
// bound, and no-raw-numbers-in-explanation. Run with:
//   node --import ./scripts/register-alias-loader.mjs scripts/test-personal-challenge.mjs
import { estimatePersonalChallenge } from "../src/lib/practice/personalChallenge.ts";
import { COMFORT_MIN, COMFORT_MAX } from "../src/lib/journey/state.ts";

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

console.log("--- base band boundaries follow journey/state.ts's comfort band ---");
check("very low ratio -> Comfortable", estimatePersonalChallenge({ unknownWordRatio: 0.01 }).label === "Comfortable");
check("just under COMFORT_MIN -> Appropriate", estimatePersonalChallenge({ unknownWordRatio: COMFORT_MIN - 0.001 }).label === "Appropriate");
check("within comfort band -> Good challenge", estimatePersonalChallenge({ unknownWordRatio: (COMFORT_MIN + COMFORT_MAX) / 2 }).label === "Good challenge");
check("just over COMFORT_MAX -> Stretch", estimatePersonalChallenge({ unknownWordRatio: COMFORT_MAX + 0.001 }).label === "Stretch");
check("very high ratio -> Likely too difficult", estimatePersonalChallenge({ unknownWordRatio: 0.9 }).label === "Likely too difficult");

console.log("--- modifiers apply at most one bounded nudge ---");
{
  const base = estimatePersonalChallenge({ unknownWordRatio: (COMFORT_MIN + COMFORT_MAX) / 2 });
  const nudgedDown = estimatePersonalChallenge({
    unknownWordRatio: (COMFORT_MIN + COMFORT_MAX) / 2,
    recentAbandonRate: 0.9,
  });
  check("high abandon rate nudges toward harder, one step only", nudgedDown.label === "Stretch", JSON.stringify({ base, nudgedDown }));
}
{
  const nudgedUp = estimatePersonalChallenge({
    unknownWordRatio: (COMFORT_MIN + COMFORT_MAX) / 2,
    percentPreviouslySaved: 0.5,
  });
  check("strongly known vocabulary nudges toward easier, one step only", nudgedUp.label === "Appropriate", JSON.stringify(nudgedUp));
}
{
  // Already at the easiest label — a nudge cannot go further, must clamp, not wrap or throw.
  const clamped = estimatePersonalChallenge({ unknownWordRatio: 0.001, percentPreviouslySaved: 0.9 });
  check("nudge clamps at the boundary label instead of wrapping", clamped.label === "Comfortable", JSON.stringify(clamped));
}
{
  const clamped = estimatePersonalChallenge({ unknownWordRatio: 0.9, recentAbandonRate: 1 });
  check("nudge clamps at the hardest label instead of wrapping", clamped.label === "Likely too difficult", JSON.stringify(clamped));
}

console.log("--- learner-facing explanation never contains a raw number ---");
for (const ratio of [0.01, 0.05, 0.1, 0.2, 0.5]) {
  const result = estimatePersonalChallenge({ unknownWordRatio: ratio });
  check(`explanation for ratio ${ratio} has no digits`, !/\d/.test(result.explanation), result.explanation);
}

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
