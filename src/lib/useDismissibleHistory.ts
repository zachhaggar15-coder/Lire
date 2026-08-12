"use client";

import { useEffect, useRef } from "react";

const MODAL_HISTORY_KEY = "__lireModal";
let nextModalId = 0;

/**
 * Gives transient UI a real Android Back destination.
 *
 * Opening a sheet adds a same-URL history entry. The system Back gesture then
 * dismisses the sheet before it can leave the reader. Closing with a button or
 * swipe quietly removes that temporary entry again.
 */
export function useDismissibleHistory(active: boolean, onDismiss: () => void) {
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!active) return;

    const modalId = `${Date.now()}-${nextModalId++}`;
    let dismissedByBack = false;
    const currentState = window.history.state;
    const nextState = currentState && typeof currentState === "object"
      ? { ...currentState, [MODAL_HISTORY_KEY]: modalId }
      : { [MODAL_HISTORY_KEY]: modalId };

    // Switching directly from one sheet to another should reuse the same Back
    // destination instead of stacking two invisible same-URL entries.
    if (currentState?.[MODAL_HISTORY_KEY]) {
      window.history.replaceState(nextState, "", window.location.href);
    } else {
      window.history.pushState(nextState, "", window.location.href);
    }

    function handlePopState() {
      dismissedByBack = true;
      onDismissRef.current();
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (!dismissedByBack) {
        window.setTimeout(() => {
          if (window.history.state?.[MODAL_HISTORY_KEY] === modalId) window.history.back();
        }, 0);
      }
    };
  }, [active]);
}
