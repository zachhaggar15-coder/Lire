import { NextResponse } from "next/server";
import { AiNotConfiguredError, translateArticleParagraphs } from "@/lib/ai/openai";

/** A whole-article translation can take longer than Vercel's default serverless timeout to come back from OpenAI. */
export const maxDuration = 60;

const NOT_CONFIGURED_MESSAGE = "AI is not configured. Add OPENAI_API_KEY to enable fluent translation.";
/** A generous cap — a genuinely huge paragraph count would mean something upstream (tokenizeParagraphsToSentences) already misbehaved. */
const MAX_PARAGRAPHS = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { paragraphs, articleTitle, level } = (body ?? {}) as Record<string, unknown>;

  if (!Array.isArray(paragraphs) || paragraphs.length === 0 || !paragraphs.every((p) => typeof p === "string" && p.trim())) {
    return NextResponse.json({ error: "'paragraphs' must be a non-empty array of non-empty strings." }, { status: 400 });
  }
  if (paragraphs.length > MAX_PARAGRAPHS) {
    return NextResponse.json({ error: `Too many paragraphs (max ${MAX_PARAGRAPHS}).` }, { status: 400 });
  }

  try {
    const result = await translateArticleParagraphs({
      paragraphs: paragraphs as string[],
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
