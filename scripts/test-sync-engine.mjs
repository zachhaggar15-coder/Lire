/**
 * Behavioural tests for item-level sync, run against real Postgres (PGlite)
 * with the production migrations. Each "device" has its own storage and talks
 * to the database through the same RPCs a browser uses.
 *
 * These replace source-shape assertions: every scenario below drives real
 * writes through the engine and the SQL, then inspects the results.
 */

import { readFileSync } from "node:fs";
import { createDatabase } from "./lib/pgHarness.mjs";
import { createStorage, createRunner } from "./lib/fakeBrowser.mjs";

const { syncPartition, readSyncState } = await import("../src/lib/sync/engine.ts");
const { SYNCED_STORES } = await import("../src/lib/sync/stores.ts");

const t = createRunner("sync engine");

const A = "aaaaaaaa-0000-4000-8000-000000000001";
const B = "bbbbbbbb-0000-4000-8000-000000000002";
const WORDS = "lire.savedWords.v1";
const KNOWN = "lire.knownWords.v1";
const SETTINGS = "lire.settings.v1";

function partitionStore(control, userId) {
  const prefix = `sorlio.v2:acct.${userId}:`;
  return {
    identity: { kind: "account", userId },
    getItem: (k) => control.storage.getItem(prefix + k),
    setItem: (k, v) => control.storage.setItem(prefix + k, v),
    removeItem: (k) => control.storage.removeItem(prefix + k),
    writeItem(k, v) {
      try {
        control.storage.setItem(prefix + k, v);
        return { ok: true };
      } catch (error) {
        return { ok: false, reason: error?.name === "QuotaExceededError" ? "quota" : "error" };
      }
    },
    deleteItem(k) {
      control.storage.removeItem(prefix + k);
      return { ok: true };
    },
    keys: () => [],
  };
}

function pgTransport(h, sessionUser, hooks = {}) {
  return {
    async pull(expectedUser, afterRev, limit) {
      if (hooks.beforePull) await hooks.beforePull();
      return h.rpc(sessionUser(), "sorlio_sync_pull", { p_expected_user: expectedUser, p_after_rev: afterRev, p_limit: limit });
    },
    async push(expectedUser, ops, day) {
      if (hooks.beforePush) await hooks.beforePush(ops);
      const out = await h.rpc(sessionUser(), "sorlio_sync_push", { p_expected_user: expectedUser, p_ops: ops, p_day: day });
      if (hooks.afterPush) await hooks.afterPush(out);
      return out;
    },
  };
}

function device(h, userId, options = {}) {
  const control = createStorage(options.storage);
  const store = partitionStore(control, userId);
  let current = true;
  let session = userId;
  const hooks = {};
  const dev = {
    control,
    store,
    hooks,
    setSession(id) {
      session = id;
    },
    invalidate() {
      current = false;
    },
    read(key) {
      const raw = store.getItem(key);
      return raw ? JSON.parse(raw) : null;
    },
    write(key, value) {
      store.setItem(key, JSON.stringify(value));
    },
    words() {
      return (dev.read(WORDS) ?? []).map((w) => w.word).sort();
    },
    sync(day = "2026-10-06") {
      return syncPartition({
        userId,
        store,
        transport: pgTransport(h, () => session, hooks),
        stillCurrent: () => current,
        today: () => day,
      });
    },
  };
  return dev;
}

const word = (w, extra = {}) => ({ word: w, lemma: w, translations: [w], primaryTranslation: w, savedAt: "2026-10-01T00:00:00.000Z", reviewCount: 0, status: "learning", ...extra });

async function serverItems(h, userId, store) {
  const { rows } = await h.db.query(
    "select item_id, deleted, data, rev from public.sorlio_sync_items where user_id = $1 and store_key = $2 order by item_id",
    [userId, store],
  );
  return rows;
}

