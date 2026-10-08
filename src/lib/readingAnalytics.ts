import type { ReadingText, SavedWord } from "@/types";
import { estimateDifficulty } from "@/lib/difficulty";
import { lookupWord } from "@/lib/dictionary/lookup";
import { toPercent } from "@/lib/format";
import type { StoredInference, StoredWordTap } from "@/lib/wordLearning";
import { findRelatedArticles } from "@/lib/comprehension";
import { tokenize, tokenizeParagraphsToSentences } from "@/lib/words";
import { isMastered } from "@/lib/reviewMembership";

export interface NewsWordExample {
  articleId: string;
  title: string;
  sourceName: string | null;
  sentence: string;
}

export interface TodayNewsWord {
  lemma: string;
  translation: string;
  articleCount: number;
  examples: NewsWordExample[];
}

export interface HeadlineComparison {
  left: ReadingText;
  right: ReadingText;
  neutralChoice: "left" | "right";
  dramaticChoice: "left" | "right";
  criticalVerb: string | null;
  framing: string;
}

export type VocabularyDecayState = "stable" | "emerging" | "fragile" | "forgotten";

export interface VocabularyStateItem {
  word: SavedWord;
  state: VocabularyDecayState;
  reason: string;
}


const CONNECTIVES = new Set(["selon", "pourtant", "cependant", "donc", "ainsi", "toutefois", "neanmoins", "car", "puisque"]);
const DRAMATIC_WORDS = ["alerte", "crise", "choc", "menace", "urgence", "explose", "bouleverse", "colere"];
const NEUTRAL_WORDS = ["annonce", "presente", "explique", "selon", "indique", "publie", "rapport", "resultat"];
const CRITICAL_VERBS = ["accuse", "critique", "denonce", "conteste", "attaque", "alerte", "reproche"];
const NEWS_WORD_FUNCTION_PARTS = ["article", "preposition", "pronoun", "determiner", "possessive", "demonstrative"];
const NEWS_WORD_STOP_LEMMAS = new Set([
  "avoir",
  "etre",
  "faire",
  "devoir",
  "aller",
  "venir",
  "avec",
  "dans",
  "pour",
  "contre",
  "cette",
  "an",
  "annee",
  "année",
  "entree",
  "entrée",
  "nom",
  "pas",
]);

function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function isProperNounLookup(partOfSpeech: string | null): boolean {
  return (partOfSpeech ?? "").toLowerCase().includes("proper noun");
}

function isUsefulTodayNewsWord(lemma: string, partOfSpeech: string | null, frequencyRank: number | null): boolean {
  const cleanLemma = normalise(lemma);
  if (NEWS_WORD_STOP_LEMMAS.has(cleanLemma)) return false;
  if (CONNECTIVES.has(cleanLemma)) return true;
  const part = (partOfSpeech ?? "").toLowerCase();
  if (NEWS_WORD_FUNCTION_PARTS.some((blocked) => part.includes(blocked))) return false;
  if (part.includes("conjunction") && !CONNECTIVES.has(cleanLemma)) return false;
  return frequencyRank != null && frequencyRank <= 5000;
}

export function isProperNounWord(word: string): boolean {
  return isProperNounLookup(lookupWord(word).partOfSpeech);
}

function wordCount(text: string): number {
  return tokenize(text).filter((token) => token.isWord).length;
}

export function countFrenchWords(text: ReadingText): number {
  return wordCount(text.body);
}

function articleSentences(text: ReadingText): string[] {
  return tokenizeParagraphsToSentences(text.body).flatMap((paragraph) => paragraph.map((sentence) => sentence.text));
}

