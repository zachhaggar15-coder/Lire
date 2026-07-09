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
  /** The article's title — genre/register context (news headline vs. blog vs. recipe) helps explain *why* this specific word was chosen. */
  articleTitle?: string | null;
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
  /**
   * Why the article chose *this specific word* in *this specific spot* —
   * register/tone, connotation, or a stylistic reason a French writer would
   * pick it over a more common synonym (e.g. "exacerber" over "aggraver" for
   * added drama in a news headline). Distinct from `meaningInContext`, which
   * covers what the word means here, not why the author reached for it.
   */
  whyThisWord: string;
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

/**
 * One article to summarize in English — used for the home page's "what is
 * this about" blurb, computed in a batch during RSS pool building (see
 * src/lib/rss/articleBlurbs.ts), not on-demand per reader like the word/
 * sentence explanations above.
 */
export interface ArticleBlurbInput {
  id: string;
  title: string;
  /** A leading excerpt of the article body — enough for a summary, short enough to keep a batch request small. */
  excerpt: string;
}

export interface ArticleBlurbResult {
  id: string;
  /** 2-3 short English sentences describing what the article is about. */
  blurbEn: string;
}
