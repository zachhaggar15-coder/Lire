import { NextResponse } from "next/server";
import { AiNotConfiguredError, explainSentence } from "@/lib/ai/openai";

const NOT_CONFIGURED_MESSAGE = "AI is not configured. Add OPENAI_API_KEY to enable explanations.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { sentence, articleTitle, previousSentence, nextSentence, level } =
    (body ?? {}) as Record<string, unknown>;

  if (typeof sentence !== "string" || !sentence.trim()) {
    return NextResponse.json({ error: "'sentence' is a required string." }, { status: 400 });
  }

  try {
    const result = await explainSentence({
      sentence,
      articleTitle: typeof articleTitle === "string" && articleTitle ? articleTitle : null,
      previousSentence: typeof previousSentence === "string" ? previousSentence : null,
      nextSentence: typeof nextSentence === "string" ? nextSentence : null,
      level: typeof level === "string" && level ? level : "A2/B1 French learner",
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: NOT_CONFIGURED_MESSAGE, code: "not_configured" }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI sentence explanation failed." },
      { status: 502 }
    );
  }
}