async function grantPremium(h, userId) {
  await h.db.query(
    `insert into public.sorlio_subscriptions (user_id, provider, product_id, purchase_token, status, expires_at, updated_at, verified_at)
     values ($1, 'google_play', 'sorlio_premium_monthly', $2, 'active', now() + interval '20 days', now(), now())
     on conflict (user_id) do update set status = 'active', expires_at = now() + interval '20 days', verified_at = now()`,
    [userId, `token-${userId}`],
  );
}

// ---------------------------------------------------------------------------

await t.section("store registry matches the server", async () => {
  const h = await createDatabase();
  const { rows } = await h.db.query("select store_key, kind, id_field from public.sorlio_sync_stores order by store_key");
  const server = rows.map((r) => `${r.store_key}|${r.kind}|${r.id_field ?? ""}`).sort();
  const client = SYNCED_STORES.map((s) => `${s.key}|${s.kind}|${s.idField ?? ""}`).sort();
  t.check("client SYNCED_STORES equals sorlio_sync_stores", JSON.stringify(server) === JSON.stringify(client), `server-only: ${server.filter((x) => !client.includes(x))}; client-only: ${client.filter((x) => !server.includes(x))}`);
});

await t.section("A edits X while B edits Y: both survive", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const d1 = device(h, A);
  const d2 = device(h, A);
  d1.write(WORDS, [word("chat"), word("chien")]);
  t.check("d1 first sync succeeds", (await d1.sync()).status === "success");
  t.check("d2 first sync succeeds", (await d2.sync()).status === "success");
  t.check("d2 received both words", JSON.stringify(d2.words()) === '["chat","chien"]', JSON.stringify(d2.words()));

  // Concurrent, unrelated edits.
  d1.write(WORDS, d1.read(WORDS).map((w) => (w.word === "chat" ? { ...w, reviewCount: 3 } : w)));
  d2.write(WORDS, d2.read(WORDS).map((w) => (w.word === "chien" ? { ...w, status: "known" } : w)));
  const r1 = await d1.sync();
  const r2 = await d2.sync();
  const r1b = await d1.sync();
  t.check("all syncs report success", [r1, r2, r1b].every((r) => r.status === "success"), JSON.stringify([r1.status, r2.status, r1b.status]));
  const server = Object.fromEntries((await serverItems(h, A, WORDS)).map((r) => [r.item_id, r.data]));
  t.check("server keeps A's edit to chat", server.chat?.reviewCount === 3);
  t.check("server keeps B's edit to chien", server.chien?.status === "known");
  const d1chien = d1.read(WORDS).find((w) => w.word === "chien");
  const d2chat = d2.read(WORDS).find((w) => w.word === "chat");
  t.check("d1 sees B's edit", d1chien?.status === "known");
  t.check("d2 sees... after its own sync? (pulled A's edit in final pull)", d2chat?.reviewCount === 3, JSON.stringify(d2chat));
});

await t.section("same item, different fields: three-way merge keeps both", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const d1 = device(h, A);
  const d2 = device(h, A);
  d1.write(WORDS, [word("maison")]);
  await d1.sync();
  await d2.sync();
  d1.write(WORDS, [{ ...d1.read(WORDS)[0], reviewCount: 5 }]);
  d2.write(WORDS, [{ ...d2.read(WORDS)[0], status: "unsure" }]);
  await d1.sync();
  const r2 = await d2.sync();
  await d1.sync();
  const merged = (await serverItems(h, A, WORDS))[0].data;
  t.check("conflict was detected and merged", r2.conflicts >= 1, `conflicts=${r2.conflicts}`);
  t.check("merged item has d1's reviewCount", merged.reviewCount === 5);
  t.check("merged item has d2's status", merged.status === "unsure");
  t.check("both devices converge", JSON.stringify(d1.read(WORDS)[0]) === JSON.stringify(d2.read(WORDS)[0]));
});

