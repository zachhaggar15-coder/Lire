/**
 * Account isolation on a shared device — behavioural tests.
 *
 * Drives the real partition layer, legacy migration, guest adoption, deletion
 * cleanup and the sync engine (against real Postgres) through the scenarios
 * that previously leaked one account's data into another.
 */

import { createDatabase } from "./lib/pgHarness.mjs";
import { createStorage, createRunner, installWindow } from "./lib/fakeBrowser.mjs";

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://testref.supabase.co";
const SESSION_KEY = "sb-testref-auth-token";

const t = createRunner("account isolation");
const A = "aaaaaaaa-0000-4000-8000-00000000000a";
const B = "bbbbbbbb-0000-4000-8000-00000000000b";
const WORDS = "lire.savedWords.v1";
const TEXTS = "lire.customTexts.v1";

const control = createStorage();
installWindow(control);

const store = await import("../src/lib/localData/store.ts");
const identity = await import("../src/lib/localData/identity.ts");
const migrate = await import("../src/lib/localData/migrateLegacy.ts");
const adoption = await import("../src/lib/localData/guestAdoption.ts");
const cleanup = await import("../src/lib/localData/accountCleanup.ts");
const engine = await import("../src/lib/sync/engine.ts");

const { localStore, storeFor, setActiveIdentity, activeIdentity, __resetLocalStoreForTests, erasePartition, currentGeneration, isCurrentGeneration } = store;
const { accountIdentity, GUEST, rememberDeletedAccount } = identity;

function signInSession(userId) {
  control.storage.setItem(SESSION_KEY, JSON.stringify({ access_token: "x", user: { id: userId } }));
}
function clearSession() {
  control.storage.removeItem(SESSION_KEY);
}
/** Simulates a fresh page load in this "tab". */
function reloadTab() {
  __resetLocalStoreForTests(null);
  return activeIdentity();
}
const word = (w) => ({ word: w, lemma: w, translations: [w], primaryTranslation: w, savedAt: "2026-10-01T00:00:00.000Z", reviewCount: 0, status: "learning" });
const readWords = (s = localStore) => JSON.parse(s.getItem(WORDS) ?? "[]").map((w) => w.word).sort();

// ---------------------------------------------------------------------------

await t.section("legacy migration: signed-in device moves data to that account", async () => {
  control.data.clear();
  control.storage.setItem(WORDS, JSON.stringify([word("ancien")]));
  control.storage.setItem("lire.sync.storeMetadata.v1", JSON.stringify({ [WORDS]: { tombstones: { autre: "2026-01-01T00:00:00Z" } } }));
  control.storage.setItem("lire.validation.v1", JSON.stringify({ anonymousId: "anon_123" }));
  control.storage.setItem("lire.swAutoReloaded.v1", "1");
  signInSession(A);
  const id = reloadTab();
  t.check("identity is the signed-in account", id.kind === "account" && id.userId === A);
  t.check("words now in A's partition", JSON.stringify(readWords(storeFor(accountIdentity(A)))) === '["ancien"]');
  t.check("no words in guest partition", readWords(storeFor(GUEST)).length === 0);
  t.check("legacy key removed", control.storage.getItem(WORDS) === null);
  t.check("old cross-account tombstones dropped", control.storage.getItem("lire.sync.storeMetadata.v1") === null && storeFor(accountIdentity(A)).getItem("lire.sync.storeMetadata.v1") === null);
  t.check("retired analytics id dropped", control.storage.getItem("lire.validation.v1") === null && storeFor(accountIdentity(A)).getItem("lire.validation.v1") === null);
  t.check("device keys untouched", control.storage.getItem("lire.swAutoReloaded.v1") === "1");
  t.check("schema marked", control.storage.getItem("sorlio.storage.schema") === "2");
  const again = migrate.migrateLegacyStorage(control.storage);
  t.check("migration is idempotent", again.migrated === false);
});

await t.section("legacy migration: signed-out device moves data to guest", async () => {
  control.data.clear();
  control.storage.setItem(WORDS, JSON.stringify([word("invite")]));
  clearSession();
  const id = reloadTab();
  t.check("identity is guest", id.kind === "guest");
  t.check("words in guest partition", JSON.stringify(readWords()) === '["invite"]');
});

