import type { ReadingSessionSignals } from "@/lib/validation/definitions";
import { isMeaningfulReadingSession } from "@/lib/validation/definitions";

const SESSION_KEY = "lire.analytics.session.v1";
const SESSION_TTL_MS = 30 * 60 * 1000;

export interface BrowserSession {
  id: string;
  startedAt: string;
  lastSeenAt: string;
}

export interface ActiveTimeTracker {
  markInteraction: (now?: number) => void;
  markVisible: (visible: boolean, now?: number) => void;
  activeMs: (now?: number) => number;
}

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return `sess_${crypto.randomUUID()}`;
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

function hasSessionStorage(): boolean {
  return typeof window !== "undefined" && !!window.sessionStorage;
}

function normalise(raw: unknown): BrowserSession | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.id !== "string" || typeof value.startedAt !== "string" || typeof value.lastSeenAt !== "string") return null;
  return { id: value.id, startedAt: value.startedAt, lastSeenAt: value.lastSeenAt };
}

export function getBrowserSession(now = new Date()): BrowserSession {
  if (!hasSessionStorage()) {
    const iso = now.toISOString();
    return { id: randomId(), startedAt: iso, lastSeenAt: iso };
  }
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    const parsed = raw ? normalise(JSON.parse(raw)) : null;
    const stale = parsed ? now.getTime() - new Date(parsed.lastSeenAt).getTime() > SESSION_TTL_MS : true;
    const session = parsed && !stale ? { ...parsed, lastSeenAt: now.toISOString() } : { id: randomId(), startedAt: now.toISOString(), lastSeenAt: now.toISOString() };
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch {
    const iso = now.toISOString();
    return { id: randomId(), startedAt: iso, lastSeenAt: iso };
  }
}

export function createActiveTimeTracker(start = Date.now()): ActiveTimeTracker {
  let visible = true;
  let activeMs = 0;
  let lastTick = start;
  let lastInteraction = start;

  function tick(now = Date.now()) {
    const recentlyActive = now - lastInteraction <= 15_000;
    if (visible && recentlyActive) activeMs += Math.max(0, now - lastTick);
    lastTick = now;
  }

  return {
    markInteraction(now = Date.now()) {
      tick(now);
      lastInteraction = now;
    },
    markVisible(nextVisible: boolean, now = Date.now()) {
      tick(now);
      visible = nextVisible;
      lastTick = now;
    },
    activeMs(now = Date.now()) {
      tick(now);
      return activeMs;
    },
  };
}

export function readingSessionSummaryIsMeaningful(signals: ReadingSessionSignals): boolean {
  return isMeaningfulReadingSession(signals);
}
