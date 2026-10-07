/**
 * Repairs the public-domain reading bank so every excerpt is a contiguous,
 * unabridged run of paragraphs from its Project Gutenberg source.
 *
 * The original generator filtered paragraphs (dropping short dialogue lines
 * and anything else that failed a heuristic) and then joined "consecutive"
 * items of the FILTERED list — so most excerpts silently skipped source
 * paragraphs while being described as exact. 383 of the 500 shipped excerpts
 * were affected.
 *
 * For each shipped excerpt (B1–C2; A1/A2 are not shown in the app and are
 * dropped from the data file):
 *   - if it is already contiguous in the source, it is kept unchanged;
 *   - otherwise it is rebuilt from the same first source paragraph as one
 *     contiguous run within its level's word range, never crossing a barrier
 *     (chapter heading, editorial note, footnote marker, italics markup);
 *     if that start cannot produce a valid run, the next start is tried.
 * IDs and levels are kept so readers' history still points at the same slot.
 *
 * Outputs:
 *   src/data/publicDomainTexts.ts           repaired bank
 *   src/data/publicDomainProvenance.json    id -> Gutenberg id + paragraph range
 *   precomputed translations of changed excerpts are removed (stale)
 *
 * Run: node --import ./scripts/register-alias-loader.mjs scripts/repair-public-domain-contiguity.mjs [cacheDir]
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { fetchGutenberg, gutenbergUrl, matchKey, sourceParagraphs } from "./lib/gutenberg.mjs";

const root = new URL("..", import.meta.url);
const dataPath = new URL("src/data/publicDomainTexts.ts", root);
const provenancePath = new URL("src/data/publicDomainProvenance.json", root);
const precomputedDir = new URL("src/data/precomputed/", root);
const cacheDir = process.argv[2];

export const WORD_TARGETS = {
  A1: { min: 45, max: 90 },
  A2: { min: 80, max: 140 },
  B1: { min: 130, max: 220 },
  B2: { min: 190, max: 310 },
  C1: { min: 260, max: 430 },
  C2: { min: 360, max: 560 },
};

/** Correctly spelled source metadata (the original list had no accents). */
export const SOURCE_META = {
  800: { title: "Le Tour du monde en quatre-vingts jours", author: "Jules Verne" },
  5097: { title: "Vingt mille lieues sous les mers", author: "Jules Verne" },
  799: { title: "De la Terre à la Lune", author: "Jules Verne" },
  17796: { title: "Le Pays des fourrures", author: "Jules Verne" },
  16826: { title: "Face au drapeau", author: "Jules Verne" },
  4791: { title: "Voyage au centre de la Terre", author: "Jules Verne" },
  4548: { title: "Cinq semaines en ballon", author: "Jules Verne" },
  30779: { title: "Les Aventures de Télémaque", author: "Fénelon" },
  55456: { title: "Aventures d'Alice au pays des merveilles", author: "Lewis Carroll (traduction de Henri Bué)" },
  14155: { title: "Madame Bovary", author: "Gustave Flaubert" },
  48359: { title: "Madame Bovary", author: "Gustave Flaubert" },
  17989: { title: "Le Comte de Monte-Cristo", author: "Alexandre Dumas" },
  17990: { title: "Le Comte de Monte-Cristo", author: "Alexandre Dumas" },
  17991: { title: "Le Comte de Monte-Cristo", author: "Alexandre Dumas" },
  17992: { title: "Le Comte de Monte-Cristo", author: "Alexandre Dumas" },
  14790: { title: "Contes du jour et de la nuit", author: "Guy de Maupassant" },
  11714: { title: "Contes de la Bécasse", author: "Guy de Maupassant" },
  51266: { title: "Œuvres complètes de Guy de Maupassant", author: "Guy de Maupassant" },
  12949: { title: "Contes français", author: "Douglas Labaree Buffum (éd.)" },
};

