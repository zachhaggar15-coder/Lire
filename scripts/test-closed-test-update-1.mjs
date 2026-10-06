// Behavioural tests for Closed-Test Update 1: the entitlement-aware onboarding
// save step and the sign-out confirmation flow.
import { readFileSync } from "node:fs";

const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
  dispatchEvent: () => true,
};

const { accessContext, accessTier } = await import("../src/lib/access/accessModel.ts");
const { getSavedWords, clearWords } = await import("../src/lib/storage.ts");
const { runWalkthroughWordAction, walkthroughAccessCopy, walkthroughSaveMode } = await import("../src/lib/onboarding/walkthroughSave.ts");
const { signOut } = await import("../src/lib/supabase/auth.ts");
const { createSignOutFlow } = await import("../src/lib/supabase/signOutFlow.ts");
const onboarding = await import("../src/lib/onboarding.ts");

let passed = 0;
let failed = 0;
const failures = [];
function check(label, condition, detail = "") {
  if (condition) passed++;
  else {
    failed++;
    failures.push(`${label}${detail ? ` - ${detail}` : ""}`);
  }
}

function entry(word) {
  return {
    word, lemma: word, translations: [word], primaryTranslation: word, partOfSpeech: "noun", gender: null,
    cefr: "A1", frequencyRank: 1, articleContextSentence: `Un ${word}.`, exampleSentenceFr: `Un ${word}.`,
    exampleSentenceEn: `A ${word}.`, sourceTextTitle: "Getting started", savedAt: "2026-10-03T12:00:00.000Z",
    reviewCount: 0, lastReviewedAt: null, status: "learning", missingFromDictionary: false,
    easeFactor: 2.5, intervalDays: 0, repetitions: 0, dueAt: "2026-10-03T12:00:00.000Z", lapses: 0,
  };
}

console.log("--- Onboarding: guest ---");
{
  clearWords();
  const ctx = accessContext(accessTier(false, false));
  check("guest tier is guest", ctx.tier === "guest");
  let built = 0;
  const out = runWalkthroughWordAction(true, ctx, false, () => (built++, entry("chat")));
  check("guest gets a preview, not a save", out.kind === "preview");
  check("the entry is never even built for a guest", built === 0);
  check("no saved-word state is created", getSavedWords().length === 0);
  check("preview says Premium unlocks saving and Review", /Premium/.test(out.message) && /review/i.test(out.message));
  check("preview says nothing was saved", /nothing was saved/.test(out.message));
  check("preview never claims success", !/^Saved/.test(out.message));
  check("guest copy does not claim saving is available", /require Premium/.test(walkthroughAccessCopy(true, ctx, false)));
}

console.log("--- Onboarding: signed-in free ---");
{
  clearWords();
  const ctx = accessContext(accessTier(true, false));
  check("authenticated non-subscriber is free, not premium", ctx.tier === "free");
  const out = runWalkthroughWordAction(true, ctx, true, () => entry("chat"));
  check("free user gets a preview", out.kind === "preview");
  check("free user nothing persisted", getSavedWords().length === 0);
  check("free copy mentions the free account", /free account/.test(out.message));
  check("free copy matches real access", /Premium features/.test(walkthroughAccessCopy(true, ctx, true)));
}

console.log("--- Onboarding: unresolved access never saves ---");
{
  const ctx = accessContext(accessTier(true, true));
  const out = runWalkthroughWordAction(false, ctx, true, () => entry("chat"));
  check("access still loading -> checking, no write", out.kind === "checking" && getSavedWords().length === 0);
  check("mode is checking until ready", walkthroughSaveMode(false, ctx) === "checking");
}

console.log("--- Onboarding: genuine Premium ---");
{
  clearWords();
  const ctx = accessContext(accessTier(true, true));
  check("subscriber is premium", ctx.tier === "premium");
  const out = runWalkthroughWordAction(true, ctx, true, () => entry("chat"));
  check("premium saves through the real path", out.kind === "saved");
  check("the word is in the real saved-word store", getSavedWords().some((w) => w.word === "chat" && w.status === "learning"));
  const again = runWalkthroughWordAction(true, ctx, true, () => entry("chat"));
  check("saving twice reports existing, no duplicate", again.kind === "exists" && getSavedWords().length === 1);
  check("premium copy offers real saving", /real word to Review/.test(walkthroughAccessCopy(true, ctx, true)));
  check("a premium flag without a session is still guest (no stale entitlement)", accessTier(false, true) === "guest");
  clearWords();
}

console.log("--- Onboarding: no temporary Premium, no separate demo store ---");
{
  const tour = readFileSync(new URL("../src/components/onboarding/InteractiveWalkthrough.tsx", import.meta.url), "utf8");
  const mod = readFileSync(new URL("../src/lib/onboarding/walkthroughSave.ts", import.meta.url), "utf8");
  check("walkthrough does not reference closed-test Premium", !/closedTest|closed-test/i.test(tour + mod));
  check("walkthrough has no demo persistence", !/localStorage|demoWords|fakeSaved/i.test(tour + mod));
}

