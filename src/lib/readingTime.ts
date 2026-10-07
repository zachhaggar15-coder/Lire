/**
 * Active reading time for the current text: counts only time the page is
 * visible and the reader has interacted recently. Used for the reader's own
 * session record on this device; it is not sent anywhere.
 */

export interface ActiveTimeTracker {
  markInteraction: (now?: number) => void;
  markVisible: (visible: boolean, now?: number) => void;
  activeMs: (now?: number) => number;
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
