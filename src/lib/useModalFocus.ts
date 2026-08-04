"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

interface HiddenSibling {
  element: HTMLElement;
  ariaHidden: string | null;
  inert: boolean;
}

/**
 * Gives a full-screen overlay proper modal behaviour: background controls are
 * removed from the accessibility tree, focus is trapped, Escape closes it,
 * and focus returns to the control that launched it.
 */
export function useModalFocus<T extends HTMLElement>(active: boolean, onEscape?: () => void) {
  const modalRef = useRef<T>(null);
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active || !modalRef.current) return;

    const modal = modalRef.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const hiddenSiblings: HiddenSibling[] = [];
    let branch: HTMLElement = modal;

    while (branch.parentElement) {
      const parent = branch.parentElement;
      for (const sibling of Array.from(parent.children)) {
        if (sibling === branch || !(sibling instanceof HTMLElement)) continue;
        // A visual backdrop is already absent from the accessibility tree and
        // may intentionally handle outside-click dismissal. Leave its pointer
        // behaviour intact while isolating every real background branch.
        if (sibling.getAttribute("aria-hidden") === "true") continue;
        hiddenSiblings.push({
          element: sibling,
          ariaHidden: sibling.getAttribute("aria-hidden"),
          inert: sibling.inert,
        });
        sibling.inert = true;
        sibling.setAttribute("aria-hidden", "true");
      }
      if (parent === document.body) break;
      branch = parent;
    }

    const initialFocus = modal.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? modal;
    initialFocus.focus({ preventScroll: true });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && onEscapeRef.current) {
        event.preventDefault();
        onEscapeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => !element.hidden && element.getAttribute("aria-hidden") !== "true",
      );
      if (focusable.length === 0) {
        event.preventDefault();
        modal.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      for (const { element, ariaHidden, inert } of hiddenSiblings) {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      }
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [active]);

  return modalRef;
}
