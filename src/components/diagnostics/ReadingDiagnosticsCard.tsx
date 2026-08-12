"use client";

import type { ReadingPerformanceMetrics } from "@/lib/practice/readingPerformance";
import { formatBaselineComparisonLabel, type BaselineComparison, type TrendLabel } from "@/lib/practice/baselineComparison";
import type { DiagnosticMessage } from "@/lib/practice/diagnosticMessaging";

interface ReadingDiagnosticsCardProps {
  performance: ReadingPerformanceMetrics;
  baseline: BaselineComparison;
  message: DiagnosticMessage;
  /** e.g. "B1" — used only to word the comparison line ("...for B1 texts"). */
  levelLabel?: string;
  trend?: TrendLabel;
  className?: string;
}

const TREND_COPY: Record<TrendLabel, string> = {
  Improving: "Improving",
  Stable: "Stable",
  "Increasing support needed": "Increasing support needed",
  "Not enough data": "Not enough data yet",
};

/**
 * Leads the lesson-completion diagnostics: one main insight (lookup rate),
 * one comparison (personal/level-band baseline), one interpretation — with
 * an optional expandable detail explaining the metrics. Reused as-is on the
 * progress page so the two screens render identical copy for the same data.
 */
export default function ReadingDiagnosticsCard({
  performance,
  baseline,
  message,
  levelLabel,
  trend,
  className = "",
}: ReadingDiagnosticsCardProps) {
  return (
    <div className={`rounded-card border border-cream-dark bg-cream-card p-4 ${className}`}>
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">Reading independence</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums text-ink">
        {performance.lookupsPer100} <span className="text-sm font-semibold text-ink-muted">lookups / 100 words</span>
      </p>
      <p className="mt-1 text-sm font-semibold text-ink">
        {formatBaselineComparisonLabel(baseline, levelLabel)}
        {trend && trend !== "Not enough data" && <span className="ml-1.5 text-ink-muted">· {TREND_COPY[trend]}</span>}
      </p>
      <p className="mt-2 text-sm text-ink-muted">{message.headline}</p>
      {message.detail && <p className="mt-1 text-xs text-ink-muted">{message.detail}</p>}

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-semibold text-ink-muted underline decoration-dotted underline-offset-2">
          What does this mean?
        </summary>
        <div className="mt-2 space-y-2 text-xs leading-relaxed text-ink-muted">
          <p>
            Lookups per 100 words estimates how often you needed vocabulary support. Comparing the rate across texts
            helps show whether reading is becoming more independent. It is affected by text difficulty, so Lire
            compares similar texts where possible.
          </p>
          <p>
            Unique lookups count different words rather than every tap — looking up the same word several times
            counts once. This text: {performance.uniqueLookupsPer100} unique lookups per 100 words.
          </p>
        </div>
      </details>
    </div>
  );
}
