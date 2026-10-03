import { readFileSync } from "node:fs";

const store = new Map();
let rejectWrites = false;
globalThis.window = {
  localStorage: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      if (rejectWrites && key === "lire.savedWords.v1") throw new Error("QuotaExceededError");
      store.set(key, String(value));
    },
    removeItem: (key) => store.delete(key),
  },
  dispatchEvent: () => true,
};

const { accessContext, accessTier, canSaveWord } = await import("../src/lib/access/accessModel.ts");
const { saveWordForAccess } = await import("../src/lib/access/saveWord.ts");
const { clearWords, getSavedWords } = await import("../src/lib/storage.ts");
const { buildReviewQueue, defaultSpacedRepetitionFields, isReviewableWordStatus } = await import("../src/lib/spacedRepetition.ts");

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
const guest = accessContext(accessTier(false, false, false));
const free = accessContext(accessTier(true, false, false));
check("guest cannot save", !canSaveWord(guest).allowed && saveWordForAccess(guest, entry("bonjour")).result === null);
check("free account cannot save", !canSaveWord(free).allowed && saveWordForAccess(free, entry("bonjour")).result === null);
check("blocked attempts do not create a saved-word record", getSavedWords().length === 0);

console.log("--- Premium and closed-test Premium share the same real save path ---");
const premium = accessContext(accessTier(true, true, false));
const closedTestPremium = accessContext(accessTier(false, false, true));
const genuineSave = saveWordForAccess(premium, entry("bonjour"));
check("genuine Premium persists a new word", genuineSave.result?.persisted === true && genuineSave.result.created === true);
check("a saved new word is immediately eligible for Review", buildReviewQueue(getSavedWords()).some((word) => word.word === "bonjour"));
check("saved state survives a fresh storage read", getSavedWords().some((word) => word.word === "bonjour"));
const closedSave = saveWordForAccess(closedTestPremium, entry("salut"));
check("temporary closed-test Premium persists through the same store", closedSave.result?.persisted === true && closedSave.result.created === true);
check("both saved words appear in Review", buildReviewQueue(getSavedWords()).map((word) => word.word).includes("bonjour") && buildReviewQueue(getSavedWords()).map((word) => word.word).includes("salut"));

console.log("--- UI status matches the Review source of truth ---");
check("learning is a Review-saved status", isReviewableWordStatus("learning"));
check("unsure is a Review-saved status", isReviewableWordStatus("unsure"));
check("known is not falsely presented as saved to Review", !isReviewableWordStatus("known"));
check("known is intentionally absent from a review queue", buildReviewQueue([{ ...entry("connu"), status: "known" }]).length === 0);

console.log("--- Repeated and failed saves cannot claim new success ---");
const repeated = saveWordForAccess(closedTestPremium, entry("bonjour"));
check("repeated canonical save remains persisted but is not newly created", repeated.result?.persisted === true && repeated.result.created === false);
check("repeated save does not duplicate the record", getSavedWords().filter((word) => word.word === "bonjour").length === 1);
const beforeFailure = getSavedWords().length;
rejectWrites = true;
const failedSave = saveWordForAccess(closedTestPremium, entry("echec"));
rejectWrites = false;
check("a rejected device write reports failure", failedSave.result?.persisted === false && failedSave.result.created === false);
check("a rejected write does not become visible in Review", getSavedWords().length === beforeFailure && !buildReviewQueue(getSavedWords()).some((word) => word.word === "echec"));

console.log("--- Disabling temporary access preserves, but cannot add to, saved data ---");
const disabled = accessContext(accessTier(false, false, false));
check("disabled temporary access restores the normal gate", saveWordForAccess(disabled, entry("ferme")).result === null);
check("existing learning data remains intact after the gate changes", getSavedWords().some((word) => word.word === "bonjour") && getSavedWords().some((word) => word.word === "salut"));

console.log("--- Product controls use the central guarded path ---");
const reader = readFileSync(new URL("../src/components/Reader.tsx", import.meta.url), "utf8");
const walkthrough = readFileSync(new URL("../src/components/onboarding/InteractiveWalkthrough.tsx", import.meta.url), "utf8");
const meaningSheet = readFileSync(new URL("../src/components/MeaningSheet.tsx", import.meta.url), "utf8");
check("Reader saves through the entitlement-aware helper", /saveWordForAccess\(/.test(reader));
const walkthroughSave = readFileSync(new URL("../src/lib/onboarding/walkthroughSave.ts", import.meta.url), "utf8");
check("walkthrough uses the same real, guarded save mechanism", /runWalkthroughWordAction\(/.test(walkthrough) && /useAccess\(\)/.test(walkthrough) && /= saveWordForAccess/.test(walkthroughSave));
check("known words are not rendered as Review saves", /isReviewableWordStatus/.test(meaningSheet) && /Already known/.test(meaningSheet));

clearWords();
console.log(`\n${passed} passed, ${failed} failed`);
if (failures.length) {
  for (const failure of failures) console.log(`FAIL ${failure}`);
  process.exitCode = 1;
}
