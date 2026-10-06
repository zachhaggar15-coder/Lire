/**
 * A durable learning action must never look successful when it was not
 * stored. For every important mutation this drives a real failure (quota
 * exceeded, storage denied, a generic exception, unreadable existing data)
 * through the real partitioned store and checks that:
 *   - the function reports failure,
 *   - the stored data is exactly as before,
 *   - no progress (XP, activity) is awarded,
 *   - the ordinary success path still works afterwards.
 */

import { createStorage, createRunner, installWindow } from "./lib/fakeBrowser.mjs";

const control = createStorage();
installWindow(control);
control.storage.setItem("sorlio.storage.schema", "2");

const t = createRunner("persistence failures");
const storage = await import("../src/lib/storage.ts");
const phrases = await import("../src/lib/phrases.ts");
const known = await import("../src/lib/knownWords.ts");
const custom = await import("../src/lib/customTexts.ts");
const { localStore } = await import("../src/lib/localData/store.ts");
const { persistenceFailureMessage } = await import("../src/lib/localData/messages.ts");

const WORDS = "lire.savedWords.v1";
const XP = "lire.gamification.xpEvents.v1";
const ACTIVITY = "lire.activityDates.v1";

const word = (w, extra = {}) => ({
  word: w, lemma: w, translations: [w], primaryTranslation: w, partOfSpeech: null, gender: null, cefr: null, frequencyRank: null,
  articleContextSentence: "", exampleSentenceFr: `Le ${w}.`, exampleSentenceEn: `The ${w}.`, sourceTextTitle: "", savedAt: "2026-10-01T00:00:00.000Z",
  reviewCount: 0, lastReviewedAt: null, status: "learning", missingFromDictionary: false, ease: 2.5, nextReviewAt: null,
  correctCount: 0, incorrectCount: 0, lastReviewResult: null, ...extra,
});

function seedWords(list) {
  localStore.setItem(WORDS, JSON.stringify(list));
}
const raw = (key) => localStore.getItem(key);

const FAILURES = [
  ["quota exceeded", () => control.failAllWrites(true), "quota"],
  ["generic write error", () => {
    control.storage.setItem = ((orig) => (k, v) => {
      if (k.includes("lire.")) throw new Error("boom");
      return orig(k, v);
    })(control.storage.setItem);
  }, "error"],
];
function restore(original) {
  control.failAllWrites(false);
  control.storage.setItem = original;
}

const originalSet = control.storage.setItem;

