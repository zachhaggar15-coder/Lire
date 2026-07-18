import { lookupWord } from "@/lib/dictionary/lookup";
import { hashString } from "@/lib/hash";
import type { SentenceGroup, Token } from "@/lib/words";

const DICTIONARY_TRANSLATION_CACHE_PREFIX = "lire.dictionaryArticleTranslation.v1.";
const MAX_PHRASE_WORDS = 9;
const COMPOSED_PHRASE_RADIUS = 2;

export type DictionaryArticleTranslationMode = "phrase-aware" | "literal";

export interface PhraseTranslationMatch {
  startIndex: number;
  endIndex: number;
  phrase: string;
  lemma: string;
  translation: string;
  partOfSpeech: string | null;
  source: "phrasebank" | "composed";
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
    const phraseWords = words.slice(0, length).map((word) => word.clean);
    const phrase = phraseWords.join(" ");
    const match = lookupPhrase(phraseWords);
    if (!match) continue;
    const lookup = match.lookup;
    const translation = lookup.translations[0];
    if (translation) {
      return {
        startIndex,
        endIndex: words[length - 1].index,
        phrase,
        lemma: lookup.lemma ?? match.key,
        translation,
        partOfSpeech: lookup.partOfSpeech,
        source: "phrasebank",
      };
    }
  }

  return null;
}

function wordPositions(tokens: Token[]): { index: number; clean: string }[] {
  return tokens.map((token, index) => ({ token, index })).filter((item) => item.token.isWord).map((item) => ({
    index: item.index,
    clean: item.token.clean,
  }));
}

function phraseTextFromWindow(tokens: Token[], startIndex: number, endIndex: number): string {
  return tokens.slice(startIndex, endIndex + 1).map((token) => token.text).join("");
}

function stripDiacritics(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .replace(/æ/g, "ae")
    .replace(/Æ/g, "AE");
}

