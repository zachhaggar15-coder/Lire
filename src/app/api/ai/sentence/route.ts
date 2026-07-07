import { NextResponse } from "next/server";
import { aiProvider } from "@/lib/ai/providers";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { sentence, previousSentence } = (body ?? {}) as Record<string, unknown>;
  if (typeof sentence !== "string" || !sentence.trim()) {
    return NextResponse.json({ error: "'sentence' is a required string." }, { status: 400 });
  }

  try {
    const result = await aiProvider.explainSentence(
      sentence,
      typeof previousSentence === "string" ? previousSentence : undefined
    );
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sentence explanation failed." },
      { status: 502 }
    );
  }
}
