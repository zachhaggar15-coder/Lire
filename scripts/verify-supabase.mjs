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
import { EXPECTED_SCHEMA_VERSION } from "../src/lib/server/schema.ts";


const EXPECTED_TABLES = [
  "sorlio_user_data",
  "sorlio_subscriptions",
  "sorlio_feedback",
  "sorlio_ai_usage",
  "sorlio_billing_events",
  "sorlio_sync_stores",
  "sorlio_sync_state",
  "sorlio_sync_items",
  "sorlio_save_quota",
  "sorlio_ops_counters",
];

/**
 * Functions a signed-in client calls directly. Everything else in public.*
 * is server-only and must NOT be executable with the anon key.
 */
const CLIENT_FUNCTIONS = [
  "sorlio_sync_pull",
  "sorlio_sync_push",
  "sorlio_sync_import_legacy",
  "sorlio_sync_import_store",
  "sorlio_sync_remove_store",
  "sorlio_schema_version",
];
const SERVER_FUNCTIONS = [
  "sorlio_consume_ai_call",
  "sorlio_has_premium",
  "sorlio_billing_record",
  "sorlio_billing_owner",
  "sorlio_billing_get",
  "sorlio_billing_claim_event",
  "sorlio_billing_finish_event",
  "sorlio_billing_due",
  "sorlio_billing_purge_events",
  "sorlio_sync_purge",
  "sorlio_ops_increment",
  "sorlio_ops_summary",
  "sorlio_maintenance",
];

/**
 * Tables the anon key must never read. sorlio_user_data is absent here because
 * it is a different rule: signed-in readers reach their own rows through RLS,
 * so "zero rows for an unauthenticated caller" is the correct expectation
 * rather than "zero rows ever".
 */
const SERVICE_ONLY_TABLES = EXPECTED_TABLES.filter((t) => t !== "sorlio_user_data");

/**
 * Retired data collection (analytics, research prompts, beta list). The app
 * no longer writes these; they are dropped once the purge in
 * docs/release/analytics-purge-plan.md is approved. Reported, not failed.
 */
const RETIRED_TABLES = ["sorlio_analytics_events", "sorlio_research_prompt_responses", "sorlio_android_beta_interest"];

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
    if (serviceCounts[table] === 0) {
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

  console.log("\n--- Retired tables ---");
  for (const table of RETIRED_TABLES) {
    const { status, count } = await countRows(url, table, serviceKey);
    if (status === 404) {
      ok(`${table} has been dropped`, true);
      continue;
    }
    const visible = (await countRows(url, table, anonKey)).count ?? 0;
    ok(`${table} shows nothing to the anon key`, visible === 0, `${visible} row(s) readable`);
    warn(`${table} still exists with ${count ?? "?"} row(s) — awaiting the approved purge`);
  }

  console.log("\n--- Row-level security refuses anon writes ---");
  // The only write in this script. The anon role has no privileges on the
  // sync tables, so this must be refused; if it is not, that is a finding
  // worth the cleanup below.
  const probe = "__sorlio_rls_probe__";
  const insert = await fetch(`${url}/rest/v1/sorlio_sync_items`, {
    method: "POST",
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ store_key: probe, item_id: probe, rev: 1, data: {} }),
  });
  ok("an anon insert is rejected", insert.status >= 400, `HTTP ${insert.status} — the anon key can write to your tables`);
  if (insert.status < 400) {
    const cleanup = await fetch(`${url}/rest/v1/sorlio_sync_items?item_id=eq.${probe}`, {
      method: "DELETE",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    console.log(`  info  probe row removed (HTTP ${cleanup.status})`);
  }

  console.log("\n--- Schema version ---");
  const versionResponse = await fetch(`${url}/rest/v1/rpc/sorlio_schema_version`, {
    method: "POST",
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, "Content-Type": "application/json" },
    body: "{}",
  });
  const version = await versionResponse.json().catch(() => null);
  ok(
    `database schema version is ${EXPECTED_SCHEMA_VERSION}`,
    version === EXPECTED_SCHEMA_VERSION,
    `found ${JSON.stringify(version)} — apply supabase/migrations/ in order through ${String(EXPECTED_SCHEMA_VERSION).padStart(4, "0")}`
  );

  console.log("\n--- Function exposure ---");
  // PostgREST's OpenAPI document lists exactly the functions the calling key
  // may execute, so it proves existence (service key) and exposure (anon key)
  // without calling anything.
  const openApi = async (key) => {
    const response = await fetch(`${url}/rest/v1/`, { headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/openapi+json" } });
    return response.json().catch(() => ({}));
  };
  const rpcNames = (doc) => new Set(Object.keys(doc.paths ?? {}).filter((path) => path.startsWith("/rpc/")).map((path) => path.slice(5)));
  const serviceDoc = await openApi(serviceKey);
  const asService = rpcNames(serviceDoc);
  const asAnon = rpcNames(await openApi(anonKey));
  for (const fn of [...CLIENT_FUNCTIONS, ...SERVER_FUNCTIONS]) ok(`${fn}() exists`, asService.has(fn), "a migration has not been applied");
  for (const fn of SERVER_FUNCTIONS) ok(`${fn}() is not callable with the public key`, !asAnon.has(fn), "server-only function exposed to clients");
  for (const fn of ["sorlio_strip_user_metadata", "sorlio_strip_identity_data"]) ok(`${fn}() is not exposed as an RPC`, !asAnon.has(fn) && !asService.has(fn));

  console.log("\n--- The deletion contract is recorded in the database ---");
  // Migration 0007 stores these as COMMENT ON TABLE.
  const description = (table) =>
    serviceDoc?.definitions?.[table]?.description ?? serviceDoc?.components?.schemas?.[table]?.description ?? "";
  ok("sorlio_user_data documents its cascade", /cascades on auth user delete/i.test(description("sorlio_user_data")), "migration 0007 has not been applied");
  ok("sorlio_subscriptions documents that it is service-role only", /service-role only/i.test(description("sorlio_subscriptions")), "migration 0007 has not been applied");

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
