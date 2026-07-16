"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics/client";
import { isStandalonePwa } from "@/lib/analytics/identity";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PwaInstallCard({ compact = false }: { compact?: boolean }) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isStandalonePwa());
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
    <section className="rounded-3xl bg-cream-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Install Lire</p>
          <p className="mt-1 text-sm text-ink-muted">
            Add Lire to your home screen for quicker reading sessions and offline access.
          </p>
        </div>
        {promptEvent ? (
          <button type="button" onClick={install} className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white active:scale-95">
            Install
          </button>
        ) : (
          <span className="shrink-0 rounded-full bg-cream-dark px-3 py-1 text-xs font-semibold text-ink-muted">PWA</span>
        )}
      </div>
      {!promptEvent && (
        <p className="mt-2 text-xs text-ink-muted">
          Use your browser menu and choose Add to Home Screen when available.
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
