import type { Category, ReadingText, SavedWord } from "@/types";
import type { ArchiveEntry } from "@/lib/archive";
import { estimateDifficulty } from "@/lib/difficulty";
import { lookupWord } from "@/lib/dictionary/lookup";
import { formatCategory } from "@/lib/format";
import { isDue } from "@/lib/spacedRepetition";
import type { StoredInference, StoredWordTap } from "@/lib/wordLearning";
import type { TranslationBudgetRecord } from "@/lib/readingInsights";
import { findRelatedArticles } from "@/lib/comprehension";
import { tokenize, tokenizeParagraphsToSentences } from "@/lib/words";

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

export interface ContextualReviewArticle {
  article: ReadingText;
  dueWords: SavedWord[];
  fragileCount: number;
  emergingCount: number;
}

export interface WeeklyReadingReport {
  articlesCompleted: number;
  frenchWordsRead: number;
  coverageStart: number;
  coverageEnd: number;
  movedToStable: number;
  mostDifficultArea: string | null;
  strongestTopic: string | null;
  nextFocus: string | null;
  translationBudgetMet: number;
  translationBudgetTotal: number;
}

export interface CategoryProficiency {
  category: Category;
  label: string;
  cefr: string;
  articles: number;
  coverage: number;
}

const CONNECTIVES = new Set(["selon", "pourtant", "cependant", "donc", "ainsi", "toutefois", "neanmoins", "car", "puisque"]);
const PRONOUNS = new Set(["il", "elle", "ils", "elles", "ce", "cela", "dont", "qui", "que", "lequel", "laquelle", "lesquels"]);
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
    const tapsAfterKnown = word.status === "known" ? tapCountFor(word, taps) : 0;
    const failedInferences = failedInferenceCount(word, inferences);
    if ((word.status === "known" && tapsAfterKnown >= 2) || (word.lastReviewResult === "incorrect" && (word.incorrectCount ?? 0) >= 2)) {
      return { word, state: "forgotten", reason: "Previously known, but recent behaviour suggests it is slipping." };
    }
    if ((word.incorrectCount ?? 0) > 0 || failedInferences > 0 || tapCountFor(word, taps) >= 3) {
      return { word, state: "fragile", reason: "Repeated lookups or missed answers make this worth isolating." };
    }
    if (word.status === "known" || (word.correctCount ?? 0) >= 3) {
      return { word, state: "stable", reason: "Several successful reviews or an explicit known mark." };
    }
    return { word, state: "emerging", reason: "Still building recognition; context review is useful." };
  });
}

