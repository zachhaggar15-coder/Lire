"use client";

import { useEffect, useState } from "react";
import { canSpeak, speakFrench, type SpeechRate } from "@/lib/speech";

interface PronounceButtonProps {
  text: string;
  label?: string;
  rate?: SpeechRate;
  className?: string;
}

export default function PronounceButton({ text, label = "Play audio", rate = "normal", className = "" }: PronounceButtonProps) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(canSpeak());
  }, []);

  if (!available) return null;

  return (
    <button
      type="button"
      onClick={() => speakFrench(text, rate)}
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
  );
}
