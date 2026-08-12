"use client";

import Link from "next/link";
import type { ReadingText } from "@/types";
import { useReadingTextById } from "@/lib/useReadingTextById";
import Reader from "@/components/Reader";

interface ReaderPageClientProps {
  id: string;
  /** Set server-side when `id` matches a hardcoded text; null otherwise. */
  initialText: ReadingText | null;
}

export default function ReaderPageClient({ id, initialText }: ReaderPageClientProps) {
  const { text, checked } = useReadingTextById(id, initialText);

  if (!checked) {
    return <div className="px-4 pt-10 text-center text-sm text-ink-muted">Loading…</div>;
  }

  if (!text) {
    return (
      <div className="px-4 pt-10 text-center">
        <p className="text-ink-muted">
          This article isn&apos;t available anymore.
        </p>
        <Link
          href="/"
          className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 shadow-raised text-sm font-semibold text-white active:scale-95"
        >
          Back to lessons
        </Link>
      </div>
    );
  }

  return <Reader text={text} />;
}
