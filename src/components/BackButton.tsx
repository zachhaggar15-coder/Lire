"use client";

import { useRouter } from "next/navigation";

/**
 * Goes to the actual previous page (router.back()) rather than a
 * per-page hardcoded destination, so it's correct regardless of how the
 * page was reached. Falls back to fallbackHref only when there's no real
 * history to go back to (e.g. the page was opened directly, as can happen
 * from a home-screen shortcut or a deep link in this PWA).
 */
export default function BackButton({ fallbackHref, label = "Back" }: { fallbackHref: string; label?: string }) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button type="button" onClick={handleClick} className="flex items-center gap-1 text-sm font-semibold text-brand">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {label}
    </button>
  );
}
