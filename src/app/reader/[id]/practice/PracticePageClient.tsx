"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReadingText } from "@/types";
import { useReadingTextById } from "@/lib/useReadingTextById";
import { buildPracticePlan, type PracticePlan } from "@/lib/practice/session";
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
 *
 * buildPracticePlan shuffles reconstruction chips and cloze options with
 * Math.random(), so it must never run during the render that produces the
 * server/static HTML — that render and the client's first hydration pass
 * are required to produce identical output, and two different random
 * shuffles guarantee a "hydration failed" mismatch (confirmed in production
 * via Sentry on this exact route). Building the plan inside a post-mount
 * effect instead of useMemo means the first render on both sides is
 * identical (a loading state with no randomised content) and the shuffled
 * plan only appears after hydration has already completed.
 */
export default function PracticePageClient({ id, initialText }: PracticePageClientProps) {
  const router = useRouter();
  const { text, checked } = useReadingTextById(id, initialText);
  const [plan, setPlan] = useState<PracticePlan | null>(null);

  useEffect(() => {
    setPlan(text ? buildPracticePlan(text) : null);
  }, [text]);

  function returnToLesson() {
    router.push(`/reader/${id}`);
  }

  function returnToMap() {
    router.replace("/");
  }

  if (!checked) {
    return <div className="px-4 pt-10 text-center text-sm text-ink-muted">Loading…</div>;
  }

  if (!text) {
    return (
      <div className="px-4 pt-10 text-center">
        <p className="text-ink-muted">This article isn&apos;t available anymore.</p>
        <Link href="/" className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 shadow-raised text-sm font-semibold text-white active:scale-[0.98]">
          Back to Read
        </Link>
      </div>
    );
  }

  if (!plan) {
    return <div className="px-4 pt-10 text-center text-sm text-ink-muted">Loading…</div>;
  }

  return <PracticeOverlay text={text} plan={plan} onClose={returnToLesson} onReturnToMap={returnToMap} />;
}
