/**
 * The Free / Premium product model — behavioural tests of the single
 * feature matrix (src/lib/access/features.ts) and the save allowance.
 *
 * Decided model (October 2026):
 *   Free: reading, news, import, listening, offline dictionary, 5 NEW saved
 *         words a day, unlimited review, grammar, non-AI exercises, progress.
 *   Premium: unlimited saving and every AI feature.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createStorage, createRunner, installWindow } from "./lib/fakeBrowser.mjs";

const control = createStorage();
installWindow(control);
control.storage.setItem("sorlio.storage.schema", "2");

const t = createRunner("access model");
const { FEATURES, FREE_DAILY_NEW_SAVES, PREMIUM_ONLY_FEATURES } = await import("../src/lib/access/features.ts");
const { accessContext, accessTier, canUse, canSaveNewWord, canUseAI } = await import("../src/lib/access/accessModel.ts");
const { saveWordForAccess } = await import("../src/lib/access/saveWord.ts");
const { newSavesToday } = await import("../src/lib/access/saveAllowance.ts");
const { getSavedWords, recordReviewResult, clearWords } = await import("../src/lib/storage.ts");

const word = (w) => ({
  word: w, lemma: w, translations: [w], primaryTranslation: w, partOfSpeech: null, gender: null, cefr: null, frequencyRank: null,
  articleContextSentence: "", exampleSentenceFr: "", exampleSentenceEn: "", sourceTextTitle: "", savedAt: "2026-10-07T00:00:00.000Z",
  reviewCount: 0, lastReviewedAt: null, status: "learning", missingFromDictionary: false, ease: 2.5, nextReviewAt: null,
  correctCount: 0, incorrectCount: 0, lastReviewResult: null,
});

await t.section("tiers", async () => {
  t.check("signed out is guest", accessTier(false, false) === "guest");
  t.check("a Premium flag without a session is still guest", accessTier(false, true) === "guest");
  t.check("signed in without entitlement is free", accessTier(true, false) === "free");
  t.check("signed in with entitlement is premium", accessTier(true, true) === "premium");
});

await t.section("the free product is genuinely useful", async () => {
  const free = ["reading", "news", "importText", "listening", "dictionaryLookup", "review", "grammarLessons", "grammarExercises", "practiceExercises", "listeningPractice", "comprehension", "progress"];
  for (const tier of ["guest", "free"]) {
    const ctx = accessContext(tier, FREE_DAILY_NEW_SAVES); // even with today's saves used up
    for (const feature of free) t.check(`${tier}: ${feature} is free`, canUse(ctx, feature).allowed === true);
  }
});

await t.section("Premium sells intelligence and capacity only", async () => {
  t.check("exactly these are Premium-only", JSON.stringify([...PREMIUM_ONLY_FEATURES].sort()) === JSON.stringify(["aiPractice", "aiSentenceHelp", "aiTranslation", "aiWordHelp", "unlimitedSaves"]));
  for (const tier of ["guest", "free"]) {
    const ctx = accessContext(tier, 0);
    for (const feature of PREMIUM_ONLY_FEATURES) {
      const decision = canUse(ctx, feature);
      t.check(`${tier}: ${feature} needs Premium`, !decision.allowed && decision.reason === "needs-premium");
    }
    t.check(`${tier}: AI denied`, !canUseAI(ctx).allowed);
  }
  const premium = accessContext("premium", 999);
  for (const feature of Object.keys(FEATURES)) t.check(`premium: ${feature}`, canUse(premium, feature).allowed);
});

await t.section("five NEW saves a day; review is never limited", async () => {
  t.check("limit is five", FREE_DAILY_NEW_SAVES === 5);
  t.check("0 used → allowed, 4 left after", canSaveNewWord(accessContext("free", 0)).remaining === 4);
  t.check("4 used → allowed, 0 left after", canSaveNewWord(accessContext("free", 4)).allowed && canSaveNewWord(accessContext("free", 4)).remaining === 0);
  t.check("5 used → daily-save-limit", canSaveNewWord(accessContext("guest", 5)).reason === "daily-save-limit");
  t.check("premium unlimited", canSaveNewWord(accessContext("premium", 500)).allowed);

  clearWords();
  let ctx = accessContext("guest", newSavesToday());
  for (let i = 0; i < 5; i += 1) {
    const out = saveWordForAccess(ctx, word(`mot${i}`));
    t.check(`save ${i + 1} stored`, out.decision.allowed && out.result?.created === true);
    ctx = accessContext("guest", newSavesToday());
  }
  t.check("counter reached five", newSavesToday() === 5);
  const sixth = saveWordForAccess(ctx, word("sixieme"));
  t.check("sixth new word refused with the true reason", !sixth.decision.allowed && sixth.decision.reason === "daily-save-limit" && sixth.result === null);
  t.check("refused word was not stored", !getSavedWords().some((w) => w.word === "sixieme"));
  const again = saveWordForAccess(ctx, word("mot1"));
  t.check("re-saving an existing word is never blocked", again.decision.allowed && again.result?.created === false);
  const reviewed = recordReviewResult("mot0", "correct");
  t.check("reviewing at the limit still works", reviewed.ok && reviewed.words.find((w) => w.word === "mot0").reviewCount === 1);
  t.check("failed saves don't consume the allowance", newSavesToday() === 5);
});

await t.section("no component invents its own Premium rule", async () => {
  // Gates must go through accessModel/features. Scan UI code for ad-hoc tier checks.
  const offenders = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(tsx|ts)$/.test(name) && !path.includes(join("lib", "access")) && !path.includes(join("lib", "premium"))) {
        const src = readFileSync(path, "utf8");
        if (/premium\.isPremium\s*\?|isPremium\s*&&\s*(save|ai)|tier\s*===\s*"premium"\s*\?\s*null/.test(src)) offenders.push(path);
      }
    }
  };
  walk(new URL("../src/components", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
  walk(new URL("../src/app", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
  t.check("no ad-hoc Premium gating outside the access layer", offenders.length === 0, offenders.join(", "));
  const retired = ["src/lib/access/limits.ts", "src/lib/access/dailyUsage.ts", "src/components/PremiumRouteGate.tsx", "src/components/ReaderAccessGate.tsx"];
  for (const file of retired) {
    let exists = true;
    try {
      statSync(new URL(`../${file}`, import.meta.url));
    } catch {
      exists = false;
    }
    t.check(`retired gate ${file} is gone (no article/lookup limits)`, !exists);
  }
});

t.finish();
