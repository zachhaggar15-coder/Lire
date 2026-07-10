import { lookupWord } from "@/lib/dictionary/lookup";
import type { SentenceGroup, Token } from "@/lib/words";

function isCapitalized(text: string): boolean {
  const first = text.match(/\p{L}/u)?.[0];
  return !!first && first === first.toUpperCase() && first !== first.toLowerCase();
}

function matchCase(source: string, translation: string): string {
  if (!translation) return translation;
  return isCapitalized(source) ? translation.charAt(0).toUpperCase() + translation.slice(1) : translation;
}

function translationForToken(tokens: Token[], index: number): string {
  const token = tokens[index];
  if (!token?.isWord) return token?.text ?? "";

  const previousWord = findAdjacentWord(tokens, index, -1);
  const nextWord = findAdjacentWord(tokens, index, 1);
  const lookup = lookupWord(token.clean, { previousWord, nextWord });
  const translation = lookup.translations[0];

  return translation ? matchCase(token.text, translation) : token.text;
}

function findAdjacentWord(tokens: Token[], index: number, direction: -1 | 1): string | null {
  for (let i = index + direction; i >= 0 && i < tokens.length; i += direction) {
    if (tokens[i].isWord) return tokens[i].clean;
  }
  return null;
}

export function translateSentenceWithDictionary(sentence: SentenceGroup): string {
  return sentence.tokens.map((token, index) => (token.isWord ? translationForToken(sentence.tokens, index) : token.text)).join("");
}

export function translateParagraphsWithDictionary(paragraphs: SentenceGroup[][]): string[] {
  return paragraphs.map((sentences) => sentences.map(translateSentenceWithDictionary).join(" "));
}
