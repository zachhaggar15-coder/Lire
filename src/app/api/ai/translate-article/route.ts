import { NextResponse } from "next/server";
import { AiNotConfiguredError, translateArticleSentences } from "@/lib/ai/openai";

/** A whole-article translation can take longer than Vercel's default serverless timeout to come back from OpenAI. */
export const maxDuration = 60;

const NOT_CONFIGURED_MESSAGE = "AI is not configured. Add OPENAI_API_KEY to enable fluent translation.";
/** A generous cap — a genuinely huge sentence count would mean something upstream (tokenizeParagraphsToSentences) already misbehaved. */
const MAX_SENTENCES = 200;

function isNumberArray(v: unknown): v is number[] {
  return Array.isArray(v) && v.every((x) => typeof x === "number" && Number.isInteger(x));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { sentences, paragraphBreakBeforeIndex, articleTitle, level } = (body ?? {}) as Record<string, unknown>;

  if (!Array.isArray(sentences) || sentences.length === 0 || !sentences.every((s) => typeof s === "string" && s.trim())) {
    return NextResponse.json({ error: "'sentences' must be a non-empty array of non-empty strings." }, { status: 400 });
  }
  if (sentences.length > MAX_SENTENCES) {
    return NextResponse.json({ error: `Too many sentences (max ${MAX_SENTENCES}).` }, { status: 400 });
  }
  if (!isNumberArray(paragraphBreakBeforeIndex)) {
    return NextResponse.json({ error: "'paragraphBreakBeforeIndex' must be an array of integers." }, { status: 400 });
  }

  try {
    const result = await translateArticleSentences({
      sentences: sentences as string[],
      paragraphBreakBeforeIndex,
      articleTitle: typeof articleTitle === "string" && articleTitle ? articleTitle : null,
      level: typeof level === "string" && level ? level : "A2/B1 French learner",
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: NOT_CONFIGURED_MESSAGE, code: "not_configured" }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI article translation failed." },
      { status: 502 }
    );
  }
}
