"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useModalFocus } from "@/lib/useModalFocus";
import { useModalPresence } from "@/lib/modalPresence";
import { useDismissibleHistory } from "@/lib/useDismissibleHistory";

interface ModalDialogProps {
  titleId: string;
  /** Called on Escape, Android back and backdrop tap. Omit to make the dialog non-dismissible while busy. */
  onDismiss?: () => void;
  children: ReactNode;
  /** Element to focus first; defaults to the dialog itself. Point it at the safe action. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  describedById?: string;
}

/**
 * The one frame for confirmation dialogs.
 *
 * Bundles everything a modal needs so individual dialogs cannot forget part
 * of it: focus is trapped and restored, the background is hidden from
 * assistive technology, Escape and the Android back gesture dismiss it, and
 * the bottom navigation hides while it is open so it can never cover the
 * dialog's buttons (the cause of the hidden "Not now" on the Premium prompt).
 */
export default function ModalDialog({ titleId, describedById, onDismiss, children, initialFocusRef }: ModalDialogProps) {
  const dismiss = () => onDismiss?.();
  const dialogRef = useModalFocus<HTMLDivElement>(true, dismiss);
  const backdropPointer = useRef(false);
  useModalPresence(true);
  useDismissibleHistory(true, dismiss);

  useEffect(() => {
    initialFocusRef?.current?.focus({ preventScroll: true });
  }, [initialFocusRef]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6"
      onPointerDown={(event) => {
        backdropPointer.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (backdropPointer.current && event.target === event.currentTarget) dismiss();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedById}
        tabIndex={-1}
        className="max-h-[calc(var(--vvh,100dvh)-1rem)] w-full max-w-md overflow-y-auto rounded-t-card bg-cream-card p-5 pb-[calc(1.25rem+var(--safe-bottom))] shadow-card sm:rounded-card sm:pb-5"
      >
        {children}
      </div>
    </div>
  );
}
