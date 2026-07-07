"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category, ReadingText, TextStatus } from "@/types";
import { getProgress } from "@/lib/progress";
import { formatDate } from "@/lib/format";

const CATEGORY_STYLES: Record<Category, string> = {
  "news-style": "bg-rose-100 text-rose-700",
  sport: "bg-emerald-100 text-emerald-700",
  culture: "bg-violet-100 text-violet-700",
  science: "bg-sky-100 text-sky-700",
  "everyday life": "bg-amber-100 text-amber-700",
};

const STATUS_STYLES: Record<TextStatus, string> = {
  unread: "bg-slate-100 text-slate-500",
  "in-progress": "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS: Record<TextStatus, string> = {
  unread: "Unread",
  "in-progress": "In progress",
  completed: "Completed",
};

export default function ReadingCard({ text }: { text: ReadingText }) {
  const [status, setStatus] = useState<TextStatus>("unread");

  useEffect(() => {
    setStatus(getProgress(text.id).status);
  }, [text.id]);

  return (
    <Link
      href={`/reader/${text.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition active:scale-[0.99]"
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${CATEGORY_STYLES[text.category]}`}
        >
          {text.category}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
          {text.difficulty}
        </span>
        <span className="ml-auto text-xs text-slate-400">{text.minutes} min</span>
      </div>
      <h2 className="text-lg font-bold leading-snug text-slate-900">{text.title}</h2>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{text.preview}</p>

      {text.sourceName && (
        <p className="mt-1.5 text-xs text-slate-400">
          {text.sourceName}
          {text.publishedAt && <> · {formatDate(text.publishedAt)}</>}
        </p>
      )}

      <span
        className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
      >
        {STATUS_LABELS[status]}
      </span>
    </Link>
  );
}
