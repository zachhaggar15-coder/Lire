"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReadingText } from "@/types";
import { useReadingTextById } from "@/lib/useReadingTextById";
import Reader from "@/components/Reader";
import RouteLoading from "@/components/RouteLoading";
import ReaderAccessGate from "@/components/ReaderAccessGate";
import { claimDailyFreeArticle } from "@/lib/premium/freeAccess";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";

interface ReaderPageClientProps {
  id: string;
  /** Set server-side when `id` matches a hardcoded text; null otherwise. */
  initialText: ReadingText | null;
}

export default function ReaderPageClient({ id, initialText }: ReaderPageClientProps) {
  const { text, checked } = useReadingTextById(id, initialText);
  const { status: premium, loading: premiumLoading } = usePremiumStatus();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!checked || premiumLoading || !text) return;
    setAllowed(premium.isPremium || claimDailyFreeArticle(text.id));
  }, [checked, premium.isPremium, premiumLoading, text]);

  if (!checked || premiumLoading || (text && allowed === null)) {
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

  if (!allowed) return <ReaderAccessGate />;

  return <Reader text={text} />;
}
