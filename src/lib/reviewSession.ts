export type WordReviewConfirmationPasses = Record<string, number>;

export type TypedWordCorrectOutcome = "repeat" | "known";

export interface TypedWordCorrectPassResult {
  outcome: TypedWordCorrectOutcome;
  confirmationPasses: WordReviewConfirmationPasses;
}

export function getTypedWordCorrectPasses(passes: WordReviewConfirmationPasses, wordKey: string): number {
  return passes[wordKey] ?? 0;
}

export function clearTypedWordCorrectPass(
  passes: WordReviewConfirmationPasses,
  wordKey: string
): WordReviewConfirmationPasses {
  if (!(wordKey in passes)) return passes;
  const { [wordKey]: _removed, ...rest } = passes;
  return rest;
}

export function applyTypedWordCorrectPass(
  passes: WordReviewConfirmationPasses,
  wordKey: string
): TypedWordCorrectPassResult {
  const currentPasses = getTypedWordCorrectPasses(passes, wordKey);

  if (currentPasses >= 1) {
    return {
      outcome: "known",
      confirmationPasses: clearTypedWordCorrectPass(passes, wordKey),
    };
  }

  return {
    outcome: "repeat",
    confirmationPasses: {
      ...passes,
      [wordKey]: currentPasses + 1,
    },
  };
}
