import { NextResponse } from "next/server";
import { AiNotConfiguredError, explainWord } from "@/lib/ai/openai";

const NOT_CONFIGURED_MESSAGE = "AI is not configured. Add OPENAI_API_KEY to enable explanations.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { word, lemma, articleSentence, simpleExampleSentence, surroundingSentence, articleTitle, level } =
    (body ?? {}) as Record<string, unknown>;

  if (typeof word !== "string" || !word.trim() || typeof articleSentence !== "string" || !articleSentence.trim()) {
    return NextResponse.json(
      { error: "Both 'word' and 'articleSentence' are required strings." },
      { status: 400 }
    );
  }

  try {
    const result = await explainWord({
      word,
      lemma: typeof lemma === "string" && lemma ? lemma : null,
      articleSentence,
      simpleExampleSentence: typeof simpleExampleSentence === "string" ? simpleExampleSentence : null,
      surroundingSentence: typeof surroundingSentence === "string" ? surroundingSentence : null,
      articleTitle: typeof articleTitle === "string" ? articleTitle : null,
      level: typeof level === "string" && level ? level : "A2/B1 French learner",
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