await t.section("A deletes X while B (offline) edits Y", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const d1 = device(h, A);
  const d2 = device(h, A);
  d1.write(WORDS, [word("x"), word("y")]);
  await d1.sync();
  await d2.sync();
  d1.write(WORDS, d1.read(WORDS).filter((w) => w.word !== "x"));
  d2.write(WORDS, d2.read(WORDS).map((w) => (w.word === "y" ? { ...w, reviewCount: 9 } : w)));
  await d1.sync();
  const r2 = await d2.sync();
  await d1.sync();
  t.check("d2 sync succeeds", r2.status === "success", r2.status);
  t.check("x is gone on d2", !d2.words().includes("x"), JSON.stringify(d2.words()));
  t.check("x is gone on d1", !d1.words().includes("x"));
  const rows = await serverItems(h, A, WORDS);
  t.check("x is a server tombstone", rows.find((r) => r.item_id === "x")?.deleted === true);
  t.check("y kept B's edit", rows.find((r) => r.item_id === "y")?.data.reviewCount === 9);
});

await t.section("stale device cannot resurrect a deleted item", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const d1 = device(h, A);
  const d2 = device(h, A);
  d1.write(WORDS, [word("vieux")]);
  await d1.sync();
  await d2.sync();
  d1.write(WORDS, []);
  await d1.sync();
  // d2 still has its stale copy and, worse, edits it offline.
  d2.write(WORDS, [{ ...d2.read(WORDS)[0], reviewCount: 2 }]);
  await d2.sync();
  await d1.sync();
  const rows = await serverItems(h, A, WORDS);
  t.check("server item remains deleted", rows.length === 1 && rows[0].deleted === true, JSON.stringify(rows));
  t.check("stale copy removed from d2 (deletion wins)", d2.words().length === 0, JSON.stringify(d2.words()));
  t.check("d1 still has nothing", d1.words().length === 0);
});

await t.section("deliberate re-save after delete is allowed", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const d1 = device(h, A);
  d1.write(WORDS, [word("retour")]);
  await d1.sync();
  d1.write(WORDS, []);
  await d1.sync();
  d1.write(WORDS, [word("retour", { savedAt: "2026-10-06T10:00:00.000Z" })]);
  const r = await d1.sync();
  const rows = await serverItems(h, A, WORDS);
  t.check("re-created item is live on the server", rows[0]?.deleted === false && r.status === "success", JSON.stringify(rows));
});

await t.section("purged tombstones: a device away past retention does not resurrect", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const d1 = device(h, A);
  const d2 = device(h, A);
  d1.write(WORDS, [word("ancien"), word("garde")]);
  await d1.sync();
  await d2.sync();
  d1.write(WORDS, d1.read(WORDS).filter((w) => w.word !== "ancien"));
  await d1.sync();
  // Age the tombstone past retention and purge it.
  await h.db.query("update public.sorlio_sync_items set updated_at = now() - interval '200 days' where deleted");
  const purge = await h.asService((tx) => tx.query("select public.sorlio_sync_purge(180) as out"));
  t.check("purge removed the tombstone", purge.rows[0].out.tombstones_purged === 1, JSON.stringify(purge.rows[0].out));
  // More activity so d2's cursor is behind the watermark.
  d1.write(WORDS, [...d1.read(WORDS), word("nouveau")]);
  await d1.sync();
  const r2 = await d2.sync();
  t.check("returning device syncs successfully", r2.status === "success", JSON.stringify(r2));
  t.check("returning device dropped the deleted item", JSON.stringify(d2.words()) === '["garde","nouveau"]', JSON.stringify(d2.words()));
  const rows = await serverItems(h, A, WORDS);
  t.check("server did not get the old item back", !rows.some((r) => r.item_id === "ancien" && !r.deleted), JSON.stringify(rows.map((r) => r.item_id)));
});

await t.section("failed server write is never reported as success", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const d1 = device(h, A);
  d1.write(WORDS, [word("panne")]);
  d1.hooks.beforePush = async () => {
    throw new Error("TypeError: Failed to fetch");
  };
  const r = await d1.sync();
  t.check("outcome is error", r.status === "error", r.status);
  t.check("message is honest and non-technical", /saved on this device/.test(r.message ?? ""), r.message);
  t.check("local word is still there", JSON.stringify(d1.words()) === '["panne"]');
  t.check("no lastSuccessAt recorded", readSyncState(d1.store).lastSuccessAt === null);
  delete d1.hooks.beforePush;
  const retry = await d1.sync();
  t.check("retry succeeds", retry.status === "success");
  t.check("server has exactly one copy", (await serverItems(h, A, WORDS)).length === 1);
});

