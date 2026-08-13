import { getSettings } from "@/lib/settings";

export type SpeechRate = "slow" | "normal";

const BASE_RATES: Record<SpeechRate, number> = { slow: 0.72, normal: 0.95 };

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

/** Every French (fr-*) voice the browser currently has loaded. May be empty on the very first call — see getFrenchVoices' caller-side voiceschanged note. */
export function getFrenchVoices(): SpeechSynthesisVoice[] {
  if (!canSpeak()) return [];
  return window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("fr"));
}

/** The reader's preferred French voice (by saved voiceURI), falling back to the browser's first available French voice, or null to let the browser pick entirely on its own. */
function getPreferredVoice(): SpeechSynthesisVoice | null {
  const voices = getFrenchVoices();
  if (voices.length === 0) return null;
  const preferredURI = getSettings().speechVoiceURI;
  return (preferredURI && voices.find((v) => v.voiceURI === preferredURI)) || voices[0];
}

/** Applies the reader's overall speed preference (settings.speechRate) on top of a "slow"/"normal" base rate, so the two stay distinguishable at any preferred speed. */
function effectiveRate(rate: SpeechRate): number {
  return BASE_RATES[rate] * getSettings().speechRate;
}

function configureUtterance(utterance: SpeechSynthesisUtterance, rate: SpeechRate): void {
  utterance.lang = "fr-FR";
  utterance.rate = effectiveRate(rate);
  const voice = getPreferredVoice();
  if (voice) utterance.voice = voice;
}

export function speakFrench(text: string, rate: SpeechRate = "normal"): boolean {
  if (!canSpeak() || !text.trim()) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.trim());
  configureUtterance(utterance, rate);
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
    configureUtterance(utterance, rate);
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

/**
 * Speaks a single paragraph at an exact rate multiplier (not the slow/normal
 * preset pair) — used by the listening-practice player, which needs its own
 * speed slider independent of the reader's global speech-rate setting.
 */
export function speakParagraphAtRate(text: string, rateMultiplier: number, onEnd?: () => void): boolean {
  const clean = text.trim();
  if (!canSpeak() || !clean) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "fr-FR";
  utterance.rate = rateMultiplier;
  const voice = getPreferredVoice();
  if (voice) utterance.voice = voice;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Queues every paragraph from startIndex onward as separate utterances via
 * back-to-back speak() calls (same technique speakFrenchParagraphs already
 * uses), rather than speaking one paragraph and waiting for its onend to
 * cancel+speak the next. The browser's own speech queue plays queued
 * utterances back-to-back with minimal gap; reactively cancelling and
 * re-speaking after each one (the previous approach) introduces an extra,
 * more noticeable pause at every paragraph boundary, which reads as
 * separate readings instead of one continuous narration.
 */
export function speakParagraphsFromRate(
  paragraphs: string[],
  startIndex: number,
  rateMultiplier: number,
  onParagraphStart: (index: number) => void,
  onEnd: () => void
): boolean {
  if (!canSpeak() || startIndex >= paragraphs.length) return false;
  window.speechSynthesis.cancel();
  const voice = getPreferredVoice();
  let queued = false;
  for (let i = startIndex; i < paragraphs.length; i++) {
    const clean = paragraphs[i].trim();
    if (!clean) continue;
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "fr-FR";
    utterance.rate = rateMultiplier;
    if (voice) utterance.voice = voice;
    utterance.onstart = () => onParagraphStart(i);
    if (i === paragraphs.length - 1) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }
    window.speechSynthesis.speak(utterance);
    queued = true;
  }
  return queued;
}
