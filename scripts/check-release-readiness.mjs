/**
 * Lists what still stands between this build and a store submission, from
 * facts in the repository (not from memory or a checklist that can rot):
 *
 *   - legal placeholders in src/lib/legal.ts (operator identity, region, dates);
 *   - Android build facts (versionCode, unused permissions);
 *   - content awaiting human review.
 *
 * Exit code 1 while anything is outstanding. Not part of `npm test`: an
 * unfinished release is not a failing build.
 *
 *   node --import ./scripts/register-alias-loader.mjs scripts/check-release-readiness.mjs
 */

import { existsSync, readFileSync } from "node:fs";

const { LEGAL, isPlaceholder } = await import("../src/lib/legal.ts");

const outstanding = [];
const done = [];

for (const [key, value] of Object.entries(LEGAL)) {
  if (typeof value === "string" && isPlaceholder(value)) outstanding.push(`legal: set LEGAL.${key} in src/lib/legal.ts (currently ${value})`);
}

const manifestPath = new URL("../android/app/src/main/AndroidManifest.xml", import.meta.url);
if (existsSync(manifestPath)) {
  const manifest = readFileSync(manifestPath, "utf8");
  if (/POST_NOTIFICATIONS/.test(manifest)) outstanding.push("android: AndroidManifest.xml still requests POST_NOTIFICATIONS, which Sorlio never uses");
  else done.push("android: no POST_NOTIFICATIONS permission");
}

const reviewDocs = [
  ["docs/review/french-human-review.md", "French content human review"],
  ["docs/review/public-domain-spot-check.md", "public-domain spot check"],
];
for (const [path, label] of reviewDocs) {
  const url = new URL(`../${path}`, import.meta.url);
  if (!existsSync(url)) {
    outstanding.push(`review: ${label} package missing (${path})`);
    continue;
  }
  const text = readFileSync(url, "utf8");
  const unreviewed = (text.match(/\|\s*\|\s*$/gm) ?? []).length;
  if (unreviewed) outstanding.push(`review: ${label} has ${unreviewed} row(s) without a verdict (${path})`);
  else done.push(`review: ${label} complete`);
}

for (const line of done) console.log(`  done  ${line}`);
for (const line of outstanding) console.log(`  TODO  ${line}`);
console.log(`\n${outstanding.length} outstanding, ${done.length} done`);
process.exit(outstanding.length ? 1 : 0);
