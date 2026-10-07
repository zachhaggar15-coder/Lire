/**
 * Review membership — behavioural tests for the reader's word control.
 *
 * A normal word shows exactly "Add to review" or "Remove from review",
 * decided only by whether it has a card in Review. These drive the real
 * storage mutations, the quota guard, the membership index the reader builds,
 * the sheet's control function, the real dictionary's lemmas, the estimated
 * vocabulary, and (for sync) the real engine against the production SQL.
 */

import { createDatabase } from "./lib/pgHarness.mjs";
import { createStorage, createRunner, installWindow } from "./lib/fakeBrowser.mjs";

const t = createRunner("review membership");
const A = "aaaaaaaa-0000-4000-8000-0000000000a1";
const B = "bbbbbbbb-0000-4000-8000-0000000000b2";
const WORDS = "lire.savedWords.v1";

const control = createStorage();
installWindow(control);
const originalSetItem = control.storage.setItem.bind(control.storage);

const { setActiveIdentity, storeFor, __resetLocalStoreForTests, localStore } = await import("../src/lib/localData/store.ts");
const { accountIdentity, GUEST } = await import("../src/lib/localData/identity.ts");
const storage = await import("../src/lib/storage.ts");
const { saveWordForAccess } = await import("../src/lib/access/saveWord.ts");
const { accessContext, accessTier } = await import("../src/lib/access/accessModel.ts");
const { newSavesToday } = await import("../src/lib/access/saveAllowance.ts");
const { VocabularyIndex, reviewControlFor, REVIEW_CONTROL_LABEL, isInReview, isMastered } = await import("../src/lib/reviewMembership.ts");
const { buildReviewQueue, defaultSpacedRepetitionFields } = await import("../src/lib/spacedRepetition.ts");
const { lookupWord } = await import("../src/lib/dictionary/lookup.ts");
const { saveOnboarding, updateSelectedReadingLevel } = await import("../src/lib/onboarding.ts");
const { getEstimatedKnownVocabulary } = await import("../src/lib/vocabulary/estimatedVocabulary.ts");
const { syncPartition } = await import("../src/lib/sync/engine.ts");

const card = (word, extra = {}) => ({
  word,
  lemma: extra.lemma === undefined ? lookupWord(word).lemma ?? word : extra.lemma,
  translations: [word],
  primaryTranslation: word,
  partOfSpeech: null,
  gender: null,
  cefr: null,
  frequencyRank: null,
  articleContextSentence: `Un ${word}.`,
  exampleSentenceFr: `Un ${word}.`,
  exampleSentenceEn: `A ${word}.`,
  sourceTextTitle: "Membership test",
  savedAt: "2026-10-01T00:00:00.000Z",
  reviewCount: 0,
  lastReviewedAt: null,
  status: "learning",
  missingFromDictionary: false,
  ...defaultSpacedRepetitionFields(),
  ...extra,
});

/** What the reader's sheet shows for a tapped surface form, exactly as Reader + MeaningSheet derive it. */
function sheetLabel(surface, words = storage.getSavedWords()) {
  const lookup = lookupWord(surface);
  const clean = surface.toLowerCase();
  const isProperNoun = (lookup.partOfSpeech ?? "").toLowerCase().includes("proper noun");
  const inReview = new VocabularyIndex(words).inReview(clean, lookup.lemma?.toLowerCase());
  return REVIEW_CONTROL_LABEL[reviewControlFor({ inReview, isProperNoun })];
}

const ADD = "Add to review";
const REMOVE = "Remove from review";
const premium = () => accessContext(accessTier(true, true));
const free = () => accessContext(accessTier(true, false), newSavesToday());

function freshAccount(userId = A) {
  control.data.clear();
  control.storage.setItem("sorlio.storage.schema", "2");
  __resetLocalStoreForTests(accountIdentity(userId));
}

// ---------------------------------------------------------------------------

await t.section("1–3: unsaved, learning and unsure words", async () => {
  freshAccount();
  t.check("1. an unsaved ordinary word offers Add", sheetLabel("maison") === ADD);
  storage.addWordToReview(card("maison"));
  t.check("2. a saved learning word offers Remove", sheetLabel("maison") === REMOVE);
  localStore.setItem(WORDS, JSON.stringify([card("fenêtre", { status: "unsure" })]));
  t.check("3. a saved unsure word offers Remove", sheetLabel("fenêtre") === REMOVE);
});

