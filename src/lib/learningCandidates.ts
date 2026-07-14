import type { ReadingText, SavedWord } from "@/types";
import { lookupWord } from "@/lib/dictionary/lookup";
import { findPhraseTranslationMatch } from "@/lib/dictionary/articleTranslation";
import { getWordFamily } from "@/lib/dictionary/wordFamily";
import { tokenizeParagraphsToSentences, type SentenceGroup } from "@/lib/words";

export interface WordTapRecord {
  word: string;
  lemma: string | null;
  count: number;
}

export interface LearningCandidate {
  word: string;
  lemma: string;
  translation: string;
  reason: string;
  score: number;
  contextSentence: string;
  phrase: string | null;
  alreadySaved: boolean;
}

function frequencyScore(rank: number | null): number {
  if (!rank) return 8;
  if (rank <= 500) return 35;
  if (rank <= 1500) return 28;
  if (rank <= 3500) return 20;
  if (rank <= 7000) return 12;
  return 4;
}

function isUsefulPartOfSpeech(partOfSpeech: string | null): boolean {
  const pos = partOfSpeech?.toLowerCase() ?? "";
  return pos.includes("verb") || pos.includes("noun") || pos.includes("adjective") || pos.includes("adverb") || pos.includes("conjunction");
}

function familyKnownPenalty(lemma: string, knownWords: Set<string>): number {
  const family = getWordFamily(lemma);
  const relatives = [...family.noun, ...family.verb, ...family.adjective, ...family.adverb, ...family.relatedExpressions];
  return relatives.some((relative) => knownWords.has(relative.toLowerCase())) ? -8 : 0;
}

function phraseAt(sentence: SentenceGroup, tokenIndex: number): string | null {
  const phrase = findPhraseTranslationMatch(sentence.tokens, tokenIndex);
  if (!phrase) return null;
  return sentence.tokens.slice(tokenIndex, phrase.endIndex + 1).map((token) => token.text).join("").toLowerCase();
}

export function selectInferenceWords(text: ReadingText, knownWords: Set<string>, limit = 2): Set<string> {
  return new Set(
    rankLearningCandidates(text, knownWords, [], [], limit)
      .map((candidate) => candidate.lemma)
  );
}

export function rankLearningCandidates(
  text: ReadingText,
  knownWords: Set<string>,
  savedWords: SavedWord[],
  tapRecords: WordTapRecord[],
  limit = 6
): LearningCandidate[] {
  const savedKeys = new Set(savedWords.flatMap((word) => [word.word.toLowerCase(), word.lemma?.toLowerCase()].filter((value): value is string => !!value)));
  const tapsByLemma = new Map<string, number>();
  for (const tap of tapRecords) {
    const key = (tap.lemma ?? tap.word).toLowerCase();
    tapsByLemma.set(key, (tapsByLemma.get(key) ?? 0) + tap.count);
  }

  const byLemma = new Map<string, LearningCandidate>();
  const paragraphs = tokenizeParagraphsToSentences(text.body);
  for (const paragraph of paragraphs) {
    for (const sentence of paragraph) {
      sentence.tokens.forEach((token, tokenIndex) => {
        if (!token.isWord || token.clean.length < 3) return;
        const lookup = lookupWord(token.text);
        if (lookup.source !== "local" || !lookup.lemma || lookup.translations.length === 0) return;
        const lemma = lookup.lemma.toLowerCase();
        if (knownWords.has(token.clean) || knownWords.has(lemma)) return;
        if (!isUsefulPartOfSpeech(lookup.partOfSpeech)) return;

        const phrase = phraseAt(sentence, tokenIndex);
        const tapCount = tapsByLemma.get(lemma) ?? tapsByLemma.get(token.clean) ?? 0;
        const score =
          frequencyScore(lookup.frequencyRank) +
          tapCount * 12 +
          (phrase ? 12 : 0) +
          (text.category === "news-style" && ["conjunction", "adverb"].some((part) => lookup.partOfSpeech?.toLowerCase().includes(part)) ? 8 : 0) +
          familyKnownPenalty(lemma, knownWords);

        const existing = byLemma.get(lemma);
        if (existing && existing.score >= score) return;
        byLemma.set(lemma, {
          word: token.clean,
          lemma,
          translation: lookup.translations[0],
          reason: phrase
            ? `Useful phrase: ${phrase}`
            : tapCount > 0
              ? `You tapped it ${tapCount} ${tapCount === 1 ? "time" : "times"}`
              : lookup.frequencyRank && lookup.frequencyRank <= 3500
                ? "Common in general French"
                : "Useful for this article",
          score,
          contextSentence: sentence.text,
          phrase,
          alreadySaved: savedKeys.has(token.clean) || savedKeys.has(lemma),
        });
      });
    }
  }

  return [...byLemma.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
