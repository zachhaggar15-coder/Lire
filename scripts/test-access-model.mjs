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

const access = await import("../src/lib/access/accessModel.ts");
const { TIER_LIMITS } = await import("../src/lib/access/limits.ts");
const usage = await import("../src/lib/access/dailyUsage.ts");

/**
 * Guest / free / Premium access.
 *
 * The rules are only worth anything if the boundaries hold exactly where the
 * product says they do, and if the reason attached to a refusal is the true
 * one — telling a signed-in reader to create an account, or a guest to buy
 * Premium for something an account would fix, both waste the moment they were
 * willing to act.
 */

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

function fresh(tier) {
  store.clear();
  return access.accessContext(tier, usage.getDailyUsage());
}

/** Opens `count` distinct articles, returning the decision for each. */
function openArticles(tier, count) {
  store.clear();
  const decisions = [];
  for (let i = 1; i <= count; i++) {
    const context = access.accessContext(tier, usage.getDailyUsage());
    const decision = access.canStartArticle(context, `article-${i}`);
    decisions.push(decision);
    if (decision.allowed) usage.recordArticleOpened(`article-${i}`);
  }
  return decisions;
}

function spendLookups(tier, count) {
  store.clear();
  const decisions = [];
  for (let i = 1; i <= count; i++) {
    const context = access.accessContext(tier, usage.getDailyUsage());
    const decision = access.canLookupWord(context);
    decisions.push(decision);
    if (decision.allowed) usage.recordLookup();
  }
  return decisions;
}

console.log("--- Tiers are derived from session and entitlement ---");
{
  check("signed out is guest", access.accessTier(false, false) === "guest");
  check("signed in without Premium is free", access.accessTier(true, false) === "free");
  check("signed in with Premium is premium", access.accessTier(true, true) === "premium");
  // A stale cached entitlement must never survive signing out.
  check("signed out with a stale entitlement is still guest", access.accessTier(false, true) === "guest");
}

console.log("--- Guest: 1 article, 3 lookups ---");
{
  const articles = openArticles("guest", 2);
  check("guest article 1 is allowed", articles[0].allowed);
  check("guest article 2 is blocked", !articles[1].allowed);
  check("guest article 2 asks for an account, not Premium", articles[1].reason === "needs-account", String(articles[1].reason));

  const lookups = spendLookups("guest", 4);
  check("guest lookups 1-3 are allowed", lookups.slice(0, 3).every((d) => d.allowed));
  check("guest lookup 4 is blocked", !lookups[3].allowed);
  check("guest lookup 4 asks for an account", lookups[3].reason === "needs-account", String(lookups[3].reason));
}

console.log("--- Free account: 3 articles, 10 lookups ---");
{
  const articles = openArticles("free", 4);
  check("free articles 1-3 are allowed", articles.slice(0, 3).every((d) => d.allowed));
  check("free article 4 is blocked", !articles[3].allowed);
  check("free article 4 asks for Premium, not an account", articles[3].reason === "needs-premium", String(articles[3].reason));

  const lookups = spendLookups("free", 11);
  check("free lookups 1-10 are allowed", lookups.slice(0, 10).every((d) => d.allowed));
  check("free lookup 11 is blocked", !lookups[10].allowed);
  check("free lookup 11 asks for Premium", lookups[10].reason === "needs-premium", String(lookups[10].reason));
}

console.log("--- Premium has no article or lookup ceiling ---");
{
  const articles = openArticles("premium", 40);
  check("premium opens far past the free limit", articles.every((d) => d.allowed));
  const lookups = spendLookups("premium", 200);
  check("premium looks up without limit", lookups.every((d) => d.allowed));
  check("premium reports unlimited rather than a count", articles[0].remaining === null);
}

console.log("--- Reopening an article costs nothing ---");
{
  store.clear();
  usage.recordArticleOpened("article-1");
  const context = access.accessContext("guest", usage.getDailyUsage());
  check("a guest may reopen the article they already read", access.canStartArticle(context, "article-1").allowed);
  check("but still cannot open a different one", !access.canStartArticle(context, "article-2").allowed);
}

console.log("--- Signing in carries usage forward ---");
{
  // The scenario from the spec: a guest at their limit signs in and gains the
  // larger ceiling without their used allowance being wiped.
  store.clear();
  usage.recordArticleOpened("article-1");
  usage.recordLookup();
  usage.recordLookup();
  usage.recordLookup();

  const asGuest = access.accessContext("guest", usage.getDailyUsage());
  check("the guest is at both limits", !access.canStartArticle(asGuest, "article-2").allowed && !access.canLookupWord(asGuest).allowed);

  const asFree = access.accessContext("free", usage.getDailyUsage());
  check("usage is not reset by signing in", asFree.usage.articleIds.length === 1 && asFree.usage.lookups === 3);
  check("the free account can read 2 more articles", access.canStartArticle(asFree, "article-2").remaining === 1);
  check("the free account has 7 lookups left", access.canLookupWord(asFree).remaining === 6, "6 remaining after this one");

  // And the loophole is closed in the other direction too.
  const backToGuest = access.accessContext("guest", usage.getDailyUsage());
  check("signing out does not restore a guest allowance", !access.canStartArticle(backToGuest, "article-2").allowed);
}
{
  // Usage must not be keyed by user, or sign-in/sign-out would reset it.
  const source = readFileSync(new URL("../src/lib/access/dailyUsage.ts", import.meta.url), "utf8");
  check("usage is not keyed by user id", !/user_?[Ii]d/.test(source));
}

