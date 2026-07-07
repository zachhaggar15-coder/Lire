import { NextResponse } from "next/server";
import { aiProvider } from "@/lib/ai/providers";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { text } = (body ?? {}) as Record<string, unknown>;
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "'text' is a required string." }, { status: 400 });
  }

  try {
    const translation = await aiProvider.translateArticle(text);
    return NextResponse.json({ translation });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Article translation failed." },
      { status: 502 }
    );
  }
}
