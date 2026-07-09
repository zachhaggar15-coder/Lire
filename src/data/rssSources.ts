import type { Category } from "@/types";

export interface RssSource {
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
  enabled: boolean;
  /** Overrides DEFAULT_MIN_WORDS (src/lib/rss/contentQuality.ts) for this feed specifically. */
  minWords?: number;
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
 * A large pool of France-related RSS feeds. `/api/rss-texts` fetches every
 * `enabled` **French-language** feed, builds a big candidate pool from the
 * working ones, and deterministically picks 5 for the day (see that route
 * for the selection logic) — the size of this list is deliberately much
 * larger than 5, so a handful of dead or rate-limited feeds on any given
 * day barely matters.
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
export const rssSources: RssSource[] = [
  { id: "france-today", name: "France Today", category: "culture", feedUrl: "https://francetoday.com/feed/", language: "en", enabled: false },
  { id: "the-good-life-france", name: "The Good Life France", category: "everyday life", feedUrl: "https://thegoodlifefrance.com/feed/", language: "en", enabled: false },
  { id: "tech-n-play", name: "Tech N Play", category: "science", feedUrl: "https://technplay.com/feed/", language: "en", enabled: false },
  { id: "rosbif-blog", name: "Rosbif Blog", category: "everyday life", feedUrl: "https://rosbifblog.com/feed/", language: "en", enabled: false },
  { id: "sig-territoires", name: "SIG Territoires", category: "science", feedUrl: "https://www.sigterritoires.fr/index.php/feed/", language: "fr", enabled: true },
  { id: "cas-d-interet", name: "Cas d'Intérêt", category: "news-style", feedUrl: "https://casdinteret.com/feed/", language: "fr", enabled: true },
  { id: "hip-paris", name: "HiP Paris", category: "everyday life", feedUrl: "https://hipparis.com/feed/", language: "en", enabled: false },
  { id: "judic-astille", name: "Judic Astille", category: "everyday life", feedUrl: "https://judicastille.com/feed/", language: "mixed", enabled: true },
  { id: "french-a-la-carte", name: "French à la Carte", category: "culture", feedUrl: "https://frenchalacarteblog.com/feed/", language: "en", enabled: false },
  { id: "the-provence-post", name: "The Provence Post", category: "everyday life", feedUrl: "https://theprovencepost.blogspot.com/feeds/posts/default", language: "en", enabled: false },
  { id: "a-taste-of-france", name: "A Taste of France", category: "culture", feedUrl: "https://www.a-taste-of-france.com/france.xml", language: "en", enabled: false },
  { id: "life-on-la-lune", name: "Life on La Lune", category: "everyday life", feedUrl: "https://lifeonlalune.com/feed/", language: "en", enabled: false },
  { id: "rvf-nouvelles", name: "RVF Nouvelles", category: "news-style", feedUrl: "https://rvf.ca/nouvelles/feed/", language: "fr", enabled: true },
  { id: "france-says", name: "France Says", category: "everyday life", feedUrl: "https://francesays.com/feed/", language: "en", enabled: false },
  { id: "paris-missives", name: "Paris Missives", category: "everyday life", feedUrl: "https://parismissives.blogspot.com/feeds/posts/default", language: "en", enabled: false },
  { id: "sharon-santoni", name: "Sharon Santoni", category: "everyday life", feedUrl: "https://sharonsantoni.com/feed/", language: "en", enabled: false },
  { id: "oui-in-france", name: "Oui In France", category: "everyday life", feedUrl: "https://www.ouiinfrance.com/feed/", language: "en", enabled: false },
  { id: "bonjour-paris", name: "Bonjour Paris", category: "culture", feedUrl: "https://bonjourparis.com/feed/", language: "en", enabled: false },
  { id: "le-francophile", name: "Le Francophile", category: "culture", feedUrl: "https://lefrancophile.com/feed/", language: "en", enabled: false },
  { id: "live-french", name: "Live French", category: "culture", feedUrl: "https://live-french.net/blog/feed/", language: "en", enabled: false },
  { id: "y-a-pas-le-feu-au-lac", name: "Y'a Pas le Feu au Lac", category: "everyday life", feedUrl: "https://www.yapaslefeuaulac.ch/feed/", language: "fr", enabled: true },
  { id: "paris-perfect", name: "Paris Perfect", category: "everyday life", feedUrl: "https://www.parisperfect.com/blog/feed/", language: "en", enabled: false },
  { id: "secrets-of-paris", name: "Secrets of Paris", category: "everyday life", feedUrl: "https://secretsofparis.com/feed/", language: "en", enabled: false },
  { id: "french-country-cottage", name: "French Country Cottage", category: "everyday life", feedUrl: "https://www.frenchcountrycottage.net/feed/", language: "en", enabled: false },
  { id: "snippets-of-paris", name: "Snippets of Paris", category: "everyday life", feedUrl: "https://snippetsofparis.com/feed/", language: "en", enabled: false },
  { id: "cnz", name: "CNZ", category: "news-style", feedUrl: "https://cnz.to/feed/rdf", language: "mixed", enabled: true },
  { id: "france-travel-tips", name: "France Travel Tips", category: "everyday life", feedUrl: "https://www.francetraveltips.com/feed/", language: "en", enabled: false },
  { id: "vine-and-the-olive", name: "Vine and the Olive", category: "culture", feedUrl: "https://feeds.feedburner.com/VineAndTheOlive", language: "en", enabled: false },
  { id: "fabulously-french", name: "Fabulously French", category: "culture", feedUrl: "https://fabulouslyfrench.blogspot.com/feeds/posts/default", language: "en", enabled: false },
  { id: "french-entree", name: "French Entrée", category: "everyday life", feedUrl: "https://www.frenchentree.com/feed/", language: "en", enabled: false },
  { id: "david-lebovitz", name: "David Lebovitz", category: "culture", feedUrl: "https://www.davidlebovitz.com/feed/", language: "en", enabled: false },
  { id: "messy-nessy-chic", name: "Messy Nessy Chic", category: "culture", feedUrl: "https://www.messynessychic.com/feed/", language: "en", enabled: false },
  { id: "lawless-french", name: "Lawless French", category: "culture", feedUrl: "https://feeds.feedblitz.com/LawlessFrench", language: "en", enabled: false },
  { id: "une-armoire-pour-deux", name: "Une Armoire Pour Deux", category: "culture", feedUrl: "https://www.unearmoirepourdeux.fr/feed/", language: "fr", enabled: true },
  { id: "the-long-weekend", name: "The Long Weekend", category: "everyday life", feedUrl: "https://www.lelongweekend.com/feed/", language: "en", enabled: false },
  { id: "keith-van-sickle", name: "Keith Van Sickle", category: "everyday life", feedUrl: "https://keithvansickle.com/feed/", language: "en", enabled: false },
  { id: "crash-magazine", name: "Crash Magazine", category: "culture", feedUrl: "https://www.crash.fr/feed/", language: "fr", enabled: true },
  { id: "aussie-in-france", name: "Aussie in France", category: "everyday life", feedUrl: "https://www.aussieinfrance.com/feed/", language: "en", enabled: false },
  { id: "french-affaires", name: "French Affaires", category: "everyday life", feedUrl: "https://frenchaffaires.com/feed/", language: "en", enabled: false },
  { id: "albert-learning-blog", name: "Albert Learning Blog", category: "culture", feedUrl: "https://blog.albert-learning.com/feed/", language: "mixed", enabled: true },
  { id: "la-penderie-de-chloe", name: "La Penderie de Chloé", category: "culture", feedUrl: "https://www.lapenderiedechloe.com/feed/", language: "fr", enabled: true },
  { id: "esl-wq", name: "ESL WQ", category: "culture", feedUrl: "https://www.eslwq.com/blog-feed.xml", language: "en", enabled: false },
  { id: "french-today", name: "French Today", category: "culture", feedUrl: "https://www.frenchtoday.com/blog/feed/", language: "en", enabled: false },
  { id: "fluentu-french", name: "FluentU French", category: "culture", feedUrl: "https://www.fluentu.com/blog/french/feed/", language: "en", enabled: false },
  { id: "arianne-g-voyance", name: "Arianne G Voyance", category: "everyday life", feedUrl: "https://www.arianne-g-voyance.fr/feed/", language: "fr", enabled: true },
  { id: "haute-vue", name: "Haute Vue", category: "culture", feedUrl: "https://www.haute-vue.com/blog-feed.xml", language: "fr", enabled: true },
  { id: "chez-loulou", name: "Chez Loulou", category: "everyday life", feedUrl: "https://feeds.feedburner.com/blogspot/chezloulou", language: "fr", enabled: true },
  { id: "prete-moi-paris", name: "Prête-moi Paris", category: "everyday life", feedUrl: "https://pretemoiparis.com/feed/", language: "fr", enabled: true },
  { id: "chut-mon-secret", name: "Chut Mon Secret", category: "everyday life", feedUrl: "https://www.chutmonsecret.com/feed/", language: "fr", enabled: true },
  { id: "the-french-life", name: "The French Life", category: "everyday life", feedUrl: "https://www.thefrenchlife.org/feed/", language: "en", enabled: false },
  { id: "sew-french-embroidery", name: "Sew French Embroidery", category: "culture", feedUrl: "https://sewfrenchembroidery.blogspot.com/feeds/posts/default?alt=rss", language: "en", enabled: false },
  { id: "la-revue-de-kenza", name: "La Revue de Kenza", category: "culture", feedUrl: "https://larevuedekenza.fr/feed/", language: "fr", enabled: true },
  { id: "french-girl-cuisine", name: "French Girl Cuisine", category: "culture", feedUrl: "https://frenchgirlcuisine.com/fr/feed/", language: "fr", enabled: true },
  { id: "a-french-american-life", name: "A French American Life", category: "everyday life", feedUrl: "https://afrenchamericanlife.com/feed/", language: "en", enabled: false },
  { id: "francais-immersion", name: "Français Immersion", category: "culture", feedUrl: "https://www.francaisimmersion.com/feed/", language: "fr", enabled: true },
  { id: "bonjour-french-words", name: "Bonjour French Words", category: "culture", feedUrl: "https://bonjourfrenchwords.tumblr.com/rss", language: "en", enabled: false },
  { id: "juliet-in-paris", name: "Juliet in Paris", category: "everyday life", feedUrl: "https://julietinparis.net/feed/", language: "en", enabled: false },
  { id: "our-french-oasis", name: "Our French Oasis", category: "everyday life", feedUrl: "https://ourfrenchoasis.com/feed/", language: "en", enabled: false },
  { id: "distant-francophile", name: "Distant Francophile", category: "everyday life", feedUrl: "https://www.distantfrancophile.com/feed/", language: "en", enabled: false },
  { id: "1st-for-french-property", name: "1st for French Property", category: "everyday life", feedUrl: "https://www.1st-for-french-property.co.uk/blog/feed/", language: "en", enabled: false },
  { id: "access-riviera", name: "Access Riviera", category: "everyday life", feedUrl: "https://accessriviera.wordpress.com/feed/", language: "en", enabled: false },
  { id: "my-melange", name: "My Mélange", category: "everyday life", feedUrl: "https://mymelange.net/feed/", language: "en", enabled: false },
  { id: "j-adore-lyon", name: "J'Adore Lyon", category: "everyday life", feedUrl: "https://jadorelyon.com/feed/", language: "en", enabled: false },
  { id: "france-24-english", name: "France 24 English", category: "news-style", feedUrl: "https://www.france24.com/en/rss", language: "en", enabled: false },
  { id: "sud-ouest", name: "Sud Ouest", category: "news-style", feedUrl: "https://www.sudouest.fr/essentiel/rss.xml", language: "fr", enabled: true },
  { id: "le-monde-diplomatique-english", name: "Le Monde Diplomatique English", category: "news-style", feedUrl: "https://mondediplo.com/backend", language: "en", enabled: false },
  { id: "midi-libre", name: "Midi Libre", category: "news-style", feedUrl: "https://www.midilibre.fr/rss.xml", language: "fr", enabled: true },
  { id: "l-est-republicain", name: "L'Est Républicain", category: "news-style", feedUrl: "https://www.estrepublicain.fr/rss", language: "fr", enabled: true },
  { id: "paris-star-online", name: "Paris Star Online", category: "news-style", feedUrl: "https://www.parisstaronline.com/feed/", language: "en", enabled: false },
  { id: "france-soir", name: "France Soir", category: "news-style", feedUrl: "https://www.francesoir.fr/rss.xml", language: "fr", enabled: true },
  { id: "dernieres-nouvelles-d-alsace", name: "Dernières Nouvelles d'Alsace", category: "news-style", feedUrl: "https://www.dna.fr/rss", language: "fr", enabled: true },
  { id: "france-revisited", name: "France Revisited", category: "culture", feedUrl: "https://francerevisited.com/feed/", language: "en", enabled: false },
  { id: "la-croix", name: "La Croix", category: "news-style", feedUrl: "https://www.la-croix.com/feeds/rss/site.xml", language: "fr", enabled: true },
  { id: "mediapart", name: "Mediapart", category: "news-style", feedUrl: "https://www.mediapart.fr/articles/feed", language: "fr", enabled: true },
  { id: "rfi-english", name: "RFI English", category: "news-style", feedUrl: "https://www.rfi.fr/en/rss", language: "en", enabled: false },
  { id: "the-paris-news", name: "The Paris News", category: "news-style", feedUrl: "https://theparisnews.com/search/?c%5B%5D=news&d=&d1=&d2=&f=rss&l=10&q=&s=start_time&sd=desc&t=article", language: "en", enabled: false },
  { id: "le-monde", name: "Le Monde", category: "news-style", feedUrl: "https://www.lemonde.fr/rss/une.xml", language: "fr", enabled: true },
  { id: "marianne", name: "Marianne", category: "news-style", feedUrl: "https://www.marianne.net/rss.xml", language: "fr", enabled: true },
  { id: "la-depeche-du-midi", name: "La Dépêche du Midi", category: "news-style", feedUrl: "https://www.ladepeche.fr/rss.xml", language: "fr", enabled: true },
  { id: "20-minutes", name: "20 Minutes", category: "news-style", feedUrl: "https://www.20minutes.fr/feeds/rss-une.xml", language: "fr", enabled: true },
  { id: "french-daily-news", name: "French Daily News", category: "news-style", feedUrl: "https://frenchdailynews.com/feed/", language: "en", enabled: false },
  { id: "yahoo-news-france", name: "Yahoo News France", category: "news-style", feedUrl: "https://fr.news.yahoo.com/rss", language: "fr", enabled: true },
  { id: "trip-usa-france", name: "Trip USA France", category: "everyday life", feedUrl: "https://tripusafrance.com/feed/", language: "en", enabled: false },
  { id: "infomigrants-english", name: "InfoMigrants English", category: "news-style", feedUrl: "https://www.infomigrants.net/en/rss/all.xml", language: "en", enabled: false },
  { id: "pv-magazine-france", name: "PV Magazine France", category: "science", feedUrl: "https://www.pv-magazine.com/region/france/feed/", language: "en", enabled: false },
  { id: "taste-of-france-magazine", name: "Taste of France Magazine", category: "culture", feedUrl: "https://tasteoffrancemag.com/feed/", language: "en", enabled: false },
  { id: "vogue-france", name: "Vogue France", category: "culture", feedUrl: "https://www.vogue.fr/feed/rss", language: "fr", enabled: true },
  { id: "arab-news-france", name: "Arab News – France", category: "news-style", feedUrl: "https://www.arabnews.com/taxonomy/term/1516/feed", language: "en", enabled: false },
  { id: "foreign-affairs-france", name: "Foreign Affairs – France", category: "news-style", feedUrl: "https://www.foreignaffairs.com/feeds/region/France/rss.xml", language: "en", enabled: false },
  { id: "atlantic-council-france", name: "Atlantic Council – France", category: "news-style", feedUrl: "https://www.atlanticcouncil.org/region/france/feed", language: "en", enabled: false },
  { id: "the-conversation-france", name: "The Conversation – France", category: "news-style", feedUrl: "https://theconversation.com/topics/the-conversation-france-24313/articles.atom", language: "en", enabled: false },
  { id: "morocco-world-news-france", name: "Morocco World News – France", category: "news-style", feedUrl: "https://www.moroccoworldnews.com/tag/france/feed", language: "en", enabled: false },
  { id: "techcrunch-france", name: "TechCrunch – France", category: "science", feedUrl: "https://techcrunch.com/tag/france/feed", language: "en", enabled: false },
  { id: "the-independent-france", name: "The Independent – France", category: "news-style", feedUrl: "https://www.the-independent.com/topic/france/rss", language: "en", enabled: false },
  { id: "nyt-france", name: "NYT – France", category: "news-style", feedUrl: "https://www.nytimes.com/svc/collections/v1/publish/https%3A//www.nytimes.com/topic/destination/france/rss.xml", language: "en", enabled: false },
  { id: "l-obs", name: "L'Obs", category: "news-style", feedUrl: "https://www.nouvelobs.com/a-la-une/rss.xml", language: "fr", enabled: true },
  { id: "channel-4-news-france", name: "Channel 4 News – France", category: "news-style", feedUrl: "https://www.channel4.com/news/world/france/feed", language: "en", enabled: false },
  { id: "complete-france", name: "Complete France", category: "everyday life", feedUrl: "https://www.completefrance.com/feed/", language: "en", enabled: false },
  { id: "ouest-france", name: "Ouest-France", category: "news-style", feedUrl: "https://www.ouest-france.fr/rss/une", language: "fr", enabled: true },
  { id: "gq-france", name: "GQ France", category: "culture", feedUrl: "https://www.gqmagazine.fr/feed/rss", language: "fr", enabled: true },
  { id: "france-voyager", name: "France Voyager", category: "everyday life", feedUrl: "https://francevoyager.com/feed/", language: "en", enabled: false },
  { id: "the-guardian-france", name: "The Guardian – France", category: "news-style", feedUrl: "https://www.theguardian.com/world/france/rss", language: "en", enabled: false },
  { id: "iarc-who-news", name: "IARC (WHO) News", category: "science", feedUrl: "https://www.iarc.who.int/feed/?post_type=news-events", language: "en", enabled: false },
  { id: "financial-times-france", name: "Financial Times – France", category: "news-style", feedUrl: "https://www.ft.com/france?format=rss", language: "en", enabled: false },
  { id: "college-de-france-news", name: "Collège de France News", category: "science", feedUrl: "https://www.college-de-france.fr/en/news.xml", language: "en", enabled: false },
  { id: "the-wildly-life-france", name: "The Wildly Life – France", category: "everyday life", feedUrl: "https://thewildlylife.com/tag/france/feed/", language: "en", enabled: false },
  { id: "travel-france-bucket-list", name: "Travel France Bucket List", category: "everyday life", feedUrl: "https://travelfrancebucketlist.com/feed/", language: "en", enabled: false },
  { id: "french-la-vie", name: "French La Vie", category: "everyday life", feedUrl: "https://www.frenchlavie.com/feed/", language: "en", enabled: false },
  { id: "la-france-agricole", name: "La France Agricole", category: "science", feedUrl: "https://www.lafranceagricole.fr/rss", language: "fr", enabled: true },
  { id: "bnn-news-france", name: "BNN News – France", category: "news-style", feedUrl: "https://bnn-news.com/tag/france/feed", language: "en", enabled: false },
  { id: "the-local-france", name: "The Local France", category: "news-style", feedUrl: "https://feeds.thelocal.com/rss/builder/fr", language: "en", enabled: false },
  { id: "us-news-france", name: "US News – France", category: "news-style", feedUrl: "https://www.usnews.com/topics/locations/france/rss", language: "en", enabled: false },
  { id: "get-french-football-news", name: "Get French Football News", category: "sport", feedUrl: "https://www.getfootballnewsfrance.com/feed/", language: "en", enabled: false },
  { id: "les-frenchies-travel", name: "Les Frenchies Travel", category: "everyday life", feedUrl: "https://lesfrenchiestravel.com/feed/", language: "en", enabled: false },
  { id: "analytics-india-magazine-france", name: "Analytics India Magazine – France", category: "science", feedUrl: "https://analyticsindiamag.com/news/france/feed", language: "en", enabled: false },

  // Previously-curated sources kept on top of the new list (not exact URL
  // duplicates of anything above).
  { id: "france-24-french", name: "France 24 (French)", category: "news-style", feedUrl: "https://www.france24.com/fr/rss", language: "fr", enabled: true },
  { id: "rfi-french", name: "RFI (French)", category: "news-style", feedUrl: "https://www.rfi.fr/fr/rss", language: "fr", enabled: true },
  { id: "franceinfo", name: "Franceinfo", category: "news-style", feedUrl: "https://www.francetvinfo.fr/titres.rss", language: "fr", enabled: true },
  { id: "liberation", name: "Libération", category: "culture", feedUrl: "https://www.liberation.fr/arc/outboundfeeds/rss-all/", language: "fr", enabled: true },
  { id: "le-figaro", name: "Le Figaro", category: "news-style", feedUrl: "https://www.lefigaro.fr/rss/figaro_actualites.xml", language: "fr", enabled: true },
  { id: "numerama", name: "Numerama", category: "science", feedUrl: "https://www.numerama.com/feed/", language: "fr", enabled: true },
  { id: "ouest-france-continu", name: "Ouest-France (Continu)", category: "everyday life", feedUrl: "https://www.ouest-france.fr/rss-en-continu.xml", language: "fr", enabled: true },
];
