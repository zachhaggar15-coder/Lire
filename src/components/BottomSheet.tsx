"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { useModalFocus } from "@/lib/useModalFocus";
import { useModalPresence } from "@/lib/modalPresence";
import { useDismissibleHistory } from "@/lib/useDismissibleHistory";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
  footer?: ReactNode;
  surfaceClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  handleClassName?: string;
}

/** Shared Android-style sheet frame used by every reader and form sheet. */
export default function BottomSheet({
  open,
  onClose,
  ariaLabel,
  children,
  footer,
  surfaceClassName = "bg-cream-card",
  contentClassName = "px-5 pb-4",
  footerClassName = "border-cream-dark bg-cream-card",
  handleClassName = "bg-cream-dark",
}: BottomSheetProps) {
  const modalRef = useModalFocus<HTMLDivElement>(open, onClose);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartY = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);
  const activePointerId = useRef<number | null>(null);

  useModalPresence(open);
  useDismissibleHistory(open, onClose);

  function handleDragStart(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragStartY.current = event.clientY;
    activePointerId.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleDragMove(event: PointerEvent<HTMLButtonElement>) {
    if (activePointerId.current !== event.pointerId || dragStartY.current === null) return;
    const nextOffset = Math.max(0, event.clientY - dragStartY.current);
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  }

  function handleDragEnd(event: PointerEvent<HTMLButtonElement>) {
    if (activePointerId.current !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const shouldDismiss = dragOffsetRef.current > 88;
    dragStartY.current = null;
    activePointerId.current = null;
    dragOffsetRef.current = 0;
    setDragOffset(0);
    if (shouldDismiss) onClose();
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/35 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6 ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
        onClick={onClose}
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          tabIndex={-1}
          onClick={(event) => event.stopPropagation()}
          className={`relative flex max-h-[calc(var(--vvh,100dvh)-0.5rem)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-cream-dark shadow-2xl transition-[transform,opacity] duration-200 ease-out sm:max-h-[calc(var(--vvh,100dvh)-3rem)] sm:rounded-3xl ${surfaceClassName} ${
            open ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 sm:translate-y-4"
          }`}
          style={{
            transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
            transitionDuration: dragOffset > 0 ? "0ms" : undefined,
          }}
        >
          <button
            type="button"
            aria-label="Swipe down to close"
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            className="flex min-h-12 w-full shrink-0 touch-none items-center justify-center active:cursor-grabbing"
          >
            <span className={`h-1.5 w-10 rounded-full ${handleClassName}`} />
          </button>
          <div className={`min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain ${contentClassName}`}>
            {children}
          </div>
          {footer && (
            <div
              className={`shrink-0 border-t px-5 pt-3 ${footerClassName}`}
              style={{ paddingBottom: "calc(0.75rem + var(--safe-bottom))" }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
