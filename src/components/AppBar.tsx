import Link from "next/link";
import type { ReactNode } from "react";
import AppIcon from "@/components/AppIcon";

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
            className="ligne-icon-button ligne-pressable -ml-2 text-brand"
          >
            <AppIcon name="back" />
          </Link>
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