await t.section("legacy migration: crash part-way resumes without loss", async () => {
  control.data.clear();
  for (let i = 0; i < 6; i++) control.storage.setItem(`lire.store${i}.v1`, `"value-${i}"`);
  signInSession(A);
  // The journal write succeeds, the third copy fails (simulated crash / quota).
  let writes = 0;
  const realSet = control.storage.setItem;
  control.storage.setItem = (k, v) => {
    writes += 1;
    if (writes === 4) throw Object.assign(new Error("quota"), { name: "QuotaExceededError" });
    return realSet(k, v);
  };
  const first = migrate.migrateLegacyStorage(control.storage);
  control.storage.setItem = realSet;
  t.check("interrupted migration reports not-migrated", first.migrated === false);
  // Meanwhile the session changes — the journal must keep the original target.
  signInSession(B);
  const second = migrate.migrateLegacyStorage(control.storage);
  t.check("resumed migration completes", second.migrated === true);
  const partA = storeFor(accountIdentity(A));
  const values = Array.from({ length: 6 }, (_, i) => partA.getItem(`lire.store${i}.v1`));
  t.check("every value reached the ORIGINAL target account", values.every((v, i) => v === `"value-${i}"`), JSON.stringify(values));
  t.check("nothing leaked to B", storeFor(accountIdentity(B)).keys().length === 0);
  t.check("no legacy keys remain", [...control.data.keys()].every((k) => !/^lire\.store/.test(k)));
});

await t.section("A → sign out → B: B sees none of A's data, private imports included", async () => {
  control.data.clear();
  control.storage.setItem("sorlio.storage.schema", "2");
  signInSession(A);
  reloadTab();
  localStore.setItem(WORDS, JSON.stringify([word("a-secret")]));
  localStore.setItem(TEXTS, JSON.stringify([{ id: "custom-diary", title: "Mon journal", body: "très privé" }]));
  localStore.setItem("lire.aiCache.word:abc", JSON.stringify({ meaning: "from A's private text" }));
  // Sign out: the app switches to guest and reloads.
  clearSession();
  setActiveIdentity(GUEST);
  reloadTab();
  t.check("guest sees no words", readWords().length === 0);
  t.check("guest sees no imported text", localStore.getItem(TEXTS) === null);
  t.check("guest sees no AI cache from A", localStore.getItem("lire.aiCache.word:abc") === null);
  signInSession(B);
  const id = reloadTab();
  t.check("now B", id.kind === "account" && id.userId === B);
  t.check("B sees no words", readWords().length === 0);
  t.check("B sees no imported text", localStore.getItem(TEXTS) === null);
  t.check("A's data still intact in A's partition", JSON.stringify(readWords(storeFor(accountIdentity(A)))) === '["a-secret"]');
});

await t.section("A → sign out → A again: A's data returns", async () => {
  clearSession();
  signInSession(A);
  reloadTab();
  t.check("A's words back", JSON.stringify(readWords()) === '["a-secret"]');
  t.check("A's imported text back", JSON.parse(localStore.getItem(TEXTS))[0].title === "Mon journal");
});

await t.section("A's deletions never reach B's server data; A's data never uploads to B", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await h.addUser(B);
  // B already has "chat" in the cloud.
  await h.rpc(B, "sorlio_sync_push", { p_expected_user: B, p_ops: [{ store: WORDS, id: "chat", op: "put", base_rev: null, data: word("chat") }], p_day: null });
  control.data.clear();
  control.storage.setItem("sorlio.storage.schema", "2");
  const partA = storeFor(accountIdentity(A));
  partA.setItem(WORDS, JSON.stringify([word("chat"), word("a-only")]));
  // A deletes "chat" locally and pretends its sync base had it (a tombstone-to-be).
  partA.setItem(engine.SYNC_STATE_KEY, JSON.stringify({ v: 2, cursor: 5, bootstrapped: true, base: { [WORDS]: { chat: [1, "x"] } }, deferred: {}, adopted: {} }));
  partA.setItem(WORDS, JSON.stringify([word("a-only")]));
  // B signs in on the same device and syncs ITS partition.
  const partB = storeFor(accountIdentity(B));
  const out = await engine.syncPartition({
    userId: B,
    store: partB,
    transport: {
      pull: (u, after, limit) => h.rpc(B, "sorlio_sync_pull", { p_expected_user: u, p_after_rev: after, p_limit: limit }),
      push: (u, ops, day) => h.rpc(B, "sorlio_sync_push", { p_expected_user: u, p_ops: ops, p_day: day }),
    },
    stillCurrent: () => true,
    today: () => new Date().toISOString().slice(0, 10),
  });
  t.check("B's sync succeeds", out.status === "success", JSON.stringify(out));
  const { rows } = await h.db.query("select item_id, deleted from public.sorlio_sync_items where user_id = $1", [B]);
  t.check("B's chat survives A's deletion", rows.some((r) => r.item_id === "chat" && !r.deleted));
  t.check("A's word never uploaded to B", !rows.some((r) => r.item_id === "a-only"));
  t.check("B's device got only B's data", JSON.stringify(readWords(partB)) === '["chat"]');
});

