import Link from "next/link";
import { changelogEntries } from "@/data/changelog";

const TYPE_STYLE = {
  new: "bg-brand-light text-brand",
  improved: "bg-sky-100 text-sky-700",
  fixed: "bg-emerald-100 text-emerald-700",
};

export default function ChangelogPage() {
  return (
    <div className="px-4 pt-6">
      <Link href="/" className="text-sm font-semibold text-brand">
        Back to dashboard
      </Link>
      <header className="mb-5 mt-2">
        <h1 className="text-2xl font-extrabold text-ink">What&apos;s new</h1>
        <p className="text-sm text-ink-muted">A short record of visible Lire improvements.</p>
      </header>

      <div className="space-y-3">
        {changelogEntries.map((entry) => (
          <article key={`${entry.date}-${entry.title}`} className="rounded-3xl bg-cream-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-ink-muted">{new Date(`${entry.date}T12:00:00`).toLocaleDateString()}</p>
                <h2 className="mt-1 text-lg font-extrabold text-ink">{entry.title}</h2>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${TYPE_STYLE[entry.type]}`}>
                {entry.type}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{entry.summary}</p>
            {entry.featureHref && (
              <Link href={entry.featureHref} className="mt-3 inline-block text-sm font-semibold text-brand underline underline-offset-2">
                Open feature
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
