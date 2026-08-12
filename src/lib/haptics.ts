"use client";

export type HapticKind = "selection" | "confirm" | "success";

const PATTERNS: Record<HapticKind, number | number[]> = {
  selection: 8,
  confirm: 14,
  success: [18, 45, 24],
};

/** Subtle Android-only enhancement; safely does nothing where vibration is unavailable. */
export function triggerHaptic(kind: HapticKind) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  navigator.vibrate(PATTERNS[kind]);
}
