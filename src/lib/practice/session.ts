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

/** Up to this many distinct sentences get turned into an activity per session. */
const MAX_ACTIVITIES = 5;

/** Builds a short practice session from a completed reading, targeting up to
 * MAX_ACTIVITIES activities drawn from distinct sentences. Degrades gracefully — a
 * short or unusual text may only yield one or two activities, never a broken/empty
 * screen unless truly nothing is eligible (in which case activities is empty and the
 * caller should hide the "Practice this text" entry point entirely). */
export function buildPracticePlan(text: ReadingText): PracticePlan {
  const sentences = allSentencesInText(text);
  const eligibleForReconstruction = shuffle(sentences.filter(isEligibleForReconstruction));
  const clozeEligible = (used: Set<number>) =>
    shuffle(sentences.filter((s) => !used.has(s.index) && s.tokens.some((t) => t.isWord && t.clean.length >= 3)));

  const activities: PracticeActivity[] = [];
  const used = new Set<number>();

  // Round-robin between reconstruction, word cloze, and phrase cloze so a longer
  // article's practice set isn't dominated by one activity type, each drawn from a
  // sentence not already used elsewhere in this session.
  const builders: Array<(sentence: TextSentence) => PracticeActivity | null> = [
    (sentence) => ({ kind: "reconstruction", exercise: buildReconstructionExercise(sentence) }),
    (sentence) => {
      const pool = distractorPoolFromBody(text.body, sentence.index, sentences);
      const cloze = buildWordCloze(sentence, pool);
      return cloze ? { kind: "cloze", exercise: cloze } : null;
    },
    (sentence) => {
      const pool = distractorPoolFromBody(text.body, sentence.index, sentences);
      const cloze = buildPhraseCloze(sentence, pool);
      return cloze ? { kind: "cloze", exercise: cloze } : null;
    },
  ];

  let reconstructionPoolIndex = 0;
  let builderIndex = 0;
  let stalePasses = 0;
  while (activities.length < MAX_ACTIVITIES && stalePasses < builders.length) {
    const builder = builders[builderIndex % builders.length];
    builderIndex++;
    const isReconstruction = builder === builders[0];
    const candidates = isReconstruction ? eligibleForReconstruction.slice(reconstructionPoolIndex) : clozeEligible(used);
    const sentence = candidates.find((s) => !used.has(s.index));
    if (!sentence) {
      stalePasses++;
      continue;
    }
    const activity = builder(sentence);
    if (!activity) {
      stalePasses++;
      continue;
    }
    activities.push(activity);
    used.add(sentence.index);
    if (isReconstruction) reconstructionPoolIndex = eligibleForReconstruction.indexOf(sentence) + 1;
    stalePasses = 0;
  }

  return {
    activities,
    grammarNotes: buildGrammarNotes(sentences),
    listeningAvailable: canSpeak(),
  };
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Prepares a shuffled copy of a reconstruction exercise's chips for display — call once per attempt. */
export function shuffledChipsFor(exercise: SentenceReconstructionExercise) {
  return shuffleChips(exercise.chips);
}
