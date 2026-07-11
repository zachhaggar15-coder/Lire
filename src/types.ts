export type Category =
  | "news-style"
  | "sport"
  | "culture"
  | "science"
  | "everyday life";

export type Difficulty = "A1" | "A2" | "B1" | "B2";

export interface ReadingText {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  /** Estimated reading time in minutes. */
  minutes: number;
  /** Short preview shown on the home card. */
  preview: string;
  /**
   * A 2-3 sentence English summary of what the article is about, shown on
   * the home-page card before a reader taps in. For RSS texts, generated in
   * a batch during pool building (src/lib/rss/articleBlurbs.ts) and may be
   * null if AI isn't configured or the batch call failed; for hardcoded
   * texts, hand-written in src/data/texts.ts.
   */
  blurbEn?: string | null;
  /** Full body text. Paragraphs are separated by blank lines. */
  body: string;
  /** Below this line: present only for RSS-sourced texts (undefined for hardcoded ones). */
  /** Name of the RSS source, e.g. "Le Monde". */
  sourceName?: string;
  /** Link to the original article. */
  sourceUrl?: string;
  /** ISO timestamp of the article's publication date. */
  publishedAt?: string;
  /** The source feed's declared language, if known (RSS-sourced texts only). */
  language?: "fr" | "en" | "mixed";
  /** True for RSS items too short for the normal quality bar but kept as short-form reading practice — see the "Short Snippets" section. */
  isShortSnippet?: boolean;
}

export type WordStatus = "learning" | "unsure" | "known";

export interface SavedWord {
  /** Clean, lowercase word as tapped — used as the unique key. */
  word: string;
  /** Dictionary/citation form, if the local dictionary resolved one. */
  lemma: string | null;
  /** Every translation the dictionary had, most useful first. */
  translations: string[];
  /** translations[0], or a placeholder when the dictionary had nothing. */
  primaryTranslation: string;
  partOfSpeech: string | null;
  gender: string | null;
  cefr: string | null;
  frequencyRank: number | null;
  /** The full sentence the word was tapped in, exactly as it appeared in the article. */
  articleContextSentence: string;
  /** A short, simple learner-friendly French example sentence (not from the article). */
  exampleSentenceFr: string;
  /** English translation of exampleSentenceFr. */
  exampleSentenceEn: string;
  /** Title of the text it came from. */
  sourceTextTitle: string;
  /** ISO timestamp of when it was first saved. */
  savedAt: string;
  /** How many times this word has been reviewed. */
  reviewCount: number;
  /** ISO timestamp of the last review, or null if never reviewed. */
  lastReviewedAt: string | null;
  /**
   * "learning" (saved via the "Save" action), "unsure" (saved via the
   * "Unsure" action), or "known" (promoted from Review's "Mark as known").
   * Words marked known straight from the reader's "I know this" button
   * never get a SavedWord at all — see src/lib/knownWords.ts.
   */
  status: WordStatus;
  /** True when the local dictionary had no entry for this word at save time. */
  missingFromDictionary?: boolean;
  /**
   * Spaced-repetition scheduling fields — see src/lib/spacedRepetition.ts.
   * Optional so older saved words (pre-dating this feature) still type-check;
   * src/lib/storage.ts fills in defaults for every word on read.
   */
  /** Ease multiplier applied to the base interval ladder. 1 = neutral. */
  ease?: number;
  /** ISO timestamp of when this card is next due, or null if due now (new/never scheduled). */
  nextReviewAt?: string | null;
  /** Consecutive correct answers in a row — resets to 0 on an incorrect answer. Drives the interval ladder. */
  correctCount?: number;
  /** Lifetime count of "Didn't know it" answers. */
  incorrectCount?: number;
  /** Result of the most recent review, or null if never reviewed. */
  lastReviewResult?: "correct" | "incorrect" | null;
}

export type TextStatus = "unread" | "in-progress" | "completed";

export interface TextProgress {
  status: TextStatus;
  /** ISO timestamp of when the text was first opened, or null. */
  openedAt: string | null;
  /** ISO timestamp of when the text was marked completed, or null. */
  completedAt: string | null;
}

export type FontSize = "small" | "medium" | "large";

export interface AppSettings {
  /** Visually highlight saved (learning/unsure) words while reading. */
  showSavedHighlights: boolean;
  /** De-emphasise words already marked "known" while reading. */
  showKnownWordStyling: boolean;
  fontSize: FontSize;
  /**
   * Overall text-to-speech speed multiplier, applied on top of the
   * "slow"/"normal" base rates every pronounce button already picks
   * between — 1 = unchanged, <1 slower, >1 faster. See src/lib/speech.ts.
   */
  speechRate: number;
  /** The browser SpeechSynthesisVoice.voiceURI to prefer for French playback, or null for the browser's own default French voice. */
  speechVoiceURI: string | null;
  /**
   * Whether Reader.tsx's "Show English" toggle is allowed to call the AI
   * fluent-translation service. On by default; turning it off means every
   * article always uses the free, instant, offline dictionary
   * word-for-word translation instead — no OpenAI usage/cost at all from
   * this feature. See "About the English translation" in Reader.tsx.
   */
  aiTranslationEnabled: boolean;
}