function articleContainsWord(article: ReadingText, word: SavedWord): boolean {
  const haystack = normalise(`${article.title} ${article.preview} ${article.body}`);
  const keys = [word.word, word.lemma ?? ""].map(normalise).filter(Boolean);
  return keys.some((key) => new RegExp(`(^|[^\\p{L}])${escapeRegExp(key)}([^\\p{L}]|$)`, "u").test(haystack));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildContextualReviewArticles(articles: ReadingText[], words: SavedWord[], taps: StoredWordTap[] = [], limit = 4): ContextualReviewArticle[] {
  const states = classifyVocabularyStates(words, taps);
  const due = states.filter(({ word }) => word.status !== "known" && isDue(word)).map(({ word }) => word);
  const stateByWord = new Map(states.map((item) => [item.word.word, item.state]));
  return articles
    .map((article) => {
      const dueWords = due.filter((word) => articleContainsWord(article, word)).slice(0, 6);
      return {
        article,
        dueWords,
        fragileCount: dueWords.filter((word) => stateByWord.get(word.word) === "fragile" || stateByWord.get(word.word) === "forgotten").length,
        emergingCount: dueWords.filter((word) => stateByWord.get(word.word) === "emerging").length,
      };
    })
    .filter((entry) => entry.dueWords.length > 0)
    .sort((a, b) => b.dueWords.length - a.dueWords.length || b.fragileCount - a.fragileCount)
    .slice(0, limit);
}

function weekStartMs(now = new Date()): number {
  return now.getTime() - 7 * 24 * 60 * 60 * 1000;
}

function estimateArchiveWordCount(entry: ArchiveEntry): number {
  return typeof entry.wordCount === "number" ? entry.wordCount : Math.max(120, (entry.minutes ?? 2) * 170);
}

function coveragePercent(knownCount: number, learningCount: number): number {
  if (knownCount + learningCount === 0) return 0;
  return Math.round((knownCount / (knownCount + learningCount)) * 100);
}

export function buildWeeklyReadingReport(
  archive: ArchiveEntry[],
  words: SavedWord[],
  knownWords: string[],
  budgetRecords: TranslationBudgetRecord[] = [],
  now = new Date()
): WeeklyReadingReport {
  const start = weekStartMs(now);
  const weekEntries = archive.filter((entry) => new Date(entry.completedAt).getTime() >= start);
  const weekWords = words.filter((word) => new Date(word.savedAt).getTime() >= start);
  const states = classifyVocabularyStates(words);
  const categoryCounts = new Map<string, number>();
  for (const entry of weekEntries) {
    if (entry.category) categoryCounts.set(entry.category, (categoryCounts.get(entry.category) ?? 0) + 1);
  }
  const strongestTopic = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const difficultArea =
    weekWords.length === 0
      ? null
      : weekWords.some((word) => PRONOUNS.has(normalise(word.lemma ?? word.word)))
        ? "object pronouns"
        : weekWords.some((word) => CONNECTIVES.has(normalise(word.lemma ?? word.word)))
          ? "connective expressions"
          : "new article vocabulary";
  const nextFocus =
    states.some((item) => item.state === "fragile" && CONNECTIVES.has(normalise(item.word.lemma ?? item.word.word)))
      ? "connective expressions"
      : states.some((item) => item.state === "fragile" && PRONOUNS.has(normalise(item.word.lemma ?? item.word.word)))
        ? "pronoun references"
        : weekEntries.length > 0 || weekWords.length > 0
          ? "one short article with five deliberate lookups"
          : null;
  const stableThisWeek = states.filter((item) => item.state === "stable" && item.word.lastReviewedAt && new Date(item.word.lastReviewedAt).getTime() >= start).length;
  const currentCoverage = coveragePercent(knownWords.length, words.filter((word) => word.status !== "known").length);
  const startCoverage = Math.max(0, currentCoverage - Math.min(8, stableThisWeek + Math.floor(weekWords.length / 8)));
  const weekBudgets = budgetRecords.filter((record) => new Date(record.completedAt).getTime() >= start);

  return {
    articlesCompleted: weekEntries.length,
    frenchWordsRead: weekEntries.reduce((sum, entry) => sum + estimateArchiveWordCount(entry), 0),
    coverageStart: startCoverage,
    coverageEnd: currentCoverage,
    movedToStable: stableThisWeek,
    mostDifficultArea: difficultArea,
    strongestTopic: strongestTopic ? formatCategory(strongestTopic) : null,
    nextFocus,
    translationBudgetMet: weekBudgets.filter((record) => record.metTarget).length,
    translationBudgetTotal: weekBudgets.length,
  };
}

const CEFR_BY_SCORE = ["A1", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C1+", "C2"];

export function buildCategoryProficiency(archive: ArchiveEntry[], knownWords: string[]): CategoryProficiency[] {
  const categories: Category[] = ["sport", "science", "culture", "news-style", "everyday life"];
  return categories.flatMap((category) => {
    const entries = archive.filter((entry) => entry.category === category);
    if (entries.length === 0) return [];
    const recent = entries.slice(-5);
    const avgCefr =
      recent.reduce((sum, entry) => sum + ({ A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 }[entry.cefr ?? ""] ?? 2), 0) /
      Math.max(1, recent.length);
    const completionBonus = Math.min(1.5, entries.length / 4);
    const knownBonus = Math.min(1, knownWords.length / 300);
    const score = Math.max(0, Math.min(CEFR_BY_SCORE.length - 1, Math.round(avgCefr + completionBonus + knownBonus) - 1));
    return [{
      category,
      label: formatCategory(category),
      cefr: CEFR_BY_SCORE[score],
      articles: entries.length,
      coverage: Math.min(98, Math.round(72 + entries.length * 3 + knownWords.length / 25)),
    }];
  });
}

export function estimateArticleCoverage(text: ReadingText, knownWords: Set<string>): number {
  return Math.round(estimateDifficulty(text.body, knownWords).dictionaryCoverage * 100);
}
