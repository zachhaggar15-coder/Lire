import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const origin = new URL(request.url).origin;
  const warmups = [
    "/api/rss-texts?limit=50&refresh=true",
    "/api/rss-texts?limit=8&snippets=only",
    "/api/rss-texts?limit=8&category=news-style&snippets=exclude",
  ];

  // Sequential, not Promise.all: only the first call forces a real rebuild
  // (refresh=true) and persists it to Redis (rssTextStore.ts). Firing all
  // three concurrently risked the 2nd/3rd landing on a different serverless
  // instance and reading Redis before the first call's write had completed,
  // each triggering its own independent ~20s rebuild instead of reusing the
  // one this route just paid for.
  const results: { path: string; ok: boolean; status: number }[] = [];
  for (const path of warmups) {
    const res = await fetch(new URL(path, origin), { cache: "no-store" });
    results.push({ path, ok: res.ok, status: res.status });
  }

  const ok = results.every((result) => result.ok);
  return NextResponse.json(
    {
      ok,
      refreshedAt: new Date().toISOString(),
      results,
    },
    { status: ok ? 200 : 502 }
  );
}