await t.section("lost push response: retry is idempotent", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const d1 = device(h, A);
  d1.write(WORDS, [word("deux")]);
  let first = true;
  d1.hooks.afterPush = async () => {
    if (first) {
      first = false;
      throw new Error("network timeout after commit");
    }
  };
  const r = await d1.sync();
  t.check("first attempt reports error", r.status === "error");
  const retry = await d1.sync();
  t.check("retry reports success", retry.status === "success", JSON.stringify(retry));
  const rows = await serverItems(h, A, WORDS);
  t.check("no duplicate or conflict damage", rows.length === 1 && rows[0].data.word === "deux");
});

await t.section("one bad item among many gives partial, not success", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const d1 = device(h, A);
  d1.write(WORDS, [word("ok1"), word("huge", { note: "x".repeat(40000) }), word("ok2")]);
  d1.write(KNOWN, ["bonjour"]);
  const r = await d1.sync();
  t.check("outcome is partial", r.status === "partial", JSON.stringify(r));
  t.check("too_large counted", r.rejected.too_large === 1);
  const rows = await serverItems(h, A, WORDS);
  t.check("good items still synced", rows.map((x) => x.item_id).join() === "ok1,ok2");
  t.check("other stores still synced", (await serverItems(h, A, KNOWN)).length === 1);
  t.check("rejected item kept locally", d1.words().includes("huge"));
});

await t.section("simultaneous pushes from two devices converge", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const d1 = device(h, A);
  const d2 = device(h, A);
  d1.write(SETTINGS, { theme: "light", fontSize: "medium" });
  await d1.sync();
  await d2.sync();
  d1.write(SETTINGS, { ...d1.read(SETTINGS), theme: "dark" });
  d2.write(SETTINGS, { ...d2.read(SETTINGS), fontSize: "large" });
  const [r1, r2] = await Promise.all([d1.sync(), d2.sync()]);
  await d1.sync();
  await d2.sync();
  t.check("both concurrent syncs finish without error", r1.status !== "error" && r2.status !== "error", `${r1.status}/${r2.status}`);
  const server = (await serverItems(h, A, SETTINGS))[0].data;
  t.check("theme edit kept", server.theme === "dark");
  t.check("font edit kept", server.fontSize === "large");
  t.check("devices converge", JSON.stringify(d1.read(SETTINGS)) === JSON.stringify(d2.read(SETTINGS)));
});

await t.section("clock skew does not matter", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const d1 = device(h, A);
  const d2 = device(h, A);
  d1.write(WORDS, [word("temps", { savedAt: "2031-01-01T00:00:00.000Z" })]);
  await d1.sync();
  await d2.sync();
  // d2's clock is years behind; its later edit must still win as the newer revision.
  d2.write(WORDS, [{ ...d2.read(WORDS)[0], savedAt: "2001-01-01T00:00:00.000Z", status: "known" }]);
  await d2.sync();
  await d1.sync();
  t.check("newer revision wins regardless of timestamps", d1.read(WORDS)[0].status === "known");
});

await t.section("identity change mid-sync: nothing lands anywhere", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await h.addUser(B);
  await grantPremium(h, A);
  const d1 = device(h, A);
  d1.write(WORDS, [word("prive")]);
  d1.hooks.beforePush = async () => {
    // The device signs out of A and into B while A's push is in flight.
    d1.setSession(B);
  };
  const r = await d1.sync();
  t.check("push refused (session is B, request names A)", r.status === "error", r.status);
  t.check("nothing written to A", (await serverItems(h, A, WORDS)).length === 0);
  t.check("nothing written to B", (await serverItems(h, B, WORDS)).length === 0);

  const d2 = device(h, A);
  d2.write(WORDS, [word("secret")]);
  d2.hooks.beforePull = async () => d2.invalidate();
  const before = d2.control.snapshot();
  const r2 = await d2.sync();
  t.check("invalidated sync aborts", r2.status === "aborted", r2.status);
  t.check("aborted sync left local storage untouched", JSON.stringify([...before]) === JSON.stringify([...d2.control.snapshot()]));
});

