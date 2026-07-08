import { NextResponse } from "next/server";
import { getPersistedRssText } from "@/lib/rss/rssTextStore";

/**
 * Fallback lookup for an RSS article by id, used by the reader page when
 * the client-side sessionStorage cache doesn't have it (e.g. a direct link
 * opened in a fresh tab). Returns 404 if there's no configured store, the
 * text expired, or it was never persisted — the reader page treats that as
 * "not available anymore," same as before this existed.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const text = await getPersistedRssText(id);
  if (!text) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ text });
}
