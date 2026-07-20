"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getOnboardingState } from "@/lib/onboarding";
import { subscribeToRecommendationPreferences } from "@/lib/recommendation/preferences";

const items = [
  { href: "/", label: "Today", icon: HomeIcon, activePaths: ["/"] },
  { href: "/articles", label: "Lessons", icon: BookIcon, activePaths: ["/articles"] },
  { href: "/review", label: "Review", icon: CardsIcon, activePaths: ["/review"] },
  {
    href: "/settings",
    label: "Profile",
    icon: ProfileIcon,
    activePaths: ["/settings", "/progress", "/words", "/phrases", "/dictionary", "/sources", "/privacy", "/changelog"],
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    function syncOnboardingState() {
      setOnboardingComplete(getOnboardingState()?.completed === true);
    }

    syncOnboardingState();
    const unsubscribe = subscribeToRecommendationPreferences(syncOnboardingState);
    window.addEventListener("storage", syncOnboardingState);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", syncOnboardingState);
    };
  }, []);

  if (pathname.startsWith("/admin")) return null;
  if (onboardingComplete !== true) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md rounded-t-3xl bg-cream-card/95 shadow-[0_-4px_16px_rgba(43,42,34,0.06)] backdrop-blur"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <ul className="flex">
        {items.map(({ href, label, icon: Icon, activePaths }) => {
          const active =
            href === "/" ? pathname === "/" : activePaths.some((path) => pathname.startsWith(path));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 px-1 py-3 text-xs font-medium transition-colors ${
                  active ? "text-brand" : "text-ink-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function CardsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="14" height="12" rx="2" />
      <path d="M8 3h9a2 2 0 0 1 2 2v11" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h9a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4z" />
      <path d="M9 8h5" />
      <path d="M9 12h6" />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