await t.section("local edit during an in-flight sync is not overwritten", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const d1 = device(h, A);
  const d2 = device(h, A);
  d1.write(WORDS, [word("a")]);
  await d1.sync();
  await d2.sync();
  d1.write(WORDS, [{ ...d1.read(WORDS)[0], reviewCount: 1 }]);
  await d1.sync();
  // d2 starts pulling; while the request is in flight the reader saves a word.
  d2.hooks.beforePull = async () => {
    d2.hooks.beforePull = null;
    d2.write(WORDS, [word("b"), ...d2.read(WORDS)]);
  };
  await d2.sync();
  await d2.sync();
  t.check("word saved during sync survived", d2.words().includes("b"), JSON.stringify(d2.words()));
  t.check("remote edit also applied", d2.read(WORDS).find((w) => w.word === "a")?.reviewCount === 1);
  t.check("new word reached the server", (await serverItems(h, A, WORDS)).some((r) => r.item_id === "b"));
});

await t.section("local edit between pull pages is not overwritten", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const d1 = device(h, A);
  d1.write(WORDS, [word("premier")]);
  await d1.sync();
  d1.write(KNOWN, Array.from({ length: 1500 }, (_, i) => `mot-${i}`));
  await d1.sync();
  const d2 = device(h, A);
  let pulls = 0;
  d2.hooks.beforePull = async () => {
    pulls += 1;
    // Page 1 (which contains the saved word) has been processed; the reader
    // saves another word before page 2 arrives.
    if (pulls === 2) d2.write(WORDS, [word("pendant"), ...(d2.read(WORDS) ?? [])]);
  };
  const r = await d2.sync();
  t.check("multi-page pull happened", pulls >= 3, `pulls=${pulls}`);
  t.check("sync succeeded", r.status === "success", r.status);
  t.check("word saved between pages survived", d2.words().includes("pendant"), JSON.stringify(d2.words()));
  t.check("pulled word also present", d2.words().includes("premier"));
  t.check("all known words arrived", (d2.read(KNOWN) ?? []).length === 1500);
});

await t.section("server refuses writes based on a purged revision", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const out = await h.rpc(A, "sorlio_sync_push", {
    p_expected_user: A,
    p_ops: [{ store: WORDS, id: "fantome", op: "put", base_rev: 42, data: word("fantome"), mode: "normal" }],
    p_day: null,
  });
  t.check("conflict(deleted) instead of resurrection", out.results[0].status === "conflict" && out.results[0].current.deleted === true, JSON.stringify(out));
  t.check("nothing created", (await serverItems(h, A, WORDS)).length === 0);

  // A tombstone that still exists: a stale edit (with a base) and an import
  // copy must both be refused; only a base-less deliberate re-save may win.
  const put = (base_rev, mode = "normal") =>
    h.rpc(A, "sorlio_sync_push", { p_expected_user: A, p_ops: [{ store: WORDS, id: "mort", op: "put", base_rev, data: word("mort", { reviewCount: base_rev ?? 0 }), mode }], p_day: null });
  const created = await put(null);
  const rev = created.results[0].rev;
  await h.rpc(A, "sorlio_sync_push", { p_expected_user: A, p_ops: [{ store: WORDS, id: "mort", op: "delete", base_rev: rev }], p_day: null });
  const stale = await put(rev);
  t.check("stale edit of a tombstoned item is refused", stale.results[0].status === "conflict" && stale.results[0].current.deleted === true, JSON.stringify(stale));
  const imported = await put(null, "import");
  t.check("import copy of a tombstoned item is refused", imported.results[0].status === "conflict", JSON.stringify(imported));
  t.check("item still deleted", (await serverItems(h, A, WORDS)).find((r) => r.item_id === "mort")?.deleted === true);
  const resaved = await put(null, "normal");
  t.check("deliberate re-save is accepted", resaved.results[0].status === "applied");
  // Stale edit of a live item (base older than current) is a conflict, not an overwrite.
  const edited = await h.rpc(A, "sorlio_sync_push", { p_expected_user: A, p_ops: [{ store: WORDS, id: "mort", op: "put", base_rev: resaved.results[0].rev, data: word("mort", { reviewCount: 7 }) }], p_day: null });
  const staleLive = await h.rpc(A, "sorlio_sync_push", { p_expected_user: A, p_ops: [{ store: WORDS, id: "mort", op: "put", base_rev: resaved.results[0].rev, data: word("mort", { reviewCount: 1 }) }], p_day: null });
  t.check("stale edit of a live item conflicts", edited.results[0].status === "applied" && staleLive.results[0].status === "conflict" && staleLive.results[0].current.data.reviewCount === 7, JSON.stringify(staleLive));
});

