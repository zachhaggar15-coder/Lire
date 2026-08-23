"use client";

import Link from "next/link";
import AccessPrompt from "@/components/AccessPrompt";
import type { AccessDenialReason } from "@/lib/access/accessModel";

/**
 * Shown instead of the reader when today's article allowance is spent.
 *
 * It used to say one thing — "Keep reading with Premium" — to everyone,
 * because there was only one tier boundary. Now a guest is one sign-in away
 * from three articles a day, so telling them to buy Premium would be selling
 * past a free step that solves their problem. AccessPrompt decides which of
 * the two walls this actually is.
 */
export default function ReaderAccessGate({
  reason,
  isGuest,
  articleId,
}: {
  reason: AccessDenialReason;
  isGuest: boolean;
  articleId: string;
}) {
  return (
    <div className="ligne-screen flex min-h-[70dvh] items-center">
      <div className="w-full">
        <AccessPrompt
          reason={reason}
          blocked="article"
          isGuest={isGuest}
          // Back to this article, so signing in lands on the thing they were
          // trying to read rather than the homepage.
          returnPath={`/reader/${articleId}`}
        />
        <Link href="/" className="mt-4 block text-center text-sm font-semibold text-ink-muted underline underline-offset-2">
          Back to lessons
        </Link>
        <p className="mt-4 text-center text-xs text-ink-faint">Your allowance resets tomorrow.</p>
      </div>
    </div>
  );
}
