/**
 * Suggests generated-dictionary entries whose later sense has stronger support
 * in the articles' precomputed English alignments than the first sense.
 * Suggestions are for editorial review; phrase alignments are not gold labels.
 */
import { createReadStream, writeFileSync } from "node:fs";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { join } from "node:path";

const dir = join(process.cwd(), ".cache", "dictionary-audit-2026-11-17");
const stop = new Set(["the", "this", "that", "with", "from", "into", "about", "some", "have", "does", "being", "there", "their", "which", "your", "were"]);
const words = (value) => String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().match(/[a-z]+/g) ?? [];
const stem = (value) => value.replace(/(?:ingly|edly|ing|ies|ied|es|ed|s)$/u, "");
function supported(gloss, aligned) {
  const terms = words(gloss).filter((word) => word.length >= 4 && !stop.has(word));
  if (!terms.length) return false;
  const reference = new Set(words(aligned).map(stem));
  return terms.some((term) => reference.has(stem(term)));
}

const grouped = new Map();
const input = createReadStream(join(dir, "occurrences.ndjson.gz")).pipe(createGunzip());
for await (const line of createInterface({ input, crlfDelay: Infinity })) {
  if (!line) continue;
  const row = JSON.parse(line);
  if (row.layer !== "generated" || row.displayedSource !== "generated-dictionary" || !row.alignment?.english) continue;
  const senses = [row.gloss, ...row.alternatives].filter(Boolean);
  if (senses.length < 2) continue;
  const key = [row.word.toLowerCase(), row.lemma, ...senses].join("\t");
  const entry = grouped.get(key) ?? { word: row.word.toLowerCase(), lemma: row.lemma, senses, count: 0, support: senses.map(() => 0), examples: [] };
  entry.count++;
  senses.forEach((sense, index) => { entry.support[index] += Number(supported(sense, row.alignment.english)); });
  if (entry.examples.length < 2) entry.examples.push({ sentence: row.sentence, aligned: row.alignment.english });
  grouped.set(key, entry);
}
const suggestions = [...grouped.values()]
  .filter((entry) => entry.count >= 3 && entry.support.slice(1).some((score) => score >= 3 && score >= entry.support[0] + 3))
  .sort((a, b) => Math.max(...b.support.slice(1)) - b.support[0] - (Math.max(...a.support.slice(1)) - a.support[0]) || b.count - a.count);
writeFileSync(join(dir, "sense-suggestions.json"), `${JSON.stringify(suggestions, null, 2)}\n`);
console.log(`Generated sense-order suggestions: ${suggestions.length}`);
for (const entry of suggestions.slice(0, 60)) {
  const best = entry.support.indexOf(Math.max(...entry.support));
  console.log(`${entry.word} (${entry.count}): ${JSON.stringify(entry.senses[0])} ${entry.support[0]} → ${JSON.stringify(entry.senses[best])} ${entry.support[best]}`);
}
