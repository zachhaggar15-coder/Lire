import { NextResponse } from "next/server";
import { aiProvider } from "@/lib/ai/providers";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { word, sentence, previousSentence } = (body ?? {}) as Record<string, unknown>;
  if (typeof word !== "string" || !word.trim() || typeof sentence !== "string" || !sentence.trim()) {
    return NextResponse.json(
      { error: "Both 'word' and 'sentence' are required strings." },
      { status: 400 }
    );
  }

  try {
    const analysis = await aiProvider.translateWord(
      word,
      sentence,
      typeof previousSentence === "string" ? previousSentence : undefined
    );
    return NextResponse.json(analysis);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Word translation failed." },
      { status: 502 }
    );
  }
}
