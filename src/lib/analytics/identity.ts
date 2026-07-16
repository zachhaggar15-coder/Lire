import { getValidationState, saveValidationState, type ValidationState } from "@/lib/validation/state";

function randomId(): string {
  const cryptoObj = typeof crypto !== "undefined" ? crypto : null;
  if (cryptoObj?.randomUUID) return `anon_${cryptoObj.randomUUID()}`;
  const bytes = new Uint8Array(16);
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return `anon_${[...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function ensureAnonymousId(now = new Date()): string {
  const state = getValidationState();
  if (state.anonymousId) return state.anonymousId;
  const anonymousId = randomId();
  const firstSeenAt = state.firstSeenAt ?? now.toISOString();
  saveValidationState({ ...state, anonymousId, firstSeenAt, lastSeenAt: now.toISOString() });
  return anonymousId;
}

export function peekAnonymousId(): string | null {
  return getValidationState().anonymousId;
}

export function attachAuthenticatedUser(state: ValidationState, _userId: string | null): ValidationState {
  // The current sync model already associates local stores with a Supabase
  // user after sign-in. This helper is intentionally a no-op placeholder so
  // analytics callers have one stable place to evolve if user-linking becomes
  // more explicit later.
  return state;
}

export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function deviceCategory(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 700) return "mobile";
  if (width < 1100) return "tablet";
  return "desktop";
}
