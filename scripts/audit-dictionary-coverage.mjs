import { texts } from "../src/data/texts.ts";
import { lookupWord } from "../src/lib/dictionary/lookup.ts";
import { tokenize } from "../src/lib/words.ts";

const DEFAULT_LIMIT = 80;
const MIN_WORD_LENGTH = 3;
const COMMON_FALSE_POSITIVES = new Set([
  "http",
  "https",
  "www",
]);

function parseLimit(argv) {
  const index = argv.indexOf("--limit");
  if (index === -1) return DEFAULT_LIMIT;
  const parsed = Number(argv[index + 1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_LIMIT;
}

function isLikelyContentWord(token) {
  const raw = token.text.trim();
  const clean = token.clean;
  if (!clean || clean.length < MIN_WORD_LENGTH) return false;
  if (COMMON_FALSE_POSITIVES.has(clean)) return false;
  if (/^\d+$/.test(clean)) return false;
  if (!/[a-zàâäéèêëïîôöùûüçœæ]/i.test(clean)) return false;
  // Uppercase acronyms and proper-name-like tokens are protected elsewhere.
  if (/^[A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜÇŒÆ]{2,}$/.test(raw)) return false;
  return true;
}

function main() {
  const limit = parseLimit(process.argv.slice(2));
  const missing = new Map();
  let totalTokens = 0;
  let checkedTokens = 0;
  let missingTokens = 0;

  for (const text of texts) {
    for (const token of tokenize(`${text.title}\n${text.body}`)) {
      if (!token.isWord) continue;
      totalTokens++;
      if (!isLikelyContentWord(token)) continue;
      checkedTokens++;

      const result = lookupWord(token.text);
      if (result.source !== "missing") continue;

      missingTokens++;
      const key = token.clean;
      const current = missing.get(key) ?? {
        word: key,
        count: 0,
        examples: [],
      };
      current.count++;
      if (current.examples.length < 3 && !current.examples.includes(text.title)) {
        current.examples.push(text.title);
      }
      missing.set(key, current);
    }
  }

  const rows = [...missing.values()].sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
  const coverage = checkedTokens === 0 ? 1 : 1 - missingTokens / checkedTokens;

  console.log(`Dictionary coverage audit`);
  console.log(`Articles scanned: ${texts.length}`);
  console.log(`Word tokens seen: ${totalTokens}`);
  console.log(`Content tokens checked: ${checkedTokens}`);
  console.log(`Missing content-token rate: ${(100 - coverage * 100).toFixed(2)}%`);
  console.log(`Unique missing words: ${rows.length}`);

  if (rows.length > 0) {
    console.log(`\nTop ${Math.min(limit, rows.length)} missing words:`);
    for (const row of rows.slice(0, limit)) {
      console.log(`  ${row.word} (${row.count}) — ${row.examples.join(" | ")}`);
    }
  }

  if (coverage < 0.985) {
    console.log("\nCoverage is below 98.5%; add high-value ordinary words to news-senses.ts or fr-en.ts.");
    process.exitCode = 1;
  }
}

main();
