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
