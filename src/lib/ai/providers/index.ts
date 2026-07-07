import type { AiProvider } from "@/lib/ai/types";
import { OpenAiProvider } from "@/lib/ai/providers/openai";

/**
 * Server-only provider selection. Route handlers import `aiProvider` from
 * here and never touch a concrete provider class directly.
 *
 * To add another provider (Anthropic, Gemini, DeepL, ...):
 *   1. Create providers/<name>.ts implementing AiProvider.
 *   2. Add a case below.
 *   3. Set AI_PROVIDER=<name> (+ that provider's own API key env var).
 * Nothing else in the app needs to change.
 */
function createProvider(): AiProvider {
  const name = (process.env.AI_PROVIDER || "openai").toLowerCase();
  switch (name) {
    case "openai":
    default:
      return new OpenAiProvider();
  }
}

export const aiProvider: AiProvider = createProvider();
