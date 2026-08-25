/**
 * Verifies a live Supabase project matches what supabase/migrations/ declares.
 *
 * Run after applying migrations, after rotating keys, and after pointing the
 * app at a different project — the three moments where the database and the
 * code can silently disagree. A schema that is merely *present* is not the
 * bar; this also checks that row-level security actually refuses the anon key,
 * which is the part no migration can prove on its own.
 *
 *   npm run verify:supabase              # uses .env.local
 *   npm run verify:supabase -- .env.ci   # or any env file
 *
 * With no file argument and no file present, it falls back to the ambient
 * environment, so it can run against a deployed environment in CI.
 *
 * Deliberately NOT part of `npm test`: it needs real credentials and network
 * access, and `npm test` must stay runnable offline with no secrets.
 *
 * Never prints a key. The project ref is masked. Reads no row contents — every
 * check uses HEAD with an exact-count header, so it reports how many rows a
 * given key can see without retrieving any of them.
 */
import { readFileSync, existsSync } from "node:fs";

const EXPECTED_TABLES = [
  "sorlio_user_data",
  "sorlio_subscriptions",
  "sorlio_analytics_events",
  "sorlio_feedback",
  "sorlio_research_prompt_responses",
  "sorlio_android_beta_interest",
  "sorlio_ai_usage",
];

/** The AI budget function from 0008; without it the AI routes fail closed. */
const REQUIRED_FUNCTIONS = ["sorlio_consume_ai_call"];

/**
 * Tables the anon key must never read. sorlio_user_data is absent here because
 * it is a different rule: signed-in readers reach their own rows through RLS,
 * so "zero rows for an unauthenticated caller" is the correct expectation
 * rather than "zero rows ever".
 */
const SERVICE_ONLY_TABLES = EXPECTED_TABLES.filter((t) => t !== "sorlio_user_data");

/** Must not exist: pre-rename tables, and the removed CEFR gamification set. */
const FORBIDDEN_TABLES = [
  "lire_user_data",
  "lire_subscriptions",
  "lire_feedback",
  "lire_analytics_events",
  "user_progress",
  "user_xp_events",
  "daily_missions",
  "article_completions",
];

let passed = 0;
let failed = 0;
const warnings = [];