function uniqueValues(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function lookupKeysForWord(clean: string): string[] {
  const straight = clean.replace(/[’‘]/g, "'");
  const variants = [straight, stripDiacritics(straight)];
  if (straight === "au" || straight === "aux") variants.push("à", "a");
  if (straight === "du" || straight === "des") variants.push("de");
  const apostropheIndex = straight.indexOf("'");
  if (apostropheIndex > 0 && apostropheIndex < straight.length - 1) {
    const head = straight.slice(0, apostropheIndex);
    const tail = straight.slice(apostropheIndex + 1);
    if (["j", "m", "t", "s", "n", "c", "d", "l", "qu"].includes(head)) {
      variants.push(tail, stripDiacritics(tail));
    }
  }
  return uniqueValues(variants);
}

function phraseLookupKeys(words: string[]): string[] {
  let phrases = [""];
  for (const word of words) {
    const variants = lookupKeysForWord(word);
    const next: string[] = [];
    for (const phrase of phrases) {
      for (const variant of variants) {
        next.push(phrase ? `${phrase} ${variant}` : variant);
      }
    }
    phrases = uniqueValues(next).slice(0, 80);
  }
  return phrases;
}

function lookupPhrase(words: string[]): { key: string; lookup: ReturnType<typeof lookupWord> } | null {
  for (const key of phraseLookupKeys(words)) {
    const lookup = lookupWord(key);
    if (isPhraseLookup(lookup)) return { key, lookup };
  }
  return null;
}

function isPhraseLookup(lookup: ReturnType<typeof lookupWord>): boolean {
  if (lookup.source === "missing" || !lookup.translations[0]) return false;
  const part = (lookup.partOfSpeech ?? "").toLowerCase();
  if (part.includes("proper noun")) return false;
  return (
    !!lookup.lemma?.includes(" ") ||
    part.includes("phrase") ||
    part.includes("connector") ||
    part.includes("idiom")
  );
}

function translateTokenWindow(tokens: Token[], startIndex: number, endIndex: number): string {
  let translated = "";
  for (let i = startIndex; i <= endIndex; i++) {
    const token = tokens[i];
    if (!token.isWord) {
      translated += token.text;
      continue;
    }
    translated += translationForToken(tokens, i, "phrase-aware");
  }
  return translated.trim().replace(/\s+/g, " ");
}

/**
 * Finds the best known local phrase containing a held word. This is the
 * long-press counterpart to findPhraseTranslationMatch: instead of only
 * checking phrases that begin at the current token, it searches every
 * contiguous word window around the held token and prefers the longest real
 * local phrase. That makes holding the middle of "prendre en compte" or
 * "sur fond de" behave like holding the phrase itself.
 */
export function findContainingPhraseTranslationMatch(tokens: Token[], tokenIndex: number): PhraseTranslationMatch | null {
  if (!tokens[tokenIndex]?.isWord) return null;

  const words = wordPositions(tokens);
  const heldWordOrdinal = words.findIndex((word) => word.index === tokenIndex);
  if (heldWordOrdinal === -1) return null;

  let best: PhraseTranslationMatch | null = null;
  for (let startOrdinal = Math.max(0, heldWordOrdinal - MAX_PHRASE_WORDS + 1); startOrdinal <= heldWordOrdinal; startOrdinal++) {
    const maxEndOrdinal = Math.min(words.length - 1, startOrdinal + MAX_PHRASE_WORDS - 1);
    for (let endOrdinal = maxEndOrdinal; endOrdinal >= Math.max(heldWordOrdinal, startOrdinal + 1); endOrdinal--) {
      const phraseWords = words.slice(startOrdinal, endOrdinal + 1).map((word) => word.clean);
      const cleanPhrase = phraseWords.join(" ");
      const phraseLookup = lookupPhrase(phraseWords);
      if (!phraseLookup) continue;
      const lookup = phraseLookup.lookup;

      const startIndex = words[startOrdinal].index;
      const endIndex = words[endOrdinal].index;
      const match: PhraseTranslationMatch = {
        startIndex,
        endIndex,
        phrase: phraseTextFromWindow(tokens, startIndex, endIndex).toLowerCase(),
        lemma: lookup.lemma ?? cleanPhrase,
        translation: lookup.translations[0],
        partOfSpeech: lookup.partOfSpeech,
        source: "phrasebank",
      };
      if (!best || endOrdinal - startOrdinal > wordOrdinalLength(best, words)) best = match;
    }
  }

  return best;
}

function wordOrdinalLength(match: PhraseTranslationMatch, words: { index: number; clean: string }[]): number {
  const start = words.findIndex((word) => word.index === match.startIndex);
  const end = words.findIndex((word) => word.index === match.endIndex);
  return start === -1 || end === -1 ? 0 : end - start;
}

/**
 * Last offline fallback for long-press phrase lookup. If no exact phrase-bank
 * entry exists, select a short local word window around the held word and
 * translate it with the phrase-aware dictionary. This does not pretend to be a
 * fluent idiom translation; PhraseSheet labels it as an offline composition
 * and offers AI only as an explicit final resort.
 */
export function buildComposedPhraseTranslationMatch(tokens: Token[], tokenIndex: number): PhraseTranslationMatch | null {
  if (!tokens[tokenIndex]?.isWord) return null;
  const words = wordPositions(tokens);
  const heldWordOrdinal = words.findIndex((word) => word.index === tokenIndex);
  if (heldWordOrdinal === -1 || words.length < 2) return null;

  const startOrdinal = Math.max(0, heldWordOrdinal - COMPOSED_PHRASE_RADIUS);
  const endOrdinal = Math.min(words.length - 1, heldWordOrdinal + COMPOSED_PHRASE_RADIUS);
  if (startOrdinal === endOrdinal) return null;

  const startIndex = words[startOrdinal].index;
  const endIndex = words[endOrdinal].index;
  const phrase = phraseTextFromWindow(tokens, startIndex, endIndex).toLowerCase();
  return {
    startIndex,
    endIndex,
    phrase,
    lemma: phrase,
    translation: translateTokenWindow(tokens, startIndex, endIndex),
    partOfSpeech: "offline phrase composition",
    source: "composed",
  };
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

/**
 * How many article translations to keep cached. Each entry is one whole
 * article's worth of sentences, so this grew without bound before — one new
 * key per article per mode, never evicted. That quietly consumed the origin's
 * entire localStorage quota as someone read, which then made *unrelated*
 * writes start throwing (saving a vocabulary word, most importantly). Keeping
 * a bounded working set fixes the cause rather than only guarding the symptom.
 */
const MAX_CACHED_ARTICLE_TRANSLATIONS = 30;

/** Cache keys, oldest `updatedAt` first. Entries with no readable timestamp sort oldest so they're evicted first. */
function cacheKeysOldestFirst(): string[] {
  const entries: { key: string; updatedAt: number }[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key?.startsWith(DICTIONARY_TRANSLATION_CACHE_PREFIX)) continue;
    let updatedAt = 0;
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) ?? "null");
      const parsedTime = parsed && typeof parsed === "object" ? Date.parse(parsed.updatedAt) : NaN;
      if (Number.isFinite(parsedTime)) updatedAt = parsedTime;
    } catch {
      // Unparseable entry — treat as oldest so it gets cleared out first.
    }
    entries.push({ key, updatedAt });
  }
  return entries.sort((a, b) => a.updatedAt - b.updatedAt).map((entry) => entry.key);
}

/** Drops the oldest cached translations until at most `keep` remain. */
function evictOldestTranslations(keep: number): void {
  const keys = cacheKeysOldestFirst();
  for (const key of keys.slice(0, Math.max(0, keys.length - keep))) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Nothing useful to do; keep trying the rest.
    }
  }
}

export function cacheDictionarySentenceTranslations(
  articleId: string,
  body: string,
  sentences: string[],
  mode: DictionaryArticleTranslationMode = "phrase-aware"
): void {
  if (!hasStorage()) return;
  const key = dictionaryTranslationCacheKey(articleId, body, mode);
  const payload = JSON.stringify({ sentences, updatedAt: new Date().toISOString() });

  try {
    window.localStorage.setItem(key, payload);
  } catch {
    // Likely quota. Clear this cache down hard and retry once — a cached
    // translation is a nice-to-have, so it should yield space rather than
    // hold onto it at the expense of the user's saved words.
    try {
      evictOldestTranslations(Math.floor(MAX_CACHED_ARTICLE_TRANSLATIONS / 3));
      window.localStorage.setItem(key, payload);
    } catch {
      // Storage genuinely unavailable: deterministic translation still works.
      return;
    }
  }

  try {
    evictOldestTranslations(MAX_CACHED_ARTICLE_TRANSLATIONS);
  } catch {
    // Eviction is maintenance, never worth failing the write that succeeded.
  }
}
