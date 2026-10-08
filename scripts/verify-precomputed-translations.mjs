/**
 * Binds every precomputed translation to the exact French it translates.
 *
 * A precomputed entry is only usable if it was generated from the CURRENT
 * text: same sentence split, and each sentence's French alignment fragments
 * actually occur in that sentence. Entries that pass are stamped with
 * `sourceHash` (sha256 of the body); entries that fail are reported and, with
 * --drop-stale, removed so precompute-fluent-translations.mjs regenerates them.
 *
 *   node --import ./scripts/register-alias-loader.mjs scripts/verify-precomputed-translations.mjs [--stamp] [--drop-stale]
 *
 * test-precomputed-translations.mjs enforces the result: every live text's
 * entry carries the hash of its current body.
 */

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { NUM_SHARDS, shardForId } from "./lib/precomputedShards.mjs";

const { texts } = await import("../src/data/texts.ts");
const { tokenizeParagraphsToSentences } = await import("../src/lib/words.ts");

const DIR = new URL("../src/data/precomputed/", import.meta.url);
const stamp = process.argv.includes("--stamp");
const dropStale = process.argv.includes("--drop-stale");

export const sourceHash = (body) => createHash("sha256").update(body).digest("hex").slice(0, 32);
const norm = (s) => s.normalize("NFC").toLowerCase().replace(/[\s  ]+/g, " ").replace(/[’']/g, "'").replace(/[«»"“”]/g, "").trim();

const store = {};
for (const file of readdirSync(DIR)) if (file.endsWith(".json")) Object.assign(store, JSON.parse(readFileSync(new URL(file, DIR), "utf8")));

const live = new Map(texts.map((text) => [text.id, text]));
const report = { live: texts.length, verified: 0, alreadyStamped: 0, stale: [], missing: [], orphans: [] };

function verify(text, entry) {
  const sentences = tokenizeParagraphsToSentences(text.body).flat().map((s) => s.text);
  // The split can change without the body changing (a splitter fix), and the
  // reader pairs translations by sentence index, so counts are always checked.
  if (!Array.isArray(entry.sentences) || entry.sentences.length !== sentences.length) return "sentence-count";
  if (entry.sourceHash) return entry.sourceHash === sourceHash(text.body) ? "ok" : "hash-mismatch";
  if (!Array.isArray(entry.alignments) || entry.alignments.length !== sentences.length) return "alignment-count";
  for (let i = 0; i < sentences.length; i += 1) {
    const sentence = norm(sentences[i]);
    const fragments = (entry.alignments[i] ?? []).map((a) => norm(a?.french ?? "")).filter((f) => f.length >= 3);
    if (fragments.length === 0) continue;
    const found = fragments.filter((f) => sentence.includes(f)).length;
    if (found / fragments.length < 0.8) return `french-mismatch@${i}`;
  }
  return "ok";
}

for (const [id, entry] of Object.entries(store)) {
  const text = live.get(id);
  if (!text) {
    report.orphans.push(id);
    if (dropStale) delete store[id];
    continue;
  }
  const result = verify(text, entry);
  if (result === "ok") {
    if (entry.sourceHash) report.alreadyStamped += 1;
    else {
      report.verified += 1;
      if (stamp) entry.sourceHash = sourceHash(text.body);
    }
  } else {
    report.stale.push(`${id}:${result}`);
    if (dropStale) delete store[id];
  }
}
for (const id of live.keys()) if (!store[id] && !report.stale.some((s) => s.startsWith(`${id}:`))) report.missing.push(id);

if (stamp || dropStale) {
  const shards = Array.from({ length: NUM_SHARDS }, () => ({}));
  for (const [id, entry] of Object.entries(store)) shards[shardForId(id)][id] = entry;
  for (let i = 0; i < NUM_SHARDS; i += 1) writeFileSync(new URL(`shard-${i}.json`, DIR), JSON.stringify(shards[i]));
}

console.log(JSON.stringify({ ...report, stale: report.stale.length, missing: report.missing.length, orphans: report.orphans.length }));
if (report.stale.length) console.log(`stale: ${report.stale.slice(0, 40).join(" ")}`);
if (report.missing.length) console.log(`missing: ${report.missing.slice(0, 40).join(" ")}`);

// Read-only runs are a test suite (run-tests): every live text must have a
// translation bound to its current body, with nothing unstamped or orphaned.
if (!stamp && !dropStale) {
  const failures = report.stale.length + report.missing.length + report.orphans.length + report.verified;
  console.log(`${report.live - report.stale.length - report.missing.length} checks passed, ${failures} failed`);
  if (failures) process.exitCode = 1;
}
