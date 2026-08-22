import Link from "next/link";

export default function ReaderAccessGate() {
  return (
    <div className="ligne-screen flex min-h-[70dvh] items-center">
      <section className="w-full rounded-card border border-brand/20 bg-cream-card p-6 text-center shadow-raised">
        <p className="ligne-label">Today&apos;s free article used</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Keep reading with Premium</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
          The free version includes one article each day with no account needed. Lire Premium unlocks every article for £3.99 a month.
        </p>
        <Link href="/premium" className="mt-5 inline-flex min-h-12 items-center rounded-full bg-brand px-6 py-3 font-semibold text-white">
          See Lire Premium
        </Link>
        <Link href="/" className="mt-3 block text-sm font-semibold text-ink-muted underline underline-offset-2">
          Back to lessons
        </Link>
        <p className="mt-5 text-xs text-ink-faint">Another free article becomes available tomorrow.</p>
      </section>
    </div>
  );
}