await t.section("guest → A, decline: data stays separate; asked once", async () => {
  control.data.clear();
  control.storage.setItem("sorlio.storage.schema", "2");
  const guest = storeFor(GUEST);
  guest.setItem(WORDS, JSON.stringify([word("g1"), word("g2")]));
  const acct = accountIdentity(A);
  const offer = adoption.shouldOfferAdoption(acct);
  t.check("offer made with counts", offer?.savedWords === 2);
  adoption.recordKeepSeparate(acct, offer);
  t.check("not asked again for the same guest data", adoption.shouldOfferAdoption(acct) === null);
  t.check("guest data untouched", readWords(guest).join() === "g1,g2");
  t.check("account got nothing", readWords(storeFor(acct)).length === 0);
  guest.setItem(WORDS, JSON.stringify([word("g1"), word("g2"), word("g3")]));
  t.check("asked again once guest data changes", adoption.shouldOfferAdoption(acct)?.savedWords === 3);
});

await t.section("guest → A, accept: merged, no duplicates, idempotent retry", async () => {
  control.data.clear();
  control.storage.setItem("sorlio.storage.schema", "2");
  const guest = storeFor(GUEST);
  const acct = accountIdentity(A);
  const partA = storeFor(acct);
  partA.setItem(WORDS, JSON.stringify([word("shared"), word("a1")]));
  guest.setItem(WORDS, JSON.stringify([word("shared"), word("g1")]));
  guest.setItem("lire.knownWords.v1", JSON.stringify(["bonjour"]));
  const result = adoption.adoptGuestData(acct);
  t.check("adoption ok", result.ok);
  t.check("account has union without duplicates", readWords(partA).join() === "a1,g1,shared", readWords(partA).join());
  t.check("known words moved", JSON.parse(partA.getItem("lire.knownWords.v1")).includes("bonjour"));
  t.check("guest copies removed", guest.getItem(WORDS) === null);
  const state = JSON.parse(partA.getItem(engine.SYNC_STATE_KEY));
  t.check("new items marked for 'adopt' upload", state.adopted[WORDS]?.g1 === 1 && !state.adopted[WORDS]?.shared);
  // Retry after a crash between merge and guest cleanup.
  guest.setItem(WORDS, JSON.stringify([word("shared"), word("g1")]));
  adoption.adoptGuestData(acct);
  t.check("retry does not duplicate", readWords(partA).join() === "a1,g1,shared");
  t.check("no further offer", adoption.shouldOfferAdoption(acct) === null);
});

await t.section("adoption failure leaves guest data intact", async () => {
  control.data.clear();
  control.storage.setItem("sorlio.storage.schema", "2");
  const guest = storeFor(GUEST);
  guest.setItem(WORDS, JSON.stringify([word("garde")]));
  control.failAllWrites(true);
  const result = adoption.adoptGuestData(accountIdentity(A));
  control.failAllWrites(false);
  t.check("reports failure honestly", !result.ok && /storage/i.test(result.error), JSON.stringify(result));
  t.check("guest data still there", readWords(guest).join() === "garde");
});

await t.section("adopted words upload with the carry-over allowance, not the daily limit", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  control.data.clear();
  control.storage.setItem("sorlio.storage.schema", "2");
  const guest = storeFor(GUEST);
  const acct = accountIdentity(A);
  const partA = storeFor(acct);
  partA.setItem(engine.SYNC_STATE_KEY, JSON.stringify({ v: 2, cursor: 0, bootstrapped: true, base: {}, deferred: {}, adopted: {} }));
  guest.setItem(WORDS, JSON.stringify(Array.from({ length: 12 }, (_, i) => word(`g${i}`))));
  adoption.adoptGuestData(acct);
  const out = await engine.syncPartition({
    userId: A,
    store: partA,
    transport: {
      pull: (u, after, limit) => h.rpc(A, "sorlio_sync_pull", { p_expected_user: u, p_after_rev: after, p_limit: limit }),
      push: (u, ops, day) => h.rpc(A, "sorlio_sync_push", { p_expected_user: u, p_ops: ops, p_day: day }),
    },
    stillCurrent: () => true,
    today: () => new Date().toISOString().slice(0, 10),
  });
  const { rows } = await h.db.query("select count(*)::int n from public.sorlio_sync_items where user_id = $1 and store_key = $2", [A, WORDS]);
  t.check("all 12 adopted words synced for a free account", out.status === "success" && rows[0].n === 12, JSON.stringify(out));
  const { rows: st } = await h.db.query("select carried_over_saves from public.sorlio_sync_state where user_id = $1", [A]);
  t.check("allowance consumed", st[0].carried_over_saves === 12);
  // A brand-new save today is still subject to the daily limit.
  const fresh = await h.rpc(A, "sorlio_sync_push", { p_expected_user: A, p_ops: Array.from({ length: 6 }, (_, i) => ({ store: WORDS, id: `n${i}`, op: "put", base_rev: null, data: word(`n${i}`), mode: "normal" })), p_day: null });
  t.check("normal saves still capped at 5/day", fresh.results.filter((r) => r.status === "applied").length === 5);
});

