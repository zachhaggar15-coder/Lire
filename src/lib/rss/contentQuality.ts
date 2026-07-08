/**
 * Content-quality gate for RSS candidate items — separate from language
 * detection (src/lib/rss/language.ts). A short teaser or a truncated
 * snippet can be perfectly good French and still be useless as reading
 * material, so this checks length/shape independently.
 */

/**
 * Default minimum word count for an RSS item to be worth reading. Named so
 * it's easy to tune later; individual feeds can override it via
 * `RssSource.minWords` (see src/data/rssSources.ts).
 *
 * Calibrated against real feeds, not picked in the abstract: most
 * commercial news RSS feeds (and plenty of blogs) deliberately publish
 * only a short teaser in *both* `<description>` and `<content:encoded>` —
 * verified against Numerama, Ouest-France, DNA, and others while tuning
 * this value. A strict 120-word floor rejected essentially the entire
 * candidate pool in testing, most of it via genuinely short (but real,
 * multi-sentence) paragraphs, not junk one-liners. 60 still rejects true
 * one-line teasers (most rejected items were well under 45 words) while
 * accepting the short-but-real paragraphs this app's "short French text"
 * format is built around anyway.
 */
export const DEFAULT_MIN_WORDS = 60;

/** Minimum number of real sentences — one giant run-on "sentence" is a red flag, not real prose. Kept low since DEFAULT_MIN_WORDS is itself modest (see that constant's comment). */
const MIN_SENTENCES = 2;

/** Below this average words/sentence, text is usually a bullet list or broken markup rather than prose. */
const MIN_AVERAGE_SENTENCE_LENGTH = 4;

/** Trailing markers that mean the feed truncated the item and this is not the full thought. */
const TRUNCATION_MARKERS = [
  /\.\.\.\s*$/,
  /…\s*$/,
  /\[\s*\.\.\.\s*\]\s*$/,
  /\[\s*…\s*\]\s*$/,
  /\bread more\b\s*$/i,
  /\bcontinue reading\b\s*$/i,
  /\blire la suite\b\s*$/i,
  /\bthe post .* appeared first on\b/i,
];

export type ContentQuality = "good" | "usable" | "poor";

export interface ContentQualityAnalysis {
  wordCount: number;
  sentenceCount: number;
  averageSentenceLength: number;
  isTooShort: boolean;
  isProbablyTruncated: boolean;
  hasEnoughSentences: boolean;
  quality: ContentQuality;
  reason: string;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function countSentences(text: string): number {
  const matches = text.match(/[^.!?…]+[.!?…]+/g);
  if (matches) return matches.length;
  // No terminal punctuation at all — treat the whole thing as (at most) one sentence.
  return text.trim().length > 0 ? 1 : 0;
}

function isProbablyTruncated(text: string): boolean {
  const trimmed = text.trim();
  return TRUNCATION_MARKERS.some((re) => re.test(trimmed));
}

/**
 * Analyses cleaned RSS body text (title should *not* be included — see
 * the pipeline notes in rssToReadingText.ts) for length and shape.
 */
export function analyseContentQuality(text: string, minWords: number = DEFAULT_MIN_WORDS): ContentQualityAnalysis {
  const wordCount = countWords(text);
  const sentenceCount = countSentences(text);
  const averageSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;

  const isTooShort = wordCount < minWords;
  const hasEnoughSentences = sentenceCount >= MIN_SENTENCES;
  const truncated = isProbablyTruncated(text);

  let quality: ContentQuality;
  let reason: string;

  if (isTooShort) {
    quality = "poor";
    reason = `only ${wordCount} words (minimum ${minWords})`;
  } else if (truncated) {
    quality = "poor";
    reason = "ends with a truncation/continue-reading marker";
  } else if (!hasEnoughSentences) {
    quality = "poor";
    reason = `only ${sentenceCount} sentence(s) (minimum ${MIN_SENTENCES})`;
  } else if (averageSentenceLength < MIN_AVERAGE_SENTENCE_LENGTH) {
    quality = "poor";
    reason = `average sentence length (${averageSentenceLength.toFixed(1)} words) is implausibly low — likely a list or broken markup`;
  } else if (wordCount < minWords * 1.5) {
    quality = "usable";
    reason = `${wordCount} words — above the minimum but on the short side`;
  } else {
    quality = "good";
    reason = `${wordCount} words across ${sentenceCount} sentences`;
  }

  return {
    wordCount,
    sentenceCount,
    averageSentenceLength,
    isTooShort,
    isProbablyTruncated: truncated,
    hasEnoughSentences,
    quality,
    reason,
  };
}

export function isAcceptableReadingContent(text: string, minWords: number = DEFAULT_MIN_WORDS): boolean {
  return analyseContentQuality(text, minWords).quality !== "poor";
}
