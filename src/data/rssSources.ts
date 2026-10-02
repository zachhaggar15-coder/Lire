import type { Category } from "@/types";

export interface RssContentUsePolicy {
  title: boolean;
  description: boolean;
  fullFeedText: boolean;
  linkedPageContent: boolean;
}

interface RssSourceBase {
  id: string;
  name: string;
  /**
   * Reuses the app's fixed `Category` union (rather than a bare string) so
   * every RSS-derived text stays compatible with `CATEGORY_STYLES` in
   * ReadingCard — no risk of an unstyled/unknown category leaking through.
   * Category assignment here is a sensible default, not a precise
   * classification — many sources cover more than one topic.
   */
  category: Category;
  feedUrl: string;
  /**
   * "fr" (French-language), "en" (English-language, often about France),
   * or "mixed" (uncertain/varies by post). `"en"` sources are skipped
   * entirely by the RSS pipeline (this is a *French* reading app) unless
   * `allowEnglishForTesting` is explicitly set — see
   * `src/app/api/rss-texts/route.ts`. The `?language=` query param on
   * `/api/rss-texts` can still filter the (already French-only) candidate
   * pool by this field.
   */
  language: "fr" | "en" | "mixed";
  /** Overrides DEFAULT_MIN_WORDS (src/lib/rss/contentQuality.ts) for this feed specifically. */
  minWords?: number;
  /**
   * Overrides the normal two-sentence prose floor for a reviewed feed whose
   * official descriptions are deliberately concise but complete. Keep this
   * source-specific: it must not relax the default quality bar globally.
   */
  minSentences?: 1 | 2;
  /** Overrides the pipeline's default of 2 accepted items per feed. */
  maxItems?: number;
  /**
   * Opt-in escape hatch for testing an English feed through the pipeline
   * without it being silently skipped by the language gate. Not meant to be
   * left on for a real feed in normal use — see "why English feeds are
   * disabled" in the README.
   */
  allowEnglishForTesting?: boolean;
  /**
   * Opt-out for full-article scraping (see src/lib/rss/scrapeArticle.ts and
   * "Full-length articles" in the README) — set to `false` for a source
   * known to block scraping (paywall, bot protection) so the pipeline
   * doesn't waste a request+timeout attempting it every refresh. Defaults
   * to `true`; only attempted at all when the feed's own teaser is short.
   */
  allowScraping?: boolean;
}

/**
 * Enabled feeds are an explicit legal/technical whitelist. TypeScript makes
 * the provenance and permitted-use fields mandatory whenever `enabled` is
 * true, so a future source cannot be switched on as a one-line config edit.
 */
export interface ApprovedRssSource extends RssSourceBase {
  enabled: true;
  siteUrl: string;
  attributionText: string;
  reuseBasis: string;
  reuseTermsUrl: string;
  reuseTermsCheckedAt: string;
  contentUse: RssContentUsePolicy;
  notes: string;
  /** Maximum age of an item at ingestion time. */
  maxItemAgeDays: number;
}

export interface DisabledRssSource extends RssSourceBase {
  enabled: false;
  siteUrl?: string;
  attributionText?: string;
  reuseBasis?: string;
  reuseTermsUrl?: string;
  reuseTermsCheckedAt?: string;
  contentUse?: RssContentUsePolicy;
  notes?: string;
  maxItemAgeDays?: number;
}

export type RssSource = ApprovedRssSource | DisabledRssSource;

export function isApprovedRssSource(source: RssSource): source is ApprovedRssSource {
  return source.enabled;
}

/**
 * A reviewed whitelist followed by the historical, disabled source catalogue.
 * Only the entries with `enabled: true` are production inputs. Each enabled
 * entry carries the terms review and a field-level use policy.
 *
 * Most of the English-language sources below are kept in the list with
 * `enabled: false` (rather than deleted) so the metadata/history isn't
 * lost — this is a French reading app, and an English "article" would
 * defeat the entire point of the exercise. See "RSS reading content" in
 * the README for why fewer, French, high-quality candidates beat a bigger
 * mixed-language pool.
 *
 * To add a feed: append an entry with a fresh, unique `id`. To remove one
 * without deleting its config, set `enabled: false`.
 */
