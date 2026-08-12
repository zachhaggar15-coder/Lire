import Link from "next/link";
import type { ReactNode } from "react";

interface AppBarProps {
  title: string;
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
  return (
    <header className={`app-bar mb-5 ${className}`}>
      <div className="flex min-h-14 items-center gap-2">
        {backHref && (
          <Link
            href={backHref}
            aria-label={backLabel}
            className="ligne-icon-button -ml-2 text-brand"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
        )}
        <div className="min-w-0 flex-1">
          {kicker && <p className="ligne-label mb-0.5">{kicker}</p>}
          <h1 className="break-words text-[1.65rem] font-semibold leading-tight text-ink">{title}</h1>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
