import assert from "node:assert/strict";

const storage = new Map();
global.window = {
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  },
};

const { claimDailyFreeArticle, getDailyFreeAccess, localDateKey } = await import("../src/lib/premium/freeAccess.ts");

const firstDay = new Date(2026, 7, 21, 9, 0, 0);
const secondDay = new Date(2026, 7, 22, 0, 1, 0);

assert.equal(getDailyFreeAccess(firstDay), null);
assert.equal(claimDailyFreeArticle("article-one", firstDay), true);
assert.deepEqual(getDailyFreeAccess(firstDay), { dateKey: localDateKey(firstDay), articleId: "article-one" });
assert.equal(claimDailyFreeArticle("article-one", firstDay), true, "same article remains available");
assert.equal(claimDailyFreeArticle("article-two", firstDay), false, "second article is blocked on the same day");
assert.equal(claimDailyFreeArticle("article-two", secondDay), true, "allowance resets on the next local day");

console.log("5 passed, 0 failed.");
