import { readFileSync } from "node:fs";

/**
 * The AI routes are the only endpoints in the app that spend money on an
 * incoming request. They once accepted unauthenticated POSTs with no rate
 * limit, no input ceiling and no output ceiling, so anyone who found them
 * could bill the developer in a loop.
 *
 * These tests pin every part of the fix in place. They read source rather
 * than making requests, because the property worth protecting is "the guard
 * is wired into every route" — a runtime test against one route would pass
 * happily while a fifth route was added without one.
 */

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

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

/** Comments explain these rules at length; only real code should satisfy a test. */
function codeOnly(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
}

const AI_ROUTES = [
  "src/app/api/ai/explain-word/route.ts",
  "src/app/api/ai/explain-sentence/route.ts",
  "src/app/api/ai/paraphrase/route.ts",
  "src/app/api/ai/translate-article/route.ts",
];

console.log("--- Every AI route is gated before it can spend anything ---");
for (const path of AI_ROUTES) {
  const source = codeOnly(read(path));
  const name = path.split("/").slice(-2)[0];

  check(`${name} calls the guard`, /requirePaidAiCaller\(request\)/.test(source));
  check(`${name} returns the guard's refusal`, /if \(!gate\.ok\) return gate\.response;/.test(source));

  // Order matters more than presence: gating after the body is parsed and
  // forwarded would defeat the point.
  const gateAt = source.indexOf("requirePaidAiCaller");
  const awaitAt = source.indexOf("await request.json()");
  check(`${name} gates before reading the body`, gateAt !== -1 && gateAt < awaitAt, `gate ${gateAt}, body ${awaitAt}`);
}

console.log("--- The guard requires an account, a subscription, and budget ---");
{
  const guard = codeOnly(read("src/lib/ai/guard.ts"));
  check("it authenticates the request", /authenticatedUser\(request\)/.test(guard));
  check("an unauthenticated caller gets 401", /status: 401/.test(guard));
  check("it checks for an active subscription", /hasActivePremium\(/.test(guard));
  check("a non-subscriber is refused", /status: 402/.test(guard));
  check("it books the call against a daily budget", /sorlio_consume_ai_call/.test(guard));
  check("an over-budget caller gets 429", /status: 429/.test(guard));

  // If migration 0008 has not been applied the RPC errors. Failing open there
  // would restore the exact hole this file exists to close.
  const errorBranch = guard.slice(guard.indexOf("sorlio_consume_ai_call"));
  check("a missing quota function fails closed", /if \(error\)[\s\S]{0,200}status: 503/.test(errorBranch));

  // An expired subscription must not keep working.
  check("premium requires an unexpired period", /expiresAt\)\.getTime\(\) > Date\.now\(\)/.test(guard));
}

console.log("--- Input size is bounded ---");
{
  const guard = codeOnly(read("src/lib/ai/guard.ts"));
  check("required text has a length ceiling", /value\.length > max/.test(guard));
  check("optional text is truncated rather than rejected", /value\.slice\(0, max\)/.test(guard));

  const translate = codeOnly(read("src/app/api/ai/translate-article/route.ts"));
  check("article translation caps sentence count", /sentences\.length > MAX_ARTICLE_SENTENCES/.test(translate));
  // The count cap alone was the original gap: 200 sentences of any length is
  // still unbounded, and cost tracks characters.
  check("article translation caps each sentence", /sentence\.length > MAX_TEXT_CHARS/.test(translate));
  check("article translation caps total characters", /totalChars > MAX_ARTICLE_TOTAL_CHARS/.test(translate));
}

console.log("--- Output size is bounded ---");
{
  const openai = codeOnly(read("src/lib/ai/openai.ts"));
  check("every OpenAI call sends max_tokens", /max_tokens: maxTokens/.test(openai));
  check("there is a default token ceiling", /DEFAULT_MAX_TOKENS\s*=\s*\d+/.test(openai));
  check("article translation gets its own ceiling", /ARTICLE_TRANSLATION_MAX_TOKENS/.test(openai));
}

console.log("--- The client sends credentials, or the routes are unusable ---");
{
  const client = codeOnly(read("src/lib/ai/client.ts"));
  check("the AI client builds an auth header", /getAccessToken\(\)/.test(client));
  check("every AI fetch uses it", (client.match(/headers: await aiHeaders\(\)/g) ?? []).length === 4,
    `${(client.match(/headers: await aiHeaders\(\)/g) ?? []).length} of 4`);
  check("no AI fetch sends bare headers", !/headers: \{ "Content-Type": "application\/json" \}/.test(client));

  const paraphrase = codeOnly(read("src/lib/practice/paraphrase.ts"));
  check("practice paraphrase sends the token too", /getAccessToken\(\)/.test(paraphrase));
}

console.log("--- The quota is counted atomically ---");
{
  const migration = read("supabase/migrations/0008_ai_usage.sql");
  check("the counter table exists", /create table if not exists public\.sorlio_ai_usage/.test(migration));
  check("it cascades on account deletion", /references auth\.users \(id\) on delete cascade/.test(migration));
  check("row level security is enabled", /alter table public\.sorlio_ai_usage enable row level security/.test(migration));
  check("no policy is granted to the anon key", !/create policy[\s\S]*sorlio_ai_usage/.test(migration));

  // Read-then-write from the route would let two concurrent requests both see
  // "one below the limit" and both proceed.
  check("check and increment happen in one statement", /on conflict \(user_id, usage_date\) do update/.test(migration));
  check("a blocked caller does not inflate the counter", /where u\.calls < p_limit/.test(migration));
}

console.log("--- Scraping sources ship disabled ---");
{
  const sources = read("src/data/rssSources.ts");
  const enabled = (sources.match(/enabled: true/g) ?? []).length;
  // The pipeline reproduces full article bodies from publishers, which no RSS
  // feed licenses. Re-enabling a source is a licensing decision.
  check("no scraping source is enabled", enabled === 0, `${enabled} still enabled`);
  check("the reason is recorded in the file", /licence|license/i.test(sources));

  const fallback = codeOnly(read("src/lib/rss/candidatePool.ts"));
  check("a fallback pool exists so surfaces are not empty", /createFallbackCandidatePool/.test(fallback));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log("\nFailures:");
  for (const failure of failures) console.log(`  - ${failure}`);
}
process.exit(failed ? 1 : 0);
