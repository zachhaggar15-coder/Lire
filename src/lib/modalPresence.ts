"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether any modal sheet is currently open.
 *
 * Bottom sheets anchor their action row to the bottom of the screen, which is
 * exactly where the fixed BottomNav sits. Relying on the sheet's z-index to
 * paint over the nav is fragile: the nav lives outside the sheet's subtree
 * (it's a sibling of <main> in layout.tsx), so any ancestor that creates a
 * stacking context — an in-flight opacity animation on .app-route-shell, for
 * one — traps the sheet's z-index and lets the nav paint on top, covering the
 * sheet's buttons. Hiding the nav outright while a sheet is open removes the
 * overlap instead of racing it.
 */
let openCount = 0;
const listeners = new Set<(open: boolean) => void>();

function emit() {
  const open = openCount > 0;
  for (const listener of listeners) listener(open);
}

/** Registers a modal as open for as long as `active` stays true. */
export function useModalPresence(active: boolean) {
  useEffect(() => {
    if (!active) return;
    openCount += 1;
    emit();
    return () => {
      openCount -= 1;
      emit();
    };
  }, [active]);
}

export function useAnyModalOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(openCount > 0);
    listeners.add(setOpen);
    return () => {
      listeners.delete(setOpen);
    };
  }, []);
  return open;
}
