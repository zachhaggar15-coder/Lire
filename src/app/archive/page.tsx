"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getArchive, type ArchiveEntry } from "@/lib/archive";
import { getSavedWords } from "@/lib/storage";
import { formatDate } from "@/lib/format";

export default function ArchivePage() {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [wordCounts, setWordCounts] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const newestFirst = [...getArchive()].reverse();
    setEntries(newestFirst);

    const words = getSavedWords();
    const counts: Record<string, number> = {};
    for (const entry of newestFirst) {
      counts[entry.title] = words.filter((w) => w.sourceTextTitle === entry.title).length;
    }
    setWordCounts(counts);
    setReady(true);
  }, []);

  return (
    <div className="px-4 pt-6">
      <Link href="/" className="text-sm font-semibold text-brand">
        ← Today
      </Link>

      <header className="mb-5 mt-2">
        <h1 className="text-2xl font-extrabold text-slate-900">Reading history</h1>
        <p className="text-sm text-slate-500">Every article you&apos;ve marked as completed.</p>
      </header>

      {ready && entries.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-slate-500">No completed articles yet.</p>
          <Link
            href="/"
            className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white active:scale-95"
          >
            Start reading
          </Link>
        </div>
      )}

      <ul className="space-y-3">
        {entries.map((entry) => {
          const count = wordCounts[entry.title] ?? 0;
          return (
            <li key={entry.textId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="font-bold leading-snug text-slate-900">{entry.title}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                {entry.sourceName && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
                    {entry.sourceName}
                  </span>
                )}
                <span>Completed {formatDate(entry.completedAt)}</span>
                {count > 0 && (
                  <span>
                    · {count} {count === 1 ? "word" : "words"} saved
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
