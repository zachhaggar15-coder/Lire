"use client";

import { useId, useRef, useState } from "react";
import ModalDialog from "@/components/ModalDialog";
import type { GuestDataSummary } from "@/lib/localData/guestAdoption";

interface GuestAdoptionDialogProps {
  summary: GuestDataSummary;
  onAdd: () => Promise<string | null>;
  onKeepSeparate: () => void;
}

function describe(summary: GuestDataSummary): string {
  const parts: string[] = [];
  if (summary.savedWords) parts.push(`${summary.savedWords} saved ${summary.savedWords === 1 ? "word" : "words"}`);
  if (summary.articlesRead) parts.push(`${summary.articlesRead} ${summary.articlesRead === 1 ? "text" : "texts"} read`);
  if (summary.knownWords) parts.push(`${summary.knownWords} known ${summary.knownWords === 1 ? "word" : "words"}`);
  if (summary.importedTexts) parts.push(`${summary.importedTexts} imported ${summary.importedTexts === 1 ? "text" : "texts"}`);
  if (parts.length === 0) return "Your progress from before you signed in.";
  return `${parts.join(", ")}.`;
}

/**
 * Asked once after a guest signs in, if the device has guest learning data.
 * Neither choice is pre-selected or emphasised over the other beyond normal
 * button order; "Keep separate" loses nothing.
 */
export default function GuestAdoptionDialog({ summary, onAdd, onKeepSeparate }: GuestAdoptionDialogProps) {
  const titleId = useId();
  const bodyId = useId();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const keepRef = useRef<HTMLButtonElement>(null);

  async function add() {
    setWorking(true);
    setError(null);
    const failure = await onAdd();
    if (failure) {
      setWorking(false);
      setError(failure);
    }
  }

  return (
    <ModalDialog titleId={titleId} describedById={bodyId} onDismiss={working ? undefined : onKeepSeparate} initialFocusRef={keepRef}>
      <h2 id={titleId} className="text-lg font-extrabold text-ink">
        Add this device&rsquo;s learning data to your account?
      </h2>
      <div id={bodyId} className="mt-2 space-y-2 text-sm leading-relaxed text-ink-muted">
        <p>You used Sorlio on this device before signing in: {describe(summary)}</p>
        <p>
          <strong className="text-ink">Add to my account</strong> moves it into your account so it syncs with your other
          devices. <strong className="text-ink">Keep separate</strong> leaves it on this device for when you use Sorlio
          signed out.
        </p>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-rose-600">
          {error}
        </p>
      )}
      <div className="mt-5 grid gap-2">
        <button
          type="button"
          onClick={() => void add()}
          disabled={working}
          className="min-h-12 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-cream disabled:opacity-60"
        >
          {working ? "Adding…" : "Add to my account"}
        </button>
        <button
          ref={keepRef}
          type="button"
          onClick={onKeepSeparate}
          disabled={working}
          className="min-h-12 rounded-full bg-cream-dark px-5 py-3 text-sm font-semibold text-ink disabled:opacity-60"
        >
          Keep separate
        </button>
      </div>
    </ModalDialog>
  );
}
