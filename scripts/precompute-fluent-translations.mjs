// Precomputes fluent AI article translations for every static (build-time)
// reading text — the starter curriculum, core fallback texts, and the
// public-domain bank — so a reader never pays a live OpenAI round trip for
// content that never changes. RSS/imported articles are the only content
// this deliberately skips: they're genuinely dynamic and can't be baked in
// ahead of time.
//
// Resumable: writes the output JSON after every successful article, and
// skips any id already present on a re-run, so an interrupted run (Ctrl-C,
// rate limit, network blip) just picks back up where it left off.
//
// Usage:
//   node --import ./scripts/register-alias-loader.mjs scripts/precompute-fluent-translations.mjs [--limit N] [--concurrency N]

import { readFileSync, writeFileSync, existsSync } from "fs";

// Plain node doesn't auto-load .env.local the way `next dev`/`next build` do.
function loadDotEnvLocal() {
  const path = new URL("../.env.local", import.meta.url);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}
loadDotEnvLocal();

const { texts } = await import("../src/data/texts.ts");
const { tokenizeParagraphsToSentences } = await import("../src/lib/words.ts");
const { translateArticleSentences } = await import("../src/lib/ai/openai.ts");

const OUTPUT_PATH = new URL("../src/data/precomputedTranslations.json", import.meta.url);

