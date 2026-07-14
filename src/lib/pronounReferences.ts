import type { Token } from "@/lib/words";

export interface PronounReference {
  pronoun: string;
  antecedentText: string;
  confidence: "likely" | "possible";
  note: string;
}

const TRACKED_PRONOUNS = new Set(["il", "ils", "elle", "elles", "ce", "cela", "ça", "dont", "qui", "que", "lequel", "laquelle", "lesquels", "lesquelles"]);
const NOUN_HINTS = new Set(["le", "la", "les", "un", "une", "des", "du", "de", "ce", "cet", "cette", "ces", "son", "sa", "ses", "leur", "leurs"]);

export function isReferencePronoun(word: string): boolean {
  return TRACKED_PRONOUNS.has(word.toLowerCase());
}

function tokenText(tokens: Token[], start: number, end: number): string {
  return tokens.slice(start, end + 1).map((token) => token.text).join("").trim();
}

function findPreviousNounPhrase(tokens: Token[], beforeIndex: number): string | null {
  for (let i = beforeIndex - 1; i >= 0; i--) {
    if (!tokens[i].isWord) continue;
    let start = i;
    for (let j = i - 1; j >= 0; j--) {
      if (!tokens[j].isWord) {
        if (tokens[j].text.trim() === "") continue;
        break;
      }
      if (NOUN_HINTS.has(tokens[j].clean) || /^[A-ZÀ-ÖØ-Þ]/.test(tokens[j].text)) {
        start = j;
        continue;
      }
      break;
    }
    const phrase = tokenText(tokens, start, i);
    if (phrase.length > 1) return phrase;
  }
  return null;
}

export function findPronounReference(
  pronoun: string,
  sentenceTokens: Token[],
  tokenIndex: number,
  previousSentenceTokens: Token[] | null
): PronounReference | null {
  const clean = pronoun.toLowerCase();
  if (!isReferencePronoun(clean)) return null;

  const inSentence = findPreviousNounPhrase(sentenceTokens, tokenIndex);
  if (inSentence) {
    return {
      pronoun: clean,
      antecedentText: inSentence,
      confidence: clean === "qui" || clean === "dont" || clean.includes("quel") ? "likely" : "possible",
      note: "This pronoun most likely points back to the highlighted noun phrase in the same sentence.",
    };
  }

  const previous = previousSentenceTokens ? findPreviousNounPhrase(previousSentenceTokens, previousSentenceTokens.length) : null;
  if (previous) {
    return {
      pronoun: clean,
      antecedentText: previous,
      confidence: "possible",
      note: "This pronoun may refer back to the highlighted idea in the previous sentence.",
    };
  }

  return null;
}
