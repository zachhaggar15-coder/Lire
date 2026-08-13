import { NextResponse } from "next/server";
import { refreshAndPersistCandidatePool } from "@/lib/rss/candidatePoolRefresh";

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const refresh = await refreshAndPersistCandidatePool();
  if (!refresh.ok) {
    return NextResponse.json(
      {
        ok: false,
        refreshStatus: refresh.status,
        error: refresh.persistenceReason,
        poolSize: refresh.pool?.items.length,
        feedsSucceeded: refresh.pool?.feedsSucceeded,
        feedsFailed: refresh.pool?.feedsFailed,
      },
      { status: refresh.status === "not-configured" ? 503 : 502 }
    );
  }

  const origin = new URL(request.url).origin;
  const warmups = [
    "/api/rss-texts?limit=24&snippets=exclude",
    "/api/rss-texts?limit=12&snippets=exclude",
    "/api/rss-texts?limit=8&snippets=only",
  ];

  // The pool has already been atomically promoted. These requests now prime
  // the exact public URLs used by the News page, Home page and snippets block.
  // Pragma forces an existing CDN entry to revalidate against the new pool.
  const results: { path: string; ok: boolean; status: number }[] = [];
  for (const path of warmups) {
    const res = await fetch(new URL(path, origin), {
      cache: "no-store",
      headers: { pragma: "no-cache" },
    });
    results.push({ path, ok: res.ok, status: res.status });
  }

  const ok = results.every((result) => result.ok);
  return NextResponse.json(
    {
      ok,
      refreshStatus: refresh.status,
      refreshedAt:
        refresh.status === "refreshed" ? new Date(refresh.pool.builtAt).toISOString() : new Date().toISOString(),
      persistenceReason: refresh.persistenceReason,
      ...(refresh.status === "refreshed" && {
        buildDurationMs: refresh.pool.buildDurationMs ?? null,
        poolSize: refresh.pool.items.length,
        feedsSucceeded: refresh.pool.feedsSucceeded,
        feedsFailed: refresh.pool.feedsFailed,
      }),
      results,
    },
    { status: ok ? 200 : 502 }
  );
}
