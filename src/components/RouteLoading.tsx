interface RouteLoadingProps {
  variant?: "lessons" | "reader" | "review" | "library";
}

function HeaderSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="mb-5" aria-hidden="true">
      <div className="h-3 w-20 rounded-full bg-cream-strong" />
      <div className={`mt-2 rounded-xl bg-cream-fill ${compact ? "h-7 w-36" : "h-8 w-44"}`} />
      <div className="mt-2 h-3 w-52 max-w-[70%] rounded-full bg-cream-strong" />
    </div>
  );
}

function LessonsSkeleton() {
  return (
    <>
      <HeaderSkeleton />
      <div className="mb-4 grid grid-cols-3 gap-2" aria-hidden="true">
        {[0, 1, 2].map((item) => <div key={item} className="h-16 rounded-2xl bg-cream-fill" />)}
      </div>
      <div className="h-48 rounded-card bg-cream-fill" aria-hidden="true" />
      <div className="mt-4 space-y-3" aria-hidden="true">
        <div className="h-24 rounded-card bg-cream-strong" />
        <div className="h-24 rounded-card bg-cream-fill" />
      </div>
    </>
  );
}

function ReaderSkeleton() {
  return (
    <>
      <div className="mb-4 h-12 w-20 rounded-full bg-cream-fill" aria-hidden="true" />
      <div className="overflow-hidden rounded-card border border-cream-dark" aria-hidden="true">
        <div className="bg-brand-light/60 p-4">
          <div className="h-5 w-16 rounded-full bg-cream-card/80" />
          <div className="mt-3 h-8 w-4/5 rounded-xl bg-cream-card/80" />
          <div className="mt-2 h-3 w-20 rounded-full bg-cream-card/80" />
        </div>
        <div className="grid grid-cols-2 gap-2 p-3.5">
          <div className="h-12 rounded-full bg-cream-fill" />
          <div className="h-12 rounded-full bg-cream-fill" />
        </div>
      </div>
      <div className="mt-5 border-t border-cream-dark pt-5" aria-hidden="true">
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-cream-strong" />
          <div className="h-4 w-11/12 rounded bg-cream-fill" />
          <div className="h-4 w-full rounded bg-cream-strong" />
          <div className="h-4 w-4/5 rounded bg-cream-fill" />
        </div>
      </div>
    </>
  );
}

function ReviewSkeleton() {
  return (
    <>
      <HeaderSkeleton compact />
      <div className="grid grid-cols-4 gap-2" aria-hidden="true">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-[5.5rem] rounded-2xl bg-cream-fill" />)}
      </div>
      <div className="mx-auto mt-14 h-24 w-24 rounded-full bg-brand-light/70" aria-hidden="true" />
      <div className="mx-auto mt-5 h-5 w-44 rounded-full bg-cream-strong" aria-hidden="true" />
      <div className="mx-auto mt-3 h-3 w-60 max-w-[75%] rounded-full bg-cream-fill" aria-hidden="true" />
      <div className="mx-auto mt-5 h-12 w-36 rounded-full bg-cream-strong" aria-hidden="true" />
    </>
  );
}

function LibrarySkeleton() {
  return (
    <>
      <HeaderSkeleton />
      <div className="h-28 rounded-card bg-cream-fill" aria-hidden="true" />
      <div className="mt-4 h-3 w-20 rounded-full bg-cream-strong" aria-hidden="true" />
      <div className="mt-3 space-y-3" aria-hidden="true">
        <div className="h-44 rounded-card bg-cream-fill" />
        <div className="h-32 rounded-card bg-cream-strong" />
        <div className="h-32 rounded-card bg-cream-fill" />
      </div>
    </>
  );
}

export default function RouteLoading({ variant = "lessons" }: RouteLoadingProps) {
  return (
    <div className="ligne-screen route-loading-delayed" role="status" aria-live="polite" aria-label="Loading screen">
      <div className="animate-pulse">
        {variant === "reader" ? <ReaderSkeleton /> : variant === "review" ? <ReviewSkeleton /> : variant === "library" ? <LibrarySkeleton /> : <LessonsSkeleton />}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
