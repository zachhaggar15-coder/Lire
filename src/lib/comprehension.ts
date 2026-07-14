import type { ReadingText } from "@/types";

export interface MultipleChoiceQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

export interface ToneQuestion extends MultipleChoiceQuestion {
  kind: "stance" | "tone" | "confidence";
}

const STOPWORDS = new Set([
  "avec",
  "dans",
  "des",
  "du",
  "elle",
  "est",
  "les",
  "leur",
  "mais",
  "par",
  "pas",
  "pour",
  "que",
  "qui",
  "sur",
  "une",
  "the",
  "and",
  "for",
  "that",
  "this",
  "with",
]);

function cleanWords(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .match(/[\p{L}\p{N}]+/gu)
    ?.filter((word) => word.length > 2 && !STOPWORDS.has(word)) ?? [];
}

function keywordSet(text: ReadingText): Set<string> {
  return new Set(cleanWords(`${text.title} ${text.preview} ${text.blurbEn ?? ""}`).slice(0, 18));
}

function overlapScore(a: ReadingText, b: ReadingText): number {
  const aWords = keywordSet(a);
  const bWords = keywordSet(b);
  let overlap = 0;
  for (const word of aWords) {
    if (bWords.has(word)) overlap++;
  }
  const sourceBonus = a.sourceName && b.sourceName && a.sourceName !== b.sourceName ? 1.5 : 0;
  const categoryBonus = a.category === b.category ? 0.75 : 0;
  return overlap + sourceBonus + categoryBonus;
}

export function findRelatedArticles(current: ReadingText, candidates: ReadingText[], limit = 3): ReadingText[] {
  const seenSources = new Set<string>();
  if (current.sourceName) seenSources.add(current.sourceName);

  const scored = candidates
    .filter((candidate) => candidate.id !== current.id)
    .map((candidate) => ({ candidate, score: overlapScore(current, candidate) }))
    .filter(({ score }) => score >= 2)
    .sort((a, b) => b.score - a.score);

  const picked: ReadingText[] = [];
  for (const { candidate } of scored) {
    if (candidate.sourceName && seenSources.has(candidate.sourceName)) continue;
    picked.push(candidate);
    if (candidate.sourceName) seenSources.add(candidate.sourceName);
    if (picked.length >= limit) break;
  }
  return picked;
}

function gist(text: ReadingText): string {
  if (text.blurbEn) return text.blurbEn.split(/(?<=[.!?])\s+/)[0];
  return text.preview;
}

function distractorFor(text: ReadingText, fallback: string): string {
  const summary = gist(text);
  return summary.length > 120 ? `${summary.slice(0, 117).trim()}...` : summary || fallback;
}

export function buildGistQuestion(current: ReadingText, candidates: ReadingText[]): MultipleChoiceQuestion {
  const correct = distractorFor(current, current.preview);
  const distractors = candidates
    .filter((candidate) => candidate.id !== current.id)
    .sort((a, b) => overlapScore(current, b) - overlapScore(current, a))
    .map((candidate) => distractorFor(candidate, candidate.preview))
    .filter((choice) => choice && choice !== correct);
  const backup = [
    "The article mainly presents a personal travel story with no wider public issue.",
    "The article mainly reports a sports result and reactions from fans.",
    "The article mainly explains a scientific discovery and its health effects.",
  ];
  const choices = [correct, ...distractors, ...backup].filter((choice, index, arr) => arr.indexOf(choice) === index).slice(0, 4);
  while (choices.length < 4) choices.push(backup[choices.length % backup.length]);
  return {
    id: `gist-${current.id}`,
    prompt: "What is the general gist of the article?",
    choices,
    answerIndex: 0,
    explanation: "The correct answer matches the article title, preview, and opening summary.",
  };
}

function containsAny(text: string, words: string[]): boolean {
  const clean = text.toLowerCase();
  return words.some((word) => clean.includes(word));
}

export function buildToneQuestions(text: ReadingText): ToneQuestion[] {
  const sample = `${text.title} ${text.preview} ${text.body.slice(0, 1200)}`;
  const alarmist = containsAny(sample, ["crise", "grave", "urgence", "danger", "alerte", "menace"]);
  const critical = containsAny(sample, ["critique", "conteste", "inquiet", "difficile", "problème", "risque"]);
  const supportive = containsAny(sample, ["succès", "excellent", "aider", "améliorer", "encourager", "apprécie"]);
  const cautious = containsAny(sample, ["pourrait", "selon", "peut-être", "prud", "étudie", "essai"]);

  const toneAnswer = alarmist ? 3 : critical ? 2 : supportive ? 1 : 0;
  const stanceAnswer = supportive && !critical ? 1 : critical ? 0 : 2;
  const confidenceAnswer = cautious ? 1 : 0;

  return [
    {
      id: `tone-${text.id}`,
      kind: "tone",
      prompt: "What tone does the article mostly use?",
      choices: ["Neutral", "Amused", "Critical", "Alarmist"],
      answerIndex: toneAnswer,
      explanation: "Look for loaded words, cautious modal verbs, and whether the article reports or argues.",
    },
    {
      id: `stance-${text.id}`,
      kind: "stance",
      prompt: "Does the author sound sceptical or supportive?",
      choices: ["Sceptical", "Supportive", "Mostly neutral"],
      answerIndex: stanceAnswer,
      explanation: "A news-style article often stays neutral even when it quotes people with strong opinions.",
    },
    {
      id: `confidence-${text.id}`,
      kind: "confidence",
      prompt: "Does the article sound certain or cautious?",
      choices: ["Confident", "Cautious", "Sarcastic"],
      answerIndex: confidenceAnswer,
      explanation: "Words like pourrait, selon, essai, and étudié usually signal caution rather than certainty.",
    },
  ];
}