await t.section("local storage full: sync reports error, data intact", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const d1 = device(h, A);
  d1.write(WORDS, [word("plein")]);
  await d1.sync();
  const d2 = device(h, A);
  d2.control.failAllWrites(true);
  const r = await d2.sync();
  t.check("outcome is error", r.status === "error", r.status);
  t.check("message mentions storage", /storage/i.test(r.message ?? ""), r.message);
  d2.control.failAllWrites(false);
  t.check("recovers once storage is available", (await d2.sync()).status === "success");
  t.check("data arrived after recovery", JSON.stringify(d2.words()) === '["plein"]');
});

await t.section("free accounts: server enforces five new saves per day", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  const d1 = device(h, A);
  // First sync uploads pre-existing data under the one-time carry-over
  // allowance (tested separately); today's NEW saves come after it.
  await d1.sync("2026-10-06");
  d1.write(WORDS, ["un", "deux", "trois", "quatre", "cinq", "six", "sept"].map((w) => word(w)));
  const r = await d1.sync("2026-10-06");
  t.check("outcome is partial with save_quota", r.status === "partial" && r.rejected.save_quota === 2, JSON.stringify(r));
  t.check("message explains the deferral", /tomorrow/.test(r.message ?? ""));
  t.check("exactly five reached the server", (await serverItems(h, A, WORDS)).length === 5);
  t.check("all seven kept locally", d1.words().length === 7);
  t.check("quota reported", r.saveQuota?.used === 5 && r.saveQuota?.limit === 5, JSON.stringify(r.saveQuota));
  const again = await d1.sync("2026-10-06");
  t.check("same day: deferred words are not retried", (await serverItems(h, A, WORDS)).length === 5 && again.rejected.save_quota === undefined);
  // Edits and deletes of existing words are not limited.
  d1.write(WORDS, d1.read(WORDS).map((w) => (w.word === "un" ? { ...w, reviewCount: 1 } : w)).filter((w) => w.word !== "deux"));
  await d1.sync("2026-10-06");
  const rows = await serverItems(h, A, WORDS);
  t.check("review of existing word synced despite quota", rows.find((x) => x.item_id === "un")?.data.reviewCount === 1);
  t.check("deletion synced despite quota", rows.find((x) => x.item_id === "deux")?.deleted === true);
  // Client-supplied day can't jump far ahead to reset the quota.
  const cheat = await h.rpc(A, "sorlio_sync_push", { p_expected_user: A, p_ops: [{ store: WORDS, id: "triche", op: "put", base_rev: null, data: word("triche"), mode: "normal" }], p_day: "2030-01-01" });
  t.check("far-future day is clamped (still rejected)", cheat.results[0].reason === "save_quota", JSON.stringify(cheat));
});

