/**
 * One-time contextual tips shown inside real lessons (not the tutorial), so a
 * learner who skipped the walkthrough still gets the two things that matter
 * most: tap a word, and saved words go to Review. Each tip is shown once per
 * device and never again.
 */

export const READER_TIPS_KEY = "lire.readerTips.v1";

export type ReaderTipId = "tap-word" | "first-save";

function readSeen(): Partial<Record<ReaderTipId, true>> {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(READER_TIPS_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** True when storage is unavailable, so a broken store never makes tips nag on every visit. */
export function hasSeenReaderTip(id: ReaderTipId): boolean {
  if (typeof window === "undefined" || !window.localStorage) return true;
  return readSeen()[id] === true;
}

export function markReaderTipSeen(id: ReaderTipId): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(READER_TIPS_KEY, JSON.stringify({ ...readSeen(), [id]: true }));
  } catch {
    // Best-effort — worst case the tip shows once more.
  }
}