await t.section("account deletion: partition erased, cannot be recreated, guest untouched", async () => {
  control.data.clear();
  control.storage.setItem("sorlio.storage.schema", "2");
  storeFor(GUEST).setItem(WORDS, JSON.stringify([word("invite")]));
  storeFor(accountIdentity(B)).setItem(WORDS, JSON.stringify([word("b-word")]));
  signInSession(A);
  reloadTab();
  localStore.setItem(WORDS, JSON.stringify([word("a-word")]));
  const generation = currentGeneration();
  // Server confirmed deletion → device forgets the account.
  rememberDeletedAccount(A);
  setActiveIdentity(GUEST);
  erasePartition(accountIdentity(A));
  clearSession();
  t.check("A's partition gone", storeFor(accountIdentity(A)).keys().length === 0);
  t.check("guest data untouched", readWords(storeFor(GUEST)).join() === "invite");
  t.check("other account untouched", readWords(storeFor(accountIdentity(B))).join() === "b-word");
  t.check("generation moved on (in-flight work invalid)", !isCurrentGeneration(generation));
  // A late write from in-flight work aimed at A is refused.
  const late = storeFor(accountIdentity(A)).writeItem(WORDS, JSON.stringify([word("zombie")]));
  t.check("late write to deleted account refused", !late.ok && late.reason === "stale-identity");
  t.check("nothing recreated", storeFor(accountIdentity(A)).keys().length === 0);
  // A session for the deleted id (e.g. a stale token) never selects that partition.
  signInSession(A);
  t.check("deleted id never becomes active", reloadTab().kind === "guest");
});

await t.section("accounts deleted elsewhere are erased from this device", async () => {
  control.data.clear();
  control.storage.setItem("sorlio.storage.schema", "2");
  const C = "cccccccc-0000-4000-8000-00000000000c";
  storeFor(accountIdentity(B)).setItem(WORDS, JSON.stringify([word("b")]));
  storeFor(accountIdentity(C)).setItem(WORDS, JSON.stringify([word("c")]));
  clearSession();
  reloadTab();
  let asked = null;
  const fakeFetch = async (_url, init) => {
    asked = JSON.parse(init.body).ids.sort();
    return { ok: true, json: async () => ({ missing: [C] }) };
  };
  const result = await cleanup.cleanUpDeletedAccounts(fakeFetch, control.storage, Date.now());
  t.check("asked about both accounts on the device", JSON.stringify(asked) === JSON.stringify([B, C].sort()));
  t.check("deleted account erased", storeFor(accountIdentity(C)).keys().length === 0 && result.erased.includes(C));
  t.check("existing account kept", readWords(storeFor(accountIdentity(B))).join() === "b");
  const second = await cleanup.cleanUpDeletedAccounts(fakeFetch, control.storage, Date.now() + 1000);
  t.check("rate-limited to once a day", second.checked === 0);
  const failing = async () => ({ ok: false, json: async () => ({}) });
  control.storage.removeItem("sorlio.accountCleanup.lastCheck");
  const failed = await cleanup.cleanUpDeletedAccounts(failing, control.storage, Date.now());
  t.check("server failure erases nothing", failed.erased.length === 0 && readWords(storeFor(accountIdentity(B))).join() === "b");
});

await t.section("multiple tabs: a sign-out in one tab moves the other to guest", async () => {
  control.data.clear();
  control.storage.setItem("sorlio.storage.schema", "2");
  signInSession(A);
  reloadTab();
  const session = await import("../src/lib/localData/session.ts");
  let reloaded = 0;
  window.location.reload = () => {
    reloaded += 1;
  };
  window.sessionStorage.setItem("lire.lessonComplete.text1", "1");
  window.sessionStorage.setItem("lire.rssTexts.session", "public");
  session.followIdentityChangeFromOtherTab(GUEST);
  t.check("tab switched to guest", activeIdentity().kind === "guest");
  t.check("tab reloaded", reloaded === 1);
  t.check("per-tab personal state cleared", window.sessionStorage.getItem("lire.lessonComplete.text1") === null);
  t.check("public news cache kept", window.sessionStorage.getItem("lire.rssTexts.session") === "public");
  session.followIdentityChangeFromOtherTab(GUEST);
  t.check("no reload loop when already in sync", reloaded === 1);
});

await t.section("storage layer reports failures instead of throwing into callers", async () => {
  control.data.clear();
  control.storage.setItem("sorlio.storage.schema", "2");
  clearSession();
  reloadTab();
  control.failNextWrites(1);
  const result = localStore.writeItem(WORDS, "[]");
  t.check("quota reported as quota", !result.ok && result.reason === "quota");
  t.check("next write works", localStore.writeItem(WORDS, "[]").ok);
});

t.finish();
