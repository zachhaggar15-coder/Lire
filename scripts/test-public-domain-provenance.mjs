/**
 * Provenance of the public-domain reading bank.
 *
 * Offline (always): every extract has a provenance record; the body hash
 * matches it (no silent edits); ranges from the same source never overlap;
 * word counts sit inside the level's range; titles carry accents; blurbs do
 * not overclaim.
 *
 * Online (VERIFY_GUTENBERG=1, or --online): re-fetches every source from
 * Project Gutenberg and proves each body is exactly the recorded contiguous
 * run of source paragraphs, with no barrier (chapter heading, editorial
 * matter) inside it.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRunner } from "./lib/fakeBrowser.mjs";
import { fetchGutenberg, matchKey, sourceParagraphs } from "./lib/gutenberg.mjs";

const t = createRunner("public-domain provenance");
const { publicDomainTexts } = await import("../src/data/publicDomainTexts.ts");
const provenance = JSON.parse(readFileSync(new URL("../src/data/publicDomainProvenance.json", import.meta.url), "utf8"));
const { CONTENT_EXCLUSIONS, WORD_TARGETS, countWords, isBarrier } = await import("./repair-public-domain-contiguity.mjs");
const { LEVEL_RELABELS } = await import("../src/data/levelRelabels.ts");
const online = process.env.VERIFY_GUTENBERG === "1" || process.argv.includes("--online");

const sha = (text) => createHash("sha256").update(text).digest("hex");

t.check("bank is not empty", publicDomainTexts.length >= 400, String(publicDomainTexts.length));
t.check("no beginner (A1/A2) literary extracts are shipped", publicDomainTexts.every((text) => !/^A[12]$/.test(text.difficulty)));

// Content gate for a 13+ audience. The word list is deliberately narrow (a
// slur has no innocent reading here; "centronotes-nègres" is a fish name and
// is excluded by the lookbehind); broader suitability is a human review item
// in docs/review/public-domain-spot-check.md.
const SLUR = /(?<![-\w])n[èé]gr(?:e|es|esse|esses)\b/i;
t.check("no excluded extract is shipped", publicDomainTexts.every((text) => !CONTENT_EXCLUSIONS[text.id]));
t.check("no extract contains a racial slur", publicDomainTexts.every((text) => !SLUR.test(text.body)), publicDomainTexts.filter((text) => SLUR.test(text.body)).map((text) => text.id).join(", "));

const ranges = new Map();
for (const text of publicDomainTexts) {
  const record = provenance[text.id];
  t.check(`${text.id} has a provenance record`, !!record);
  if (!record) continue;
  t.check(`${text.id} body matches its recorded hash`, sha(matchKey(text.body)) === record.bodySha256);
  const words = countWords(text.body);
  // A relabelled extract keeps the length it was cut to (data/levelRelabels.ts).
  const cutFor = LEVEL_RELABELS[text.id]?.from ?? text.difficulty;
  const target = WORD_TARGETS[cutFor];
  t.check(`${text.id} length fits ${cutFor}`, words >= target.min && words <= target.max, `${words} words`);
  t.check(`${text.id} contains no editorial matter (illustration, note, synopsis, scene break)`, !text.body.split(/\n{2,}/).some(isBarrier), text.body.split(/\n{2,}/).find(isBarrier)?.slice(0, 80));
  t.check(`${text.id} keeps one paragraph per source paragraph`, text.body.split(/\n{2,}/).length === record.lastParagraph - record.firstParagraph + 1);
  t.check(`${text.id} source URL matches provenance`, text.sourceUrl.endsWith(`/${record.gutenbergId}`));
  const list = ranges.get(record.gutenbergId) ?? [];
  t.check(`${text.id} does not overlap another extract`, !list.some((r) => record.firstParagraph <= r.lastParagraph && record.lastParagraph >= r.firstParagraph));
  list.push(record);
  ranges.set(record.gutenbergId, list);
  t.check(`${text.id} blurb does not claim "exact"`, !/\bexact\b/i.test(text.blurbEn ?? ""));
  t.check(`${text.id} title is accented where needed`, !/\b(Becasse|Telemaque|Francais|completes|terre a la)\b/.test(text.title));
}

if (online) {
  const cache = process.env.GUTENBERG_CACHE;
  for (const [gid, records] of ranges) {
    const paragraphs = sourceParagraphs(await fetchGutenberg(gid, cache));
    for (const record of records) {
      const text = publicDomainTexts.find((item) => provenance[item.id] === record);
      const slice = paragraphs.slice(record.firstParagraph, record.lastParagraph + 1);
      t.check(`${text.id} is exactly source paragraphs ${record.firstParagraph}-${record.lastParagraph}`, matchKey(slice.join("")) === matchKey(text.body));
      t.check(`${text.id} contains no barrier paragraph`, !slice.some(isBarrier));
    }
  }
}

t.finish();
