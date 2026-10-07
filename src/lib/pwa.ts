/** True when Sorlio is running as an installed app (PWA or Android wrapper). */
export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}
