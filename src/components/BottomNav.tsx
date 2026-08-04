"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getOnboardingState } from "@/lib/onboarding";
import { subscribeToRecommendationPreferences } from "@/lib/recommendation/preferences";

const items = [
  { href: "/", label: "Lessons", activePaths: ["/", "/articles"] },
  { href: "/live-news", label: "News", activePaths: ["/live-news"] },
  { href: "/review", label: "Review", activePaths: ["/review"] },
  {
    href: "/settings",
    label: "You",
    activePaths: [
      "/settings",
      "/progress",
      "/words",
      "/phrases",
      "/dictionary",
      "/sources",
      "/privacy",
      "/changelog",
      "/grammar",
      "/archive",
      "/lookup",
    ],
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    function syncOnboardingState() {
      const state = getOnboardingState();
      setOnboardingComplete(state?.completed === true && state.walkthroughCompleted === true);
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
  if (/^\/reader\/[^/]+\/(practice|listen)$/.test(pathname)) return null;
  if (onboardingComplete !== true) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-cream-dark bg-cream-chrome"
      style={{ paddingBottom: "var(--safe-bottom)" }}
      aria-label="Primary"
    >
      <ul className="flex px-5 pb-[26px] pt-3">
        {items.map(({ href, label, activePaths }) => {
          const active = activePaths.some((path) => (path === "/" ? pathname === "/" : pathname.startsWith(path)));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`block min-h-11 px-1 py-2 text-center font-mono text-[9px] uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                  active ? "font-bold text-brand" : "font-normal text-ink-faint"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
