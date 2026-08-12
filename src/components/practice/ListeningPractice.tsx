"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReadingText } from "@/types";
import { tokenizeParagraphsToSentences } from "@/lib/words";
import { speakParagraphAtRate, stopSpeaking, canSpeak } from "@/lib/speech";
import { markListeningPracticeCompleted } from "@/lib/practice/practiceProgress";
import { getSettings } from "@/lib/settings";
import { useModalFocus } from "@/lib/useModalFocus";
import { useDismissibleHistory } from "@/lib/useDismissibleHistory";
import AppIcon from "@/components/AppIcon";

interface ListeningPracticeProps {
  text: ReadingText;
  onClose: () => void;
}

const MIN_RATE = 0.6;
const MAX_RATE = 1.6;

/**
 * Listening-only rereading mode: plays the article paragraph by paragraph,
 * with the transcript hidden by default. Browser speech synthesis has no
 * seek/duration API, so "back 10 seconds" and "skip to end" are honest
 * approximations at paragraph granularity (step back one paragraph / jump
 * straight to the last one) rather than a literal time seek.
 */
export default function ListeningPractice({ text, onClose }: ListeningPracticeProps) {
  const [revealed, setRevealed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [index, setIndex] = useState(0);
  const [available, setAvailable] = useState(false);
  // Server and first client render must agree. Browser-only speech support
  // and the stored preference are loaded immediately after hydration.
  const [rate, setRate] = useState(1);
  const modalRef = useModalFocus<HTMLDivElement>(true, onClose);
  useDismissibleHistory(true, onClose);
  const rateRef = useRef(rate);
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);
  const paragraphs = useMemo(() => tokenizeParagraphsToSentences(text.body).map((p) => p.map((s) => s.text).join(" ")), [text.body]);

  useEffect(() => {
    setAvailable(canSpeak());
    setRate(getSettings().speechRate);
    return () => stopSpeaking();
  }, []);

  function playFrom(startIndex: number, rateOverride?: number) {
    if (!available) return;
    const clamped = Math.max(0, Math.min(startIndex, paragraphs.length - 1));
    setIndex(clamped);
    setFinished(false);
    setPlaying(true);
    speakParagraphAtRate(paragraphs[clamped], rateOverride ?? rateRef.current, () => advance(clamped));
  }

  function advance(fromIndex: number) {
    const next = fromIndex + 1;
    if (next < paragraphs.length) {
      setIndex(next);
      speakParagraphAtRate(paragraphs[next], rateRef.current, () => advance(next));
    } else {
      setPlaying(false);
      setFinished(true);
      markListeningPracticeCompleted(text.id);
    }
  }

  function play() {
    playFrom(finished ? 0 : index);
  }

  function stop() {
    stopSpeaking();
    setPlaying(false);
  }

  function restart() {
    playFrom(0);
  }

  function backTenSeconds() {
    // Paragraph-granularity approximation — see file header.
    playFrom(Math.max(0, index - 1));
  }

  function skipToEnd() {
    playFrom(paragraphs.length - 1);
  }

  return (
    <div ref={modalRef} role="dialog" aria-modal="true" aria-label="Listening practice" tabIndex={-1} className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto bg-cream px-6 pb-8 pt-[calc(var(--safe-top)+3.5rem)] sm:justify-center sm:py-8">
      <button type="button" onClick={onClose} aria-label="Close listening practice" className="ligne-icon-button absolute right-4 top-[calc(var(--safe-top)+0.5rem)] bg-cream-card text-ink-muted">
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

        {available && paragraphs.length > 0 && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Paragraph {Math.min(index + 1, paragraphs.length)} of {paragraphs.length}
          </p>
        )}

        {available && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={backTenSeconds}
              disabled={index === 0 && !playing && !finished}
              aria-label="Back 10 seconds"
              className="ligne-pill border border-cream-dark bg-cream-card px-3 py-2.5 text-ink disabled:opacity-40"
            >
              <BackIcon className="h-4 w-4" />
            </button>
            {!playing ? (
              <button type="button" onClick={finished ? restart : play} className="ligne-pill bg-brand px-6 py-3 text-cream" aria-label={finished ? "Play again" : "Play"}>
                {finished ? "Play again" : "Play"}
              </button>
            ) : (
              <button type="button" onClick={stop} className="ligne-pill bg-ink px-6 py-3 text-cream" aria-label="Stop">
                Stop
              </button>
            )}
            <button
              type="button"
              onClick={skipToEnd}
              disabled={finished}
              aria-label="Skip to end"
              className="ligne-pill border border-cream-dark bg-cream-card px-3 py-2.5 text-ink disabled:opacity-40"
            >
              <SkipEndIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {available && (
          <div className="mt-5">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              <span>Speed</span>
              <span>{rate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={MIN_RATE}
              max={MAX_RATE}
              step={0.05}
              value={rate}
              onChange={(event) => {
                const next = Number(event.target.value);
                setRate(next);
                // Applies live: if something is already playing, restart the
                // current paragraph at the new rate rather than waiting for
                // the next one to pick it up. Passed explicitly since the
                // rate-ref sync effect hasn't run yet at this point.
                if (playing) playFrom(index, next);
              }}
              aria-label="Playback speed"
              className="mt-2 w-full accent-brand"
            />
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
              <p key={i} className={`mb-3 font-french text-[15px] leading-relaxed last:mb-0 ${i === index ? "text-ink" : "text-ink-muted"}`}>
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
  return <AppIcon name="close" className={className} />;
}

function BackIcon({ className }: { className?: string }) {
  return <AppIcon name="skip-back" className={className} />;
}

function SkipEndIcon({ className }: { className?: string }) {
  return <AppIcon name="skip-forward" className={className} />;
}
