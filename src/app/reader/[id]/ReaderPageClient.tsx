"use client";

import Link from "next/link";
import type { ReadingText } from "@/types";
import { useReadingTextById } from "@/lib/useReadingTextById";
import Reader from "@/components/Reader";
import RouteLoading from "@/components/RouteLoading";

interface ReaderPageClientProps {
  id: string;
  /** Set server-side when `id` matches a hardcoded text; null otherwise. */
  initialText: ReadingText | null;
}

export default function ReaderPageClient({ id, initialText }: ReaderPageClientProps) {
  const { text, checked } = useReadingTextById(id, initialText);

  if (!checked) {
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

  return <Reader text={text} />;
}
