"use client";

import { useEffect, useState } from "react";
import { getSyncPreferences, setImportedTextSync } from "@/lib/sync/preferences";

/** The "Sync imported texts" switch (signed-in accounts only). Off by default. */
export default function AccountSyncOptions() {
  const [enabled, setEnabled] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => setEnabled(getSyncPreferences().importedTexts), []);

  async function toggle() {
    const next = !enabled;
    setWorking(true);
    setMessage(null);
    const result = await setImportedTextSync(next);
    setWorking(false);
    setEnabled(getSyncPreferences().importedTexts);
    setMessage(result.ok ? (next ? "Imported texts will now sync to your account." : "Imported texts are no longer stored in your account. Copies on your devices are kept.") : result.error);
  }

  return (
    <div id="sync-imported-texts" className="mt-4 border-t border-cream-fill pt-3">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => void toggle()}
        disabled={working}
        className="flex w-full items-center justify-between gap-4 text-left disabled:opacity-60"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink">Sync imported texts</span>
          <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
            Off: texts you import stay only on this device. On: they&rsquo;re also stored in your Sorlio account so they
            appear on your other devices. Turning it off removes them from your account but keeps them on your devices.
          </span>
        </span>
        <span className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${enabled ? "bg-brand" : "bg-cream-fill"}`} aria-hidden="true">
          <span className={`inline-block h-5 w-5 transform rounded-full bg-cream transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
        </span>
      </button>
      {message && (
        <p role="status" className="mt-2 text-xs text-ink-muted">
          {message}
        </p>
      )}
    </div>
  );
}
