const PLAY_COUNT_KEY = "lire.audioPlayCount.v1";
const TIP_SEEN_KEY = "lire.audioTipSeen.v1";

/** Shown only after the learner has used audio a few times, not on first use — see recordAudioPlayAndCheckTip. */
const PLAYS_BEFORE_TIP = 3;

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function getPlayCount(): number {
  if (!hasStorage()) return 0;
  const raw = window.localStorage.getItem(PLAY_COUNT_KEY);
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) ? value : 0;
}

function isTipSeen(): boolean {
  if (!hasStorage()) return true;
  return window.localStorage.getItem(TIP_SEEN_KEY) === "1";
}

export function markAudioTipSeen(): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(TIP_SEEN_KEY, "1");
}

/**
 * Call once per successful audio playback. Returns true exactly once — the
 * first time the play count crosses PLAYS_BEFORE_TIP and the tip hasn't been
 * shown yet — so the caller can surface "Try listening once before reading
 * the sentence" without repeating it on every later playback.
 */
export function recordAudioPlayAndCheckTip(): boolean {
  if (!hasStorage()) return false;
  const nextCount = getPlayCount() + 1;
  window.localStorage.setItem(PLAY_COUNT_KEY, String(nextCount));
  if (isTipSeen()) return false;
  return nextCount >= PLAYS_BEFORE_TIP;
}
