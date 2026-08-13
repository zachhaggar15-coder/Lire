"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getOnboardingState } from "@/lib/onboarding";
import { subscribeToRecommendationPreferences } from "@/lib/recommendation/preferences";
import { useAnyModalOpen } from "@/lib/modalPresence";
import AppIcon, { type AppIconName } from "@/components/AppIcon";

const items = [
  { href: "/", label: "Lessons", icon: "lessons" as AppIconName, activePaths: ["/", "/articles", "/reader", "/import"] },
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

export default function BottomNav() {
  const pathname = usePathname();
  const modalOpen = useAnyModalOpen();
  // Assume visible on first paint (matches the common case: onboarding already
  // complete) so the nav doesn't pop in after mount on every load. It's
  // corrected to false, if needed, once the effect below reads real state.
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(true);

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

  // -1 (no tab matches the current route) intentionally hides the pill below
  // rather than defaulting to index 0 — a stray highlight under "Lessons"
  // while every label reads inactive is worse than no highlight at all.
  const activeIndex = items.findIndex(({ activePaths }) =>
    activePaths.some((path) => (path === "/" ? pathname === "/" : pathname.startsWith(path)))
  );

  return (
    <nav
      className="bottom-nav fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-cream-dark/80 bg-cream-chrome/95 backdrop-blur-lg transition-transform duration-200"
      style={{ paddingBottom: "max(var(--safe-bottom), 0.25rem)" }}
      aria-label="Primary"
    >
      <ul className="relative grid grid-cols-4 px-3 pb-1.5 pt-2">
        {activeIndex >= 0 && (
          <li
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-2 flex h-7 w-[calc((100%_-_1.5rem)/4)] justify-center transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          >
            <span className="h-7 w-12 rounded-full bg-brand-light" />
          </li>
        )}
        {items.map(({ href, label, icon, activePaths }) => {
          const active = activePaths.some((path) => (path === "/" ? pathname === "/" : pathname.startsWith(path)));
          return (
            <li key={href} className="relative z-10 min-w-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`ligne-pressable flex min-h-12 flex-col items-center justify-center rounded-2xl px-1 py-1 text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                  active ? "font-bold text-brand" : "font-normal text-ink-faint"
                }`}
              >
                <span className="flex h-7 w-12 items-center justify-center rounded-full">
                  <AppIcon name={icon} active={active} />
                </span>
                <span className="mt-0.5 font-sans text-[11px] font-semibold leading-4 tracking-[0.01em]">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
