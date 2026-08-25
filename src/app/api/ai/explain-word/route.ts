import { NextResponse } from "next/server";
import { AiNotConfiguredError, explainWord } from "@/lib/ai/openai";
import { optionalText, requirePaidAiCaller, requireText, MAX_TITLE_CHARS } from "@/lib/ai/guard";

const NOT_CONFIGURED_MESSAGE = "AI is not configured. Add OPENAI_API_KEY to enable explanations.";

export async function POST(request: Request) {
  const gate = await requirePaidAiCaller(request);
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { word, lemma, articleSentence, simpleExampleSentence, surroundingSentence, articleTitle, level } =
    (body ?? {}) as Record<string, unknown>;

  const checkedWord = requireText(word, "word", 120);
  if (!checkedWord.ok) return checkedWord.response;
  const checkedSentence = requireText(articleSentence, "articleSentence");
  if (!checkedSentence.ok) return checkedSentence.response;

  try {
    const result = await explainWord({
      word: checkedWord.value,
      lemma: optionalText(lemma, 120),
      articleSentence: checkedSentence.value,
      simpleExampleSentence: optionalText(simpleExampleSentence),
      surroundingSentence: optionalText(surroundingSentence),
      articleTitle: optionalText(articleTitle, MAX_TITLE_CHARS),
      level: optionalText(level, 80) ?? "A2/B1 French learner",
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: NOT_CONFIGURED_MESSAGE, code: "not_configured" }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI word explanation failed." },
      { status: 502 }
    );
  }
}
