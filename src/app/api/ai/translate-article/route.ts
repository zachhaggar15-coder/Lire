import { NextResponse } from "next/server";
import { AiNotConfiguredError, translateArticleSentences } from "@/lib/ai/openai";
import { optionalText, requirePaidAiCaller, MAX_ARTICLE_SENTENCES, MAX_ARTICLE_TOTAL_CHARS, MAX_TEXT_CHARS, MAX_TITLE_CHARS } from "@/lib/ai/guard";

/** A whole-article translation can take longer than Vercel's default serverless timeout to come back from OpenAI, and translateArticleSentences now retries up to 3 times internally — sized to cover 3 back-to-back 45s attempts with headroom. */
export const maxDuration = 150;

const NOT_CONFIGURED_MESSAGE = "AI is not configured. Add OPENAI_API_KEY to enable fluent translation.";

function isNumberArray(v: unknown): v is number[] {
  return Array.isArray(v) && v.every((x) => typeof x === "number" && Number.isInteger(x));
}

export async function POST(request: Request) {
  const gate = await requirePaidAiCaller(request);
  if (!gate.ok) return gate.response;

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
  if (sentences.length > MAX_ARTICLE_SENTENCES) {
    return NextResponse.json({ error: `Too many sentences (max ${MAX_ARTICLE_SENTENCES}).` }, { status: 400 });
  }
  // Capping the count alone left the door open: 200 sentences of any length is
  // still an unbounded request. Cost tracks characters, so cap those too.
  if ((sentences as string[]).some((sentence) => sentence.length > MAX_TEXT_CHARS)) {
    return NextResponse.json({ error: `A sentence is too long (max ${MAX_TEXT_CHARS} characters).` }, { status: 400 });
  }
  const totalChars = (sentences as string[]).reduce((sum, sentence) => sum + sentence.length, 0);
  if (totalChars > MAX_ARTICLE_TOTAL_CHARS) {
    return NextResponse.json({ error: `Article is too long (max ${MAX_ARTICLE_TOTAL_CHARS} characters).` }, { status: 400 });
  }
  if (!isNumberArray(paragraphBreakBeforeIndex)) {
    return NextResponse.json({ error: "'paragraphBreakBeforeIndex' must be an array of integers." }, { status: 400 });
  }

  try {
    const result = await translateArticleSentences({
      sentences: sentences as string[],
      paragraphBreakBeforeIndex,
      articleTitle: optionalText(articleTitle, MAX_TITLE_CHARS),
      level: optionalText(level, 80) ?? "A2/B1 French learner",
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
