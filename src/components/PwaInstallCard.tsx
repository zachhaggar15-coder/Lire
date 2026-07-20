"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics/client";
import { isStandalonePwa } from "@/lib/analytics/identity";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function manualInstallHint(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "In Safari, use Share, then Add to Home Screen.";
  if (ua.includes("android") && ua.includes("chrome")) return "In Chrome, open the menu and choose Install app or Add to Home screen.";
  if (ua.includes("edg/")) return "In Edge, use the app/install icon in the address bar or Apps in the menu.";
  if (ua.includes("chrome")) return "In Chrome, use the install icon in the address bar or Install app in the menu.";
  return "Use your browser's install or Add to Home Screen option when it appears.";
}

export default function PwaInstallCard({ compact = false }: { compact?: boolean }) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [installHint, setInstallHint] = useState("Use your browser's install or Add to Home Screen option when it appears.");

  useEffect(() => {
    setInstalled(isStandalonePwa());
    setInstallHint(manualInstallHint(window.navigator.userAgent));
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      trackEvent("pwa_install_prompt_shown", {});
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  if (installed || dismissed) return null;
  if (!promptEvent && compact) return null;

  async function install() {
    if (!promptEvent) return;
    trackEvent("pwa_install_clicked", {});
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice.catch(() => null);
    if (choice?.outcome === "accepted") {
      setInstalled(true);
    } else {
      trackEvent("pwa_install_dismissed", {});
      setDismissed(true);
    }
    setPromptEvent(null);
  }

  return (
    <section className="rounded-card bg-cream-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Install Lire</p>
          <p className="mt-1 text-sm text-ink-muted">
            Add Lire to your home screen for quicker reading sessions and offline access.
          </p>
        </div>
        {promptEvent ? (
          <button type="button" onClick={install} className="shrink-0 rounded-full bg-brand px-4 py-2 shadow-raised text-sm font-semibold text-white active:scale-95">
            Install
          </button>
        ) : (
          <span className="shrink-0 rounded-full bg-cream-dark px-3 py-1 text-xs font-semibold text-ink-muted">PWA</span>
        )}
      </div>
      {!promptEvent && (
        <p className="mt-2 text-xs text-ink-muted">
          {installHint}
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          trackEvent("pwa_install_dismissed", { manual: true });
          setDismissed(true);
        }}
        className="mt-3 text-xs font-semibold text-ink-muted underline underline-offset-2"
      >
        Not now
      </button>
    </section>
  );
}
