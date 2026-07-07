"use client";

interface ToastProps {
  message: string | null;
}

/**
 * Minimal, non-blocking confirmation used when the word popup is turned
 * off in Settings — reading isn't interrupted, but the save is acknowledged.
 */
export default function Toast({ message }: ToastProps) {
  const open = message !== null;
  return (
    <div
      aria-hidden={!open}
      className={`pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto flex max-w-md justify-center px-4 transition-all duration-200 ${
        open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div className="rounded-full bg-slate-900/90 px-4 py-2 text-sm font-medium text-white shadow-lg">
        {message}
      </div>
    </div>
  );
}
