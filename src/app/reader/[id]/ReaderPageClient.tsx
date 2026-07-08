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
 * stable build-time ids, so they're looked up client-side: first the
 * sessionStorage cache the home page populates right after fetching (fast,
 * no network), and if that misses (e.g. a direct link opened in a fresh
 * tab), the optional server-side persisted store via GET /api/rss-texts/[id]
 * — which itself no-ops to "not found" if no KV/Redis store is configured.
 */
export default function ReaderPageClient({ id, initialText }: ReaderPageClientProps) {
  const [text, setText] = useState<ReadingText | null>(initialText);
  const [checked, setChecked] = useState(initialText !== null);

  useEffect(() => {
    if (initialText) return;

    const cached = getCachedRssTextById(id);
    if (cached) {
      setText(cached);
      setChecked(true);
      return;
    }

    let cancelled = false;
    fetch(`/api/rss-texts/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { text: ReadingText } | null) => {
        if (cancelled) return;
        setText(data?.text ?? null);
        setChecked(true);
      })
      .catch(() => {
        if (!cancelled) {
          setText(null);
          setChecked(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, initialText]);

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
          className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white active:scale-95"
        >
          Back to Read
        </Link>
      </div>
    );
  }

  return <Reader text={text} />;
}
