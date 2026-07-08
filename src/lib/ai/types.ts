/**
 * Types for the on-demand AI explanation layer. AI is never called
 * automatically — only when a reader explicitly taps "Ask AI for nuance" or
 * "Ask AI to explain" (see WordSheet.tsx / SentenceSheet.tsx). Both routes
 * use OpenAI today; see src/lib/ai/openai.ts.
 */

export interface WordExplanationRequest {
  word: string;
  lemma: string | null;
  /** The sentence the word was tapped in, from the article. */
  articleSentence: string;
  /** The dictionary's (or fallback) simple example sentence, if any. */
  simpleExampleSentence?: string | null;
  /** The sentence just before articleSentence, if available. */
  surroundingSentence?: string | null;
  /** e.g. "A2/B1 French learner". */
  level: string;
}

export interface WordExplanation {
  word: string;
  lemma: string | null;
  translation: string;
  partOfSpeech: string | null;
  meaningInContext: string;
  simpleExampleFr: string;
  simpleExampleEn: string;
  grammarOrUsageNote: string;
  commonMistake: string | null;
}

export interface SentenceExplanationRequest {
  sentence: string;
  articleTitle?: string | null;
  previousSentence?: string | null;
  nextSentence?: string | null;
  /** e.g. "A2/B1 French learner". */
  level: string;
}

export interface UsefulVocabularyItem {
  word: string;
  meaning: string;
}

export interface SentenceExplanation {
  originalSentence: string;
  naturalEnglishTranslation: string;
  simplifiedFrench: string;
  grammarNotes: string[];
  usefulVocabulary: UsefulVocabularyItem[];
  explanation: string;
}
