"use client";

import { useEffect, useState } from "react";
import { canSpeak, speakFrench, type SpeechRate } from "@/lib/speech";
import { markAudioTipSeen, recordAudioPlayAndCheckTip } from "@/lib/audioTip";
import { trackEvent } from "@/lib/analytics/client";

interface PronounceButtonProps {
  text: string;
  label?: string;
  rate?: SpeechRate;
  className?: string;
  /** For analytics only — which kind of audio this button plays. */
  scope?: "word" | "sentence";
}

export default function PronounceButton({
  text,
  label = "Play audio",
  rate = "normal",
  className = "",
  scope = "word",
}: PronounceButtonProps) {
  const [available, setAvailable] = useState(false);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    setAvailable(canSpeak());
  }, []);

  if (!available) return null;

  function handleClick() {
    const started = speakFrench(text, rate);
    if (!started) return;
    trackEvent("audio_played", { scope });
    if (recordAudioPlayAndCheckTip()) setShowTip(true);
  }

  return (
    <div className="inline-flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink active:scale-95 ${className}`}
        aria-label={label}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H3v6h3l5 4z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
        {rate === "slow" ? "Slow" : "Audio"}
      </button>
      {showTip && (
        <p className="max-w-[16rem] rounded-xl bg-brand-light px-2.5 py-1.5 text-xs text-brand">
          Try listening once before reading the sentence.{" "}
          <button
            type="button"
            onClick={() => {
              markAudioTipSeen();
              setShowTip(false);
            }}
            className="font-semibold underline underline-offset-2"
          >
            Got it
          </button>
        </p>
      )}
    </div>
  );
}
