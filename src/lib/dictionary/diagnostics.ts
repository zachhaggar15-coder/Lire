import { resolveWithCandidates, type ResolveMeaningInput, type ResolutionOutcome } from "@/lib/dictionary/resolveMeaning";

/**
 * Why the resolver chose what it chose.
 *
 * Candidate scoring is a real improvement over the old cascade, but it trades
 * one debugging problem for another: with a cascade you could at least read
 * the code top-down and see which branch fired, whereas a weighted field gives
 * no such narrative. When a reader reports "Sorlio said the wrong thing here",
 * the question is which candidates existed, what each scored, and what
 * evidence moved them — and that has to be answerable without a debugger.
 *
 * Development only. Nothing here is imported by the reader UI; the whole point
 * of the architecture is that the learner sees one meaning and none of this.
 */

export interface ResolutionExplanation {
  sentence: string;
  tapped: string;
  winner: string;
  score: number;
  confidence: string;
  margin: number | null;
  escalates: boolean;
  abstained: boolean;
  evidence: string[];
  rejected: { english: string; score: number; source: string; evidence: string[] }[];
}

export function explainResolution(input: ResolveMeaningInput): ResolutionExplanation {
  const outcome = resolveWithCandidates(input);
  return toExplanation(outcome);
}

export function toExplanation(outcome: ResolutionOutcome): ResolutionExplanation {
  const { meaning, candidates, runnerUpScore } = outcome;
  const best = candidates[0] ?? null;
  return {
    sentence: meaning.contextSentence,
    tapped: meaning.tappedText,
    winner: meaning.abstained ? "(abstained)" : `${meaning.displayFrench} → ${meaning.displayEnglish}`,
    score: best ? round(best.score) : 0,
    confidence: meaning.confidence,
    margin: best && runnerUpScore !== null ? round(best.score - runnerUpScore) : null,
    escalates: meaning.wantsAiEscalation,
    abstained: meaning.abstained,
    evidence: best?.candidate.evidence ?? [],
    rejected: candidates.slice(1, 6).map((entry) => ({
      english: entry.candidate.english,
      score: round(entry.score),
      source: entry.candidate.source,
      evidence: entry.candidate.evidence,
    })),
  };
}

/** Human-readable form, for pasting into a bug report or reading in a terminal. */
export function formatExplanation(explanation: ResolutionExplanation): string {
  const lines: string[] = [];
  lines.push(`sentence: ${explanation.sentence}`);
  lines.push(`tapped:   ${explanation.tapped}`);
  lines.push(`winner:   ${explanation.winner}`);
  lines.push(
    `score:    ${explanation.score}  confidence: ${explanation.confidence}` +
      (explanation.margin !== null ? `  margin: ${explanation.margin}` : "  margin: (uncontested)") +
      (explanation.escalates ? "  [escalates]" : "")
  );
  if (explanation.evidence.length > 0) {
    lines.push("evidence:");
    for (const item of explanation.evidence) lines.push(`  + ${item}`);
  }
  if (explanation.rejected.length > 0) {
    lines.push("rejected:");
    for (const item of explanation.rejected) {
      lines.push(`  - "${item.english}" ${item.score} (${item.source})`);
    }
  }
  return lines.join("\n");
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
