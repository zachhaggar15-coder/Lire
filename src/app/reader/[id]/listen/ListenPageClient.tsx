"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReadingText } from "@/types";
import { useReadingTextById } from "@/lib/useReadingTextById";
import ListeningPractice from "@/components/practice/ListeningPractice";

interface ListenPageClientProps {
  id: string;
  initialText: ReadingText | null;
}

/** A real page for "Listen without text" — see PracticePageClient for why. */
export default function ListenPageClient({ id, initialText }: ListenPageClientProps) {
  const router = useRouter();
  const { text, checked } = useReadingTextById(id, initialText);

  function returnToLesson() {
    router.push(`/reader/${id}`);
  }

  if (!checked) {
    return <div className="px-4 pt-10 text-center text-sm text-ink-muted">Loading…</div>;
  }

  if (!text) {
    return (
      <div className="px-4 pt-10 text-center">
        <p className="text-ink-muted">This article isn&apos;t available anymore.</p>
        <Link href="/" className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 shadow-raised text-sm font-semibold text-white active:scale-95">
          Back to Read
        </Link>
      </div>
    );
  }

  return <ListeningPractice text={text} onClose={returnToLesson} />;
}
