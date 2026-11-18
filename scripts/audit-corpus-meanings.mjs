/**
 * Exhaustively records the dictionary answer for each word occurrence in the
 * bundled articles, alongside any precomputed English phrase alignment.
 *
 * An alignment is an independent review clue, not proof that a dictionary
 * gloss is correct: natural translations change word order and combine words.
 * The output deliberately distinguishes checked coverage from semantic review.
 *
 * Run: node --import ./scripts/register-alias-loader.mjs scripts/audit-corpus-meanings.mjs
 */
import { createWriteStream, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createGzip } from "node:zlib";
import { once } from "node:events";
import { join } from "node:path";
import { texts } from "../src/data/texts.ts";
import { ensureGeneratedDictionary, lookupWord } from "../src/lib/dictionary/lookup.ts";
import { resolveWithCandidates } from "../src/lib/dictionary/resolveMeaning.ts";
import { resolveTranslationAlignments } from "../src/lib/translationAlignment.ts";
import { tokenize, tokenizeParagraphsToSentences } from "../src/lib/words.ts";

const outputDir = join(process.cwd(), ".cache", "dictionary-audit-2026-11-17");
mkdirSync(outputDir, { recursive: true });
const compressed = createGzip({ level: 6 });
compressed.pipe(createWriteStream(join(outputDir, "occurrences.ndjson.gz")));

await ensureGeneratedDictionary();
const translations = Object.assign({}, ...Array.from({ length: 16 }, (_, index) =>
  JSON.parse(readFileSync(new URL(`../src/data/precomputed/shard-${index}.json`, import.meta.url), "utf8"))
));

const summary = {
  articles: texts.length,
  occurrences: 0,
  missing: 0,
  selfGloss: 0,
  alignmentCovered: 0,
  singleWordAlignment: 0,
  displayedUnresolved: 0,
  displayedBySource: {},
  byLayer: {},
  uniqueForms: 0,
  uniqueMeanings: 0,
};
const forms = new Set();
const meanings = new Map();

function normalise(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function lookupFor(tokens, index) {
  const previous = tokens.slice(0, index).reverse().find((token) => token.isWord)?.text;
  const next = tokens.slice(index + 1).find((token) => token.isWord)?.text;
  return lookupWord(tokens[index].text, { previousWord: previous, nextWord: next });
}

async function record(text, sentence, sentenceIndex, tokens, alignments) {
  const located = resolveTranslationAlignments(tokens, alignments);
  const byToken = new Map();
  for (const alignment of located) {
    for (let index = alignment.startIndex; index <= alignment.endIndex; index++) {
      if (tokens[index]?.isWord && !byToken.has(index)) byToken.set(index, alignment);
    }
  }
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (!token.isWord) continue;
    const lookup = lookupFor(tokens, index);
    const alignment = byToken.get(index) ?? null;
    const gloss = lookup.translations[0] ?? null;
    const resolved = resolveWithCandidates({
      tokens,
      tokenIndex: index,
      contextSentence: sentence,
      alignments,
      lookup,
    }).meaning;
    const selfGloss = lookup.source !== "missing" && normalise(gloss) === normalise(token.clean) && lookup.layer !== "proper-noun";
    const row = {
      articleId: text.id,
      articleTitle: text.title,
      sentenceIndex,
      tokenIndex: index,
      sentence,
      word: token.text,
      lemma: lookup.lemma,
      gloss,
      alternatives: lookup.translations.slice(1, 5),
      layer: lookup.layer,
      displayedMeaning: resolved.displayEnglish,
      displayedSource: resolved.source,
      displayedConfidence: resolved.confidence,
      alignment: alignment ? { french: alignment.french, english: alignment.english, frenchWordCount: alignment.frenchWordCount } : null,
      flags: [
        ...(lookup.source === "missing" ? ["missing"] : []),
        ...(selfGloss ? ["self-gloss"] : []),
        ...(lookup.partOfSpeechUncertain ? ["guessed-lemma"] : []),
      ],
    };
    if (!compressed.write(`${JSON.stringify(row)}\n`)) await once(compressed, "drain");
    summary.occurrences++;
    summary.missing += Number(lookup.source === "missing");
    summary.selfGloss += Number(selfGloss);
    summary.alignmentCovered += Number(!!alignment);
    summary.singleWordAlignment += Number(alignment?.frenchWordCount === 1);
    summary.displayedUnresolved += Number(resolved.abstained);
    summary.displayedBySource[resolved.source] = (summary.displayedBySource[resolved.source] ?? 0) + 1;
    const layer = lookup.layer ?? "missing";
    summary.byLayer[layer] = (summary.byLayer[layer] ?? 0) + 1;
    forms.add(token.clean);
    const key = [token.clean, lookup.lemma, gloss, layer].join("\t");
    const grouped = meanings.get(key) ?? { form: token.clean, lemma: lookup.lemma, gloss, layer, count: 0, selfGloss, unresolved: 0, examples: [] };
    grouped.count++;
    grouped.unresolved += Number(resolved.abstained);
    if (grouped.examples.length < 3 && !grouped.examples.some((example) => example.articleId === text.id && example.sentence === sentence)) {
      grouped.examples.push({ articleId: text.id, sentence, alignment: alignment?.english ?? null, displayed: resolved.displayEnglish });
    }
    meanings.set(key, grouped);
  }
}

for (const [articleIndex, text] of texts.entries()) {
  const translation = translations[text.id] ?? null;
  await record(text, text.title, -1, tokenize(text.title), null);
  const sentences = tokenizeParagraphsToSentences(text.body).flat();
  for (let index = 0; index < sentences.length; index++) {
    const sentence = sentences[index];
    await record(text, sentence.text, index, sentence.tokens, translation?.alignments?.[index] ?? null);
  }
  if ((articleIndex + 1) % 100 === 0) console.log(`Checked ${articleIndex + 1}/${texts.length} articles; ${summary.occurrences} word occurrences`);
}
compressed.end();
await once(compressed, "end");
summary.uniqueForms = forms.size;
summary.uniqueMeanings = meanings.size;
const grouped = [...meanings.values()].sort((a, b) => b.count - a.count || a.form.localeCompare(b.form));
writeFileSync(join(outputDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
writeFileSync(join(outputDir, "meanings.json"), `${JSON.stringify(grouped)}\n`);
writeFileSync(join(outputDir, "review-queue.json"), `${JSON.stringify(grouped.filter((row) => row.layer === "missing" || row.selfGloss), null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
console.log(`Report: ${outputDir}`);