await t.section("4–5: estimated vocabulary never decides membership", async () => {
  freshAccount();
  saveOnboarding("C2", []);
  const estimated = getEstimatedKnownVocabulary();
  t.check("the C2 estimate includes common words like maison", estimated.has("maison"));
  t.check("4. a word in the CEFR estimate but not saved offers Add", sheetLabel("maison") === ADD);
  // Legacy data: an old onboarding seed / manual known mark for a saved word.
  localStore.setItem("lire.knownWords.v1", JSON.stringify(["maison", "chat"]));
  storage.addWordToReview(card("chat"));
  t.check("5. a saved word also in the old known list offers Remove (saved membership wins)", sheetLabel("chat") === REMOVE);
  t.check("   and an old known-list word that is not saved offers Add", sheetLabel("maison") === ADD);
});

await t.section("6–9: legacy known cards, reactivation, removal, reload", async () => {
  freshAccount();
  const legacy = card("souvent", { status: "known", reviewCount: 6, correctCount: 3, ease: 1.45, nextReviewAt: "2026-11-01T00:00:00.000Z" });
  localStore.setItem(WORDS, JSON.stringify([legacy]));
  t.check("6. a legacy known card offers Add", sheetLabel("souvent") === ADD);
  const before = newSavesToday();
  const added = saveWordForAccess(free(), card("souvent"));
  const after = storage.getSavedWords().find((w) => w.word === "souvent");
  t.check("6. Add genuinely reactivates it", added.result?.reactivated === true && isInReview(after));
  t.check("   keeping its review history", after.reviewCount === 6 && after.correctCount === 3 && after.ease === 1.45 && after.nextReviewAt === "2026-11-01T00:00:00.000Z");
  t.check("   without a duplicate card", storage.getSavedWords().filter((w) => w.word === "souvent").length === 1);
  t.check("   and without using a new save", newSavesToday() === before);
  t.check("7. the reactivated word immediately offers Remove", sheetLabel("souvent", added.result.words) === REMOVE);
  const removed = storage.removeWordFromReview("souvent", lookupWord("souvent").lemma);
  t.check("8. Remove immediately offers Add", removed.ok && sheetLabel("souvent", removed.words) === ADD);
  t.check("   and keeps the card and its history", removed.words.find((w) => w.word === "souvent")?.reviewCount === 6);
  t.check("   and takes it out of the review queue", !buildReviewQueue(removed.words, Date.parse("2027-01-01")).some((w) => w.word === "souvent"));
  // 9. A fresh page load: nothing but storage.
  __resetLocalStoreForTests(accountIdentity(A));
  t.check("9. after reload the removed word still offers Add", sheetLabel("souvent") === ADD);
  storage.addWordToReview(card("souvent"));
  __resetLocalStoreForTests(accountIdentity(A));
  t.check("9. after reload a re-added word still offers Remove", sheetLabel("souvent") === REMOVE);
});

await t.section("11: accounts on one device", async () => {
  freshAccount(A);
  storage.addWordToReview(card("voiture"));
  t.check("11. account A sees Remove", sheetLabel("voiture") === REMOVE);
  setActiveIdentity(accountIdentity(B));
  t.check("11. account B sees Add", sheetLabel("voiture") === ADD);
  setActiveIdentity(GUEST);
  t.check("    a guest sees Add", sheetLabel("voiture") === ADD);
  setActiveIdentity(accountIdentity(A));
  t.check("    A still sees Remove after switching back", sheetLabel("voiture") === REMOVE);
});

