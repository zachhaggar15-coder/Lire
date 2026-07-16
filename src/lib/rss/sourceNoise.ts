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

export function stripSourceBoilerplate(text: string): string {
  let current = text
    .split("\n")
    .filter((line) => !isStandaloneSourceFooterLine(line.trim()))
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
  const body = stripSourceBoilerplate(text.body);
  if (body === text.body) return text;
  return {
    ...text,
    body,
  };
}
