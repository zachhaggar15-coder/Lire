/**
 * Imported texts are never silently evicted (audit RC27).
 *
 * The store used to keep only the newest 80, so the 81st import, or a merge
 * bringing more than 80 from another device, quietly deleted a reader's
 * oldest private texts.
 */
import { createStorage, createRunner, installWindow } from "./lib/fakeBrowser.mjs";

const t = createRunner("import capacity");
const control = createStorage();
installWindow(control);
const custom = await import("../src/lib/customTexts.ts");
const store = await import("../src/lib/localData/store.ts");

const add = (n) => custom.saveCustomText({ title: `Texte ${n}`, body: `Ceci est le texte numéro ${n}.`, category: "culture", difficulty: "B1" });

await t.section("the limit refuses, never evicts", async () => {
  control.data.clear();
  store.__resetLocalStoreForTests(null);
  for (let i = 1; i <= custom.MAX_CUSTOM_TEXTS; i += 1) add(i);
  t.check(`${custom.MAX_CUSTOM_TEXTS} texts stored`, custom.getCustomTexts().length === custom.MAX_CUSTOM_TEXTS);
  const oldestId = custom.getCustomTexts().at(-1).id;
  const extra = add(9999);
  t.check("one more import is refused with reason 'limit'", extra.ok === false && extra.reason === "limit");
  t.check("the oldest text is still there", custom.getCustomTextById(oldestId) !== undefined);
  t.check("count unchanged", custom.getCustomTexts().length === custom.MAX_CUSTOM_TEXTS);
  const again = add(1);
  t.check("re-importing an existing text at the limit still works (replaces it)", again.ok === true && custom.getCustomTexts().length === custom.MAX_CUSTOM_TEXTS);
  const removed = custom.deleteCustomText(oldestId);
  t.check("after a delete, a new import fits", removed.ok && add(10000).ok === true);
});

await t.section("more than the limit (merged from another device) is never trimmed", async () => {
  control.data.clear();
  store.__resetLocalStoreForTests(null);
  const merged = Array.from({ length: 95 }, (_, i) => ({ id: `custom-m${i}`, title: `M${i}`, body: "Texte.", preview: "Texte.", minutes: 1, category: "culture", difficulty: "B1", language: "fr" }));
  store.localStore.setItem("lire.customTexts.v1", JSON.stringify(merged));
  t.check("95 texts readable", custom.getCustomTexts().length === 95);
  const result = custom.deleteCustomText("custom-m3");
  t.check("deleting one keeps the other 94", result.ok && custom.getCustomTexts().length === 94);
  t.check("new imports are refused while over the limit", add(1).reason === "limit");
});

t.finish();
