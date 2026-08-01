import type { ReadingText } from "@/types";
import { allSentencesInText, type TextSentence } from "@/lib/practice/textSentences";
import {
  buildReconstructionExercise,
  isEligibleForReconstruction,
  shuffleChips,
  type SentenceReconstructionExercise,
} from "@/lib/practice/sentenceReconstruction";
import { buildWordCloze, buildPhraseCloze, distractorPoolFromBody, type ClozeExercise } from "@/lib/practice/cloze";
import { buildGrammarNotes, type GrammarNote } from "@/lib/practice/grammarNotes";
import { canSpeak } from "@/lib/speech";

export type PracticeActivity =
  | { kind: "reconstruction"; exercise: SentenceReconstructionExercise }
  | { kind: "cloze"; exercise: ClozeExercise };

export interface PracticePlan {
  activities: PracticeActivity[];
  grammarNotes: GrammarNote[];
  listeningAvailable: boolean;
}

/** Builds a short practice session from a completed reading. Degrades gracefully — a very
 * short or unusual text may only yield one or two activities, never a broken/empty screen
 * unless truly nothing is eligible (in which case activities is empty and the caller should
 * hide the "Practice this text" entry point entirely). */
export function buildPracticePlan(text: ReadingText): PracticePlan {
  const sentences = allSentencesInText(text);
  const eligible = sentences.filter(isEligibleForReconstruction);
  const activities: PracticeActivity[] = [];
  const usedForCloze = new Set<number>();

  // 1) Sentence reconstruction, from the eligible pool.
  let reconstructionSentence: TextSentence | null = null;
  if (eligible.length > 0) {
    reconstructionSentence = eligible[Math.floor(Math.random() * eligible.length)];
    activities.push({ kind: "reconstruction", exercise: buildReconstructionExercise(reconstructionSentence) });
    usedForCloze.add(reconstructionSentence.index);
  }

  // 2) Word cloze + 3) phrase cloze, from sentences with real content words, excluding the
  // one already used for reconstruction so the same sentence isn't reused three times.
  const clozeCandidates = sentences.filter((s) => !usedForCloze.has(s.index) && s.tokens.some((t) => t.isWord && t.clean.length >= 3));
  const shuffledCandidates = [...clozeCandidates].sort(() => Math.random() - 0.5);

  for (const sentence of shuffledCandidates) {
    if (activities.filter((a) => a.kind === "cloze" && a.exercise.kind === "word").length >= 1) break;
    const pool = distractorPoolFromBody(text.body, sentence.index, sentences);
    const cloze = buildWordCloze(sentence, pool);
    if (cloze) {
      activities.push({ kind: "cloze", exercise: cloze });
      usedForCloze.add(sentence.index);
      break;
    }
  }

  for (const sentence of shuffledCandidates) {
    if (usedForCloze.has(sentence.index)) continue;
    if (activities.filter((a) => a.kind === "cloze" && a.exercise.kind === "phrase").length >= 1) break;
    const pool = distractorPoolFromBody(text.body, sentence.index, sentences);
    const cloze = buildPhraseCloze(sentence, pool);
    if (cloze) {
      activities.push({ kind: "cloze", exercise: cloze });
      usedForCloze.add(sentence.index);
      break;
    }
  }

  return {
    activities,
    grammarNotes: buildGrammarNotes(sentences),
    listeningAvailable: canSpeak(),
  };
}

/** Prepares a shuffled copy of a reconstruction exercise's chips for display — call once per attempt. */
export function shuffledChipsFor(exercise: SentenceReconstructionExercise) {
  return shuffleChips(exercise.chips);
}
