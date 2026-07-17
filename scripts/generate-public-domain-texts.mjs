import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "../src/data/publicDomainTexts.ts");

const TARGET_TOTAL = 720;
const LEVEL_TARGETS = {
  A1: 100,
  A2: 120,
  B1: 130,
  B2: 130,
  C1: 120,
  C2: 120,
};

const SOURCES = [
  { id: 800, title: "Le tour du monde en quatre-vingts jours", author: "Jules Verne", category: "everyday life" },
  { id: 5097, title: "Vingt mille lieues sous les mers", author: "Jules Verne", category: "science" },
  { id: 799, title: "De la terre a la lune", author: "Jules Verne", category: "science" },
  { id: 17796, title: "Le pays des fourrures", author: "Jules Verne", category: "science" },
  { id: 16826, title: "Face au drapeau", author: "Jules Verne", category: "news-style" },
  { id: 4791, title: "Voyage au centre de la terre", author: "Jules Verne", category: "science" },
  { id: 4548, title: "Cinq semaines en ballon", author: "Jules Verne", category: "sport" },
  { id: 30779, title: "Les aventures de Telemaque", author: "Fenelon", category: "culture" },
  { id: 55456, title: "Aventures d'Alice au pays des merveilles", author: "Lewis Carroll", category: "culture" },
  { id: 14155, title: "Madame Bovary", author: "Gustave Flaubert", category: "everyday life" },
  { id: 48359, title: "Madame Bovary (oeuvres completes)", author: "Gustave Flaubert", category: "culture" },
  { id: 17989, title: "Le comte de Monte-Cristo, Tome I", author: "Alexandre Dumas", category: "news-style" },
  { id: 17990, title: "Le comte de Monte-Cristo, Tome II", author: "Alexandre Dumas", category: "culture" },
  { id: 17991, title: "Le comte de Monte-Cristo, Tome III", author: "Alexandre Dumas", category: "culture" },
  { id: 17992, title: "Le comte de Monte-Cristo, Tome IV", author: "Alexandre Dumas", category: "news-style" },
  { id: 14790, title: "Contes du jour et de la nuit", author: "Guy de Maupassant", category: "culture" },
  { id: 11714, title: "Contes de la Becasse", author: "Guy de Maupassant", category: "culture" },
  { id: 51266, title: "Oeuvres completes de Guy de Maupassant, volume 06", author: "Guy de Maupassant", category: "everyday life" },
  { id: 12949, title: "Contes Francais", author: "Douglas Labaree Buffum et al.", category: "culture" },
];

const CATEGORY_ROTATION = ["news-style", "sport", "culture", "science", "everyday life"];
const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];
const WORD_TARGETS = {
  A1: { min: 45, max: 90 },
  A2: { min: 80, max: 140 },
  B1: { min: 130, max: 220 },
  B2: { min: 190, max: 310 },
  C1: { min: 260, max: 430 },
  C2: { min: 360, max: 560 },
};

function gutenbergUrl(id) {
  return `https://www.gutenberg.org/ebooks/${id}`;
}

function textUrl(id) {
  return `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`;
}