function ok(label, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    failed++;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function warn(message) {
  warnings.push(message);
  console.log(`  WARN  ${message}`);
}

function loadEnv(path) {
  if (!path) {
    const candidate = ".env.local";
    if (existsSync(candidate)) path = candidate;
  }
  if (!path || !existsSync(path)) {
    console.log(`  info  no env file; using the ambient environment`);
    return process.env;
  }
  console.log(`  info  reading ${path}`);
  const env = { ...process.env };
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#")) continue;
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

/** Hides the project ref, which identifies the database publicly. */
function maskUrl(url) {
  if (!url) return "(unset)";
  const ref = url.replace(/^https?:\/\//, "").split(".")[0];
  return ref.length > 8 ? `https://${ref.slice(0, 4)}…${ref.slice(-3)}.supabase.co` : "https://…supabase.co";
}

/** Reads a Supabase key's own claims. Local only — no network, no verification. */
function claims(jwt) {
  try {
    return JSON.parse(Buffer.from(String(jwt).split(".")[1], "base64url").toString());
  } catch {
    return {};
  }
}

/**
 * Row count visible to `key`, without fetching any row.
 *
 * HEAD plus `Prefer: count=exact` makes PostgREST answer in a Content-Range
 * header (`* / 42`) and send no body, so this reports what a key is allowed to
 * see without ever reading someone's saved words.
 *
 * Returns { status, count } — count is null when the table does not exist.
 */
async function countRows(baseUrl, table, key) {
  const response = await fetch(`${baseUrl}/rest/v1/${table}?select=*`, {
    method: "HEAD",
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact", Range: "0-0" },
  });
  const range = response.headers.get("content-range");
  const total = range && range.includes("/") ? Number(range.split("/")[1]) : null;
  return { status: response.status, count: Number.isFinite(total) ? total : null };
}

async function main() {
  const env = loadEnv(process.argv[2]);
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const urlOverride = env.SUPABASE_URL;

  console.log("\n--- Credentials are present and consistent ---");
  ok("NEXT_PUBLIC_SUPABASE_URL is set", !!url);
  ok("NEXT_PUBLIC_SUPABASE_ANON_KEY is set", !!anonKey);
  ok("SUPABASE_SERVICE_ROLE_KEY is set", !!serviceKey);

  // The server client reads SUPABASE_URL || NEXT_PUBLIC_SUPABASE_URL. Set to a
  // stale value it points every API route at one database while the browser
  // uses another, and sign-in still appears to work.
  ok(
    "SUPABASE_URL does not disagree with the public URL",
    !urlOverride || urlOverride === url,
    urlOverride ? `override targets ${maskUrl(urlOverride)}, browser targets ${maskUrl(url)}` : ""
  );

  if (!url || !anonKey || !serviceKey) {
    console.log("\nCannot continue without all three credentials.\n");
    process.exit(1);
  }
  console.log(`  info  project ${maskUrl(url)}`);

  // A key from the wrong project is still a structurally valid JWT, so this
  // failure otherwise surfaces much later as a confusing permission error.
  const anon = claims(anonKey);
  const service = claims(serviceKey);
  const projectRef = url.replace(/^https?:\/\//, "").split(".")[0];

  ok("the anon key really is the anon role", anon.role === "anon", `role is ${anon.role ?? "unreadable"}`);
  ok("the service key really is the service role", service.role === "service_role", `role is ${service.role ?? "unreadable"}`);
  ok("the anon key belongs to this project", !anon.ref || anon.ref === projectRef, "key was issued by a different project");
  ok("the service key belongs to this project", !service.ref || service.ref === projectRef, "key was issued by a different project");

  console.log("\n--- Every expected table exists ---");
  const serviceCounts = {};
  for (const table of EXPECTED_TABLES) {
    const { status, count } = await countRows(url, table, serviceKey);
    serviceCounts[table] = count;
    ok(`${table} exists`, status < 400, `HTTP ${status} — run supabase/migrations/ in filename order`);
  }

  console.log("\n--- Superseded tables were not recreated ---");
  for (const table of FORBIDDEN_TABLES) {
    const { status } = await countRows(url, table, serviceKey);
    ok(`${table} is absent`, status === 404, `HTTP ${status} — an obsolete migration has been applied`);
  }

  console.log("\n--- Row-level security refuses the anon key ---");
  // The anon key ships inside the app on every device, so treat it as public.
  // A table holding rows that this key can count is a table the public can read.
  for (const table of SERVICE_ONLY_TABLES) {
    const { status, count } = await countRows(url, table, anonKey);
    const visible = status < 400 ? count ?? 0 : 0;
    ok(`${table} shows nothing to the anon key`, visible === 0, `${visible} row(s) readable with a key that ships in the app`);
    // On an empty table the assertion above is trivially true, so say so
    // rather than let a green tick imply a guarantee that was never tested.
    if ((serviceCounts[table] ?? 0) === 0) {
      warn(`${table} is empty, so its RLS check proved nothing — re-run once it holds rows`);
    }
  }
  {
    const { status, count } = await countRows(url, "sorlio_user_data", anonKey);
    const visible = status < 400 ? count ?? 0 : 0;
    ok("sorlio_user_data shows nothing to an unauthenticated caller", visible === 0, `${visible} row(s) leaked`);
    if ((serviceCounts.sorlio_user_data ?? 0) === 0) {
      warn("sorlio_user_data is empty, so its RLS check proved nothing — re-run once a reader has synced");
    }
  }

  console.log("\n--- Row-level security refuses anon writes ---");
  // The only write in this script. If the insert policy is correct the row is
  // rejected and nothing is stored; if it is not, that is a finding worth the
  // cleanup below.
  const probe = "__sorlio_rls_probe__";
  const insert = await fetch(`${url}/rest/v1/sorlio_analytics_events`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ event_name: probe }),
  });
  ok("an anon insert is rejected", insert.status >= 400, `HTTP ${insert.status} — the anon key can write to your tables`);
  if (insert.status < 400) {
    const cleanup = await fetch(`${url}/rest/v1/sorlio_analytics_events?event_name=eq.${probe}`, {
      method: "DELETE",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    console.log(`  info  probe row removed (HTTP ${cleanup.status})`);
  }

  console.log("\n--- Functions the app depends on exist ---");
  for (const fn of REQUIRED_FUNCTIONS) {
    // Calling with no arguments is enough to tell existence from absence:
    // a missing function answers 404/PGRST202, a present one complains about
    // its arguments instead.
    const response = await fetch(`${url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    let payload = null;
    try { payload = await response.json(); } catch { payload = null; }
    const missing = response.status === 404 || payload?.code === "PGRST202";
    ok(`${fn}() exists`, !missing, "run supabase/migrations/0008_ai_usage.sql");
  }


  console.log("\n--- The deletion contract is recorded in the database ---");
  // Migration 0007 stores these as COMMENT ON TABLE, so their presence is also
  // proof that the last migration ran.
  const spec = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: "application/openapi+json" },
  });
  let doc = null;
  try {
    doc = await spec.json();
  } catch {
    doc = null;
  }
  const description = (table) =>
    doc?.definitions?.[table]?.description ?? doc?.components?.schemas?.[table]?.description ?? "";

  ok("sorlio_user_data documents its cascade", /cascades on auth user delete/i.test(description("sorlio_user_data")), "migration 0007 has not been applied");
  ok("sorlio_subscriptions documents that it is service-role only", /service-role only/i.test(description("sorlio_subscriptions")), "migration 0007 has not been applied");
  ok("sorlio_android_beta_interest documents that it survives deletion", /not deleted/i.test(description("sorlio_android_beta_interest")), "migration 0007 has not been applied");

  console.log(`\n${passed} passed, ${failed} failed${warnings.length ? `, ${warnings.length} inconclusive` : ""}\n`);
  if (warnings.length) {
    console.log("Inconclusive checks pass only because the table is empty:");
    for (const message of warnings) console.log(`  - ${message}`);
    console.log("");
  }
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(`\nVerification could not run: ${error.message}\n`);
  process.exit(1);
});
