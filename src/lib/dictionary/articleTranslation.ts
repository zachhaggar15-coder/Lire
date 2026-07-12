import { lookupWord } from "@/lib/dictionary/lookup";
import { hashString } from "@/lib/hash";
import type { SentenceGroup, Token } from "@/lib/words";

const DICTIONARY_TRANSLATION_CACHE_PREFIX = "lire.dictionaryArticleTranslation.v1.";
const MAX_PHRASE_WORDS = 7;

export type DictionaryArticleTranslationMode = "phrase-aware" | "literal";

export interface PhraseTranslationMatch {
  startIndex: number;
  endIndex: number;
  phrase: string;
  lemma: string;
  translation: string;
  partOfSpeech: string | null;
}

function isCapitalized(text: string): boolean {
  const first = text.match(/\p{L}/u)?.[0];
  return !!first && first === first.toUpperCase() && first !== first.toLowerCase();
}

function matchCase(source: string, translation: string): string {
  if (!translation) return translation;
  return isCapitalized(source) ? translation.charAt(0).toUpperCase() + translation.slice(1) : translation;
}

function translationForToken(tokens: Token[], index: number, mode: DictionaryArticleTranslationMode): string {
  const token = tokens[index];
  if (!token?.isWord) return token?.text ?? "";

  const lookup =
    mode === "phrase-aware"
      ? lookupWord(token.text, {
          previousWord: findAdjacentWord(tokens, index, -1),
          nextWord: findAdjacentWord(tokens, index, 1),
        })
      : lookupWord(token.text);
  const translation = lookup.translations[0];

  return translation ? matchCase(token.text, translation) : token.text;
}

export function findPhraseTranslationMatch(tokens: Token[], startIndex: number): PhraseTranslationMatch | null {
  const words: { index: number; clean: string }[] = [];
  for (let i = startIndex; i < tokens.length && words.length < MAX_PHRASE_WORDS; i++) {
    const token = tokens[i];
    if (token.isWord) {
      words.push({ index: i, clean: token.clean });
      continue;
    }
    if (words.length > 0 && token.text.trim() !== "") break;
  }

  for (let length = words.length; length >= 2; length--) {
    const phrase = words.slice(0, length).map((word) => word.clean).join(" ");
    const lookup = lookupWord(phrase);
    const translation = lookup.translations[0];
    if (lookup.source !== "missing" && lookup.lemma?.includes(" ") && translation) {
      return {
        startIndex,
        endIndex: words[length - 1].index,
        phrase,
        lemma: lookup.lemma,
        translation,
        partOfSpeech: lookup.partOfSpeech,
      };
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

export function translateSentenceWithDictionary(
  sentence: SentenceGroup,
  mode: DictionaryArticleTranslationMode = "phrase-aware"
): string {
  let translated = "";

  for (let index = 0; index < sentence.tokens.length; index++) {
    const token = sentence.tokens[index];
    if (!token.isWord) {
      translated += token.text;
      continue;
    }

    const phrase = mode === "phrase-aware" ? findPhraseTranslationMatch(sentence.tokens, index) : null;
    if (phrase) {
      translated += matchCase(token.text, phrase.translation);
      index = phrase.endIndex;
      continue;
    }

    translated += translationForToken(sentence.tokens, index, mode);
  }

  return translated;
}

export function translateParagraphsWithDictionary(
  paragraphs: SentenceGroup[][],
  mode: DictionaryArticleTranslationMode = "phrase-aware"
): string[] {
  return paragraphs.map((sentences) => sentences.map((sentence) => translateSentenceWithDictionary(sentence, mode)).join(" "));
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function dictionaryTranslationCacheKey(articleId: string, body: string, mode: DictionaryArticleTranslationMode): string {
  return `${DICTIONARY_TRANSLATION_CACHE_PREFIX}${hashString(`${articleId}::${mode}::${body}`)}`;
}

export function translateSentencesWithDictionaryCache(
  articleId: string,
  body: string,
  paragraphs: SentenceGroup[][],
  mode: DictionaryArticleTranslationMode = "phrase-aware"
): string[] {
  const expectedLength = paragraphs.reduce((sum, sentences) => sum + sentences.length, 0);
  const key = dictionaryTranslationCacheKey(articleId, body, mode);

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

  const sentences = paragraphs.flatMap((paragraph) => paragraph.map((sentence) => translateSentenceWithDictionary(sentence, mode)));
  return sentences;
}

export function cacheDictionarySentenceTranslations(
  articleId: string,
  body: string,
  sentences: string[],
  mode: DictionaryArticleTranslationMode = "phrase-aware"
): void {
  if (hasStorage()) {
    try {
      window.localStorage.setItem(dictionaryTranslationCacheKey(articleId, body, mode), JSON.stringify({ sentences, updatedAt: new Date().toISOString() }));
    } catch {
      // Storage full or unavailable: deterministic translation still works.
    }
  }
}
