"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReadingText } from "@/types";
import { tokenizeParagraphsToSentences } from "@/lib/words";
import { speakFrenchParagraphs, stopSpeaking, canSpeak } from "@/lib/speech";
import { markListeningPracticeCompleted } from "@/lib/practice/practiceProgress";

interface ListeningPracticeProps {
  text: ReadingText;
  onClose: () => void;
}

/**
 * Listening-only rereading mode: plays the article with the transcript
 * hidden by default. Browser speech synthesis has no seek/duration API, so
 * "completion" here honestly means "played through to the end without being
 * stopped early" (the onEnd callback firing) — not a comprehension check.
 */
export default function ListeningPractice({ text, onClose }: ListeningPracticeProps) {
  const [revealed, setRevealed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const paragraphs = useMemo(() => tokenizeParagraphsToSentences(text.body).map((p) => p.map((s) => s.text).join(" ")), [text.body]);
  const available = canSpeak();

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  function play() {
    if (!available) return;
    setPlaying(true);
    setFinished(false);
    speakFrenchParagraphs(paragraphs, "normal", () => {
      setPlaying(false);
      setFinished(true);
      markListeningPracticeCompleted(text.id);
    });
  }

  function stop() {
    stopSpeaking();
    setPlaying(false);
  }

  function restart() {
    stop();
    setFinished(false);
    play();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream px-6">
      <button type="button" onClick={onClose} aria-label="Close listening practice" className="absolute right-4 top-[calc(var(--safe-top)+1rem)] rounded-full bg-cream-card p-2 text-ink-muted">
        <CloseIcon className="h-4 w-4" />
      </button>

      <div className="w-full max-w-sm text-center">
        <p className="ligne-label">Listening practice</p>
        <h1 className="mt-1 text-xl font-semibold text-ink">{text.title}</h1>

        {!available && (
          <p className="mt-6 text-sm text-ink-muted">Spoken audio isn&apos;t available in this browser.</p>
        )}

        {available && !revealed && (
          <p className="mt-6 text-sm text-ink-muted">The text is hidden. Listen, then reveal it whenever you&apos;re ready.</p>
        )}

        {available && (
          <div className="mt-6 flex items-center justify-center gap-3">
            {!playing ? (
              <button type="button" onClick={finished ? restart : play} className="ligne-pill bg-brand px-6 py-3 text-cream" aria-label={finished ? "Play again" : "Play"}>
                {finished ? "Play again" : "Play"}
              </button>
            ) : (
              <button type="button" onClick={stop} className="ligne-pill bg-ink px-6 py-3 text-cream" aria-label="Stop">
                Stop
              </button>
            )}
            {playing && (
              <button type="button" onClick={restart} className="ligne-pill border border-cream-dark bg-cream-card px-4 py-3 text-ink" aria-label="Restart from the beginning">
                Restart
              </button>
            )}
          </div>
        )}

        {finished && !revealed && (
          <p className="mt-4 text-xs font-semibold text-brand" role="status">
            Listening practice completed.
          </p>
        )}

        {!revealed ? (
          <button type="button" onClick={() => setRevealed(true)} className="ligne-pill mt-8 border border-cream-dark bg-cream-card px-4 py-2.5 text-sm text-ink-muted">
            Reveal text
          </button>
        ) : (
          <div className="mt-8 max-h-[45vh] overflow-y-auto rounded-card border border-cream-dark bg-cream-card p-4 text-left">
            {paragraphs.map((p, i) => (
              <p key={i} className="mb-3 font-french text-[15px] leading-relaxed text-ink last:mb-0">
                {p}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