await t.section("12: inflections share one card", async () => {
  freshAccount();
  const lemmaOf = (w) => lookupWord(w).lemma;
  t.check("dictionary: vais/va/allé → aller; suis/est → être; a/ont → avoir", lemmaOf("vais") === "aller" && lemmaOf("va") === "aller" && lemmaOf("allé") === "aller" && lemmaOf("suis") === "être" && lemmaOf("ont") === "avoir", ["vais", "va", "allé", "suis", "ont"].map(lemmaOf).join());
  storage.addWordToReview(card("vais"));
  t.check("12. vais, va and allé all offer Remove once vais is saved", ["vais", "va", "allé"].every((w) => sheetLabel(w) === REMOVE), ["vais", "va", "allé"].map((w) => sheetLabel(w)).join());
  const second = storage.addWordToReview(card("va"));
  t.check("    adding another form does not create a second card", second.created === false && storage.getSavedWords().length === 1);
  storage.removeWordFromReview("va", lemmaOf("va"));
  t.check("12. removing from another form offers Add on every form", ["vais", "va", "allé"].every((w) => sheetLabel(w) === ADD));
  storage.addWordToReview(card("suis"));
  t.check("    an être card is untouched by aller's state", sheetLabel("est") === REMOVE && sheetLabel("va") === ADD);
  // A card whose lemma is unknown matches only its own form.
  storage.addWordToReview(card("zorglub", { lemma: null }));
  storage.removeWordFromReview("ont", lemmaOf("ont"));
  t.check("    removing an unrelated lemma leaves other cards alone", sheetLabel("suis") === REMOVE && sheetLabel("zorglub") === REMOVE);
});

await t.section("13: the CEFR level never changes membership", async () => {
  freshAccount();
  saveOnboarding("B1", []);
  storage.addWordToReview(card("table"));
  storage.addWordToReview(card("jardin"));
  storage.removeWordFromReview("jardin", "jardin");
  const before = localStore.getItem(WORDS);
  updateSelectedReadingLevel("C2");
  updateSelectedReadingLevel("A1");
  t.check("13. saved words are byte-for-byte unchanged by level changes", localStore.getItem(WORDS) === before);
  t.check("13. controls unchanged", sheetLabel("table") === REMOVE && sheetLabel("jardin") === ADD);
  t.check("    no known-word list is written", localStore.getItem("lire.knownWords.v1") === null);
});

await t.section("14: three correct answers keep the card in Review", async () => {
  freshAccount();
  storage.addWordToReview(card("lentement"));
  for (let i = 0; i < 3; i++) storage.recordReviewResult("lentement", "correct");
  const after = storage.getSavedWords().find((w) => w.word === "lentement");
  t.check("14. after three Knew it the card is still in Review", isInReview(after) && after.status === "learning");
  t.check("    it counts as mastered", isMastered(after));
  t.check("    it is scheduled further out, not dropped", buildReviewQueue([after], Date.parse(after.nextReviewAt) + 1).length === 1 && Date.parse(after.nextReviewAt) > Date.now() + 6 * 864e5);
  t.check("14. the reader offers Remove (no third state)", sheetLabel("lentement") === REMOVE);
});

await t.section("15–17: the free daily limit", async () => {
  freshAccount();
  const words = ["un", "deux", "trois", "quatre", "cinq"].map((w) => `${w}mot`);
  for (const [i, w] of words.entries()) {
    const out = saveWordForAccess(free(), card(w, { lemma: null }));
    if (i === 4) t.check("15. the 5th new save is allowed", out.decision.allowed && out.result?.created === true);
  }
  t.check("    five new saves are counted", newSavesToday() === 5);
  const sixth = saveWordForAccess(free(), card("sixmot", { lemma: null }));
  t.check("16. a 6th genuinely new save is blocked and stores nothing", sixth.result === null && !storage.getSavedWords().some((w) => w.word === "sixmot"));
  storage.removeWordFromReview("unmot", null);
  t.check("17. removing does not give a save back", newSavesToday() === 5 && saveWordForAccess(free(), card("septmot", { lemma: null })).result === null);
  const back = saveWordForAccess(free(), card("unmot", { lemma: null }));
  t.check("17. re-adding the same word at the limit is allowed and free", back.result?.reactivated === true && newSavesToday() === 5);
  for (let i = 0; i < 3; i++) {
    storage.removeWordFromReview("unmot", null);
    saveWordForAccess(free(), card("unmot", { lemma: null }));
  }
  t.check("17. remove/re-add cycles never count as new saves", newSavesToday() === 5 && storage.getSavedWords().filter((w) => w.word === "unmot").length === 1);
  t.check("    repeated Add on a word already in Review is a no-op", saveWordForAccess(free(), card("deuxmot", { lemma: null })).result?.created === false && newSavesToday() === 5);
  t.check("    Premium is never limited", saveWordForAccess(premium(), card("huitmot", { lemma: null })).result?.created === true);
});