console.log("--- Premium features are Premium for everyone unentitled ---");
{
  const features = ["saveWord", "comprehension", "aiExplanation", "practice", "review", "listening", "grammar", "importText"];
  for (const tier of ["guest", "free"]) {
    const context = fresh(tier);
    for (const feature of features) {
      const decision = access.canUsePremiumFeature(context, feature);
      check(`${tier} cannot use ${feature}`, !decision.allowed);
      // Never "needs-account": an account alone does not unlock these, so
      // prompting a guest to sign in here would leave them just as blocked.
      check(`${tier} is told ${feature} needs Premium`, decision.reason === "needs-premium", String(decision.reason));
    }
  }
  const premium = fresh("premium");
  for (const feature of features) {
    check(`premium can use ${feature}`, access.canUsePremiumFeature(premium, feature).allowed);
  }
}
{
  const context = fresh("free");
  check("canSaveWord is blocked for free", !access.canSaveWord(context).allowed);
  check("canUseComprehension is blocked for free", !access.canUseComprehension(context).allowed);
  check("canUseAIExplanation is blocked for free", !access.canUseAIExplanation(context).allowed);
  check("canUseReview is blocked for free", !access.canUseReview(context).allowed);
  check("canImportText is blocked for free", !access.canImportText(context).allowed);
}

console.log("--- Storage failures fail open ---");
{
  const realWindow = globalThis.window;
  globalThis.window = { dispatchEvent: () => true };
  const noStorage = usage.getDailyUsage();
  check("unavailable storage reads as nothing used", noStorage.articleIds.length === 0 && noStorage.lookups === 0);
  const context = access.accessContext("guest", noStorage);
  check("a reader is not locked out by blocked storage", access.canStartArticle(context, "any").allowed);
  globalThis.window = realWindow;
}
{
  store.clear();
  store.set("lire.access.dailyUsage.v1", "not json");
  const corrupt = usage.getDailyUsage();
  check("corrupt usage reads as nothing used", corrupt.articleIds.length === 0 && corrupt.lookups === 0);
}

console.log("--- The old free-article record is carried over ---");
{
  // Somebody mid-day must not gain a second free article because the storage
  // format changed underneath them.
  store.clear();
  const today = usage.getDailyUsage().dateKey;
  store.set("lire.access.dailyArticle.v1", JSON.stringify({ dateKey: today, articleId: "legacy-article" }));
  const migrated = usage.getDailyUsage();
  check("the legacy article counts against today", migrated.articleIds.includes("legacy-article"));
  const context = access.accessContext("guest", migrated);
  check("the legacy article is still free to reopen", access.canStartArticle(context, "legacy-article").allowed);
  check("but a second article is blocked", !access.canStartArticle(context, "another").allowed);
}
{
  store.clear();
  store.set("lire.access.dailyArticle.v1", JSON.stringify({ dateKey: "1999-01-01", articleId: "old" }));
  check("a stale legacy record does not count", usage.getDailyUsage().articleIds.length === 0);
}

console.log("--- Limits match the specification ---");
{
  check("guest articles = 1", TIER_LIMITS.guest.articlesPerDay === 1);
  check("guest lookups = 3", TIER_LIMITS.guest.lookupsPerDay === 3);
  check("free articles = 3", TIER_LIMITS.free.articlesPerDay === 3);
  check("free lookups = 10", TIER_LIMITS.free.lookupsPerDay === 10);
  check("premium articles unlimited", TIER_LIMITS.premium.articlesPerDay === null);
  check("premium lookups unlimited", TIER_LIMITS.premium.lookupsPerDay === null);
  check("only premium has advanced features", !TIER_LIMITS.guest.advancedFeatures && !TIER_LIMITS.free.advancedFeatures && TIER_LIMITS.premium.advancedFeatures);
}

console.log("--- Gates are wired at the real call sites ---");
{
  const reader = readFileSync(new URL("../src/components/Reader.tsx", import.meta.url), "utf8");
  check("word taps are gated", /canLookupWord\(access\)/.test(reader));
  check("saving is gated", /canSaveWord\(access\)/.test(reader));
  check("comprehension is gated", /canUseComprehension\(access\)/.test(reader));
  check("a blocked tap does not consume an allowance", reader.indexOf("canLookupWord(access)") < reader.indexOf("consumeLookup()"));

  for (const [path, feature] of [
    ["src/app/review/page.tsx", "review"],
    ["src/app/grammar/page.tsx", "grammar"],
    ["src/app/import/page.tsx", "importText"],
    ["src/app/reader/[id]/practice/PracticePageClient.tsx", "practice"],
    ["src/app/reader/[id]/listen/ListenPageClient.tsx", "listening"],
  ]) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    check(`${path} is gated as ${feature}`, new RegExp(`feature="${feature}"`).test(source));
  }

  const meaningSheet = readFileSync(new URL("../src/components/MeaningSheet.tsx", import.meta.url), "utf8");
  check("the AI explanation button is gated", /aiAllowed/.test(meaningSheet));
  // The resolver's automatic escalation is correctness, not a feature; gating
  // it would silently degrade lookups rather than withhold something visible.
  check("automatic escalation is left ungated", !/canUseAIExplanation/.test(readFileSync(new URL("../src/lib/dictionary/resolveMeaning.ts", import.meta.url), "utf8")));
}

console.log("--- Existing vocabulary is not destroyed ---");
{
  const reader = readFileSync(new URL("../src/components/Reader.tsx", import.meta.url), "utf8");
  const words = readFileSync(new URL("../src/app/words/page.tsx", import.meta.url), "utf8");
  check("the save gate blocks adding, not reading", /setBlocked\(\{ reason: saveDecision\.reason/.test(reader));
  check("nothing deletes saved words on a tier change", !/clearWords\(\)/.test(reader));
  check("the vocabulary list is not gated", !/PremiumRouteGate/.test(words));
}

if (failures.length > 0) {
  console.log("");
  for (const failure of failures) console.log(`FAIL ${failure}`);
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
