"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReadingText } from "@/types";
import { getCachedRssTextById } from "@/lib/rss/rssTextCache";
import Reader from "@/components/Reader";

interface ReaderPageClientProps {
  id: string;
  /** Set server-side when `id` matches a hardcoded text; null otherwise. */
  initialText: ReadingText | null;
}

/**
 * Hardcoded texts resolve server-side (initialText). RSS texts don't have
 * stable build-time ids, so they're looked up client-side from the
 * session cache the home page populates right after fetching them.
 */
export default function ReaderPageClient({ id, initialText }: ReaderPageClientProps) {
  const [text, setText] = useState<ReadingText | null>(initialText);
  const [checked, setChecked] = useState(initialText !== null);

  useEffect(() => {
    if (initialText) return;
    setText(getCachedRssTextById(id) ?? null);
    setChecked(true);
  }, [id, initialText]);

  if (!checked) {
    return <div className="px-4 pt-10 text-center text-sm text-slate-400">Loading…</div>;
  }

  if (!text) {
    return (
      <div className="px-4 pt-10 text-center">
        <p className="text-slate-500">
          This article isn&apos;t available anymore — RSS texts are only kept
          for your current session.
        </p>
        <Link
          href="/"
          className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white active:scale-95"
        >
          Back to Read
        </Link>
      </div>
    );
  }

  return <Reader text={text} />;
}
