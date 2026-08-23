"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReadingText } from "@/types";
import { useReadingTextById } from "@/lib/useReadingTextById";
import Reader from "@/components/Reader";
import RouteLoading from "@/components/RouteLoading";
import ReaderAccessGate from "@/components/ReaderAccessGate";
import { canStartArticle, type AccessDenialReason } from "@/lib/access/accessModel";
import { useAccess } from "@/lib/access/useAccess";

interface ReaderPageClientProps {
  id: string;
  /** Set server-side when `id` matches a hardcoded text; null otherwise. */
  initialText: ReadingText | null;
}

export default function ReaderPageClient({ id, initialText }: ReaderPageClientProps) {
  const { text, checked } = useReadingTextById(id, initialText);
  const { context, ready, tier, consumeArticle } = useAccess();
  const [denial, setDenial] = useState<AccessDenialReason | null | undefined>(undefined);

  useEffect(() => {
    if (!checked || !ready || !text) return;
    const decision = canStartArticle(context, text.id);
    setDenial(decision.allowed ? null : decision.reason);
    // Counted only once the article is actually allowed to open, and only the
    // first time today — reopening one already read costs nothing, since
    // going back to finish something is continuing a lesson rather than
    // starting another.
    if (decision.allowed) consumeArticle(text.id);
    // Deliberately keyed on the identity of the tap rather than on `context`,
    // which changes object identity on every usage tick and would re-run this
    // after its own write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, ready, text?.id, tier]);

  if (!checked || !ready || (text && denial === undefined)) {
    // A genuinely invalid id can spend real time here — the id-lookup path
    // still has to wait on the RSS candidate pool being built on a cold
    // server. Same destination-shaped skeleton + status announcement as
    // every other route, rather than a plain, unannounced "Loading…" line.
    return <RouteLoading variant="reader" />;
  }

  if (!text) {
    return (
      <div className="px-4 pt-10 text-center">
        <p className="text-ink-muted">
          This article isn&apos;t available anymore.
        </p>
        <Link
          href="/"
          className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 shadow-raised text-sm font-semibold text-white"
        >
          Back to lessons
        </Link>
      </div>
    );
  }

  if (denial) return <ReaderAccessGate reason={denial} isGuest={tier === "guest"} articleId={text.id} />;

  return <Reader text={text} />;
}
