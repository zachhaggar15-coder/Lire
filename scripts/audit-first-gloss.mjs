// Ranks every word in the app's static reading corpus by how often a
// reader actually meets it, then reports the *first* dictionary gloss
// (translations[0] — the only one the reader ever sees) for each, so a
// human/agent reviewer can scan for wrong-first-gloss cases like the
// démarche -> "gait" bug, without having to guess which of ~90k dictionary
// entries are worth checking.
//
// Usage: node --import ./scripts/register-alias-loader.mjs scripts/audit-first-gloss.mjs [--top N]

import { texts } from "../src/data/texts.ts";
import { tokenize } from "../src/lib/words.ts";
import { lookupWord } from "../src/lib/dictionary/lookup.ts";

function parseArg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  const value = Number(process.argv[idx + 1]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const TOP = parseArg("top", 300);
const MIN_LENGTH = 2;

function isContentCandidate(token) {
  const clean = token.clean;
  if (!clean || clean.length < MIN_LENGTH) return false;
  if (/^\d+$/.test(clean)) return false;
  if (!/[a-zàâäéèêëïîôöùûüçœæ]/i.test(clean)) return false;
  return true;
}

const counts = new Map();
const examples = new Map();

for (const text of texts) {
  if ((text.language ?? "fr") !== "fr") continue;
  for (const token of tokenize(`${text.title}\n${text.body}`)) {
    if (!token.isWord || !isContentCandidate(token)) continue;
    const key = token.clean;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (!examples.has(key)) examples.set(key, text.title);
  }
}

const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP);

const rows = ranked.map(([word, count]) => {
  const lookup = lookupWord(word);
  return {
    word,
    count,
    firstGloss: lookup.translations[0] ?? "(missing)",
    allGlosses: lookup.translations,
    partOfSpeech: lookup.partOfSpeech,
    source: lookup.source,
    example: examples.get(word),
  };
});

console.log(JSON.stringify(rows, null, 2));