await t.section("18: a failed write never shows Remove", async () => {
  freshAccount();
  localStore.setItem(WORDS, JSON.stringify([card("perdu", { removedFromReviewAt: "2026-10-02T00:00:00.000Z" })]));
  control.storage.setItem = () => {
    const error = new Error("full");
    error.name = "QuotaExceededError";
    throw error;
  };
  const before = newSavesToday();
  const fresh = saveWordForAccess(premium(), card("neuf"));
  const back = saveWordForAccess(premium(), card("perdu"));
  control.storage.setItem = originalSetItem;
  t.check("18. a failed new save reports not persisted and the sheet still offers Add", fresh.result?.persisted === false && sheetLabel("neuf", fresh.result.words) === ADD);
  t.check("18. a failed re-add reports not persisted and the sheet still offers Add", back.result?.persisted === false && sheetLabel("perdu", back.result.words) === ADD);
  t.check("    nothing counted against the limit", newSavesToday() === before);
  t.check("    storage holds only the removed card", storage.getSavedWords().length === 1 && !isInReview(storage.getSavedWords()[0]));
});

await t.section("19 (two tabs): a stale control cannot resurrect or duplicate", async () => {
  freshAccount();
  storage.addWordToReview(card("rideau"));
  const staleTab = storage.getSavedWords(); // tab 2's snapshot: in Review
  storage.removeWordFromReview("rideau", "rideau"); // tab 1 removes it
  t.check("stale tab still shows Remove", sheetLabel("rideau", staleTab) === REMOVE);
  const staleRemove = storage.removeWordFromReview("rideau", "rideau");
  t.check("19. its Remove is a harmless no-op on what is stored", staleRemove.ok && sheetLabel("rideau", staleRemove.words) === ADD);
  storage.addWordToReview(card("rideau")); // tab 1 adds it back
  const staleAdd = storage.addWordToReview(card("rideau")); // tab 2 (showing Add) adds too
  t.check("19. a stale Add neither duplicates nor counts as new", staleAdd.created === false && storage.getSavedWords().filter((w) => w.word === "rideau").length === 1);
});

await t.section("20: names only close", async () => {
  freshAccount();
  const paris = lookupWord("Paris");
  t.check("the dictionary marks Paris as a proper noun", (paris.partOfSpeech ?? "").includes("proper noun"), String(paris.partOfSpeech));
  t.check("20. a proper noun shows Close, not a review control", sheetLabel("Paris") === "Close");
  t.check("    every other word gets exactly one of the two labels", ["maison", "souvent", "vais", "zorglub"].every((w) => [ADD, REMOVE].includes(sheetLabel(w))));
  // A word Sorlio found no meaning for cannot become a useful card, so it
  // closes instead of offering an Add that would do nothing.
  t.check("20. a word with no meaning closes rather than offering a dead Add", reviewControlFor({ inReview: false, isProperNoun: false, noMeaning: true }) === "close");
  t.check("20. but if it is already in Review it can still be removed", reviewControlFor({ inReview: true, isProperNoun: false, noMeaning: true }) === "remove");
  t.check("    a word with a meaning is unaffected", reviewControlFor({ inReview: false, isProperNoun: false, noMeaning: false }) === "add");
});

// ---------------------------------------------------------------------------
// Sync: device 1 is this window (the app's own functions); device 2 is a
// second storage. Both talk to real Postgres with the production migrations.

function rawDevice(userId) {
  const other = createStorage();
  const prefix = `sorlio.v2:acct.${userId}:`;
  return {
    identity: { kind: "account", userId },
    getItem: (k) => other.storage.getItem(prefix + k),
    setItem: (k, v) => other.storage.setItem(prefix + k, v),
    removeItem: (k) => other.storage.removeItem(prefix + k),
    writeItem(k, v) {
      other.storage.setItem(prefix + k, v);
      return { ok: true };
    },
    deleteItem(k) {
      other.storage.removeItem(prefix + k);
      return { ok: true };
    },
    keys: () => [],
  };
}

