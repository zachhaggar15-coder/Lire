/**
 * Runs every test suite in sequence and prints a summary with exact counts.
 *
 *   node scripts/run-tests.mjs            all suites
 *   node scripts/run-tests.mjs sync auth  only suites whose file name matches
 *
 * Each suite runs in its own Node process (they install global stubs such as
 * `window`), with the `@/` alias loader registered.
 */

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/** Ordered: fast pure-logic suites first, real-database suites after. */
export const SUITES = [
  "test-rss-filters.mjs",
  "test-rss-delivery.mjs",
  "test-learning-logic.mjs",
  "test-core-logic.mjs",
  "test-lire-level.mjs",
  "test-contextual-translation.mjs",
  "test-meaning-resolution.mjs",
  "test-meaning-corpus.mjs",
  "test-meaning-escalation.mjs",
  "test-meaning-shadowing.mjs",
  "test-meaning-generalisation.mjs",
  "test-learner-meaning.mjs",
  "test-translation-alignment.mjs",
  "test-dictionary-accuracy.mjs",
  "test-practice-exercises.mjs",
  "test-session-record.mjs",
  "test-personal-challenge.mjs",
  "test-reading-performance.mjs",
  "test-baseline-comparison.mjs",
  "test-diagnostic-messaging.mjs",
  "test-paraphrase-validation.mjs",
  "test-paraphrase-fallback.mjs",
  "test-paraphrase-session-integration.mjs",
  "test-onboarding-walkthrough.mjs",
  "test-closed-test-update-1.mjs",
  "test-saved-word-review-flow.mjs",
  "test-security-regressions.mjs",
  "test-account-auth.mjs",
  "test-ai-cost-controls.mjs",
  "test-access-model.mjs",
  "test-fullscreen-layout-regression.mjs",
  "test-practice-corpus-coverage.mjs",
  "test-android-release-config.mjs",
  "test-rate-prompt.mjs",
  "test-account-isolation.mjs",
  "test-sync-engine.mjs",
  "test-persistence-failures.mjs",
  "test-billing.mjs",
  "test-account-deletion.mjs",
];

const filters = process.argv.slice(2);
const selected = SUITES.filter((name) => filters.length === 0 || filters.some((f) => name.includes(f)));
const results = [];
const started = Date.now();

for (const suite of selected) {
  const t0 = Date.now();
  const run = spawnSync(process.execPath, ["--no-warnings", "--import", "./scripts/register-alias-loader.mjs", join("scripts", suite)], {
    cwd: join(here, ".."),
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const output = `${run.stdout ?? ""}${run.stderr ?? ""}`;
  // Suites print their own totals in a few historical formats; capture them all.
  let passed = 0;
  let failed = 0;
  for (const match of output.matchAll(/(\d+) failed, (\d+) passed/g)) {
    failed += Number(match[1]);
    passed += Number(match[2]);
  }
  const remaining = output.replace(/(\d+) failed, (\d+) passed/g, "");
  for (const match of remaining.matchAll(/(\d+) (?:checks )?passed(?:, (\d+) failed)?/g)) {
    passed += Number(match[1]);
    failed += Number(match[2] ?? 0);
  }
  const ok = run.status === 0;
  results.push({ suite, ok, passed, failed, ms: Date.now() - t0 });
  process.stdout.write(`${ok ? "PASS" : "FAIL"}  ${suite.padEnd(44)} ${String(passed).padStart(6)} passed  ${String(failed).padStart(3)} failed  ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
  if (!ok) process.stdout.write(output.split("\n").filter((line) => /FAIL|✗|Error|failed/.test(line)).slice(0, 25).map((l) => `      ${l}`).join("\n") + "\n");
}

const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
const failedSuites = results.filter((r) => !r.ok);
console.log(`\n${results.length} suites, ${results.length - failedSuites.length} passed, ${failedSuites.length} failed · ${totalPassed} checks passed, ${totalFailed} failed · ${((Date.now() - started) / 1000).toFixed(0)}s`);
process.exit(failedSuites.length ? 1 : 0);
