"use client";

import { useEffect, useState } from "react";
import type { AppSettings } from "@/types";
import { canSpeak, getFrenchVoices, speakFrench } from "@/lib/speech";

const PREVIEW_TEXT = "Bonjour, ceci est un exemple de voix française.";

interface SpeechSettingsCardProps {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
}

/**
 * Voice + speed controls for every "Listen"/pronounce button in the app
 * (Reader's article/paragraph listening and word pronounce buttons) — all
 * read the same settings.speechRate/speechVoiceURI via speech.ts, so this
 * card is the one place to tune them rather than per-button controls.
 */
export default function SpeechSettingsCard({ settings, onChange }: SpeechSettingsCardProps) {
  const [available, setAvailable] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setAvailable(canSpeak());
    if (!canSpeak()) return;

    // Chrome (among others) loads voices asynchronously — an immediate
    // getVoices() call often returns an empty list on first page load, only
    // populating after this event fires.
    function loadVoices() {
      setVoices(getFrenchVoices());
    }
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  if (!available) return null;

  return (
    <div className="rounded-3xl bg-cream-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink">Reading aloud</p>
          <p className="mt-0.5 text-sm text-ink-muted">Voice and speed for every "Listen" button.</p>
        </div>
        <button
          type="button"
          onClick={() => speakFrench(PREVIEW_TEXT)}
          className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white active:scale-95"
        >
          Preview
        </button>
      </div>

      {voices.length > 0 && (
        <div className="mt-3">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Voice</label>
          <select
            value={settings.speechVoiceURI ?? ""}
            onChange={(e) => onChange({ speechVoiceURI: e.target.value || null })}
            className="w-full rounded-xl bg-cream-dark px-3 py-2 text-sm text-ink"
          >
            <option value="">Browser default</option>
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-3">
        <label className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          <span>Speed</span>
          <span>{settings.speechRate.toFixed(2)}x</span>
        </label>
        <input
          type="range"
          min={0.7}
          max={1.3}
          step={0.05}
          value={settings.speechRate}
          onChange={(e) => onChange({ speechRate: Number(e.target.value) })}
          className="w-full accent-brand"
          aria-label="Speech speed"
        />
        <div className="mt-0.5 flex justify-between text-[11px] text-ink-muted">
          <span>Slower</span>
          <span>Faster</span>
        </div>
      </div>
    </div>
  );
}
