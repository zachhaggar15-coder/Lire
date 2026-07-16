import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const origin = new URL(request.url).origin;
  const warmups = [
    "/api/rss-texts?limit=50&refresh=true",
    "/api/rss-texts?limit=8&snippets=only",
    "/api/rss-texts?limit=8&category=news-style&snippets=exclude",
  ];

  const results = await Promise.all(
    warmups.map(async (path) => {
      const res = await fetch(new URL(path, origin), { cache: "no-store" });
      return { path, ok: res.ok, status: res.status };
    })
  );

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
