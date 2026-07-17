import type { ArticleTranslationAlignmentSegment } from "@/lib/ai/types";
import { cleanWord, tokenize, type Token } from "@/lib/words";

export interface ResolvedTranslationAlignment {
  startIndex: number;
  endIndex: number;
  french: string;
  english: string;
}

export interface InterlinearTranslationChunk {
  startIndex: number;
  endIndex: number;
  french: string;
  english: string | null;
  source: "natural" | "sentence" | "none";
}

interface WordPosition {
  tokenIndex: number;
  key: string;
}

function stripDiacritics(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/Æ/g, "ae");
}

function normaliseAlignmentWord(text: string): string {
  return stripDiacritics(cleanWord(text).replace(/[’‘]/g, "'"));
}

function wordsFromText(text: string): string[] {
  return tokenize(text)
    .filter((token) => token.isWord)
    .map((token) => normaliseAlignmentWord(token.text))
    .filter(Boolean);
}

function wordPositions(tokens: Token[]): WordPosition[] {
  return tokens
    .map((token, tokenIndex) => ({ token, tokenIndex }))
    .filter((item) => item.token.isWord)
    .map((item) => ({
      tokenIndex: item.tokenIndex,
      key: normaliseAlignmentWord(item.token.text),
    }))
    .filter((item) => item.key);
}

function findWindow(positions: WordPosition[], words: string[], startOrdinal: number): number {
  for (let ordinal = startOrdinal; ordinal <= positions.length - words.length; ordinal++) {
    let matches = true;
    for (let offset = 0; offset < words.length; offset++) {
      if (positions[ordinal + offset]?.key !== words[offset]) {
        matches = false;
        break;
      }
    }
    if (matches) return ordinal;
  }
  return -1;
}

function tokenText(tokens: Token[], startIndex: number, endIndex: number): string {
  return tokens.slice(startIndex, endIndex + 1).map((token) => token.text).join("");
}

export function resolveTranslationAlignments(
  tokens: Token[],
  alignments: ArticleTranslationAlignmentSegment[] | null | undefined
): ResolvedTranslationAlignment[] {
  if (!alignments?.length) return [];

  const positions = wordPositions(tokens);
  if (positions.length === 0) return [];

  const resolved: ResolvedTranslationAlignment[] = [];
  let searchOrdinal = 0;

  for (const alignment of alignments) {
    const french = alignment.french.trim();
    const english = alignment.english.trim();
    if (!french || !english) continue;

    const words = wordsFromText(french);
    if (words.length === 0) continue;

    const matchOrdinal = findWindow(positions, words, searchOrdinal);
    if (matchOrdinal === -1) continue;

    const startIndex = positions[matchOrdinal].tokenIndex;
    const endIndex = positions[matchOrdinal + words.length - 1].tokenIndex;
    resolved.push({
      startIndex,
      endIndex,
      french: tokenText(tokens, startIndex, endIndex).trim() || french,
      english,
    });
    searchOrdinal = matchOrdinal + words.length;
  }

  return resolved;
}

export function findNaturalTranslationForToken(
  tokens: Token[],
  tokenIndex: number,
  alignments: ArticleTranslationAlignmentSegment[] | null | undefined
): ResolvedTranslationAlignment | null {
  if (!tokens[tokenIndex]?.isWord) return null;
  return resolveTranslationAlignments(tokens, alignments).find((alignment) => tokenIndex >= alignment.startIndex && tokenIndex <= alignment.endIndex) ?? null;
}

export function buildInterlinearTranslationChunks(
  tokens: Token[],
  alignments: ArticleTranslationAlignmentSegment[] | null | undefined,
  fallbackSentenceTranslation?: string | null
): InterlinearTranslationChunk[] {
  if (tokens.length === 0) return [];

  const resolved = resolveTranslationAlignments(tokens, alignments);
  const fallback = fallbackSentenceTranslation?.trim();
  if (resolved.length === 0 && fallback) {
    return [
      {
        startIndex: 0,
        endIndex: tokens.length - 1,
        french: tokenText(tokens, 0, tokens.length - 1).trim(),
        english: fallback,
        source: "sentence",
      },
    ];
  }

  const chunks: InterlinearTranslationChunk[] = [];
  let cursor = 0;
  for (const alignment of resolved) {
    if (cursor < alignment.startIndex) {
      chunks.push({
        startIndex: cursor,
        endIndex: alignment.startIndex - 1,
        french: tokenText(tokens, cursor, alignment.startIndex - 1).trim(),
        english: null,
        source: "none",
      });
    }
    chunks.push({ ...alignment, source: "natural" });
    cursor = alignment.endIndex + 1;
  }

  if (cursor < tokens.length) {
    chunks.push({
      startIndex: cursor,
      endIndex: tokens.length - 1,
      french: tokenText(tokens, cursor, tokens.length - 1).trim(),
      english: null,
      source: "none",
    });
  }

  return chunks.filter((chunk) => chunk.startIndex <= chunk.endIndex);
}
