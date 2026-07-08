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
  /** Full body text. Paragraphs are separated by blank lines. */
  body: string;
  /** Below this line: present only for RSS-sourced texts (undefined for hardcoded ones). */
  /** Name of the RSS source, e.g. "Le Monde". */
  sourceName?: string;
  /** Link to the original article. */
  sourceUrl?: string;
  /** ISO timestamp of the article's publication date. */
  publishedAt?: string;
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
}

export type ReviewFilter = "all" | "today" | "least-reviewed" | "current-text";
