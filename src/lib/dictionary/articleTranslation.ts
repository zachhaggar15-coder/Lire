import { lookupWord } from "@/lib/dictionary/lookup";
import { hashString } from "@/lib/hash";
import type { SentenceGroup, Token } from "@/lib/words";

const DICTIONARY_TRANSLATION_CACHE_PREFIX = "lire.dictionaryArticleTranslation.v1.";
const MAX_PHRASE_WORDS = 5;

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
  const lookup = lookupWord(token.text, { previousWord, nextWord });
  const translation = lookup.translations[0];

  return translation ? matchCase(token.text, translation) : token.text;
}

function findPhraseTranslation(tokens: Token[], startIndex: number): { endIndex: number; translation: string } | null {
  const words: { index: number; clean: string }[] = [];
  for (let i = startIndex; i < tokens.length && words.length < MAX_PHRASE_WORDS; i++) {
    const token = tokens[i];
    if (token.isWord) words.push({ index: i, clean: token.clean });
  }

  for (let length = words.length; length >= 2; length--) {
    const phrase = words.slice(0, length).map((word) => word.clean).join(" ");
    const lookup = lookupWord(phrase);
    const translation = lookup.translations[0];
    if (lookup.source !== "missing" && lookup.lemma?.includes(" ") && translation) {
      return { endIndex: words[length - 1].index, translation };
    }
  }

  return null;
}

function findAdjacentWord(tokens: Token[], index: number, direction: -1 | 1): string | null {
  for (let i = index + direction; i >= 0 && i < tokens.length; i += direction) {
    if (tokens[i].isWord) return tokens[i].clean;
  }
  return null;
}

export function translateSentenceWithDictionary(sentence: SentenceGroup): string {
  let translated = "";

  for (let index = 0; index < sentence.tokens.length; index++) {
    const token = sentence.tokens[index];
    if (!token.isWord) {
      translated += token.text;
      continue;
    }

    const phrase = findPhraseTranslation(sentence.tokens, index);
    if (phrase) {
      translated += matchCase(token.text, phrase.translation);
      index = phrase.endIndex;
      continue;
    }

    translated += translationForToken(sentence.tokens, index);
  }

  return translated;
}

export function translateParagraphsWithDictionary(paragraphs: SentenceGroup[][]): string[] {
  return paragraphs.map((sentences) => sentences.map(translateSentenceWithDictionary).join(" "));
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function dictionaryTranslationCacheKey(articleId: string, body: string): string {
  return `${DICTIONARY_TRANSLATION_CACHE_PREFIX}${hashString(`${articleId}::${body}`)}`;
}

export function translateSentencesWithDictionaryCache(
  articleId: string,
  body: string,
  paragraphs: SentenceGroup[][]
): string[] {
  const expectedLength = paragraphs.reduce((sum, sentences) => sum + sentences.length, 0);
  const key = dictionaryTranslationCacheKey(articleId, body);

  if (hasStorage()) {
    try {
      const raw = window.localStorage.getItem(key);
      const cached = raw ? JSON.parse(raw) : null;
      if (
        cached &&
        typeof cached === "object" &&
        Array.isArray(cached.sentences) &&
        cached.sentences.length === expectedLength &&
        cached.sentences.every((sentence: unknown) => typeof sentence === "string")
      ) {
        return cached.sentences;
      }
    } catch {
      // Cache misses should never block reading.
    }
  }

  const sentences = paragraphs.flatMap((paragraph) => paragraph.map(translateSentenceWithDictionary));
  return sentences;
}

export function cacheDictionarySentenceTranslations(articleId: string, body: string, sentences: string[]): void {
  if (hasStorage()) {
    try {
      window.localStorage.setItem(dictionaryTranslationCacheKey(articleId, body), JSON.stringify({ sentences, updatedAt: new Date().toISOString() }));
    } catch {
      // Storage full or unavailable: deterministic translation still works.
    }
  }
}
