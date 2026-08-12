"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getOnboardingState } from "@/lib/onboarding";
import { subscribeToRecommendationPreferences } from "@/lib/recommendation/preferences";
import { useAnyModalOpen } from "@/lib/modalPresence";

const items = [
  { href: "/", label: "Lessons", icon: "lessons" as const, activePaths: ["/", "/articles"] },
  { href: "/live-news", label: "News", icon: "news" as const, activePaths: ["/live-news"] },
  { href: "/review", label: "Review", icon: "review" as const, activePaths: ["/review"] },
  {
    href: "/settings",
    label: "Library",
    icon: "library" as const,
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

function NavIcon({ name }: { name: (typeof items)[number]["icon"] }) {
  if (name === "lessons") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" />
      </svg>
    );
  }
  if (name === "news") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h13v16H6a2 2 0 0 1-2-2z" />
        <path d="M17 8h3v10a2 2 0 0 1-2 2h-1" />
        <path d="M7 8h7M7 12h7M7 16h4" />
      </svg>
    );
  }
  if (name === "review") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 7h11a5 5 0 0 1 0 10H8" />
        <path d="m8 13-4 4 4 4" />
        <path d="m16 3 4 4-4 4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5h16v15H4z" />
      <path d="M8 3v4M16 3v4M8 11h8M8 15h5" />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const modalOpen = useAnyModalOpen();
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
  if (modalOpen) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-cream-dark bg-cream-chrome"
      style={{ paddingBottom: "var(--safe-bottom)" }}
      aria-label="Primary"
    >
      <ul className="flex px-3 pb-2 pt-2">
        {items.map(({ href, label, icon, activePaths }) => {
          const active = activePaths.some((path) => (path === "/" ? pathname === "/" : pathname.startsWith(path)));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center rounded-2xl px-1 py-1.5 text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                  active ? "font-bold text-brand" : "font-normal text-ink-faint"
                }`}
              >
                <span className={`flex h-7 w-11 items-center justify-center rounded-full ${active ? "bg-brand-light" : "bg-transparent"}`}>
                  <NavIcon name={icon} />
                </span>
                <span className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em]">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