console.log("--- Onboarding: state ---");
{
  store.clear();
  onboarding.saveOnboarding("A2", [], "steady", { seedKnownWords: false });
  onboarding.saveWalkthroughStep(3);
  check("reload mid-tour resumes at the saved step", onboarding.getOnboardingState().walkthroughStep === 3);
  onboarding.saveWalkthroughStep(1);
  check("going back is valid and persists", onboarding.getOnboardingState().walkthroughStep === 1);
  onboarding.completeWalkthrough();
  check("completion persists", onboarding.getOnboardingState().walkthroughCompleted === true);
  check("completion clears the resume step", onboarding.getOnboardingState().walkthroughStep === null);
  onboarding.resetWalkthrough();
  check("restart works", onboarding.getOnboardingState().walkthroughCompleted === false);
  check("a preview never wrote saved words during any of this", !store.has("sorlio.v2:guest:lire.savedWords.v1"));
}

console.log("--- Auth wrapper: signOut ---");
{
  const fakeClient = (impl) => ({ auth: { signOut: impl } });
  const ok = await signOut(fakeClient(async () => ({ error: null })));
  check("success reports ok", ok.ok === true && ok.error === null);
  const bad = await signOut(fakeClient(async () => ({ error: { message: "AuthRetryableFetchError: Failed to fetch" } })));
  check("failure reports not ok", bad.ok === false);
  check("failure message is non-technical", !!bad.error && !/AuthRetryable|Failed to fetch/.test(bad.error));
  const thrown = await signOut(fakeClient(async () => { throw new Error("network down"); }));
  check("a thrown error is not swallowed as success", thrown.ok === false && !!thrown.error);
  const none = await signOut(null);
  check("unconfigured client reports failure", none.ok === false);
}

console.log("--- Sign-out flow ---");
{
  store.clear();
  store.set("sorlio.v2:guest:lire.savedWords.v1", JSON.stringify([{ word: "bonjour" }]));
  store.set("sorlio.v2:guest:lire.sessionRecords.v1", JSON.stringify([{ textId: "a" }]));
  const snapshot = JSON.stringify([...store.entries()]);

  let session = true;
  let signedOutCalls = 0;
  let signedOutUi = 0;
  const states = [];
  const deferred = () => {
    let resolve;
    const promise = new Promise((res) => (resolve = res));
    return { promise, resolve };
  };
  let gate = deferred();
  const fn = async () => {
    signedOutCalls++;
    const result = await gate.promise;
    if (result.ok) session = false;
    return result;
  };
  const confirm = createSignOutFlow(fn, () => signedOutUi++, (s) => states.push(s));

  check("before confirmation the session is active and nothing was called", session && signedOutCalls === 0);
  check("cancel/dismiss never call sign-out", signedOutCalls === 0 && signedOutUi === 0);

  const first = confirm();
  const second = confirm();
  const third = confirm();
  check("pending state is reported", states[0]?.working === true);
  check("duplicate presses are ignored", signedOutCalls === 1 && states.length === 1);
  gate.resolve({ ok: false, error: "Couldn't sign out. Please check your connection and try again." });
  await Promise.all([first, second, third]);
  check("failure keeps the user authenticated", session === true && signedOutUi === 0);
  check("failure is surfaced", states.at(-1).working === false && /try again/.test(states.at(-1).error));

  gate = deferred();
  const retry = confirm();
  check("retry after failure is allowed", signedOutCalls === 2);
  gate.resolve({ ok: true, error: null });
  await retry;
  check("success updates UI exactly once", signedOutUi === 1 && session === false);

  const thrownFlow = createSignOutFlow(async () => { throw new Error("boom"); }, () => signedOutUi++, (s) => states.push(s));
  await thrownFlow();
  check("an exception is surfaced, not treated as signed out", signedOutUi === 1 && !!states.at(-1).error);

  check("local learning data is untouched by the sign-out flow", JSON.stringify([...store.entries()]) === snapshot);
  await signOut({ auth: { signOut: async () => ({ error: null }) } });
  check("the auth wrapper writes nothing to local storage", JSON.stringify([...store.entries()]) === snapshot);
}

console.log("--- Sign-out dialog wiring ---");
{
  const dialog = readFileSync(new URL("../src/components/SignOutDialog.tsx", import.meta.url), "utf8");
  const card = readFileSync(new URL("../src/components/AccountCard.tsx", import.meta.url), "utf8");
  check("Settings button only opens the dialog", /onClick=\{\(\) => setConfirmingSignOut\(true\)\}/.test(card));
  check("the dialog is a labelled modal", /role="dialog"/.test(dialog) && /aria-modal="true"/.test(dialog) && /aria-labelledby/.test(dialog));
  check("focus starts on Cancel", /cancelRef/.test(dialog));
  check("dismissal is blocked while signing out", /if \(!working\) onCancel\(\)/.test(dialog));
  check("copy says the data stays on the device but is hidden from others", /stays on this device/.test(dialog) && /hidden until you sign in again/.test(dialog));
  // Signing out reloads into the guest partition, so no signed-in UI can linger.
  const session = readFileSync(new URL("../src/lib/localData/session.ts", import.meta.url), "utf8");
  check("sign-out ends in a reload into the guest partition", /setActiveIdentity\(GUEST\);\s*clearTabSessionState\(\);\s*reload\(/.test(session) && /signOutThisDevice/.test(dialog));
}

console.log(`\n${passed} passed, ${failed} failed`);
for (const f of failures) console.log(`FAIL ${f}`);
process.exitCode = failed > 0 ? 1 : 0;
