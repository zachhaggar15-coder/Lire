"use client";

import { useState } from "react";

interface SentenceSheetProps {
  /** The tapped sentence's French text, or null when the sheet is closed. */
  sentence: string | null;
  onClose: () => void;
}

/**
 * Bottom sheet shown on a sentence tap. There is no automatic translation
 * or explanation here — the app now only calls AI when a reader explicitly
 * asks for it, and that path isn't wired up to a real provider yet either
 * (see the "Ask AI to explain" button below).
 */
export default function SentenceSheet({ sentence, onClose }: SentenceSheetProps) {
  const [showAiPlaceholder, setShowAiPlaceholder] = useState(false);
  const open = sentence !== null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-hidden={!open}
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl border-t border-slate-200 bg-white p-5 shadow-2xl transition-transform duration-200 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(1.25rem + var(--safe-bottom))" }}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Sentence</p>
            <p className="mt-1 text-base font-semibold leading-snug text-slate-900">{sentence}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 active:scale-95"
          >
            Done
          </button>
        </div>

        <div className="mt-4">
          <button
            onClick={() => setShowAiPlaceholder(true)}
            className="rounded-full bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 active:scale-95"
          >
            Ask AI to explain
          </button>
          {showAiPlaceholder && (
            <p className="mt-2 text-sm italic text-slate-400">
              AI explanations are not enabled yet.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
