/**
 * Types for the AI help layer. Word and sentence explanations are explicit
 * button actions only; fluent article translation may be prewarmed by
 * Reader.tsx when the user has enabled it, and RSS blurbs are generated in a
 * server-side batch during pool refresh.
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

export interface PronounReferenceExplanation {
  pronoun: string;
  refersTo: string;
  explanation: string;
}

export interface SentenceStructure {
  subject: string;
  mainVerb: string;
  object: string | null;
  subordinateClauses: string[];
  pronounReferences: PronounReferenceExplanation[];
  tense: string;
  literalTranslation: string;
}

export interface SentenceExplanation {
  originalSentence: string;
  naturalEnglishTranslation: string;
  simplifiedFrench: string;
  naturalMeaning?: string;
  literalStructure?: string;
  mainExpression?: string;
  relevantGrammar?: string[];
  whyLiteralTranslationSoundsWrong?: string;
  structure: SentenceStructure;
  grammarNotes: string[];
  usefulVocabulary: UsefulVocabularyItem[];
  explanation: string;
  tone: {
    label: string;
    explanation: string;
  };
}

/**
 * A whole article's sentences, translated fluently and idiomatically (not
 * word-for-word). Reader.tsx can prewarm this in the background when Natural
 * translation and AI translation are enabled, then reveal it only when the
 * reader toggles Translate. Distinct from the instant, free, offline
 * `translateSentenceWithDictionary` (articleTranslation.ts), which stays as
 * the fallback shown immediately while this loads, and if AI isn't configured
 * or the call fails.
 *
 * Sentence-, not paragraph-, granularity: a reader lines each French
 * sentence up against its own English line directly underneath (true
 * "between the lines"), which a coarser per-paragraph translation can't
 * support when a paragraph runs more than one sentence.
 */
export interface ArticleTranslationRequest {
  /** Every sentence in the article, in reading order — the response must return exactly this many translations, same order. Paragraph boundaries are conveyed separately via `paragraphBreakBeforeIndex` so the model still has full-article context, but the output stays flat and 1:1 with this array. */
  sentences: string[];
  /** Indices into `sentences` where a new paragraph starts (always includes 0) — lets the translation prompt show real paragraph structure without the response needing to track it. */
  paragraphBreakBeforeIndex: number[];
  articleTitle?: string | null;
  /** e.g. "A2/B1 French learner". */
  level: string;
}

export interface ArticleTranslationResult {
  /** One fluent English translation per input sentence, same order. */
  sentences: string[];
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