export function buildTodayNewsWords(articles: ReadingText[], limit = 6): TodayNewsWord[] {
  const byLemma = new Map<string, { translation: string; articleIds: Set<string>; examples: NewsWordExample[] }>();
  const today = new Date().toISOString().slice(0, 10);
  const news = articles.filter((article) => article.category === "news-style" && (!article.publishedAt || article.publishedAt.slice(0, 10) === today));
  const source = news.length >= 2 ? news : articles.filter((article) => article.category === "news-style");

  for (const article of source) {
    const seenInArticle = new Set<string>();
    for (const sentence of articleSentences(article)) {
      for (const token of tokenize(sentence)) {
        if (!token.isWord || token.clean.length < 3) continue;
        const lookup = lookupWord(token.text);
        if (lookup.source !== "local" || !lookup.lemma || lookup.translations.length === 0) continue;
        if (isProperNounLookup(lookup.partOfSpeech)) continue;
        const lemma = lookup.lemma.toLowerCase();
        if (!isUsefulTodayNewsWord(lemma, lookup.partOfSpeech, lookup.frequencyRank)) continue;
        const entry = byLemma.get(lemma) ?? { translation: lookup.translations[0], articleIds: new Set<string>(), examples: [] };
        entry.articleIds.add(article.id);
        if (!seenInArticle.has(lemma) && entry.examples.length < 4) {
          entry.examples.push({
            articleId: article.id,
            title: article.title,
            sourceName: article.sourceName ?? null,
            sentence,
          });
        }
        seenInArticle.add(lemma);
        byLemma.set(lemma, entry);
      }
    }
  }

  return [...byLemma.entries()]
    .map(([lemma, entry]) => ({
      lemma,
      translation: entry.translation,
      articleCount: entry.articleIds.size,
      examples: entry.examples,
    }))
    .filter((entry) => entry.articleCount >= 2)
    .sort((a, b) => b.articleCount - a.articleCount || a.lemma.localeCompare(b.lemma))
    .slice(0, limit);
}

function signalCount(title: string, signals: string[]): number {
  const clean = normalise(title);
  return signals.filter((word) => clean.includes(normalise(word))).length;
}

function firstSignal(title: string, signals: string[]): string | null {
  const clean = normalise(title);
  return signals.find((word) => clean.includes(normalise(word))) ?? null;
}

export function buildHeadlineComparison(current: ReadingText, candidates: ReadingText[]): HeadlineComparison | null {
  const related = findRelatedArticles(current, candidates, 1)[0];
  if (!related) return null;
  const leftDrama = signalCount(current.title, DRAMATIC_WORDS);
  const rightDrama = signalCount(related.title, DRAMATIC_WORDS);
  const leftNeutral = signalCount(current.title, NEUTRAL_WORDS);
  const rightNeutral = signalCount(related.title, NEUTRAL_WORDS);
  const neutralChoice = leftNeutral >= rightNeutral && leftDrama <= rightDrama ? "left" : "right";
  const dramaticChoice = leftDrama >= rightDrama ? "left" : "right";
  const criticalVerb = firstSignal(`${current.title} ${related.title}`, CRITICAL_VERBS);
  return {
    left: current,
    right: related,
    neutralChoice,
    dramaticChoice,
    criticalVerb,
    framing:
      current.sourceName && related.sourceName
        ? `${current.sourceName} frames it as "${current.title}", while ${related.sourceName} frames it as "${related.title}".`
        : "Compare the verbs, adjectives, and implied cause in each headline.",
  };
}

function tapCountFor(word: SavedWord, taps: StoredWordTap[]): number {
  const lemma = word.lemma?.toLowerCase();
  return taps
    .filter((tap) => tap.word.toLowerCase() === word.word.toLowerCase() || (!!lemma && tap.lemma?.toLowerCase() === lemma))
    .reduce((sum, tap) => sum + tap.count, 0);
}

function failedInferenceCount(word: SavedWord, inferences: StoredInference[]): number {
  const lemma = word.lemma?.toLowerCase();
  return inferences.filter((entry) => !entry.correct && (entry.word.toLowerCase() === word.word.toLowerCase() || (!!lemma && entry.lemma?.toLowerCase() === lemma))).length;
}

export function classifyVocabularyStates(words: SavedWord[], taps: StoredWordTap[] = [], inferences: StoredInference[] = []): VocabularyStateItem[] {
  return words.map((word) => {
    const mastered = isMastered(word);
    const tapsAfterMastered = mastered ? tapCountFor(word, taps) : 0;
    const failedInferences = failedInferenceCount(word, inferences);
    if ((mastered && tapsAfterMastered >= 2) || (word.lastReviewResult === "incorrect" && (word.incorrectCount ?? 0) >= 2)) {
      return { word, state: "forgotten", reason: "Missed again, or looked up again after being strong." };
    }
    if ((word.incorrectCount ?? 0) > 0 || failedInferences > 0 || tapCountFor(word, taps) >= 3) {
      return { word, state: "fragile", reason: "Missed in Review or looked up more than once." };
    }
    if (mastered) {
      return { word, state: "stable", reason: "Remembered several times in a row." };
    }
    return { word, state: "emerging", reason: "Still new in Review." };
  });
}

export function estimateArticleCoverage(text: ReadingText, knownWords: Set<string>): number {
  return toPercent(estimateDifficulty(text.body, knownWords).dictionaryCoverage);
}