await t.section("first sync carries over earlier saves, bounded once per account", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  const d1 = device(h, A);
  d1.write(WORDS, Array.from({ length: 9 }, (_, i) => word(`ancien${i}`)));
  const r = await d1.sync();
  t.check("existing local words all upload on first sync", r.status === "success" && (await serverItems(h, A, WORDS)).length === 9, JSON.stringify(r));
  await h.db.query("update public.sorlio_sync_state set carried_over_saves = 500 where user_id = $1", [A]);
  const abuse = await h.rpc(A, "sorlio_sync_push", { p_expected_user: A, p_ops: [{ store: WORDS, id: "x", op: "put", base_rev: null, data: word("x"), mode: "import" }], p_day: null });
  t.check("relabelling new saves as 'import' stops at the allowance", abuse.results[0].reason === "save_quota", JSON.stringify(abuse));
});

await t.section("premium accounts are not limited", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const d1 = device(h, A);
  d1.write(WORDS, Array.from({ length: 12 }, (_, i) => word(`mot${i}`)));
  const r = await d1.sync();
  t.check("all twelve synced", r.status === "success" && (await serverItems(h, A, WORDS)).length === 12);
});

await t.section("server: identity and privilege checks", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await h.addUser(B);
  let refused = false;
  try {
    await h.rpc(B, "sorlio_sync_push", { p_expected_user: A, p_ops: [], p_day: null });
  } catch (error) {
    refused = /identity_mismatch/.test(error.message);
  }
  t.check("B's session cannot push as A", refused);
  let anonRefused = false;
  try {
    await h.rpc(null, "sorlio_sync_pull", { p_expected_user: A, p_after_rev: 0 });
  } catch {
    anonRefused = true;
  }
  t.check("anonymous callers refused", anonRefused);
  let directWrite = false;
  try {
    await h.as(A, (tx) => tx.query("insert into public.sorlio_sync_items (user_id, store_key, item_id, rev, data) values ($1, 'lire.savedWords.v1', 'x', 1, '{}')", [A]));
    directWrite = true;
  } catch {}
  t.check("no direct table writes", !directWrite);
  let purgeAllowed = false;
  try {
    await h.as(A, (tx) => tx.query("select public.sorlio_sync_purge(180)"));
    purgeAllowed = true;
  } catch {}
  t.check("users cannot run purge", !purgeAllowed);
  let premiumProbe = false;
  try {
    await h.as(A, (tx) => tx.query("select public.sorlio_has_premium($1)", [B]));
    premiumProbe = true;
  } catch {}
  t.check("users cannot probe other accounts' premium", !premiumProbe);
  const unknown = await h.rpc(A, "sorlio_sync_push", { p_expected_user: A, p_ops: [{ store: "lire.validation.v1", id: "x", op: "put", base_rev: null, data: {} }], p_day: null });
  t.check("unknown stores rejected", unknown.results[0].reason === "unknown_store");
  let tooMany = false;
  try {
    await h.rpc(A, "sorlio_sync_push", { p_expected_user: A, p_ops: Array.from({ length: 501 }, (_, i) => ({ store: KNOWN, id: `w${i}`, op: "put", base_rev: null, data: true })), p_day: null });
  } catch (error) {
    tooMany = /too_many_ops/.test(error.message);
  }
  t.check("op batches are bounded", tooMany);
  // Deleted account: FK prevents re-creation.
  await h.db.query("delete from auth.users where id = $1", [B]);
  let deletedRefused = false;
  try {
    await h.rpc(B, "sorlio_sync_push", { p_expected_user: B, p_ops: [{ store: KNOWN, id: "z", op: "put", base_rev: null, data: true }], p_day: null });
  } catch (error) {
    deletedRefused = /account_missing/.test(error.message);
  }
  t.check("a deleted account's still-valid token cannot recreate data", deletedRefused);
});

