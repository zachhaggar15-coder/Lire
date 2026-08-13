"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import AppIcon from "@/components/AppIcon";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

interface AppBarProps {
  title: string;
  /** Used as the destination only when there's no real page to go back to (e.g. opened directly, such as from a home-screen shortcut). Otherwise router.back() goes to the actual previous page, regardless of how this one was reached. */
  backHref?: string;
  backLabel?: string;
  kicker?: string;
  action?: ReactNode;
  className?: string;
}

export default function AppBar({
  title,
  backHref,
  backLabel = "Back",
  kicker,
  action,
  className = "",
}: AppBarProps) {
  const router = useRouter();
  useDocumentTitle(title);

  function handleBack() {
    if (backHref && typeof window !== "undefined" && window.history.length <= 1) {
      router.push(backHref);
    } else {
      router.back();
    }
  }

  return (
    <header className={`app-bar mb-5 ${className}`}>
      <div className="flex min-h-14 items-center gap-2">
        {backHref && (
          <button
            type="button"
            onClick={handleBack}
            aria-label={backLabel}
            className="ligne-icon-button ligne-pressable -ml-2 text-brand"
          >
            <AppIcon name="back" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          {kicker && <p className="ligne-label mb-0.5">{kicker}</p>}
          <h1 className="ligne-title break-words">{title}</h1>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
