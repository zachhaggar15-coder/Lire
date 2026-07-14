import type { ReadingText } from "@/types";

export interface MultipleChoiceQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation?: string;
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

const SIGNALS = {
  alarmist: ["alerte", "catastrophe", "crise", "danger", "grave", "menace", "panique", "urgence"],
  amused: ["amusant", "amuse", "drole", "humour", "sourire"],
  critical: ["accuse", "conteste", "critique", "denonce", "difficile", "inquiet", "inquiete", "probleme", "risque"],
  supportive: ["aide", "aider", "ameliore", "ameliorer", "apprecie", "encourage", "reussite", "salue", "succes"],
  cautious: ["devrait", "essai", "estime", "etudie", "eventuel", "possible", "pourrait", "prudence", "selon", "semble"],
  confident: ["affirme", "assure", "certain", "confirme", "demontre", "prouve", "sans doute"],
} as const;

function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function cleanWords(text: string): string[] {
  return (
    normalise(text)
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter((word) => word.length > 2 && !STOPWORDS.has(word)) ?? []
  );
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
  };
}

function matchSignals(text: string, words: readonly string[]): string[] {
  const clean = normalise(text);
  return words.filter((word) => clean.includes(normalise(word)));
}

function evidenceList(words: string[]): string {
  const picked = words.slice(0, 3);
  if (picked.length === 0) return "";
  if (picked.length === 1) return picked[0];
  if (picked.length === 2) return `${picked[0]} and ${picked[1]}`;
  return `${picked[0]}, ${picked[1]}, and ${picked[2]}`;
}

function strongest(matches: Record<string, string[]>, orderedLabels: string[]): { label: string; words: string[] } {
  let best = orderedLabels[0];
  for (const label of orderedLabels) {
    if ((matches[label]?.length ?? 0) > (matches[best]?.length ?? 0)) best = label;
  }
  return { label: best, words: matches[best] ?? [] };
}

export function buildToneQuestions(text: ReadingText): ToneQuestion[] {
  const sample = `${text.title} ${text.preview} ${text.body.slice(0, 1200)}`;
  const matches = {
    alarmist: matchSignals(sample, SIGNALS.alarmist),
    amused: matchSignals(sample, SIGNALS.amused),
    critical: matchSignals(sample, SIGNALS.critical),
    supportive: matchSignals(sample, SIGNALS.supportive),
    cautious: matchSignals(sample, SIGNALS.cautious),
    confident: matchSignals(sample, SIGNALS.confident),
  };

  const tone = strongest(matches, ["alarmist", "critical", "amused"]);
  const toneAnswer = tone.words.length === 0 ? 0 : tone.label === "amused" ? 1 : tone.label === "critical" ? 2 : 3;
  const toneExplanation =
    tone.words.length === 0
      ? "The article mostly reports facts without enough loaded language to make the tone amused, critical, or alarmist."
      : tone.label === "alarmist"
        ? `Words like ${evidenceList(tone.words)} make the article sound alarmist.`
        : tone.label === "critical"
          ? `Words like ${evidenceList(tone.words)} make the article sound critical.`
          : `Words like ${evidenceList(tone.words)} make the article sound amused.`;

  const stanceAnswer =
    matches.critical.length > matches.supportive.length
      ? 0
      : matches.supportive.length > matches.critical.length
        ? 1
        : 2;
  const stanceExplanation =
    stanceAnswer === 0
      ? `Critical markers such as ${evidenceList(matches.critical)} make the author sound sceptical.`
      : stanceAnswer === 1
        ? `Positive markers such as ${evidenceList(matches.supportive)} make the author sound supportive.`
        : "The article does not show a strong sceptical or supportive stance; it mainly reports the situation.";

  const confidenceAnswer =
    matches.cautious.length > matches.confident.length
      ? 1
      : matches.confident.length > matches.cautious.length
        ? 0
        : 2;
  const confidenceExplanation =
    confidenceAnswer === 1
      ? `Words like ${evidenceList(matches.cautious)} signal caution rather than certainty.`
      : confidenceAnswer === 0
        ? `Words like ${evidenceList(matches.confident)} signal confidence rather than caution.`
        : "There are not enough clear confidence or caution markers in the article excerpt to choose one strongly.";

  return [
    {
      id: `tone-${text.id}`,
      kind: "tone",
      prompt: "What tone does the article mostly use?",
      choices: ["Neutral", "Amused", "Critical", "Alarmist"],
      answerIndex: toneAnswer,
      explanation: toneExplanation,
    },
    {
      id: `stance-${text.id}`,
      kind: "stance",
      prompt: "Does the author sound sceptical or supportive?",
      choices: ["Sceptical", "Supportive", "Mostly neutral"],
      answerIndex: stanceAnswer,
      explanation: stanceExplanation,
    },
    {
      id: `confidence-${text.id}`,
      kind: "confidence",
      prompt: "Does the article sound certain or cautious?",
      choices: ["Confident", "Cautious", "Not enough evidence"],
      answerIndex: confidenceAnswer,
      explanation: confidenceExplanation,
    },
  ];
}
