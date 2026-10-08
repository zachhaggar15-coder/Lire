import { readFileSync } from "node:fs";

const store = new Map();
let rejectWrites = false;
globalThis.window = {
  localStorage: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      if (rejectWrites && key.endsWith(":lire.savedWords.v1")) throw new Error("QuotaExceededError");
      store.set(key, String(value));
    },
    removeItem: (key) => store.delete(key),
  },
  dispatchEvent: () => true,
};

const { accessContext, accessTier, canSaveNewWord } = await import("../src/lib/access/accessModel.ts");
const { saveWordForAccess } = await import("../src/lib/access/saveWord.ts");
const { clearWords, getSavedWords } = await import("../src/lib/storage.ts");
const { buildReviewQueue, defaultSpacedRepetitionFields } = await import("../src/lib/spacedRepetition.ts");
const { isInReview } = await import("../src/lib/reviewMembership.ts");

let passed = 0;
let failed = 0;
const failures = [];

function check(label, condition, detail = "") {
  if (condition) passed++;
  else {
    failed++;
    failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function entry(word, lemma = word) {
  return {
    word,
    lemma,
    translations: [word],
    primaryTranslation: word,
    partOfSpeech: "noun",
    gender: null,
    cefr: "A1",
    frequencyRank: 1,
    articleContextSentence: `Un ${word} de test.`,
    exampleSentenceFr: `Un ${word}.`,
    exampleSentenceEn: `A ${word}.`,
    sourceTextTitle: "Saved-word regression article",
    savedAt: "2026-10-01T12:00:00.000Z",
    reviewCount: 0,
    lastReviewedAt: null,
    status: "learning",
    missingFromDictionary: false,
    ...defaultSpacedRepetitionFields(),
  };
}

console.log("--- Saving is gated before persistence ---");
store.clear();
const guestAtLimit = accessContext(accessTier(false, false), 5);
const freeAtLimit = accessContext(accessTier(true, false), 5);
check("guest at the daily limit cannot save a new word", !canSaveNewWord(guestAtLimit).allowed && saveWordForAccess(guestAtLimit, entry("bonjour")).result === null);
check("free account at the daily limit cannot save a new word", !canSaveNewWord(freeAtLimit).allowed && saveWordForAccess(freeAtLimit, entry("bonjour")).result === null);
check("blocked attempts do not create a saved-word record", getSavedWords().length === 0);

console.log("--- Free and Premium share the same real save path ---");
const premium = accessContext(accessTier(true, true));
const freeWithAllowance = accessContext(accessTier(false, false), 0);
const genuineSave = saveWordForAccess(premium, entry("bonjour"));
check("genuine Premium persists a new word", genuineSave.result?.persisted === true && genuineSave.result.created === true);
check("a saved new word is immediately eligible for Review", buildReviewQueue(getSavedWords()).some((word) => word.word === "bonjour"));
check("saved state survives a fresh storage read", getSavedWords().some((word) => word.word === "bonjour"));
const freeSave = saveWordForAccess(freeWithAllowance, entry("salut"));
check("a free save within the allowance persists through the same store", freeSave.result?.persisted === true && freeSave.result.created === true);
check("both saved words appear in Review", buildReviewQueue(getSavedWords()).map((word) => word.word).includes("bonjour") && buildReviewQueue(getSavedWords()).map((word) => word.word).includes("salut"));

console.log("--- UI status matches the Review source of truth ---");
check("a learning card is in Review", isInReview(entry("appris")));
check("an unsure card is in Review", isInReview({ ...entry("douteux"), status: "unsure" }));
check("a removed card is not in Review, and not queued", !isInReview({ ...entry("retire"), removedFromReviewAt: "2026-10-02T00:00:00.000Z" }) && buildReviewQueue([{ ...entry("retire"), removedFromReviewAt: "2026-10-02T00:00:00.000Z" }]).length === 0);
check("a legacy known card reads as not in Review (re-addable), and is not queued", !isInReview({ ...entry("connu"), status: "known" }) && buildReviewQueue([{ ...entry("connu"), status: "known" }]).length === 0);

console.log("--- Repeated and failed saves cannot claim new success ---");
const repeated = saveWordForAccess(premium, entry("bonjour"));
check("repeated canonical save remains persisted but is not newly created", repeated.result?.persisted === true && repeated.result.created === false);
check("repeated save does not duplicate the record", getSavedWords().filter((word) => word.word === "bonjour").length === 1);
const beforeFailure = getSavedWords().length;
rejectWrites = true;
const failedSave = saveWordForAccess(premium, entry("echec"));
rejectWrites = false;
check("a rejected device write reports failure", failedSave.result?.persisted === false && failedSave.result.created === false);
check("a rejected write does not become visible in Review", getSavedWords().length === beforeFailure && !buildReviewQueue(getSavedWords()).some((word) => word.word === "echec"));

console.log("--- Hitting the limit preserves, but cannot add to, saved data ---");
check("a new save at the limit is refused", saveWordForAccess(guestAtLimit, entry("ferme")).result === null);
check("existing learning data remains intact", getSavedWords().some((word) => word.word === "bonjour") && getSavedWords().some((word) => word.word === "salut"));

console.log("--- Product controls use the central guarded path ---");
const reader = readFileSync(new URL("../src/components/Reader.tsx", import.meta.url), "utf8");
const walkthrough = readFileSync(new URL("../src/components/onboarding/InteractiveWalkthrough.tsx", import.meta.url), "utf8");
const meaningSheet = readFileSync(new URL("../src/components/MeaningSheet.tsx", import.meta.url), "utf8");
check("Reader saves through the entitlement-aware helper", /saveWordForAccess\(/.test(reader));
const walkthroughSave = readFileSync(new URL("../src/lib/onboarding/walkthroughSave.ts", import.meta.url), "utf8");
check("walkthrough uses the same real, guarded save mechanism", /runWalkthroughWordAction\(/.test(walkthrough) && /useAccess\(\)/.test(walkthrough) && /= saveWordForAccess/.test(walkthroughSave));
check("the word sheet renders the shared binary control, with no third \"known\" state", /reviewControlFor\(/.test(meaningSheet) && !/Already known|Marked as known|I know this/.test(meaningSheet));

clearWords();
// A grade must be stored before the feedback animation timer starts: the
// review page cancels that timer on unmount, so leaving during the animation
// used to drop the answer (audit RC26).
{
  const { readFileSync } = await import("node:fs");
  const page = readFileSync(new URL("../src/app/review/page.tsx", import.meta.url), "utf8");
  const body = (name) => page.slice(page.indexOf(`function ${name}(`), page.indexOf("\n  }\n", page.indexOf(`function ${name}(`)));
  for (const [name, write] of [["gradeWord", "recordReviewResult("], ["gradePhrase", "recordPhraseReview("]]) {
    const source = body(name);
    const writeAt = source.indexOf(write);
    const timerAt = source.indexOf("setTimeout(");
    check(`${name} stores the grade before starting the animation timer`, writeAt !== -1 && timerAt !== -1 && writeAt < timerAt, `write ${writeAt}, timer ${timerAt}`);
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failures.length) {
  for (const failure of failures) console.log(`FAIL ${failure}`);
  process.exitCode = 1;
}
