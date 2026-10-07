import { NextResponse } from "next/server";
import { generateParaphraseOptions } from "@/lib/ai/openai";
import { optionalText, requirePaidAiCaller, requireText, MAX_TITLE_CHARS, aiFailureResponse, learnerLevel } from "@/lib/ai/guard";


export async function POST(request: Request) {
  const gate = await requirePaidAiCaller(request);
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { sentence, articleTitle, level } = (body ?? {}) as Record<string, unknown>;

  const checked = requireText(sentence, "sentence");
  if (!checked.ok) return checked.response;

  try {
    const result = await generateParaphraseOptions({
      sentence: checked.value,
      articleTitle: optionalText(articleTitle, MAX_TITLE_CHARS),
      level: learnerLevel(level),
    });
    return NextResponse.json(result);
  } catch (err) {
    return aiFailureResponse(err);
  }
}
