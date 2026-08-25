import { NextResponse } from "next/server";
import { AiNotConfiguredError, generateParaphraseOptions } from "@/lib/ai/openai";
import { optionalText, requirePaidAiCaller, requireText, MAX_TITLE_CHARS } from "@/lib/ai/guard";

const NOT_CONFIGURED_MESSAGE = "AI is not configured. Add OPENAI_API_KEY to enable paraphrase practice.";

export async function POST(request: Request) {
  const gate = await requirePaidAiCaller(request);
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { sentence, articleTitle, level } = (body ?? {}) as Record<string, unknown>;

  const checked = requireText(sentence, "sentence");
  if (!checked.ok) return checked.response;

  try {
    const result = await generateParaphraseOptions({
      sentence: checked.value,
      articleTitle: optionalText(articleTitle, MAX_TITLE_CHARS),
      level: optionalText(level, 80) ?? "A2/B1 French learner",
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
