import type { SavedWord } from "@/types";

/**
 * Review membership for vocabulary: the one answer every screen uses.
 *
 * A word is either in Review or it is not. The reader offers exactly "Add to
 * review" or "Remove from review" from this, never a third state.
 *
 * This replaced a model where the reader asked three stores — saved words,
 * their status, and a list of "known" words seeded from the chosen CEFR level
 * — and let the known list win. A word the learner had saved could show
 * "Already known" with no way to remove it, and a word from the level's
 * assumed vocabulary could not be added at all. What a learner is estimated
 * to know (src/lib/vocabulary/estimatedVocabulary.ts) informs difficulty and
 * recommendations only; it never decides membership.
 *
 * Identity: a card belongs to a tapped word when its saved form is that form,
 * or when both have the same lemma ("vais", "va" and "allé" all reach the
 * "aller" card). The lemma used is the one the reader resolved for the tap,
 * so the control shown and the card a tap changes are always the same card.
 */

/** In Review: not removed, and not the legacy "known" state. */
export function isInReview(card: Pick<SavedWord, "status" | "removedFromReviewAt">): boolean {
  return card.status !== "known" && !card.removedFromReviewAt;
}

/** Mastery from review history: three correct answers in a row (or a legacy graduated card). */
export const MASTERY_STREAK = 3;

export function isMastered(card: Pick<SavedWord, "status" | "correctCount">): boolean {
  return card.status === "known" || (card.correctCount ?? 0) >= MASTERY_STREAK;
}

function key(value: string | null | undefined): string | null {
  const trimmed = value?.trim().toLowerCase();
  return trimmed ? trimmed : null;
}

/** Every card (in Review or not) that is the vocabulary item for this form/lemma. */
export function findVocabularyCards(words: SavedWord[], form: string, lemma: string | null | undefined): SavedWord[] {
  return new VocabularyIndex(words).cards(form, lemma);
}

/** Indexes cards by form and lemma, so the reader can ask per token without scanning every card. */
export class VocabularyIndex {
  private readonly byForm = new Map<string, SavedWord[]>();
  private readonly byLemma = new Map<string, SavedWord[]>();

  constructor(words: SavedWord[]) {
    for (const card of words) {
      const form = key(card.word);
      if (form) this.byForm.set(form, [...(this.byForm.get(form) ?? []), card]);
      const lemma = key(card.lemma);
      if (lemma) this.byLemma.set(lemma, [...(this.byLemma.get(lemma) ?? []), card]);
    }
  }

  cards(form: string, lemma: string | null | undefined): SavedWord[] {
    const out = [...(this.byForm.get(key(form) ?? "") ?? [])];
    const lemmaKey = key(lemma);
    for (const card of lemmaKey ? this.byLemma.get(lemmaKey) ?? [] : []) if (!out.includes(card)) out.push(card);
    return out;
  }

  /** The card in Review for this word, preferring the exact form; null when the word is not in Review. */
  activeCard(form: string, lemma: string | null | undefined): SavedWord | null {
    const active = this.cards(form, lemma).filter(isInReview);
    return active.find((card) => key(card.word) === key(form)) ?? active[0] ?? null;
  }

  inReview(form: string, lemma: string | null | undefined): boolean {
    return this.activeCard(form, lemma) !== null;
  }
}

export function isVocabularyInReview(words: SavedWord[], form: string, lemma: string | null | undefined): boolean {
  return new VocabularyIndex(words).inReview(form, lemma);
}

export type ReviewControl = "add" | "remove" | "close";

/**
 * The word sheet's one review control. A normal word gets exactly "Add to
 * review" or "Remove from review", from membership alone. Two kinds of tap
 * are not vocabulary that can be added, and only close: a name or place, and
 * a word Sorlio could find no meaning for (a card with no answer is no use in
 * Review). If such a word is already in Review it can still be removed.
 */
export function reviewControlFor(options: { inReview: boolean; isProperNoun: boolean; noMeaning?: boolean }): ReviewControl {
  if (options.inReview && !options.isProperNoun) return "remove";
  if (options.isProperNoun || options.noMeaning) return "close";
  return "add";
}

export const REVIEW_CONTROL_LABEL: Record<ReviewControl, string> = {
  add: "Add to review",
  remove: "Remove from review",
  close: "Close",
};