function transport(h, userId) {
  return {
    pull: (expected, afterRev, limit) => h.rpc(userId, "sorlio_sync_pull", { p_expected_user: expected, p_after_rev: afterRev, p_limit: limit }),
    push: (expected, ops, day) => h.rpc(userId, "sorlio_sync_push", { p_expected_user: expected, p_ops: ops, p_day: day }),
  };
}

const TODAY = new Date().toISOString().slice(0, 10);
const sync = (h, store, userId = A) => syncPartition({ userId, store, transport: transport(h, userId), stillCurrent: () => true, today: () => TODAY });
const words2 = (store) => JSON.parse(store.getItem(WORDS) ?? "[]");

await t.section("10 + 19: membership survives sync, and a stale device cannot resurrect", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  freshAccount(A);
  const d1 = storeFor(accountIdentity(A));
  const d2 = rawDevice(A);

  storage.addWordToReview(card("fromage"));
  storage.addWordToReview(card("pain"));
  await sync(h, d1);
  await sync(h, d2);
  t.check("10. device 2 receives the cards in Review", sheetLabel("fromage", words2(d2)) === REMOVE && sheetLabel("pain", words2(d2)) === REMOVE);

  storage.removeWordFromReview("fromage", "fromage");
  await sync(h, d1);
  // Device 2 is stale: it reviewed fromage offline before hearing of the removal.
  const graded = words2(d2).map((w) => (w.word === "fromage" ? { ...w, reviewCount: 1, lastReviewResult: "correct" } : w));
  d2.setItem(WORDS, JSON.stringify(graded));
  await sync(h, d2);
  await sync(h, d1);
  const d2fromage = words2(d2).find((w) => w.word === "fromage");
  t.check("19. the stale device's edit does not put the word back in Review", sheetLabel("fromage", words2(d2)) === ADD && !!d2fromage?.removedFromReviewAt, JSON.stringify(d2fromage));
  t.check("    and its review was kept (three-way merge)", d2fromage?.reviewCount === 1);
  t.check("10. device 1 agrees after the round trip", sheetLabel("fromage") === ADD && storage.getSavedWords().find((w) => w.word === "fromage")?.reviewCount === 1);

  storage.addWordToReview(card("fromage"));
  await sync(h, d1);
  await sync(h, d2);
  t.check("10. re-adding syncs: device 2 offers Remove", sheetLabel("fromage", words2(d2)) === REMOVE);
  const { rows } = await h.db.query("select count(*)::int as n from public.sorlio_sync_items where user_id = $1 and store_key = $2", [A, WORDS]);
  t.check("    one server item per word (re-adding is an update)", rows[0].n === 2);
});

await t.section("server: putting a card back is not a new save for the free limit", async () => {
  const h = await createDatabase();
  await h.addUser(B);
  freshAccount(B);
  const d1 = storeFor(accountIdentity(B));
  // The device's first sync uploads in import mode (the one-time carry-over
  // allowance); sync once first so the saves below are ordinary daily saves.
  await sync(h, d1, B);
  for (const w of ["amot", "bmot", "cmot", "dmot", "emot"]) storage.addWordToReview(card(w, { lemma: null }));
  await sync(h, d1, B);
  storage.removeWordFromReview("amot", null);
  await sync(h, d1, B);
  storage.addWordToReview(card("amot", { lemma: null }));
  storage.addWordToReview(card("fmot", { lemma: null }));
  await sync(h, d1, B);
  const server = new Map((await h.db.query("select item_id, data from public.sorlio_sync_items where user_id = $1 and store_key = $2", [B, WORDS])).rows.map((r) => [r.item_id, r.data]));
  t.check("the server accepted the first five new words", ["amot", "bmot", "cmot", "dmot", "emot"].every((w) => server.has(w)));
  t.check("the server accepted re-adding amot (an update) at its daily limit", server.has("amot") && !server.get("amot").removedFromReviewAt);
  t.check("the server refused a 6th genuinely new word for a free account", !server.has("fmot"));
});

t.finish();
