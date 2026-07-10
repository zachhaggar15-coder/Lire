export type SpeechRate = "slow" | "normal";

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function speakFrench(text: string, rate: SpeechRate = "normal"): boolean {
  if (!canSpeak() || !text.trim()) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = "fr-FR";
  utterance.rate = rate === "slow" ? 0.72 : 0.95;
  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Reads a whole article aloud, one paragraph at a time, rather than as one
 * giant utterance — some browsers (Chrome in particular) silently truncate
 * a single SpeechSynthesisUtterance somewhere past ~32k characters, which a
 * full article can approach. Queuing one utterance per paragraph sidesteps
 * that entirely: speechSynthesis.speak() already plays queued utterances
 * back-to-back, so this just needs to enqueue them all up front.
 *
 * Calls onEnd once when the last paragraph finishes, or immediately if
 * playback is cancelled/interrupted (e.g. via stopSpeaking) — so a caller
 * can reliably reset a "playing" UI state either way.
 */
export function speakFrenchParagraphs(paragraphs: string[], rate: SpeechRate = "normal", onEnd?: () => void): boolean {
  const clean = paragraphs.map((p) => p.trim()).filter(Boolean);
  if (!canSpeak() || clean.length === 0) return false;
  window.speechSynthesis.cancel();

  clean.forEach((paragraph, index) => {
    const utterance = new SpeechSynthesisUtterance(paragraph);
    utterance.lang = "fr-FR";
    utterance.rate = rate === "slow" ? 0.72 : 0.95;
    if (index === clean.length - 1 && onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  });
  return true;
}

/** Immediately stops any in-progress speakFrench/speakFrenchParagraphs playback. */
export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}
