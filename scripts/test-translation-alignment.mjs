import {
  buildInterlinearTranslationChunks,
  findNaturalTranslationForToken,
  resolveTranslationAlignments,
} from "../src/lib/translationAlignment.ts";
import { tokenize } from "../src/lib/words.ts";

let passed = 0;
let failed = 0;

function check(label, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`OK ${label}`);
  } else {
    failed++;
    console.log(`FAIL ${label}${detail ? ` - ${detail}` : ""}`);
  }
}

function wordIndex(tokens, word) {
  const index = tokens.findIndex((token) => token.isWord && token.clean === word);
  if (index === -1) throw new Error(`Could not find ${word} in ${JSON.stringify(tokens)}`);
  return index;
}

console.log("--- Translation alignment helpers ---");

{
  const tokens = tokenize("Il met en place une nouvelle règle.");
  const alignments = [
    { french: "met en place", english: "sets up" },
    { french: "une nouvelle règle", english: "a new rule" },
  ];
  const resolved = resolveTranslationAlignments(tokens, alignments);
  const place = findNaturalTranslationForToken(tokens, wordIndex(tokens, "place"), alignments);
  check("multi-word French phrase aligns as one natural English phrase", place?.english === "sets up", JSON.stringify({ resolved, place }));
  check("resolved phrase preserves the source French surface text", place?.french === "met en place", JSON.stringify(place));
}

{
  const tokens = tokenize("Elle passe à travers la ville.");
  const alignments = [{ french: "a travers", english: "through" }];
  const through = findNaturalTranslationForToken(tokens, wordIndex(tokens, "travers"), alignments);
  check("alignment matching tolerates missing accents from model output", through?.english === "through", JSON.stringify(through));
}

{
  const tokens = tokenize("Le projet avance vite.");
  const chunks = buildInterlinearTranslationChunks(tokens, [], "The project is moving quickly.");
  check(
    "sentence fallback remains available when no word-level alignment exists",
    chunks.length === 1 && chunks[0].source === "sentence" && chunks[0].english === "The project is moving quickly.",
    JSON.stringify(chunks)
  );
}

{
  const tokens = tokenize("Le projet avance vite.");
  const chunks = buildInterlinearTranslationChunks(tokens, [{ french: "avance", english: "is moving forward" }], "The project is moving quickly.");
  check(
    "word-level alignment does not duplicate the full sentence fallback",
    chunks.some((chunk) => chunk.source === "natural" && chunk.english === "is moving forward") &&
      chunks.every((chunk) => chunk.source !== "sentence"),
    JSON.stringify(chunks)
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
