/**
 * Shared Project Gutenberg helpers for the public-domain reading bank:
 * fetching (with a local cache), stripping the licence header/footer, and
 * splitting into the ORIGINAL ordered paragraph list. Nothing here filters
 * paragraphs out — callers that need contiguous excerpts work on this list.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function gutenbergUrl(id) {
  return `https://www.gutenberg.org/ebooks/${id}`;
}

export function textUrl(id) {
  return `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`;
}

export function stripLicence(raw) {
  let text = raw.replace(/\r\n/g, "\n");
  const startMatch =
    text.match(/\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[\s\S]*?\*\*\*/i) ??
    text.match(/\*\*\*\s*START OF (?:THE|THIS) EBOOK[\s\S]*?\*\*\*/i);
  if (startMatch?.index !== undefined) text = text.slice(startMatch.index + startMatch[0].length);
  const endMatch =
    text.match(/\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[\s\S]*/i) ??
    text.match(/\*\*\*\s*END OF (?:THE|THIS) EBOOK[\s\S]*/i);
  if (endMatch?.index !== undefined) text = text.slice(0, endMatch.index);
  return text.replace(/﻿/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/** Every paragraph of the source, in order, with whitespace collapsed. */
export function sourceParagraphs(raw) {
  return stripLicence(raw)
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** Comparison key that ignores whitespace and spacing around punctuation. */
export function matchKey(text) {
  return text
    .normalize("NFC")
    .replace(/[\s  ]+/g, "")
    .toLowerCase();
}

export async function fetchGutenberg(id, cacheDir) {
  if (cacheDir) {
    mkdirSync(cacheDir, { recursive: true });
    const cached = join(cacheDir, `pg${id}.txt`);
    if (existsSync(cached)) return readFileSync(cached, "utf8");
    const raw = await download(id);
    writeFileSync(cached, raw);
    return raw;
  }
  return download(id);
}

async function download(id) {
  const response = await fetch(textUrl(id), { headers: { "User-Agent": "Sorlio public domain reading bank (provenance check)" } });
  if (!response.ok) throw new Error(`Gutenberg ${id}: HTTP ${response.status}`);
  return response.text();
}
