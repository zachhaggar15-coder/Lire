/**
 * Provider-agnostic contracts for every AI-backed capability in the app.
 * Route handlers depend only on these interfaces (via the factory in
 * providers/index.ts), never on a concrete provider — adding Anthropic,
 * Gemini, or DeepL later means writing one new file that implements these
 * same interfaces, with no changes anywhere else.
 */

/** Vocabulary fields worth persisting alongside a saved word. */
export interface VocabularyEntry {
  translation: string;
  /** Dictionary/citation form: infinitive for verbs, masculine singular for adjectives, etc. */
  lemma: string;
  partOfSpeech: string;
  /** Rough CEFR level for this word, e.g. "A2", "B1". */
  cefr: string;
  exampleSentence: string;
}

/** Full context-aware analysis shown in the word bottom sheet. */
export interface WordAnalysis extends VocabularyEntry {
  word: string;
  literalMeaning: string;
  meaningInThisSentence: string;
  /** Any extra usage note worth surfacing; empty string if there's nothing notable. */
  notes: string;
}

export interface SentenceExplanation {
  translation: string;
  /** Grammar/tense/idiom explanation aimed at a B1 learner. */
  explanation: string;
}

export interface TranslationProvider {
  /** Translates a full article, preserving blank-line paragraph breaks. */
  translateArticle(text: string): Promise<string>;
  /** Context-aware word translation: the word, the sentence it's in, and optionally the sentence before it. */
  translateWord(word: string, sentence: string, previousSentence?: string): Promise<WordAnalysis>;
}

export interface SentenceExplanationProvider {
  explainSentence(sentence: string, previousSentence?: string): Promise<SentenceExplanation>;
}

export interface VocabularyProvider {
  extractVocabulary(word: string, sentence: string): Promise<VocabularyEntry>;
}

/** What a full provider implementation must offer. */
export interface AiProvider
  extends TranslationProvider,
    SentenceExplanationProvider,
    VocabularyProvider {}
