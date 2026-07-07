import { cacheStore, articleCacheKey } from "@/lib/ai/cache";

/**
 * Full-article translation, cached per text id — a given article is only
 * ever sent to the API once, no matter how many times its "Show full
 * translation" disclosure is opened. Returns null on failure.
 */
export async function getArticleTranslation(
  textId: string,
  text: string
): Promise<string | null> {
  const key = articleCacheKey(textId);
  const cached = cacheStore.get<string>(key);
  if (cached) return cached;

  try {
    const res = await fetch("/api/ai/article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;

    const { translation }: { translation: string } = await res.json();
    cacheStore.set(key, translation);
    return translation;
  } catch {
    return null;
  }
}
