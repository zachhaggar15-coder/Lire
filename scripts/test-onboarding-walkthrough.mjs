// Logic tests for the interactive-walkthrough state machine in onboarding.ts
// — new vs returning user, skip, restart, and mid-close resume. Run with:
//   node --import ./scripts/register-alias-loader.mjs scripts/test-onboarding-walkthrough.mjs
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
  completeWalkthrough,
  getOnboardingState,
  resetWalkthrough,
  saveOnboarding,
  saveWalkthroughStep,
  skipOnboarding,
  updateSelectedReadingLevel,
} from "../src/lib/onboarding.ts";

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

console.log("--- brand-new user sees onboarding ---");
store.clear();
check("no stored state -> getOnboardingState is null", getOnboardingState() === null);

console.log("--- completing the picker leaves the walkthrough pending ---");
saveOnboarding("A2", [], "steady", { seedKnownWords: false });
{
  const state = getOnboardingState();
  check("picker completion sets completed=true", state.completed === true);
  check("walkthrough starts NOT completed (new user should see it next)", state.walkthroughCompleted === false, JSON.stringify(state));
  check("walkthrough step starts at null (not yet begun)", state.walkthroughStep === null);
}

console.log("--- mid-walkthrough close-and-reopen resumes at the right step ---");
saveWalkthroughStep(2);
{
  const state = getOnboardingState();
  check("walkthrough step persists across a simulated reload", state.walkthroughStep === 2, JSON.stringify(state));
  check("completing the picker's fields is untouched by a step save", state.level === "A2" && state.goalPreset === "steady");
}

console.log("--- finishing the walkthrough marks it done and clears the resume step ---");
completeWalkthrough();
{
  const state = getOnboardingState();
  check("walkthroughCompleted becomes true", state.walkthroughCompleted === true);
  check("walkthroughStep resets to null once finished", state.walkthroughStep === null);
}

console.log("--- returning user (already finished) does not see the walkthrough again ---");
{
  const state = getOnboardingState();
  check("a completed walkthrough stays completed on a fresh read", state.walkthroughCompleted === true);
}

console.log("--- restarting the tutorial from Settings ---");
// Simulate unrelated learner data that must never be touched by a restart.
store.set("lire.savedWords.v1", JSON.stringify([{ word: "chat", status: "learning" }]));
store.set("lire.sessionRecords.v1", JSON.stringify([{ textId: "some-text" }]));
resetWalkthrough();
{
  const state = getOnboardingState();
  check("restart clears walkthroughCompleted so it shows again", state.walkthroughCompleted === false);
  check("restart clears any stale resume step", state.walkthroughStep === null);
  check("restart does NOT touch the picker's own completed flag", state.completed === true);
  check("restart does NOT change the previously-selected level", state.level === "A2");
  check("restart does NOT erase saved words", store.get("lire.savedWords.v1") === JSON.stringify([{ word: "chat", status: "learning" }]));
  check("restart does NOT erase session-record history", store.get("lire.sessionRecords.v1") === JSON.stringify([{ textId: "some-text" }]));
}

console.log("--- skip is equivalent to completing (never shown again after skipping) ---");
completeWalkthrough();
{
  const state = getOnboardingState();
  check("skip path (completeWalkthrough) marks the walkthrough done", state.walkthroughCompleted === true);
}

console.log("--- updateSelectedReadingLevel preserves walkthrough progress ---");
resetWalkthrough();
saveWalkthroughStep(3);
updateSelectedReadingLevel("B1");
{
  const state = getOnboardingState();
  check("changing the reading level does not reset walkthrough completion", state.walkthroughCompleted === false);
  check("changing the reading level does not reset the resume step", state.walkthroughStep === 3, JSON.stringify(state));
  check("the level itself does update", state.level === "B1");
}

console.log("--- skipOnboarding (skipping the picker itself) still yields valid walkthrough defaults ---");
store.clear();
skipOnboarding();
{
  const state = getOnboardingState();
  check("skipping the picker still initialises walkthrough fields (not undefined/crashing)", state.walkthroughCompleted === false && state.walkthroughStep === null);
}

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
