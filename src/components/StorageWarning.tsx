"use client";

import { useEffect, useState } from "react";
import { STORAGE_FAILURE_EVENT, type WriteFailure } from "@/lib/localData/store";

/**
 * A single, persistent notice when the device stops accepting writes (usually
 * a full storage quota). Without it, background bookkeeping — reading
 * history, progress, XP — would fail silently. Specific actions (saving a
 * word, grading a review) still report their own failure in place.
 */
export default function StorageWarning() {
  const [reason, setReason] = useState<WriteFailure | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onFailure = (event: Event) => {
      setReason((event as CustomEvent<WriteFailure>).detail ?? "error");
      setDismissed(false);
    };
    window.addEventListener(STORAGE_FAILURE_EVENT, onFailure);
    return () => window.removeEventListener(STORAGE_FAILURE_EVENT, onFailure);
  }, []);

  if (!reason || dismissed) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-[60] mx-auto max-w-md px-4 pt-[calc(0.5rem+var(--safe-top,0px))]"
    >
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 shadow-card dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100">
        <p className="font-semibold">
          {reason === "quota" ? "Your device storage is full" : "Sorlio couldn't save to this device"}
        </p>
        <p className="mt-1 leading-relaxed">
          Recent progress may not be saved. Free up space on your device (or in your browser&rsquo;s site storage), then
          try again.
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="mt-2 min-h-11 rounded-full bg-rose-100 px-4 text-sm font-semibold text-rose-900 dark:bg-rose-900 dark:text-rose-50"
        >
          OK
        </button>
      </div>
    </div>
  );
}