/**
 * Historical commercial sources remain disabled. Read this before turning
 * any of them back on.
 *
 * The legacy pipeline did not merely read these feeds; scrapeArticle.ts followed
 * each item to the publisher's page and extracted the full article body. Several of the
 * sources below are national newspapers — Le Monde, Mediapart, La Croix,
 * Marianne — and several more are regional dailies. Mediapart is funded
 * entirely by subscriptions.
 *
 * An RSS feed is an invitation to read the feed. It is not a licence to
 * reproduce the article it links to, and Sorlio charges for access, which
 * makes any reproduction commercial use of someone else's work. Linking back
 * and naming the source is good manners; it is not permission.
 *
 * So the feature ships switched off rather than deleted. Nothing else changes:
 * createFallbackCandidatePool() (src/lib/rss/candidatePool.ts) fills the same
 * surfaces from the public-domain bank, and the app still has ~1,590 texts
 * that are either written for it or genuinely free to use.
 *
 * Turning a source back on remains a licensing decision, not a config change.
 * Before switching one on, establish that its terms actually permit
 * reproducing article text in a paid app, and record what you found.
 */
export const rssSources: RssSource[] = [
  {
    id: "service-public-particuliers",
    name: "Service-Public.fr — Particuliers",
    category: "everyday life",
    feedUrl: "https://www.service-public.gouv.fr/abonnements/rss/actu-actualites-particuliers.rss",
    siteUrl: "https://www.service-public.gouv.fr/particuliers/actualites",
    language: "fr",
    enabled: true,
    minWords: 20,
    maxItems: 8,
    maxItemAgeDays: 14,
    attributionText: "Source : service-public.fr — Direction de l’information légale et administrative",
    reuseBasis: "Service-Public authorises webmasters and bloggers to freely redistribute its RSS news when the source is visibly identified.",
    reuseTermsUrl: "https://www.service-public.gouv.fr/P10008",
    reuseTermsCheckedAt: "2026-10-02",
    contentUse: { title: true, description: true, fullFeedText: false, linkedPageContent: false },
    notes: "Use only the RSS title, description, date and canonical link. Do not scrape the linked page.",
    allowScraping: false,
  },
  {
    id: "service-public-professionnels",
    name: "Service-Public.fr — Entreprendre",
    category: "news-style",
    feedUrl: "https://www.service-public.gouv.fr/abonnements/rss/actu-actu-pro.rss",
    siteUrl: "https://entreprendre.service-public.gouv.fr/actualites",
    language: "fr",
    enabled: true,
    minWords: 20,
    maxItems: 8,
    maxItemAgeDays: 14,
    attributionText: "Source : service-public.fr — Direction de l’information légale et administrative",
    reuseBasis: "Service-Public authorises webmasters and bloggers to freely redistribute its RSS news when the source is visibly identified.",
    reuseTermsUrl: "https://www.service-public.gouv.fr/P10008",
    reuseTermsCheckedAt: "2026-10-02",
    contentUse: { title: true, description: true, fullFeedText: false, linkedPageContent: false },
    notes: "Use only the RSS title, description, date and canonical link. Do not scrape the linked page.",
    allowScraping: false,
  },
  {
    id: "european-commission-news",
    name: "Commission européenne — Actualités",
    category: "news-style",
    feedUrl: "https://commission.europa.eu/node/29665/rss_fr",
    siteUrl: "https://commission.europa.eu/news-and-media/highlighted-news_fr",
    language: "fr",
    enabled: true,
    minWords: 20,
    maxItems: 8,
    maxItemAgeDays: 14,
    attributionText: "Source : Commission européenne — Réutilisation sous CC BY 4.0",
    reuseBasis: "Commission-owned website content is reusable under the Commission legal notice and Decision 2011/833/EU, generally under CC BY 4.0, subject to stated exceptions and third-party rights.",
    reuseTermsUrl: "https://commission.europa.eu/legal-notice_fr",
    reuseTermsCheckedAt: "2026-10-02",
    contentUse: { title: true, description: true, fullFeedText: false, linkedPageContent: false },
    notes: "Use only French RSS title/description text owned by the Commission. Do not use images, logos, third-party material or linked-page content.",
    allowScraping: false,
  },
  {
    id: "europarl-press-releases",
    name: "Parlement européen — Communiqués de presse",
    category: "news-style",
    feedUrl: "https://www.europarl.europa.eu/rss/doc/press-releases/fr.xml",
    siteUrl: "https://www.europarl.europa.eu/news/fr/press-room",
    language: "fr",
    enabled: true,
    minWords: 20,
    minSentences: 1,
    maxItems: 8,
    maxItemAgeDays: 14,
    attributionText: "© Union européenne — Source : Parlement européen",
    reuseBasis: "The European Parliament legal notice permits reuse of EU-owned textual material for commercial or non-commercial dissemination with integrity and source acknowledgement; partial reuse must link to the complete source item.",
    reuseTermsUrl: "https://www.europarl.europa.eu/legal-notice/fr",
    reuseTermsCheckedAt: "2026-10-02",
    contentUse: { title: true, description: true, fullFeedText: false, linkedPageContent: false },
    notes: "Use only the RSS title and description with the complete-item URL. The official feed intentionally publishes complete one-sentence summaries, so this source may use a one-sentence floor; the French-language, word-count, truncation and freshness gates still apply. Reject non-French items and preserve the EU credit supplied by the feed.",
    allowScraping: false,
  },
  { id: "france-today", name: "France Today", category: "culture", feedUrl: "https://francetoday.com/feed/", language: "en", enabled: false },
  { id: "the-good-life-france", name: "The Good Life France", category: "everyday life", feedUrl: "https://thegoodlifefrance.com/feed/", language: "en", enabled: false },
  { id: "tech-n-play", name: "Tech N Play", category: "science", feedUrl: "https://technplay.com/feed/", language: "en", enabled: false },
  { id: "rosbif-blog", name: "Rosbif Blog", category: "everyday life", feedUrl: "https://rosbifblog.com/feed/", language: "en", enabled: false },
  { id: "sig-territoires", name: "SIG Territoires", category: "science", feedUrl: "https://www.sigterritoires.fr/index.php/feed/", language: "fr", enabled: false },
  // Mislabeled fr — verified via /api/rss-texts?health=true on 2026-07-10:
  // every sampled item's title/body is actually English (French-history
  // blog written in English), so every item was correctly rejected by the
  // language check. Corrected the language field and disabled, matching
  // every other genuinely-English source in this list.
  { id: "cas-d-interet", name: "Cas d'Intérêt", category: "news-style", feedUrl: "https://casdinteret.com/feed/", language: "en", enabled: false },
  { id: "hip-paris", name: "HiP Paris", category: "everyday life", feedUrl: "https://hipparis.com/feed/", language: "en", enabled: false },
  // Mislabeled mixed — verified 2026-07-10: 50/50 sampled items were
  // English (personal blog written entirely in English despite the
  // French-sounding name).
  { id: "judic-astille", name: "Judic Astille", category: "everyday life", feedUrl: "https://judicastille.com/feed/", language: "en", enabled: false },
  { id: "french-a-la-carte", name: "French à la Carte", category: "culture", feedUrl: "https://frenchalacarteblog.com/feed/", language: "en", enabled: false },
  { id: "the-provence-post", name: "The Provence Post", category: "everyday life", feedUrl: "https://theprovencepost.blogspot.com/feeds/posts/default", language: "en", enabled: false },
  { id: "a-taste-of-france", name: "A Taste of France", category: "culture", feedUrl: "https://www.a-taste-of-france.com/france.xml", language: "en", enabled: false },
  { id: "life-on-la-lune", name: "Life on La Lune", category: "everyday life", feedUrl: "https://lifeonlalune.com/feed/", language: "en", enabled: false },
  { id: "rvf-nouvelles", name: "RVF Nouvelles", category: "news-style", feedUrl: "https://rvf.ca/nouvelles/feed/", language: "fr", enabled: false },
  { id: "france-says", name: "France Says", category: "everyday life", feedUrl: "https://francesays.com/feed/", language: "en", enabled: false },
  { id: "paris-missives", name: "Paris Missives", category: "everyday life", feedUrl: "https://parismissives.blogspot.com/feeds/posts/default", language: "en", enabled: false },
  { id: "sharon-santoni", name: "Sharon Santoni", category: "everyday life", feedUrl: "https://sharonsantoni.com/feed/", language: "en", enabled: false },
  { id: "oui-in-france", name: "Oui In France", category: "everyday life", feedUrl: "https://www.ouiinfrance.com/feed/", language: "en", enabled: false },
  { id: "bonjour-paris", name: "Bonjour Paris", category: "culture", feedUrl: "https://bonjourparis.com/feed/", language: "en", enabled: false },
  { id: "le-francophile", name: "Le Francophile", category: "culture", feedUrl: "https://lefrancophile.com/feed/", language: "en", enabled: false },
  { id: "live-french", name: "Live French", category: "culture", feedUrl: "https://live-french.net/blog/feed/", language: "en", enabled: false },
  { id: "y-a-pas-le-feu-au-lac", name: "Y'a Pas le Feu au Lac", category: "everyday life", feedUrl: "https://www.yapaslefeuaulac.ch/feed/", language: "fr", enabled: false },
  { id: "paris-perfect", name: "Paris Perfect", category: "everyday life", feedUrl: "https://www.parisperfect.com/blog/feed/", language: "en", enabled: false },
  { id: "secrets-of-paris", name: "Secrets of Paris", category: "everyday life", feedUrl: "https://secretsofparis.com/feed/", language: "en", enabled: false },
  { id: "french-country-cottage", name: "French Country Cottage", category: "everyday life", feedUrl: "https://www.frenchcountrycottage.net/feed/", language: "en", enabled: false },
  { id: "snippets-of-paris", name: "Snippets of Paris", category: "everyday life", feedUrl: "https://snippetsofparis.com/feed/", language: "en", enabled: false },
  // Mislabeled mixed — verified 2026-07-10: an English-language recipe blog, 10/10 sampled items rejected as English.
  { id: "cnz", name: "CNZ", category: "news-style", feedUrl: "https://cnz.to/feed/rdf", language: "en", enabled: false },
  { id: "france-travel-tips", name: "France Travel Tips", category: "everyday life", feedUrl: "https://www.francetraveltips.com/feed/", language: "en", enabled: false },
  { id: "vine-and-the-olive", name: "Vine and the Olive", category: "culture", feedUrl: "https://feeds.feedburner.com/VineAndTheOlive", language: "en", enabled: false },
  { id: "fabulously-french", name: "Fabulously French", category: "culture", feedUrl: "https://fabulouslyfrench.blogspot.com/feeds/posts/default", language: "en", enabled: false },
  { id: "french-entree", name: "French Entrée", category: "everyday life", feedUrl: "https://www.frenchentree.com/feed/", language: "en", enabled: false },
  { id: "david-lebovitz", name: "David Lebovitz", category: "culture", feedUrl: "https://www.davidlebovitz.com/feed/", language: "en", enabled: false },
  { id: "messy-nessy-chic", name: "Messy Nessy Chic", category: "culture", feedUrl: "https://www.messynessychic.com/feed/", language: "en", enabled: false },
  { id: "lawless-french", name: "Lawless French", category: "culture", feedUrl: "https://feeds.feedblitz.com/LawlessFrench", language: "en", enabled: false },
  { id: "une-armoire-pour-deux", name: "Une Armoire Pour Deux", category: "culture", feedUrl: "https://www.unearmoirepourdeux.fr/feed/", language: "fr", enabled: false },
  { id: "the-long-weekend", name: "The Long Weekend", category: "everyday life", feedUrl: "https://www.lelongweekend.com/feed/", language: "en", enabled: false },
  { id: "keith-van-sickle", name: "Keith Van Sickle", category: "everyday life", feedUrl: "https://keithvansickle.com/feed/", language: "en", enabled: false },
  // Mislabeled fr — verified 2026-07-10: this fashion/art magazine's RSS content is entirely English, 10/10 sampled items rejected.
  { id: "crash-magazine", name: "Crash Magazine", category: "culture", feedUrl: "https://www.crash.fr/feed/", language: "en", enabled: false },
  { id: "aussie-in-france", name: "Aussie in France", category: "everyday life", feedUrl: "https://www.aussieinfrance.com/feed/", language: "en", enabled: false },
  { id: "french-affaires", name: "French Affaires", category: "everyday life", feedUrl: "https://frenchaffaires.com/feed/", language: "en", enabled: false },
  { id: "albert-learning-blog", name: "Albert Learning Blog", category: "culture", feedUrl: "https://blog.albert-learning.com/feed/", language: "mixed", enabled: false },
  { id: "la-penderie-de-chloe", name: "La Penderie de Chloé", category: "culture", feedUrl: "https://www.lapenderiedechloe.com/feed/", language: "fr", enabled: false },
  { id: "esl-wq", name: "ESL WQ", category: "culture", feedUrl: "https://www.eslwq.com/blog-feed.xml", language: "en", enabled: false },
  { id: "french-today", name: "French Today", category: "culture", feedUrl: "https://www.frenchtoday.com/blog/feed/", language: "en", enabled: false },
  { id: "fluentu-french", name: "FluentU French", category: "culture", feedUrl: "https://www.fluentu.com/blog/french/feed/", language: "en", enabled: false },
  { id: "arianne-g-voyance", name: "Arianne G Voyance", category: "everyday life", feedUrl: "https://www.arianne-g-voyance.fr/feed/", language: "fr", enabled: false },
  // Mislabeled fr — verified 2026-07-10: English-language Riviera lifestyle blog, all sampled items rejected.
  { id: "haute-vue", name: "Haute Vue", category: "culture", feedUrl: "https://www.haute-vue.com/blog-feed.xml", language: "en", enabled: false },
  // Verified 2026-07-10: feed URL now 404s (Feedburner has been sunsetting old redirects for years).
  { id: "chez-loulou", name: "Chez Loulou", category: "everyday life", feedUrl: "https://feeds.feedburner.com/blogspot/chezloulou", language: "fr", enabled: false },
  // Verified 2026-07-10: fetch/timeout/parse failure — unreachable.
  { id: "prete-moi-paris", name: "Prête-moi Paris", category: "everyday life", feedUrl: "https://pretemoiparis.com/feed/", language: "fr", enabled: false },
  { id: "chut-mon-secret", name: "Chut Mon Secret", category: "everyday life", feedUrl: "https://www.chutmonsecret.com/feed/", language: "fr", enabled: false },
  { id: "the-french-life", name: "The French Life", category: "everyday life", feedUrl: "https://www.thefrenchlife.org/feed/", language: "en", enabled: false },
  { id: "sew-french-embroidery", name: "Sew French Embroidery", category: "culture", feedUrl: "https://sewfrenchembroidery.blogspot.com/feeds/posts/default?alt=rss", language: "en", enabled: false },
  // Verified 2026-07-10: genuinely French, but a headline-only feed (0-word
  // teasers) whose scrape doesn't recover real content either — 3/3 sampled
  // items unrecoverable. Very low volume (3-item feed) besides.
  { id: "la-revue-de-kenza", name: "La Revue de Kenza", category: "culture", feedUrl: "https://larevuedekenza.fr/feed/", language: "fr", enabled: false },
  { id: "french-girl-cuisine", name: "French Girl Cuisine", category: "culture", feedUrl: "https://frenchgirlcuisine.com/fr/feed/", language: "fr", enabled: false },
  { id: "a-french-american-life", name: "A French American Life", category: "everyday life", feedUrl: "https://afrenchamericanlife.com/feed/", language: "en", enabled: false },
  { id: "francais-immersion", name: "Français Immersion", category: "culture", feedUrl: "https://www.francaisimmersion.com/feed/", language: "fr", enabled: false },
  { id: "bonjour-french-words", name: "Bonjour French Words", category: "culture", feedUrl: "https://bonjourfrenchwords.tumblr.com/rss", language: "en", enabled: false },
  { id: "juliet-in-paris", name: "Juliet in Paris", category: "everyday life", feedUrl: "https://julietinparis.net/feed/", language: "en", enabled: false },
  { id: "our-french-oasis", name: "Our French Oasis", category: "everyday life", feedUrl: "https://ourfrenchoasis.com/feed/", language: "en", enabled: false },
  { id: "distant-francophile", name: "Distant Francophile", category: "everyday life", feedUrl: "https://www.distantfrancophile.com/feed/", language: "en", enabled: false },
  { id: "1st-for-french-property", name: "1st for French Property", category: "everyday life", feedUrl: "https://www.1st-for-french-property.co.uk/blog/feed/", language: "en", enabled: false },
  { id: "access-riviera", name: "Access Riviera", category: "everyday life", feedUrl: "https://accessriviera.wordpress.com/feed/", language: "en", enabled: false },
  { id: "my-melange", name: "My Mélange", category: "everyday life", feedUrl: "https://mymelange.net/feed/", language: "en", enabled: false },
  { id: "j-adore-lyon", name: "J'Adore Lyon", category: "everyday life", feedUrl: "https://jadorelyon.com/feed/", language: "en", enabled: false },
  { id: "france-24-english", name: "France 24 English", category: "news-style", feedUrl: "https://www.france24.com/en/rss", language: "en", enabled: false },
  { id: "sud-ouest", name: "Sud Ouest", category: "news-style", feedUrl: "https://www.sudouest.fr/essentiel/rss.xml", language: "fr", enabled: false },
  { id: "le-monde-diplomatique-english", name: "Le Monde Diplomatique English", category: "news-style", feedUrl: "https://mondediplo.com/backend", language: "en", enabled: false },
  { id: "midi-libre", name: "Midi Libre", category: "news-style", feedUrl: "https://www.midilibre.fr/rss.xml", language: "fr", enabled: false },
  { id: "l-est-republicain", name: "L'Est Républicain", category: "news-style", feedUrl: "https://www.estrepublicain.fr/rss", language: "fr", enabled: false },
  { id: "paris-star-online", name: "Paris Star Online", category: "news-style", feedUrl: "https://www.parisstaronline.com/feed/", language: "en", enabled: false },
  { id: "france-soir", name: "France Soir", category: "news-style", feedUrl: "https://www.francesoir.fr/rss.xml", language: "fr", enabled: false },
  { id: "dernieres-nouvelles-d-alsace", name: "Dernières Nouvelles d'Alsace", category: "news-style", feedUrl: "https://www.dna.fr/rss", language: "fr", enabled: false },
  { id: "france-revisited", name: "France Revisited", category: "culture", feedUrl: "https://francerevisited.com/feed/", language: "en", enabled: false },
  { id: "la-croix", name: "La Croix", category: "news-style", feedUrl: "https://www.la-croix.com/feeds/rss/site.xml", language: "fr", enabled: false },
  { id: "mediapart", name: "Mediapart", category: "news-style", feedUrl: "https://www.mediapart.fr/articles/feed", language: "fr", enabled: false },
  { id: "rfi-english", name: "RFI English", category: "news-style", feedUrl: "https://www.rfi.fr/en/rss", language: "en", enabled: false },
  { id: "the-paris-news", name: "The Paris News", category: "news-style", feedUrl: "https://theparisnews.com/search/?c%5B%5D=news&d=&d1=&d2=&f=rss&l=10&q=&s=start_time&sd=desc&t=article", language: "en", enabled: false },
  {
    id: "le-monde", name: "Le Monde", category: "news-style", feedUrl: "https://www.lemonde.fr/rss/une.xml", language: "fr", enabled: false,
    reuseBasis: "Rejected: Le Monde reserves RSS use to strictly personal, non-professional and non-collective use; other exploitation requires authorisation and payment.",
    reuseTermsUrl: "https://www.lemonde.fr/le-monde-et-vous/article/2025/07/14/les-flux-rss-du-monde-fr_5498778_3237.html",
    reuseTermsCheckedAt: "2026-10-02",
    notes: "Not compatible with redistribution inside Sorlio without a separate syndication licence.",
  },
  { id: "marianne", name: "Marianne", category: "news-style", feedUrl: "https://www.marianne.net/rss.xml", language: "fr", enabled: false },
  { id: "la-depeche-du-midi", name: "La Dépêche du Midi", category: "news-style", feedUrl: "https://www.ladepeche.fr/rss.xml", language: "fr", enabled: false },
  { id: "20-minutes", name: "20 Minutes", category: "news-style", feedUrl: "https://www.20minutes.fr/feeds/rss-une.xml", language: "fr", enabled: false },
  { id: "french-daily-news", name: "French Daily News", category: "news-style", feedUrl: "https://frenchdailynews.com/feed/", language: "en", enabled: false },
  // Verified 2026-07-10: genuinely French, but the feed publishes
  // headline-only items (empty description/content:encoded — 0 words before
  // any quality check even runs), and scraping the Yahoo article page for
  // the full text doesn't recover real content either (Yahoo's EU consent
  // wall blocks it) — every item is unrecoverable, not just unlucky.
  { id: "yahoo-news-france", name: "Yahoo News France", category: "news-style", feedUrl: "https://fr.news.yahoo.com/rss", language: "fr", enabled: false },
  { id: "trip-usa-france", name: "Trip USA France", category: "everyday life", feedUrl: "https://tripusafrance.com/feed/", language: "en", enabled: false },
  { id: "infomigrants-english", name: "InfoMigrants English", category: "news-style", feedUrl: "https://www.infomigrants.net/en/rss/all.xml", language: "en", enabled: false },
  { id: "pv-magazine-france", name: "PV Magazine France", category: "science", feedUrl: "https://www.pv-magazine.com/region/france/feed/", language: "en", enabled: false },
  { id: "taste-of-france-magazine", name: "Taste of France Magazine", category: "culture", feedUrl: "https://tasteoffrancemag.com/feed/", language: "en", enabled: false },
  { id: "vogue-france", name: "Vogue France", category: "culture", feedUrl: "https://www.vogue.fr/feed/rss", language: "fr", enabled: false },
  { id: "arab-news-france", name: "Arab News – France", category: "news-style", feedUrl: "https://www.arabnews.com/taxonomy/term/1516/feed", language: "en", enabled: false },
  { id: "foreign-affairs-france", name: "Foreign Affairs – France", category: "news-style", feedUrl: "https://www.foreignaffairs.com/feeds/region/France/rss.xml", language: "en", enabled: false },
  { id: "atlantic-council-france", name: "Atlantic Council – France", category: "news-style", feedUrl: "https://www.atlanticcouncil.org/region/france/feed", language: "en", enabled: false },
  { id: "the-conversation-france", name: "The Conversation – France", category: "news-style", feedUrl: "https://theconversation.com/topics/the-conversation-france-24313/articles.atom", language: "en", enabled: false },
  { id: "morocco-world-news-france", name: "Morocco World News – France", category: "news-style", feedUrl: "https://www.moroccoworldnews.com/tag/france/feed", language: "en", enabled: false },
  { id: "techcrunch-france", name: "TechCrunch – France", category: "science", feedUrl: "https://techcrunch.com/tag/france/feed", language: "en", enabled: false },
  { id: "the-independent-france", name: "The Independent – France", category: "news-style", feedUrl: "https://www.the-independent.com/topic/france/rss", language: "en", enabled: false },
  { id: "nyt-france", name: "NYT – France", category: "news-style", feedUrl: "https://www.nytimes.com/svc/collections/v1/publish/https%3A//www.nytimes.com/topic/destination/france/rss.xml", language: "en", enabled: false },
  { id: "l-obs", name: "L'Obs", category: "news-style", feedUrl: "https://www.nouvelobs.com/a-la-une/rss.xml", language: "fr", enabled: false },
  { id: "channel-4-news-france", name: "Channel 4 News – France", category: "news-style", feedUrl: "https://www.channel4.com/news/world/france/feed", language: "en", enabled: false },
  { id: "complete-france", name: "Complete France", category: "everyday life", feedUrl: "https://www.completefrance.com/feed/", language: "en", enabled: false },
  { id: "ouest-france", name: "Ouest-France", category: "news-style", feedUrl: "https://www.ouest-france.fr/rss/une", language: "fr", enabled: false },
  { id: "gq-france", name: "GQ France", category: "culture", feedUrl: "https://www.gqmagazine.fr/feed/rss", language: "fr", enabled: false },
  { id: "france-voyager", name: "France Voyager", category: "everyday life", feedUrl: "https://francevoyager.com/feed/", language: "en", enabled: false },
  { id: "the-guardian-france", name: "The Guardian – France", category: "news-style", feedUrl: "https://www.theguardian.com/world/france/rss", language: "en", enabled: false },
  { id: "iarc-who-news", name: "IARC (WHO) News", category: "science", feedUrl: "https://www.iarc.who.int/feed/?post_type=news-events", language: "en", enabled: false },
  { id: "financial-times-france", name: "Financial Times – France", category: "news-style", feedUrl: "https://www.ft.com/france?format=rss", language: "en", enabled: false },
  { id: "college-de-france-news", name: "Collège de France News", category: "science", feedUrl: "https://www.college-de-france.fr/en/news.xml", language: "en", enabled: false },
  { id: "the-wildly-life-france", name: "The Wildly Life – France", category: "everyday life", feedUrl: "https://thewildlylife.com/tag/france/feed/", language: "en", enabled: false },
  { id: "travel-france-bucket-list", name: "Travel France Bucket List", category: "everyday life", feedUrl: "https://travelfrancebucketlist.com/feed/", language: "en", enabled: false },
  { id: "french-la-vie", name: "French La Vie", category: "everyday life", feedUrl: "https://www.frenchlavie.com/feed/", language: "en", enabled: false },
  { id: "la-france-agricole", name: "La France Agricole", category: "science", feedUrl: "https://www.lafranceagricole.fr/rss", language: "fr", enabled: false },
  { id: "bnn-news-france", name: "BNN News – France", category: "news-style", feedUrl: "https://bnn-news.com/tag/france/feed", language: "en", enabled: false },
  { id: "the-local-france", name: "The Local France", category: "news-style", feedUrl: "https://feeds.thelocal.com/rss/builder/fr", language: "en", enabled: false },
  { id: "us-news-france", name: "US News – France", category: "news-style", feedUrl: "https://www.usnews.com/topics/locations/france/rss", language: "en", enabled: false },
  { id: "get-french-football-news", name: "Get French Football News", category: "sport", feedUrl: "https://www.getfootballnewsfrance.com/feed/", language: "en", enabled: false },
  { id: "les-frenchies-travel", name: "Les Frenchies Travel", category: "everyday life", feedUrl: "https://lesfrenchiestravel.com/feed/", language: "en", enabled: false },
  { id: "analytics-india-magazine-france", name: "Analytics India Magazine – France", category: "science", feedUrl: "https://analyticsindiamag.com/news/france/feed", language: "en", enabled: false },

  // Previously-curated sources kept on top of the new list (not exact URL
  // duplicates of anything above).
  {
    id: "france-24-french", name: "France 24 (French)", category: "news-style", feedUrl: "https://www.france24.com/fr/rss", language: "fr", enabled: false,
    reuseBasis: "Rejected: no current permission was established for Sorlio to commercially redistribute feed text.",
    reuseTermsCheckedAt: "2026-10-02",
    notes: "Public feed availability alone is not a reuse licence.",
  },
  {
    id: "rfi-french", name: "RFI (French)", category: "news-style", feedUrl: "https://www.rfi.fr/fr/rss", language: "fr", enabled: false,
    reuseBasis: "Rejected: RFI states that reproduction requires prior permission and cannot be used commercially.",
    reuseTermsUrl: "https://www1.rfi.fr/actuen/articles/110/article_2829.asp",
    reuseTermsCheckedAt: "2026-10-02",
    notes: "RSS reader availability does not grant Sorlio redistribution rights.",
  },
  {
    id: "franceinfo", name: "Franceinfo", category: "news-style", feedUrl: "https://www.francetvinfo.fr/titres.rss", language: "fr", enabled: false,
    reuseBasis: "Rejected: no current permission was established for Sorlio to commercially redistribute feed text.",
    reuseTermsCheckedAt: "2026-10-02",
    notes: "Leave disabled unless written terms or a licence cover this exact use.",
  },
  {
    id: "liberation", name: "Libération", category: "culture", feedUrl: "https://www.liberation.fr/arc/outboundfeeds/rss-all/", language: "fr", enabled: false,
    reuseBasis: "Rejected: no current permission was established for Sorlio to commercially redistribute feed text.",
    reuseTermsCheckedAt: "2026-10-02",
    notes: "Leave disabled unless written terms or a licence cover this exact use.",
  },
  {
    id: "le-figaro", name: "Le Figaro", category: "news-style", feedUrl: "https://www.lefigaro.fr/rss/figaro_actualites.xml", language: "fr", enabled: false,
    reuseBasis: "Rejected: no current permission was established for Sorlio to commercially redistribute feed text.",
    reuseTermsCheckedAt: "2026-10-02",
    notes: "Leave disabled unless written terms or a licence cover this exact use.",
  },
  { id: "numerama", name: "Numerama", category: "science", feedUrl: "https://www.numerama.com/feed/", language: "fr", enabled: false },
  { id: "ouest-france-continu", name: "Ouest-France (Continu)", category: "everyday life", feedUrl: "https://www.ouest-france.fr/rss-en-continu.xml", language: "fr", enabled: false },

  // Added to widen daily redundancy for generic French news (verified live
  // 200 + valid RSS/Atom XML via a direct curl check before adding).
  { id: "bfmtv", name: "BFMTV", category: "news-style", feedUrl: "https://www.bfmtv.com/rss/news-24-7/", language: "fr", enabled: false },
  { id: "lexpress", name: "L'Express", category: "news-style", feedUrl: "https://www.lexpress.fr/arc/outboundfeeds/rss/alaune.xml", language: "fr", enabled: false },
  { id: "courrier-international", name: "Courrier International", category: "news-style", feedUrl: "https://www.courrierinternational.com/feed/all/rss.xml", language: "fr", enabled: false },
  { id: "challenges", name: "Challenges", category: "news-style", feedUrl: "https://www.challenges.fr/rss.xml", language: "fr", enabled: false },
  { id: "france-bleu", name: "France Bleu", category: "news-style", feedUrl: "https://www.francebleu.fr/rss/a-la-une.xml", language: "fr", enabled: false },
  { id: "france-culture", name: "France Culture", category: "culture", feedUrl: "https://www.radiofrance.fr/franceculture/rss", language: "fr", enabled: false },
  { id: "slate-fr", name: "Slate.fr", category: "culture", feedUrl: "https://www.slate.fr/rss.xml", language: "fr", enabled: false },
];