await t.section("legacy rows: imported once, own tombstones honoured, opt-in store skipped", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  await h.db.query(
    `insert into public.sorlio_user_data (user_id, store_key, data, updated_at) values
      ($1, 'lire.savedWords.v1', $2, now()),
      ($1, '__sync_meta__:lire.savedWords.v1', $3, now()),
      ($1, 'lire.knownWords.v1', '["oui","non"]', now()),
      ($1, 'lire.settings.v1', '{"theme":"dark"}', now()),
      ($1, 'lire.customTexts.v1', '[{"id":"custom-1","title":"Journal","body":"prive"}]', now()),
      ($1, 'lire.validation.v1', '{"anonymousId":"anon_x"}', now())`,
    [A, JSON.stringify([word("legacy1"), word("legacy2")]), JSON.stringify({ tombstones: { supprime: "2026-09-01T00:00:00Z" } })],
  );
  // This device has an old local copy, including the word deleted elsewhere.
  const d1 = device(h, A);
  d1.write(WORDS, [word("legacy1"), word("supprime"), word("local-only")]);
  const r = await d1.sync();
  t.check("first sync succeeds", r.status === "success", JSON.stringify(r));
  t.check("legacy words present, deleted one dropped, local-only kept", JSON.stringify(d1.words()) === '["legacy1","legacy2","local-only"]', JSON.stringify(d1.words()));
  t.check("settings imported", d1.read(SETTINGS)?.theme === "dark");
  t.check("imported texts NOT imported automatically", (await serverItems(h, A, "lire.customTexts.v1")).length === 0);
  const { rows } = await h.db.query("select count(*)::int as n from public.sorlio_user_data where user_id = $1", [A]);
  t.check("legacy rows left intact (rollback possible)", rows[0].n === 6);
  const { rows: state } = await h.db.query("select legacy_imported_at from public.sorlio_sync_state where user_id = $1", [A]);
  t.check("import recorded once", state[0].legacy_imported_at !== null);
  // Opt-in import of imported texts.
  const imp = await h.rpc(A, "sorlio_sync_import_store", { p_expected_user: A, p_store: "lire.customTexts.v1" });
  t.check("opt-in import brings imported texts across", imp.imported === 1);
  const removed = await h.rpc(A, "sorlio_sync_remove_store", { p_expected_user: A, p_store: "lire.customTexts.v1" });
  t.check("opting out removes cloud copies (new and legacy)", removed.removed === 1);
  const { rows: legacyLeft } = await h.db.query("select count(*)::int as n from public.sorlio_user_data where user_id = $1 and store_key like '%customTexts%'", [A]);
  t.check("legacy imported-text copy deleted on opt-out", legacyLeft[0].n === 0);
  const tomb = await serverItems(h, A, "lire.customTexts.v1");
  t.check("tombstone keeps no text", tomb.every((x) => x.deleted && x.data === null));
});

await t.section("imported texts only sync when the account opts in", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await grantPremium(h, A);
  const d1 = device(h, A);
  d1.write("lire.customTexts.v1", [{ id: "custom-a", title: "Diary", body: "private" }]);
  await d1.sync();
  t.check("not uploaded by default", (await serverItems(h, A, "lire.customTexts.v1")).length === 0);
  d1.write("lire.syncPreferences.v1", { importedTexts: true });
  await d1.sync();
  t.check("uploaded after opting in", (await serverItems(h, A, "lire.customTexts.v1")).length === 1);
});

await t.section("accounts are isolated on the server", async () => {
  const h = await createDatabase();
  await h.addUser(A);
  await h.addUser(B);
  await grantPremium(h, A);
  await grantPremium(h, B);
  const dA = device(h, A);
  const dB = device(h, B);
  dA.write(WORDS, [word("a-only")]);
  await dA.sync();
  dB.write(WORDS, [word("b-only")]);
  await dB.sync();
  t.check("B never receives A's items", JSON.stringify(dB.words()) === '["b-only"]', JSON.stringify(dB.words()));
  t.check("A never receives B's items", JSON.stringify(dA.words()) === '["a-only"]');
});

// Guard against a regression to whole-store uploads.
const engineSource = readFileSync(new URL("../src/lib/sync/engine.ts", import.meta.url), "utf8");
t.check("engine never writes sorlio_user_data", !engineSource.includes("sorlio_user_data"));

t.finish();
