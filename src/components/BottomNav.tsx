"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getOnboardingState } from "@/lib/onboarding";
import { subscribeToRecommendationPreferences } from "@/lib/recommendation/preferences";

/**
 * Reading is the point of the app, so the two places you actually find
 * something to read are in the tab bar rather than only behind a dashboard
 * tile. Words sits here too because saved vocabulary is checked far more
 * often than Settings, which is a rare destination and stays reachable from
 * the dashboard and the level chip in the header.
 */
const items = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/articles", label: "Articles", icon: BookIcon },
  { href: "/live-news", label: "News", icon: NewsIcon },
  { href: "/review", label: "Review", icon: CardsIcon },
  { href: "/words", label: "Words", icon: BookmarkIcon },
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
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 px-1 py-3 text-[11px] font-medium transition-colors ${
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

function NewsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h13v14H6a2 2 0 0 1-2-2z" />
      <path d="M17 8h3v9a2 2 0 0 1-3 1.7" />
      <path d="M7 9h7" />
      <path d="M7 13h7" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}
