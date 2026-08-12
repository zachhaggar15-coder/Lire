interface RouteLoadingProps {
  variant?: "list" | "reader" | "review";
}

export default function RouteLoading({ variant = "list" }: RouteLoadingProps) {
  return (
    <div className="ligne-screen" role="status" aria-label="Loading screen">
      <div className="animate-pulse" aria-hidden="true">
        <div className="mb-6 flex min-h-14 items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-cream-fill" />
          <div className="flex-1">
            <div className="h-3 w-20 rounded-full bg-cream-strong" />
            <div className="mt-2 h-7 w-40 rounded-xl bg-cream-fill" />
          </div>
        </div>
        {variant === "reader" ? (
          <>
            <div className="h-40 rounded-card bg-cream-fill" />
            <div className="mt-6 space-y-3">
              <div className="h-4 w-full rounded bg-cream-strong" />
              <div className="h-4 w-11/12 rounded bg-cream-fill" />
              <div className="h-4 w-full rounded bg-cream-strong" />
              <div className="h-4 w-4/5 rounded bg-cream-fill" />
            </div>
          </>
        ) : variant === "review" ? (
          <>
            <div className="h-64 rounded-card bg-cream-fill" />
            <div className="mt-4 h-12 rounded-full bg-cream-strong" />
          </>
        ) : (
          <div className="space-y-3">
            <div className="h-28 rounded-card bg-cream-fill" />
            <div className="h-24 rounded-card bg-cream-strong" />
            <div className="h-24 rounded-card bg-cream-fill" />
          </div>
        )}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
