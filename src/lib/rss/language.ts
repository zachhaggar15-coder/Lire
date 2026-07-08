/**
 * Lightweight, dependency-free French-vs-English language detection for RSS
 * content. Not a real language-ID model — just stopword/character-shape
 * heuristics, which is plenty for "is this feed item actually French" at
 * the volume this app deals with (a handful of words per candidate item).
 */

export type LikelyLanguage = "fr" | "en" | "mixed" | "unknown";

export interface LanguageAnalysis {
  likelyLanguage: LikelyLanguage;
  frenchScore: number;
  englishScore: number;
  reason: string;
}

/** Very common French function words — deliberately short/high-frequency so they show up even in a short teaser. */
const FRENCH_STOPWORDS = new Set([
  "le", "la", "les", "un", "une", "des", "du", "de", "et", "en", "est",
  "sont", "dans", "pour", "avec", "sur", "au", "aux", "que", "qui", "ce",
  "cette", "ces", "son", "sa", "ses", "leur", "leurs", "nous", "vous", "ils",
  "elles", "elle", "il", "je", "tu", "on", "pas", "plus", "mais", "ou",
  "où", "donc", "car", "comme", "aussi", "très", "bien", "être", "avoir",
  "fait", "faire", "sans", "sous", "entre", "vers", "chez", "depuis",
  "pendant", "après", "avant", "selon", "alors", "ainsi", "encore", "déjà",
  "toujours", "jamais", "aujourd'hui", "hier", "demain",
]);

/** Very common English function words. */
const ENGLISH_STOPWORDS = new Set([
  "the", "a", "an", "and", "is", "are", "was", "were", "in", "for", "with",
  "on", "at", "to", "of", "that", "which", "this", "these", "those", "his",
  "her", "their", "our", "your", "we", "you", "they", "she", "he", "it",
  "not", "more", "but", "or", "as", "so", "because", "also", "very", "well",
  "be", "have", "has", "had", "do", "does", "did", "without", "under",
  "between", "toward", "since", "during", "before", "after", "according",
  "then", "still", "never", "always", "today", "yesterday", "tomorrow",
]);

/** Elisions like l'idée, d'accord, qu'il, j'ai, n'est, c'est, s'il — a strong French signal even without any accents. */
const FRENCH_CONTRACTION_RE = /\b[ljdqncs]['’]/gi;

/** Accented characters common in French. */
const FRENCH_ACCENT_RE = /[àâäéèêëïîôöùûüçœæ]/gi;

function wordsOf(text: string): string[] {
  return (text.toLowerCase().match(/[a-zàâäéèêëïîôöùûüçœæ']+/gi) ?? []).map((w) => w.replace(/^'+|'+$/g, ""));
}

/**
 * Scores a piece of text for French-ness vs English-ness and returns a
 * best guess at its language. Both scores are on the same rough scale, so
 * comparing them directly is meaningful; `reason` is a short human-readable
 * explanation useful for dev-mode rejection logs.
 */
export function analyseLanguage(text: string): LanguageAnalysis {
  const words = wordsOf(text);
  const totalWords = words.length;

  if (totalWords === 0) {
    return { likelyLanguage: "unknown", frenchScore: 0, englishScore: 0, reason: "no words to analyse" };
  }

  let frenchStopwordHits = 0;
  let englishStopwordHits = 0;
  for (const word of words) {
    if (FRENCH_STOPWORDS.has(word)) frenchStopwordHits++;
    if (ENGLISH_STOPWORDS.has(word)) englishStopwordHits++;
  }

  const contractionHits = (text.match(FRENCH_CONTRACTION_RE) ?? []).length;
  const accentHits = (text.match(FRENCH_ACCENT_RE) ?? []).length;

  // Normalised to "hits per 100 words" so short and long texts are comparable.
  const scale = 100 / totalWords;
  const frenchScore = (frenchStopwordHits + contractionHits * 1.5 + accentHits * 0.5) * scale;
  const englishScore = englishStopwordHits * scale;

  const frenchWordRatio = frenchStopwordHits / totalWords;
  const englishWordRatio = englishStopwordHits / totalWords;

  let likelyLanguage: LikelyLanguage;
  let reason: string;

  if (englishScore > frenchScore * 1.3 && englishWordRatio > 0.08) {
    likelyLanguage = "en";
    reason = `English stopword ratio (${(englishWordRatio * 100).toFixed(0)}%) clearly exceeds French (${(frenchWordRatio * 100).toFixed(0)}%)`;
  } else if (frenchScore > englishScore * 1.3 && (frenchWordRatio > 0.04 || contractionHits > 0)) {
    likelyLanguage = "fr";
    reason = `French signal (stopwords + elisions/accents) clearly exceeds English`;
  } else if (frenchScore > 0 && englishScore > 0 && Math.abs(frenchScore - englishScore) < Math.max(frenchScore, englishScore) * 0.3) {
    likelyLanguage = "mixed";
    reason = "French and English signals are comparably strong — looks mixed";
  } else if (frenchScore < 1 && englishScore < 1) {
    likelyLanguage = "unknown";
    reason = "too little stopword/accent signal either way to tell";
  } else {
    likelyLanguage = frenchScore >= englishScore ? "fr" : "en";
    reason = "weak but directional signal";
  }

  return { likelyLanguage, frenchScore, englishScore, reason };
}

/** Below this many words, an "unknown" verdict is treated as unsafe rather than benefit-of-the-doubt French. */
const MIN_WORDS_FOR_UNKNOWN_TOLERANCE = 40;

/**
 * The actual accept/reject gate the RSS pipeline uses. Deliberately does
 * *not* require accents — plenty of genuine French sentences (informal
 * style, short teasers) have few or none — the stopword/elision signal
 * carries most of the weight.
 */
export function isAcceptableFrenchText(text: string): boolean {
  const { likelyLanguage, frenchScore, englishScore } = analyseLanguage(text);

  if (likelyLanguage === "en") return false;
  if (englishScore > frenchScore) return false; // English clearly higher, even if not classified "en" outright
  if (likelyLanguage === "unknown") {
    const wordCount = wordsOf(text).length;
    return wordCount >= MIN_WORDS_FOR_UNKNOWN_TOLERANCE;
  }
  if (frenchScore < 1) return false; // signal too weak to trust either way

  return true;
}
