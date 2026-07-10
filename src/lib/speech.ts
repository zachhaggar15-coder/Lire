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