/**
 * Extracts removed after content review for a general 13+ audience. These
 * are faithful to their period sources, but shown without any framing they
 * would put a racial slur or a sexual scene in front of a teenage reader.
 * Removed rather than edited: the bank only ships unaltered text.
 */
export const CONTENT_EXCLUSIONS = {
  "pd-b1-275": "racial slur used for African people (Cinq semaines en ballon)",
  "pd-c1-495": "racial slur used for a boy (Face au drapeau)",
  "pd-c1-497": "racial slur used for African people (Cinq semaines en ballon)",
  "pd-c2-604": "racial slur used for African people (Cinq semaines en ballon)",
  "pd-c1-486": "people described as 'le sauvage' (Cinq semaines en ballon)",
  "pd-c1-515": "African guide called 'maudit sauvage' (Cinq semaines en ballon)",
  "pd-c1-543": "peoples ranked as more or less 'sauvages' (Cinq semaines en ballon)",
  "pd-c1-576": "people described as 'types foncièrement sauvages' (Face au drapeau)",
  "pd-c2-690": "wedding-night undressing scene (Contes de la Bécasse)",
};

export function countWords(text) {
  return (text.match(/[A-Za-zÀ-ÖØ-öø-ÿœŒ]+(?:['’‑-][A-Za-zÀ-ÖØ-öø-ÿœŒ]+)*/g) ?? []).length;
}

/**
 * A chapter synopsis printed under a heading in these editions:
 * "Traversée rapide.--Résolutions prudentes.--Caravanes.--Gao.--Le Niger."
 * Short headline fragments joined by unspaced "--" (dialogue opens with "--"
 * or «, and parenthetical dashes in Face au drapeau are spaced " -- ").
 */
export function isSynopsis(paragraph) {
  if (paragraph.length > 700 || /^\s*(«|--)/.test(paragraph) || / -- /.test(paragraph)) return false;
  const segments = paragraph.split(/--/).map((segment) => segment.trim()).filter(Boolean);
  if (segments.length < 4) return false;
  const short = segments.filter((segment) => segment.split(/\s+/).length <= 7).length;
  return short / segments.length >= 0.75;
}

export const RACIAL_SLUR = /(?<![-\w])n[èé]gr(?:e|es|esse|esses)\b/i;

/** Paragraphs an excerpt may never include or cross. */
export function isBarrier(paragraph) {
  // Editorial insertions: "[Illustration: LE VIEUX]" and the editors' notes
  // these editions print inline, "[Environ 400 lieues]".
  if (/\[[^\]]*\]/.test(paragraph)) return true;
  // A scene break ("* * *"): text either side belongs to different scenes.
  if (/^[\s*]+$/.test(paragraph)) return true;
  if (isSynopsis(paragraph)) return true;
  // Content, not editorial: a passage using this slur is never shown
  // unframed to a 13+ audience, so rebuilds must not land on one
  // (see CONTENT_EXCLUSIONS and the gate in test-public-domain-provenance).
  if (RACIAL_SLUR.test(paragraph)) return true;
  const digits = (paragraph.match(/\d/g) ?? []).length;
  if (/project gutenberg|ebook|copyright|license|produced by|table des mati[eè]res/i.test(paragraph)) return true;
  if (/^(CHAPITRE|LIVRE|TOME|PARTIE|PREMI[EÈ]RE PARTIE)\b/i.test(paragraph)) return true;
  if (/^([IVXLCDM]+|\d+)\.?$/i.test(paragraph)) return true;
  if (/^[A-ZÀ-Ý\s'’.,-]{3,}$/.test(paragraph) && paragraph.length < 80) return true; // all-caps heading
  if (/\[\d+\]|[_~]/.test(paragraph)) return true; // footnote markers, italics markup
  if (digits / Math.max(1, paragraph.length) > 0.04) return true;
  if (/\b(vol\.|in-8|in-12|pp\.|librairie|imprimerie)\b/i.test(paragraph)) return true;
  return false;
}

/** A contiguous run from `start` within the level's word range, or null. */
export function contiguousRun(paragraphs, start, level) {
  const target = WORD_TARGETS[level];
  let words = 0;
  let end = start - 1;
  for (let index = start; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index];
    if (isBarrier(paragraph)) break;
    const next = countWords(paragraph);
    if (words + next > target.max) break;
    words += next;
    end = index;
    if (words >= target.min) return { start, end, words };
  }
  return null;
}

function previewFor(body) {
  const sentences = body.replace(/\n+/g, " ").split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter(Boolean);
  const chosen = sentences.find((sentence) => countWords(sentence) >= 6) ?? sentences[0] ?? body;
  return chosen.length > 180 ? `${chosen.slice(0, 177).trim()}...` : chosen;
}

function minutesFor(words) {
  return Math.max(1, Math.min(8, Math.round(words / 130)));
}

function blurbFor(meta, words) {
  return `An unabridged extract (${words} words) from ${meta.title} by ${meta.author}, from the Project Gutenberg edition. Spelling and punctuation are as in that edition.`;
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

/** Finds the source paragraph range an excerpt body occupies, if contiguous. */
export function locate(paragraphs, keys, body) {
  const bodyParas = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const whole = matchKey(bodyParas.join(" "));
  const probe = matchKey(bodyParas[0]).slice(0, 24);
  const candidates = [];
  keys.forEach((key, index) => {
    if (key.includes(probe)) candidates.push(index);
  });
  for (const start of candidates) {
    let acc = "";
    for (let index = start; index < keys.length && acc.length <= whole.length + 200; index += 1) {
      acc += keys[index];
      if (acc === whole || (acc.includes(whole) && acc.startsWith(probe.slice(0, 20)))) return { start, end: index, contiguous: true };
    }
  }
  return candidates.length ? { start: candidates[0], end: null, contiguous: false } : null;
}

async function main() {
  const source = readFileSync(dataPath, "utf8");
  // Accepts the original generated file and this script's own output, so a
  // re-run is idempotent: already-repaired extracts are simply kept.
  const marker = /const (?:generatedPublicDomainTexts|publicDomainTexts): ReadingText\[\] = /.exec(source);
  if (!marker) throw new Error("publicDomainTexts.ts: array declaration not found");
  const arrayStart = marker.index + marker[0].length;
  const arrayEnd = source.indexOf("\n];", arrayStart) + 2;
  const texts = JSON.parse(source.slice(arrayStart, arrayEnd));
  const shipped = texts.filter((text) => text.difficulty !== "A1" && text.difficulty !== "A2");

  const bySource = new Map();
  for (const text of shipped) {
    const id = Number(text.sourceUrl.split("/").pop());
    if (!bySource.has(id)) bySource.set(id, []);
    bySource.get(id).push(text);
  }

  const provenance = {};
  const droppedIds = [];
  const changed = new Set();
  const usedRanges = new Map();
  let kept = 0;
  let rebuilt = 0;
  const out = [];
  for (const [gid, items] of [...bySource.entries()].sort((a, b) => a[0] - b[0])) {
    const paragraphs = sourceParagraphs(await fetchGutenberg(gid, cacheDir));
    const keys = paragraphs.map(matchKey);
    const ranges = usedRanges.get(gid) ?? [];
    usedRanges.set(gid, ranges);
    const overlaps = (s, e) => ranges.some((r) => s <= r.end && e >= r.start);
    const meta = SOURCE_META[gid];
    if (!meta) throw new Error(`No metadata for Gutenberg ${gid}`);

    for (const text of items) {
      if (CONTENT_EXCLUSIONS[text.id]) {
        droppedIds.push(text.id);
        changed.add(text.id);
        continue;
      }
      const where = locate(paragraphs, keys, text.body);
      if (!where) throw new Error(`${text.id}: could not find its first paragraph in Gutenberg ${gid}`);
      let start = where.start;
      let end = where.end;
      let body = text.body;
      let words = countWords(body);
      const range = WORD_TARGETS[text.difficulty];
      const intact = where.contiguous && words >= range.min && words <= range.max && !paragraphs.slice(where.start, where.end + 1).some(isBarrier) && !overlaps(where.start, where.end);
      if (!intact) {
        let run = null;
        for (let offset = 0; offset < paragraphs.length && !run; offset += 1) {
          for (const candidateStart of [where.start + offset, where.start - offset]) {
            if (candidateStart < 0 || candidateStart >= paragraphs.length) continue;
            const candidate = contiguousRun(paragraphs, candidateStart, text.difficulty);
            if (candidate && !overlaps(candidate.start, candidate.end)) {
              run = candidate;
              break;
            }
          }
        }
        if (!run) {
          // This source has no unused contiguous passage of the right length
          // left. Better one fewer extract than a spliced one.
          droppedIds.push(text.id);
          continue;
        }
        start = run.start;
        end = run.end;
        words = run.words;
        body = paragraphs.slice(start, end + 1).join("\n\n");
        changed.add(text.id);
        rebuilt += 1;
      } else {
        // Same words, but restore the source's paragraph breaks (earlier
        // generators merged dialogue turns into one run-on paragraph).
        const restored = paragraphs.slice(start, end + 1).join("\n\n");
        if (matchKey(restored) !== matchKey(body)) throw new Error(`${text.id}: kept extract is not exactly paragraphs ${start}-${end}`);
        if (restored !== body) {
          body = restored;
          changed.add(text.id);
        }
        kept += 1;
      }
      ranges.push({ start, end });
      const excerptNumber = text.title.match(/extrait (\d+)/)?.[1];
      out.push({
        ...text,
        title: excerptNumber ? `${meta.title}: extrait ${excerptNumber}` : meta.title,
        minutes: minutesFor(words),
        preview: previewFor(body),
        blurbEn: blurbFor(meta, words),
        body,
        sourceName: `Public domain: ${meta.title} (${meta.author})`,
        sourceUrl: gutenbergUrl(gid),
      });
      provenance[text.id] = { gutenbergId: gid, firstParagraph: start, lastParagraph: end, words, bodySha256: sha256(matchKey(body)) };
    }
  }

  out.sort((a, b) => a.id.localeCompare(b.id));
  const header = `import type { ReadingText } from "@/types";

/**
 * Public-domain reading bank: contiguous, unabridged extracts from French
 * Project Gutenberg texts (B1–C2).
 *
 * Every body is one uninterrupted run of paragraphs from the source edition,
 * with whitespace normalised and nothing else changed. The paragraph range
 * of each extract is recorded in publicDomainProvenance.json and verified by
 * scripts/test-public-domain-provenance.mjs.
 *
 * Generated/repaired by scripts/repair-public-domain-contiguity.mjs.
 */
export const publicDomainTexts: ReadingText[] = `;
  writeFileSync(dataPath, `${header}${JSON.stringify(out, null, 2)};\n`);
  writeFileSync(provenancePath, `${JSON.stringify(provenance, null, 1)}\n`);

  // Drop precomputed translations of excerpts whose text changed.
  let dropped = 0;
  for (const file of readdirSync(precomputedDir)) {
    if (!file.endsWith(".json")) continue;
    const path = new URL(file, precomputedDir);
    const shard = JSON.parse(readFileSync(path, "utf8"));
    let touched = false;
    for (const id of Object.keys(shard)) {
      const isRetiredLevel = /^pd-a[12]-/.test(id);
      if (changed.has(id) || isRetiredLevel || droppedIds.includes(id)) {
        delete shard[id];
        touched = true;
        dropped += 1;
      }
    }
    if (touched) writeFileSync(path, JSON.stringify(shard));
  }
  console.log(JSON.stringify({ shipped: shipped.length, kept, rebuilt, dropped: droppedIds, droppedPrecomputed: dropped }));
}

if (process.argv[1]?.endsWith("repair-public-domain-contiguity.mjs")) await main();