for (const [label, inject, reason] of FAILURES) {
  await t.section(`saved words: ${label}`, async () => {
    control.data.clear();
    control.storage.setItem("sorlio.storage.schema", "2");
    seedWords([word("chat"), word("chien")]);
    const before = raw(WORDS);
    const xpBefore = raw(XP);
    const activityBefore = raw(ACTIVITY);
    inject();

    const save = storage.saveWord(word("oiseau"));
    t.check(`[${label}] saveWord reports not persisted`, save.persisted === false && save.created === false);
    const review = storage.recordReviewResult("chat", "correct");
    t.check(`[${label}] review reports failure with reason`, review.ok === false && review.reason === reason, JSON.stringify({ ok: review.ok, reason: review.reason }));
    t.check(`[${label}] review returns the unchanged words`, review.words.find((w) => w.word === "chat").reviewCount === 0);
    const knownResult = storage.markWordAsKnown("chat");
    t.check(`[${label}] mark known reports failure`, knownResult.ok === false);
    const del = storage.deleteWord("chien");
    t.check(`[${label}] delete reports failure and keeps the word`, del.ok === false && del.words.some((w) => w.word === "chien"));
    const clear = storage.clearWords();
    t.check(`[${label}] clear reports failure and keeps everything`, clear.ok === false && clear.words.length === 2);

    restore(originalSet);
    t.check(`[${label}] stored words are byte-for-byte unchanged`, raw(WORDS) === before);
    t.check(`[${label}] no XP awarded`, raw(XP) === xpBefore);
    t.check(`[${label}] no activity recorded`, raw(ACTIVITY) === activityBefore);
    t.check(`[${label}] message never claims success`, !/saved\b(?!.*wasn't)/i.test(persistenceFailureMessage(reason)) || /wasn't|couldn't|can't/.test(persistenceFailureMessage(reason)));

    const ok = storage.recordReviewResult("chat", "correct");
    t.check(`[${label}] succeeds once storage recovers`, ok.ok === true && ok.words.find((w) => w.word === "chat").reviewCount === 1);
  });
}

await t.section("storage denied (reads throw): nothing is overwritten", async () => {
  control.data.clear();
  control.storage.setItem("sorlio.storage.schema", "2");
  seedWords([word("precieux")]);
  const before = raw(WORDS);
  control.failReads(true);
  const words = storage.getSavedWords();
  t.check("read failure yields no words to the UI", words.length === 0);
  // Still denied: the save must not write a one-word list over the real one.
  let threw = false;
  let save;
  try {
    save = storage.saveWord(word("nouveau"));
  } catch {
    threw = true;
  }
  control.failReads(false);
  t.check("a save while reads are denied is refused, not thrown", !threw && save.persisted === false);
  t.check("existing words were not replaced", raw(WORDS) === before);
  // Once reads work again, saving keeps the existing words.
  const recovered = storage.saveWord(word("nouveau"));
  t.check("after recovery the save keeps existing words", recovered.persisted === true && recovered.words.map((w) => w.word).sort().join() === "nouveau,precieux");
});

await t.section("corrupted saved words are never overwritten by a new save", async () => {
  control.data.clear();
  control.storage.setItem("sorlio.storage.schema", "2");
  localStore.setItem(WORDS, "{not json");
  t.check("unreadable list shows as empty", storage.getSavedWords().length === 0);
  const save = storage.saveWord(word("nouveau"));
  t.check("save refused", save.persisted === false);
  t.check("corrupted data preserved for recovery", raw(WORDS) === "{not json");
});

await t.section("phrases", async () => {
  control.data.clear();
  control.storage.setItem("sorlio.storage.schema", "2");
  localStore.setItem("lire.savedPhrases.v1", JSON.stringify([{ phrase: "tout de suite", lemma: "tout de suite", translation: "right away", savedAt: "2026-10-01T00:00:00Z", status: "learning", updatedAt: "2026-10-01T00:00:00Z", correctStreak: 0 }]));
  const before = raw("lire.savedPhrases.v1");
  control.failAllWrites(true);
  const review = phrases.recordPhraseReview("tout de suite", true);
  const knownP = phrases.markPhraseKnown("tout de suite");
  const del = phrases.deletePhrase("tout de suite");
  control.failAllWrites(false);
  t.check("phrase review reports failure", review.ok === false && review.reason === "quota");
  t.check("phrase mark-known reports failure", knownP.ok === false);
  t.check("phrase delete reports failure, phrase kept", del.ok === false && del.phrases.length === 1);
  t.check("stored phrases unchanged", raw("lire.savedPhrases.v1") === before);
  t.check("phrase review succeeds after recovery", phrases.recordPhraseReview("tout de suite", true).ok === true);
});

await t.section("known words", async () => {
  control.data.clear();
  control.storage.setItem("sorlio.storage.schema", "2");
  localStore.setItem("lire.knownWords.v1", JSON.stringify(["bonjour", "merci"]));
  control.failAllWrites(true);
  const failure = known.clearKnownWords();
  const marked = known.markKnown("salut");
  control.failAllWrites(false);
  t.check("clear reports the failure", failure === "quota");
  t.check("mark returns the unchanged list", !marked.includes("salut"));
  t.check("known words unchanged", JSON.parse(raw("lire.knownWords.v1")).join() === "bonjour,merci");
  t.check("clear succeeds after recovery", known.clearKnownWords() === null && JSON.parse(raw("lire.knownWords.v1")).length === 0);
});

await t.section("imported texts", async () => {
  control.data.clear();
  control.storage.setItem("sorlio.storage.schema", "2");
  const body = "Le petit chat dort sur le canapé pendant que la pluie tombe doucement sur la ville silencieuse ce soir.";
  control.failAllWrites(true);
  const saved = custom.saveCustomText({ title: "Journal", body, category: "news-style", difficulty: "A2" });
  control.failAllWrites(false);
  t.check("failed import reports failure (no navigation to a missing text)", saved.ok === false && saved.reason === "quota");
  t.check("nothing stored", custom.getCustomTexts().length === 0);
  const tooLong = custom.saveCustomText({ title: "", body: "mot ".repeat(20_000), category: "news-style", difficulty: "A2" });
  t.check("over-long import refused with a reason", tooLong.ok === false && tooLong.reason === "too-long");
  const ok = custom.saveCustomText({ title: "Journal", body, category: "news-style", difficulty: "A2" });
  t.check("import succeeds normally", ok.ok === true && custom.getCustomTexts().length === 1);
  control.failAllWrites(true);
  const del = custom.deleteCustomText(ok.text.id);
  control.failAllWrites(false);
  t.check("failed delete keeps the text and says so", del.ok === false && custom.getCustomTexts().length === 1);
  t.check("delete succeeds normally", custom.deleteCustomText(ok.text.id).ok === true && custom.getCustomTexts().length === 0);
});

t.finish();
