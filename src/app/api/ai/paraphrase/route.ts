import { NextResponse } from "next/server";
import { AiNotConfiguredError, generateParaphraseOptions } from "@/lib/ai/openai";

const NOT_CONFIGURED_MESSAGE = "AI is not configured. Add OPENAI_API_KEY to enable paraphrase practice.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { sentence, articleTitle, level } = (body ?? {}) as Record<string, unknown>;

  if (typeof sentence !== "string" || !sentence.trim()) {
    return NextResponse.json({ error: "'sentence' is a required string." }, { status: 400 });
  }

  try {
    const result = await generateParaphraseOptions({
      sentence,
      articleTitle: typeof articleTitle === "string" ? articleTitle : null,
      level: typeof level === "string" && level ? level : "A2/B1 French learner",
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: NOT_CONFIGURED_MESSAGE, code: "not_configured" }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI paraphrase generation failed." },
      { status: 502 }
    );
  }
}
