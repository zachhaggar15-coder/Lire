import type { ReadingText } from "@/types";

const SOURCE_FOOTER_RE =
  /\b(?:appeared\s+first\s+on|apparu\s+en\s+premier\s+sur|publie\s+en\s+premier\s+sur|publi\u00e9\s+en\s+premier\s+sur|paru\s+en\s+premier\s+sur)\b/i;

const TRAILING_SOURCE_FOOTER_RE =
  /(^|[\s.!?\u2026])[^.!?\u2026\n]*(?:appeared\s+first\s+on|apparu\s+en\s+premier\s+sur|publie\s+en\s+premier\s+sur|publi\u00e9\s+en\s+premier\s+sur|paru\s+en\s+premier\s+sur)[^.!?\u2026\n]*[.!?\u2026]?\s*$/i;

function normalizeLoose(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compact(value: string): string {
  return normalizeLoose(value).replace(/\s+/g, "");
}

function hostParts(sourceUrl?: string | null): string[] {
  if (!sourceUrl) return [];
  try {
    const hostname = new URL(sourceUrl).hostname.replace(/^www\./, "");
    const withoutTld = hostname.split(".").slice(0, -1).join(".");
    return [hostname, withoutTld, ...withoutTld.split(/[.-]/)].filter(Boolean);
  } catch {
    return [];
  }
}

function sourceAliases(sourceName?: string | null, sourceUrl?: string | null): Set<string> {
  const aliases = new Set<string>();
  for (const value of [sourceName ?? "", ...hostParts(sourceUrl)]) {
    const key = compact(value);
    if (key.length >= 4) aliases.add(key);
  }
  return aliases;
}

export function isSourceFooterText(text: string): boolean {
  return SOURCE_FOOTER_RE.test(normalizeLoose(text));
}

export function isStandaloneSourceFooterLine(text: string): boolean {
  const normalized = normalizeLoose(text);
  return (
    /^(?:est\s+)?(?:apparu|paru|publie)\s+en\s+premier\s+sur\b/.test(normalized) ||
    /^the\s+post\b.*\bappeared\s+first\s+on\b/.test(normalized) ||
    /^(?:l\s+article|cet\s+article)\b.*\b(?:apparu|paru|publie)\s+en\s+premier\s+sur\b/.test(normalized)
  );
}

function isStandaloneSourceAttribution(text: string, sourceName?: string | null, sourceUrl?: string | null): boolean {
  const lineKey = compact(text.replace(/[-–—|]+\s*$/u, ""));
  if (!lineKey) return false;
  for (const alias of sourceAliases(sourceName, sourceUrl)) {
    if (lineKey === alias) return true;
    // Publishers sometimes prefix their configured name with a short French
    // article (for example "Les Dernières Nouvelles d'Alsace -").
    if (lineKey.endsWith(alias) && lineKey.length - alias.length <= 3) return true;
  }
  return false;
}

export function stripSourceBoilerplate(text: string, sourceName?: string | null, sourceUrl?: string | null): string {
  let current = text
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      return !isStandaloneSourceFooterLine(trimmed) && !isStandaloneSourceAttribution(trimmed, sourceName, sourceUrl);
    })
    .join("\n");

  let previous: string;
  do {
    previous = current;
    current = current
      .replace(TRAILING_SOURCE_FOOTER_RE, (_match, boundary: string) => (/[.!?\u2026]/.test(boundary) ? boundary : ""))
      .trimEnd();
  } while (current !== previous);

  return current;
}

export function isLikelySourceBoilerplateToken({
  word,
  contextSentence,
  sourceName,
  sourceUrl,
}: {
  word: string;
  contextSentence?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
}): boolean {
  const key = compact(word);
  if (key.length < 4) return false;

  const aliases = sourceAliases(sourceName, sourceUrl);
  if (aliases.has(key)) return true;

  if (!contextSentence || !isSourceFooterText(contextSentence)) return false;
  const sentenceKey = compact(contextSentence);
  if (!sentenceKey.includes(key)) return false;

  const sourceNameKey = compact(sourceName ?? "");
  if (sourceNameKey && sourceNameKey.includes(key)) return true;
  return hostParts(sourceUrl).some((part) => compact(part).includes(key));
}

export function cleanReadingTextSourceNoise(text: ReadingText): ReadingText {
  const body = stripSourceBoilerplate(text.body, text.sourceName, text.sourceUrl);
  if (body === text.body) return text;
  return {
    ...text,
    body,
  };
}