function parseArg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  const value = Number(process.argv[idx + 1]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const LIMIT = parseArg("limit", Infinity);
const CONCURRENCY = parseArg("concurrency", 4);
const MAX_SENTENCES = 200; // matches the API route's own cap
// A single request covering a long, dense article (25+ sentences, common at
// C1/C2 level) reliably took over a minute end to end — the live reader UI
// never hits this because it already sends its own translation requests in
// small 2-paragraph chunks (see PARAGRAPHS_PER_TRANSLATION_CHUNK in
// Reader.tsx); this script was sending a whole article in one request for
// fewer total calls, which is fine for short/medium articles but not safe
// for the longest ones. Chunking by paragraph past this size fixes it the
// same way the live path already avoids the problem.
const MAX_SENTENCES_PER_REQUEST = 12;

function loadExisting() {
  if (!existsSync(OUTPUT_PATH)) return {};
  try {
    return JSON.parse(readFileSync(OUTPUT_PATH, "utf8"));
  } catch {
    return {};
  }
}

function save(store) {
  writeFileSync(OUTPUT_PATH, JSON.stringify(store));
}

/** Paragraph-sentence groups plus the flat sentence array, so both a single whole-article
 * request and a paragraph-chunked fallback can be built from the same tokenisation. */
function buildParagraphGroups(text) {
  const paragraphs = tokenizeParagraphsToSentences(text.body);
  return paragraphs.map((group) => group.map((sentence) => sentence.text));
}

function flattenGroups(groups) {
  const sentences = [];
  const paragraphBreakBeforeIndex = [];
  let running = 0;
  for (const group of groups) {
    paragraphBreakBeforeIndex.push(running);
    for (const sentence of group) sentences.push(sentence);
    running += group.length;
  }
  return { sentences, paragraphBreakBeforeIndex };
}

/** Groups consecutive paragraphs into chunks, each up to ~MAX_SENTENCES_PER_REQUEST sentences (a paragraph longer than that on its own still becomes its own single-paragraph chunk — never split mid-paragraph). */
function chunkParagraphGroups(groups) {
  const chunks = [];
  let current = [];
  let currentCount = 0;
  for (const group of groups) {
    if (current.length > 0 && currentCount + group.length > MAX_SENTENCES_PER_REQUEST) {
      chunks.push(current);
      current = [];
      currentCount = 0;
    }
    current.push(group);
    currentCount += group.length;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

// The model occasionally returns a different sentence count than requested
// despite the prompt asking for a 1:1 array (assertArticleTranslation in
// openai.ts strictly rejects any mismatch) — non-deterministic, so a couple
// of retries clears the large majority of these without weakening that
// validation for the live product.
const MAX_ATTEMPTS = 4;

async function translateWithRetries(sentences, paragraphBreakBeforeIndex, text) {
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const result = await translateArticleSentences({
        sentences,
        paragraphBreakBeforeIndex,
        articleTitle: text.title,
        level: `${text.difficulty} French learner`,
      });
      if (result.sentences.length !== sentences.length) {
        lastError = `expected ${sentences.length} sentences, got ${result.sentences.length}`;
        continue;
      }
      return { ok: true, result };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  return { ok: false, error: lastError };
}

async function processOne(text, store) {
  if (store[text.id]) return "skipped";
  if ((text.language ?? "fr") !== "fr") return "skipped-lang";

  const groups = buildParagraphGroups(text);
  const { sentences, paragraphBreakBeforeIndex } = flattenGroups(groups);
  if (sentences.length === 0 || sentences.length > MAX_SENTENCES) return "skipped-size";

  if (sentences.length <= MAX_SENTENCES_PER_REQUEST) {
    const outcome = await translateWithRetries(sentences, paragraphBreakBeforeIndex, text);
    if (outcome.ok) {
      store[text.id] = outcome.result;
      return "done";
    }
    console.log(`FAILED ${text.id} after ${MAX_ATTEMPTS} attempts: ${outcome.error}`);
    return "error";
  }

  // Long article: translate paragraph-chunks sequentially and merge. Each
  // chunk only sees its own sentences as context (same limitation the live
  // per-chunk path already has), which is an acceptable trade for reliably
  // finishing at all.
  const chunks = chunkParagraphGroups(groups);
  const mergedSentences = [];
  const mergedAlignments = [];
  for (const chunkGroups of chunks) {
    const chunkFlat = flattenGroups(chunkGroups);
    const outcome = await translateWithRetries(chunkFlat.sentences, chunkFlat.paragraphBreakBeforeIndex, text);
    if (!outcome.ok) {
      console.log(`FAILED ${text.id} (chunk) after ${MAX_ATTEMPTS} attempts: ${outcome.error}`);
      return "error";
    }
    mergedSentences.push(...outcome.result.sentences);
    mergedAlignments.push(...(outcome.result.alignments ?? chunkFlat.sentences.map(() => [])));
  }
  if (mergedSentences.length !== sentences.length) {
    console.log(`FAILED ${text.id}: merged chunk count ${mergedSentences.length} != expected ${sentences.length}`);
    return "error";
  }
  store[text.id] = { sentences: mergedSentences, alignments: mergedAlignments };
  return "done";
}

async function runPool(items, worker, concurrency) {
  let index = 0;
  let doneCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  async function next() {
    while (index < items.length) {
      const i = index++;
      const outcome = await worker(items[i]);
      if (outcome === "done") doneCount++;
      else if (outcome === "error") errorCount++;
      else skipCount++;
      if (doneCount > 0 && doneCount % 20 === 0) console.log(`... ${doneCount} done, ${skipCount} skipped, ${errorCount} errors (${index}/${items.length} processed)`);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, next));
  return { doneCount, skipCount, errorCount };
}

async function main() {
  const store = loadExisting();
  const candidates = texts.slice(0, LIMIT);
  console.log(`Precomputing fluent translations for up to ${candidates.length} texts (concurrency ${CONCURRENCY})...`);
  console.log(`Already cached: ${Object.keys(store).length}`);

  let sinceLastSave = 0;
  const result = await runPool(
    candidates,
    async (text) => {
      const outcome = await processOne(text, store);
      if (outcome === "done") {
        sinceLastSave++;
        if (sinceLastSave >= 10) {
          save(store);
          sinceLastSave = 0;
        }
      }
      return outcome;
    },
    CONCURRENCY
  );
  save(store);

  console.log(`\nDone. ${result.doneCount} translated, ${result.skipCount} skipped, ${result.errorCount} errors.`);
  console.log(`Total cached now: ${Object.keys(store).length} / ${texts.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
