"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReadingText } from "@/types";
import { useReadingTextById } from "@/lib/useReadingTextById";
import { buildPracticePlan } from "@/lib/practice/session";
import PracticeOverlay from "@/components/practice/PracticeOverlay";

interface PracticePageClientProps {
  id: string;
  initialText: ReadingText | null;
}

/**
 * A real page (not an in-place overlay) so "Practice the text" is a proper
 * navigation: it gets its own URL, back-button behaviour, and full-page
 * transition instead of just toggling something in on top of the lesson
 * summary without the page appearing to change.
 */
export default function PracticePageClient({ id, initialText }: PracticePageClientProps) {
  const router = useRouter();
  const { text, checked } = useReadingTextById(id, initialText);
  const plan = useMemo(() => (text ? buildPracticePlan(text) : null), [text]);

  function returnToLesson() {
    router.push(`/reader/${id}`);
  }

  if (!checked) {
    return <div className="px-4 pt-10 text-center text-sm text-ink-muted">Loading…</div>;
  }

  if (!text || !plan) {
    return (
      <div className="px-4 pt-10 text-center">
        <p className="text-ink-muted">This article isn&apos;t available anymore.</p>
        <Link href="/" className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 shadow-raised text-sm font-semibold text-white active:scale-95">
          Back to Read
        </Link>
      </div>
    );
  }

  return <PracticeOverlay text={text} plan={plan} onClose={returnToLesson} />;
}