function cleanText(raw) {
  let text = raw.replace(/\r\n/g, "\n");
  const startMatch =
    text.match(/\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[\s\S]*?\*\*\*/i) ??
    text.match(/\*\*\*\s*START OF (?:THE|THIS) EBOOK[\s\S]*?\*\*\*/i);
  if (startMatch?.index !== undefined) text = text.slice(startMatch.index + startMatch[0].length);
  const endMatch =
    text.match(/\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[\s\S]*/i) ??
    text.match(/\*\*\*\s*END OF (?:THE|THIS) EBOOK[\s\S]*/i);
  if (endMatch?.index !== undefined) text = text.slice(0, endMatch.index);

  return text
    .replace(/\uFEFF/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function paragraphsFromText(raw) {
  return cleanText(raw)
    .split(/\n\s*\n/g)
    .map((paragraph) =>
      paragraph
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((paragraph) => {
      const words = countWords(paragraph);
      const digits = (paragraph.match(/\d/g) ?? []).length;
      const digitRatio = digits / Math.max(1, paragraph.length);
      if (words < 12 || words > 220) return false;
      if (/project gutenberg|ebook|copyright|license|produced by|table des matieres/i.test(paragraph)) return false;
      if (/^CHAPITRE|^LIVRE|^TOME|^\d+\.?$|^[IVXLCDM]+\.?$/i.test(paragraph)) return false;
      if (digitRatio > 0.04) return false;
      if (/(^|\s)(Paris|Londres|Bruxelles|Leipzig),\s+[A-Z]/.test(paragraph)) return false;
      if (/\b(vol\.|tome|in-8|in-12|pp\.|chez|editions?|librairie|imprimerie|cadot|levy|tresse)\b/i.test(paragraph)) return false;
      if (/\b\d{4}\b/.test(paragraph)) return false;
      if (/\[\d+\]/.test(paragraph)) return false;
      if (/[_~]/.test(paragraph)) return false;
      return /[.!?;:]/.test(paragraph);
    });
}

function countWords(text) {
  return (text.match(/[A-Za-zÀ-ÖØ-öø-ÿ]+(?:['’‑-][A-Za-zÀ-ÖØ-öø-ÿ]+)*/g) ?? []).length;
}

function sentenceCount(text) {
  return Math.max(1, (text.match(/[.!?…]+(?:\s|$)/g) ?? []).length);
}

function difficultyScore(text) {
  const words = countWords(text);
  const avgSentence = words / sentenceCount(text);
  const longWordRatio =
    (text.match(/[A-Za-zÀ-ÖØ-öø-ÿ]{9,}/g) ?? []).length / Math.max(1, words);
  const punctuationComplexity = (text.match(/[;:—()]/g) ?? []).length / Math.max(1, sentenceCount(text));
  const quoteComplexity = (text.match(/[«»"]/g) ?? []).length / 6;
  return avgSentence * 0.72 + longWordRatio * 52 + punctuationComplexity * 2.2 + quoteComplexity;
}

function normalizeExcerpt(excerpt) {
  return excerpt
    .replace(/\s+([,.;:!?»])/g, "$1")
    .replace(/([«])\s+/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function makeCandidate(source, paragraphs, start, level) {
  const target = WORD_TARGETS[level];
  const picked = [];
  let words = 0;
  let end = start;
  for (let index = start; index < paragraphs.length && words < target.min; index++) {
    const paragraph = paragraphs[index];
    const nextWords = countWords(paragraph);
    if (words > 0 && words + nextWords > target.max) break;
    picked.push(paragraph);
    words += nextWords;
    end = index;
  }
  if (words < target.min || words > target.max || picked.length === 0) return null;
  const body = normalizeExcerpt(picked.join("\n\n"));
  if (body.length < 120 || body.length > 4200) return null;
  return {
    source,
    body,
    wordCount: words,
    score: difficultyScore(body),
    paragraphCount: picked.length,
    start,
    end,
  };
}

function rangeKey(candidate) {
  return String(candidate.source.id);
}

function overlapsUsedRange(candidate, usedRangesBySource) {
  const ranges = usedRangesBySource.get(rangeKey(candidate)) ?? [];
  return ranges.some((range) => candidate.start <= range.end + 1 && candidate.end >= range.start - 1);
}

function markUsedRange(candidate, usedRangesBySource) {
  const key = rangeKey(candidate);
  const ranges = usedRangesBySource.get(key) ?? [];
  ranges.push({ start: candidate.start, end: candidate.end });
  usedRangesBySource.set(key, ranges);
}

function chooseByLevel(candidates, level, needed, usedBodies, usedRangesBySource) {
  const sorted = [...candidates]
    .filter((candidate) => !usedBodies.has(candidate.body))
    .sort((a, b) => a.score - b.score);

  let pool;
  if (level === "A1") pool = sorted.slice(0, Math.ceil(sorted.length * 0.24));
  else if (level === "A2") pool = sorted.slice(Math.floor(sorted.length * 0.12), Math.ceil(sorted.length * 0.42));
  else if (level === "B1") pool = sorted.slice(Math.floor(sorted.length * 0.28), Math.ceil(sorted.length * 0.62));
  else if (level === "B2") pool = sorted.slice(Math.floor(sorted.length * 0.45), Math.ceil(sorted.length * 0.78));
  else if (level === "C1") pool = sorted.slice(Math.floor(sorted.length * 0.62), Math.ceil(sorted.length * 0.92));
  else pool = sorted.slice(Math.floor(sorted.length * 0.74));

  if (pool.length < needed) pool = sorted;
  const out = [];
  for (const candidate of pool) {
    if (out.length >= needed) break;
    if (usedBodies.has(candidate.body)) continue;
    if (overlapsUsedRange(candidate, usedRangesBySource)) continue;
    usedBodies.add(candidate.body);
    markUsedRange(candidate, usedRangesBySource);
    out.push(candidate);
  }
  if (out.length < needed) {
    for (const candidate of sorted) {
      if (out.length >= needed) break;
      if (usedBodies.has(candidate.body)) continue;
      usedBodies.add(candidate.body);
      markUsedRange(candidate, usedRangesBySource);
      out.push(candidate);
    }
  }
  return out;
}

function titleFor(candidate) {
  return candidate.source.title
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/, Tome [IVX]+/i, "")
    .trim();
}

function previewFor(body) {
  const firstSentence = body.split(/(?<=[.!?…])\s+/)[0] ?? body;
  return firstSentence.length > 180 ? `${firstSentence.slice(0, 177).trim()}...` : firstSentence;
}

function minutesFor(words) {
  return Math.max(1, Math.min(8, Math.round(words / 130)));
}

function toReadingText(candidate, level, sequence) {
  return {
    id: `pd-${level.toLowerCase()}-${String(sequence).padStart(3, "0")}`,
    title: titleFor(candidate),
    category: candidate.source.category ?? CATEGORY_ROTATION[sequence % CATEGORY_ROTATION.length],
    difficulty: level,
    minutes: minutesFor(candidate.wordCount),
    preview: previewFor(candidate.body),
    blurbEn: null,
    body: candidate.body,
    sourceName: `Public domain source: ${candidate.source.title} (${candidate.source.author})`,
    sourceUrl: gutenbergUrl(candidate.source.id),
    language: "fr",
  };
}

async function fetchSource(source) {
  const response = await fetch(textUrl(source.id), {
    headers: { "User-Agent": "Liree public domain reading bank generator" },
  });
  if (!response.ok) {
    throw new Error(`Failed ${source.id} ${source.title}: HTTP ${response.status}`);
  }
  const raw = await response.text();
  const paragraphs = paragraphsFromText(raw);
  if (paragraphs.length < 20) {
    throw new Error(`Too few usable paragraphs for ${source.id} ${source.title}: ${paragraphs.length}`);
  }
  return { source, paragraphs };
}

function buildCandidates(sourceEntries) {
  const byLevel = Object.fromEntries(CEFR_ORDER.map((level) => [level, []]));
  for (const { source, paragraphs } of sourceEntries) {
    for (const level of CEFR_ORDER) {
      const step = level === "A1" || level === "A2" ? 1 : 2;
      for (let start = 0; start < paragraphs.length; start += step) {
        const candidate = makeCandidate(source, paragraphs, start, level);
        if (candidate) byLevel[level].push(candidate);
      }
    }
  }
  return byLevel;
}

async function main() {
  const sourceEntries = [];
  for (const source of SOURCES) {
    sourceEntries.push(await fetchSource(source));
  }

  const candidatesByLevel = buildCandidates(sourceEntries);
  const usedBodies = new Set();
  const usedRangesBySource = new Map();
  const texts = [];
  let sequence = 1;

  for (const level of CEFR_ORDER) {
    const chosen = chooseByLevel(candidatesByLevel[level], level, LEVEL_TARGETS[level], usedBodies, usedRangesBySource);
    if (chosen.length < LEVEL_TARGETS[level]) {
      throw new Error(`Only found ${chosen.length}/${LEVEL_TARGETS[level]} excerpts for ${level}`);
    }
    for (const candidate of chosen) {
      texts.push(toReadingText(candidate, level, sequence));
      sequence++;
    }
  }

  if (texts.length < TARGET_TOTAL) {
    throw new Error(`Generated ${texts.length}, expected at least ${TARGET_TOTAL}`);
  }

  const counts = CEFR_ORDER.map((level) => `${level}:${texts.filter((text) => text.difficulty === level).length}`).join(", ");
  const output = `import type { ReadingText } from "@/types";

/**
 * Exact public-domain excerpts from French-language Project Gutenberg texts.
 *
 * The generator keeps the excerpt body wording unchanged, then adds Liree
 * metadata (level, category, reading time, preview, and source URL). Regenerate
 * with: node scripts/generate-public-domain-texts.mjs
 */
export const publicDomainTexts: ReadingText[] = ${JSON.stringify(texts, null, 2)};
`;

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, output, "utf8");
  console.log(`Wrote ${texts.length} public-domain excerpts to ${outputPath}`);
  console.log(counts);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
