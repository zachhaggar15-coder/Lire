// One-off repair for src/data/publicDomainTexts.ts.
//
// The original generator collapsed all whitespace after joining paragraphs
// (see normalizeExcerpt in generate-public-domain-texts.mjs), which merged
// every dialogue turn into a single run-on paragraph, and it took sentence #1
// as the preview, which produced listings like "--Oh!" and "--Serviteur!".
//
// The generator is fixed, but regenerating needs Project Gutenberg. This
// applies the same two rules to the committed data so readers get coherent
// excerpts now, without changing a single word of the source text:
//   1. put each dialogue turn back on its own paragraph
//   2. use the first sentence with real content as the preview
//
// Run with: node scripts/repair-public-domain-texts.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(here, "..", "src", "data", "publicDomainTexts.ts");

/** Dialogue openers used across these Gutenberg transcriptions: "--", "—", "–", and the odd "—-". */
const DIALOGUE_MARKER = /\s+((?:-{2,}|[—–])-?)\s*(?=[«"'\p{Lu}\p{Ll}])/gu;

function countWords(text) {
  return text.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
}

/**
 * Restores paragraph breaks before each dialogue turn. Only splits when the
 * marker appears mid-body, so an excerpt that already opens with a dash keeps
 * its first line intact.
 */
function restoreParagraphs(body) {
  if (body.includes("\n")) return body;
  // No space inserted after the marker: the excerpts are meant to reproduce
  // the source wording exactly, so this only moves the break, it doesn't
  // retypeset the dash.
  const split = body.replace(DIALOGUE_MARKER, (_match, marker) => `\n\n${marker}`);
  return split
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

function previewFor(body) {
  const sentences = body
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?…])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const substantial = sentences.find((sentence) => countWords(sentence) >= 6);
  const chosen = substantial ?? sentences[0] ?? body;
  return chosen.length > 180 ? `${chosen.slice(0, 177).trim()}...` : chosen;
}

const source = fs.readFileSync(target, "utf8");
// Not indexOf("["): the `ReadingText[]` type annotation gets there first.
const assignment = source.indexOf("= [");
const start = assignment === -1 ? -1 : assignment + 2;
const end = source.lastIndexOf("]");
if (start === -1 || end === -1) throw new Error("Could not locate the texts array.");

const header = source.slice(0, start);
const texts = JSON.parse(source.slice(start, end + 1));

let paragraphsRestored = 0;
let previewsFixed = 0;

for (const text of texts) {
  const body = restoreParagraphs(text.body);
  if (body !== text.body) paragraphsRestored++;
  text.body = body;

  const preview = previewFor(body);
  if (preview !== text.preview) previewsFixed++;
  text.preview = preview;
}

fs.writeFileSync(target, `${header}${JSON.stringify(texts, null, 2)};\n`, "utf8");

console.log(`Repaired ${texts.length} excerpts.`);
console.log(`  paragraph breaks restored: ${paragraphsRestored}`);
console.log(`  previews replaced:         ${previewsFixed}`);
