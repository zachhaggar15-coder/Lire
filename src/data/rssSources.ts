import type { Category } from "@/types";

export interface RssSource {
  id: string;
  name: string;
  /**
   * Reuses the app's fixed `Category` union (rather than a bare string) so
   * every RSS-derived text stays compatible with `CATEGORY_STYLES` in
   * ReadingCard — no risk of an unstyled/unknown category leaking through.
   */
  category: Category;
  feedUrl: string;
  language: "fr";
  enabled: boolean;
}

/**
 * Add or remove feeds here. Each enabled source contributes at most one
 * reading text (the first item that passes the content-quality checks in
 * src/lib/rss/cleanContent.ts). To disable a feed without deleting it,
 * flip `enabled` to false.
 */
export const rssSources: RssSource[] = [
  {
    id: "france24",
    name: "France 24",
    category: "news-style",
    feedUrl: "https://www.france24.com/fr/rss",
    language: "fr",
    enabled: true,
  },
  {
    id: "rfi",
    name: "RFI",
    category: "news-style",
    feedUrl: "https://www.rfi.fr/fr/rss",
    language: "fr",
    enabled: true,
  },
  {
    id: "lemonde",
    name: "Le Monde",
    category: "news-style",
    feedUrl: "https://www.lemonde.fr/rss/une.xml",
    language: "fr",
    enabled: true,
  },
  {
    id: "20minutes",
    name: "20 Minutes",
    category: "everyday life",
    feedUrl: "https://www.20minutes.fr/feeds/rss-une.xml",
    language: "fr",
    enabled: true,
  },
  {
    id: "sudouest",
    name: "Sud Ouest",
    category: "everyday life",
    feedUrl: "https://www.sudouest.fr/essentiel/rss.xml",
    language: "fr",
    enabled: true,
  },
  {
    id: "franceinfo",
    name: "Franceinfo",
    category: "news-style",
    feedUrl: "https://www.francetvinfo.fr/titres.rss",
    language: "fr",
    enabled: true,
  },
  {
    id: "liberation",
    name: "Libération",
    category: "culture",
    feedUrl: "https://www.liberation.fr/arc/outboundfeeds/rss-all/",
    language: "fr",
    enabled: true,
  },
  {
    id: "lefigaro",
    name: "Le Figaro",
    category: "news-style",
    feedUrl: "https://www.lefigaro.fr/rss/figaro_actualites.xml",
    language: "fr",
    enabled: true,
  },
  {
    id: "numerama",
    name: "Numerama",
    category: "science",
    feedUrl: "https://www.numerama.com/feed/",
    language: "fr",
    enabled: true,
  },
  {
    id: "ouestfrance",
    name: "Ouest-France",
    category: "everyday life",
    feedUrl: "https://www.ouest-france.fr/rss-en-continu.xml",
    language: "fr",
    enabled: true,
  },
];
