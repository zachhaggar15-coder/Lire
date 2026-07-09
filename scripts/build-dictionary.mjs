// Regenerates src/data/dictionaries/generated/fr-en-generated.json from the
// WikDict French->English SQLite export. Run with:
//   node scripts/build-dictionary.mjs
//
// Source data: WikDict (https://www.wikdict.com), built from Wiktionary via
// DBnary. Licensed CC BY-SA 4.0 — see
// src/data/dictionaries/generated/NOTICE.md for full attribution/license
// details and why that's safe to redistribute here.
//
// This script downloads the dictionary once (cached in .cache/, gitignored)
// and re-runs the whole filter/merge/rank pipeline from scratch, so it's
// safe to re-run any time coverage needs refreshing. Only the JSON *output*
// is committed to the repo — this script itself is not part of `npm run
// build`, matching the existing scripts/generate-icons.mjs pattern.
import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SOURCE_URL = "https://download.wikdict.com/dictionaries/sqlite/2/fr-en.sqlite3";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = path.join(rootDir, ".cache");
const cachedDbPath = path.join(cacheDir, "wikdict-fr-en.sqlite3");
const curatedPath = path.join(rootDir, "src/data/dictionaries/fr-en.ts");
const outDir = path.join(rootDir, "src/data/dictionaries/generated");
const outPath = path.join(outDir, "fr-en-generated.json");

/**
 * How many highest-importance entries to keep — see NOTICE.md for the
 * reasoning. Set high enough to include essentially every clean entry
 * WikDict has after filtering (~92,500 as of the last regeneration) rather
 * than an arbitrary cap, since dictionary-lookup misses were a recurring
 * real-world complaint. `Infinity` would also work; a large finite number
 * is used so a future WikDict export that's bigger still gets a sane bound.
 */
const TARGET_SIZE = 200_000;
/** Long tails of translation senses get noisy in the UI — keep the first few. */
const MAX_TRANSLATIONS = 6;

/** Part-of-speech tags from WikDict's lexentry ids that aren't useful general vocabulary. */
const EXCLUDED_POS = new Set([
  "nompr", // proper noun
  "nom_de_famille", // surname
  "patronyme",
  "prenom",
  "prénom", // first name
]);

/** WikDict POS tag -> the app's DictionaryEntry.partOfSpeech style. */
const POS_LABELS = {
  nom: "noun",
  adj: "adjective",
  verb: "verb (infinitive)",
  adv: "adverb",
  conjonction: "conjunction",
  conjonction_de_coordination: "conjunction",
  préposition: "preposition",
  preposition: "preposition",
  interjection: "interjection",
  pronom: "pronoun",
  pronom_personnel: "pronoun",
  pronom_relatif: "pronoun",
  pronom_demonstratif: "pronoun",
  pronom_démonstratif: "pronoun",
  pronom_interrogatif: "pronoun",
  pronom_possessif: "pronoun",
  pronom_indefini: "pronoun",
  pronom_indéfini: "pronoun",
  locutionphrase: "phrase",
  locution_phrase: "phrase",
  locution: "phrase",
};

/** A single French word/short phrase — no wiki-markup, no digits-only junk. */
const CLEAN_WORD_RE = /^[a-zàâäéèêëïîôöùûüçœæ]+(?:[-' ][a-zàâäéèêëïîôöùûüçœæ]+){0,2}$/i;

function posOf(lexentry) {
  const m = /^fra\/.+__([^_]+(?:_[^_]+)*)__[0-9]+$/.exec(lexentry ?? "");
  return m ? m[1] : null;
}

async function ensureDownloaded() {
  if (existsSync(cachedDbPath)) {
    console.log(`Using cached ${cachedDbPath}`);
    return;
  }
  mkdirSync(cacheDir, { recursive: true });
  console.log(`Downloading ${SOURCE_URL} ...`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(cachedDbPath, buf);
  console.log(`Saved ${(buf.length / 1e6).toFixed(1)}MB to ${cachedDbPath}`);
}

/** Lemmas already in the hand-curated dictionary don't need a generated entry — it always wins the lookup anyway. */
function loadCuratedLemmas() {
  const src = readFileSync(curatedPath, "utf8");
  const lemmas = new Set();
  for (const m of src.matchAll(/lemma:\s*"((?:[^"\\]|\\.)*)"/g)) {
    lemmas.add(m[1].toLowerCase());
  }
  return lemmas;
}

function extractEntries(db) {
  const rows = db
    .prepare(
      "SELECT lexentry, written_rep, trans_list, importance FROM translation WHERE is_good = 1 AND lexentry IS NOT NULL"
    )
    .all();

  const merged = new Map();
  for (const row of rows) {
    const pos = posOf(row.lexentry);
    if (EXCLUDED_POS.has(pos)) continue;
    if (!CLEAN_WORD_RE.test(row.written_rep)) continue;
    if (/\[\[|\]\]|_/.test(row.trans_list)) continue;

    const key = row.written_rep.toLowerCase();
    const translations = row.trans_list
      .split("|")
      .map((t) => t.trim())
      .filter(Boolean);

    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, {
        lemma: key,
        translations: [...new Set(translations)],
        partOfSpeech: POS_LABELS[pos] ?? null,
        importance: row.importance ?? 0,
      });
    } else {
      for (const t of translations) {
        if (!existing.translations.includes(t)) existing.translations.push(t);
      }
      existing.importance = Math.max(existing.importance, row.importance ?? 0);
    }
  }

  return [...merged.values()];
}

async function main() {
  await ensureDownloaded();

  const db = new DatabaseSync(cachedDbPath, { readOnly: true });
  const entries = extractEntries(db);
  db.close();
  console.log(`Extracted ${entries.length} clean, merged candidate entries.`);

  const curatedLemmas = loadCuratedLemmas();
  const withoutCurated = entries.filter((e) => !curatedLemmas.has(e.lemma));
  console.log(`${entries.length - withoutCurated.length} already covered by the curated dictionary — skipped.`);

  withoutCurated.sort((a, b) => b.importance - a.importance);
  const top = withoutCurated.slice(0, TARGET_SIZE);

  // Drop the internal `importance` field from the shipped output — it was
  // only needed for ranking, not for lookup, and frequencyRank (the rank
  // position itself) is the field the app's DictionaryEntry type expects.
  const output = top.map(({ lemma, translations, partOfSpeech }, i) => ({
    lemma,
    translations: translations.slice(0, MAX_TRANSLATIONS),
    ...(partOfSpeech ? { partOfSpeech } : {}),
    frequencyRank: 1000 + i, // curated entries occupy the low ranks (1-~60); this keeps generated entries clearly "less common" by comparison
  }));

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, JSON.stringify(output));
  console.log(`Wrote ${output.length} entries to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
