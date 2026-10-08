import type { Metadata } from "next";
import type { ReactNode } from "react";
import AppBar from "@/components/AppBar";
import { publicDomainTexts } from "@/data/publicDomainTexts";
import { rssSources } from "@/data/rssSources";

export const metadata: Metadata = {
  title: "Credits and Licences - Sorlio",
  description: "Where Sorlio's reading texts, dictionary, news and software come from, and under which licences.",
};

const linkClass = "font-semibold text-brand underline underline-offset-2";

function External({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className={linkClass} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

/**
 * One row per public-domain work actually shipped, with its extract count.
 * Long works (Monte-Cristo, for example) come from several Gutenberg
 * volumes, each linked.
 */
function publicDomainWorks() {
  const works = new Map<string, { label: string; urls: string[]; count: number }>();
  for (const text of publicDomainTexts) {
    const label = (text.sourceName ?? "").replace(/^Public domain:\s*/, "");
    const url = text.sourceUrl ?? "";
    const work = works.get(label) ?? { label, urls: [], count: 0 };
    work.count += 1;
    if (url && !work.urls.includes(url)) work.urls.push(url);
    works.set(label, work);
  }
  for (const work of works.values()) work.urls.sort();
  return [...works.values()].sort((a, b) => a.label.localeCompare(b.label, "fr"));
}

const newsSources = rssSources.filter((source) => source.enabled);

const FONTS = ["Instrument Serif", "Newsreader", "Space Grotesk", "Space Mono"];

/** Open-source software shipped in or used to run the app. */
const SOFTWARE: Array<{ name: string; licence: string; url: string }> = [
  { name: "Next.js", licence: "MIT", url: "https://github.com/vercel/next.js" },
  { name: "React", licence: "MIT", url: "https://github.com/facebook/react" },
  { name: "Supabase JavaScript client", licence: "MIT", url: "https://github.com/supabase/supabase-js" },
  { name: "Mozilla Readability", licence: "Apache-2.0", url: "https://github.com/mozilla/readability" },
  { name: "jsdom", licence: "MIT", url: "https://github.com/jsdom/jsdom" },
  { name: "Upstash Redis client", licence: "MIT", url: "https://github.com/upstash/redis-js" },
  { name: "Google Auth Library", licence: "Apache-2.0", url: "https://github.com/googleapis/google-auth-library-nodejs" },
  { name: "Tailwind CSS", licence: "MIT", url: "https://github.com/tailwindlabs/tailwindcss" },
];

export default function CreditsPage() {
  const works = publicDomainWorks();
  return (
    <div className="ligne-screen">
      <AppBar title="Credits and licences" kicker="Sorlio" backHref="/settings" backLabel="Back to You" />
      <div className="space-y-3 text-sm leading-relaxed text-ink-muted">
        <section className="rounded-card bg-cream-card p-4 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Sorlio texts and lessons</h2>
          <p className="mt-2">
            Texts marked &ldquo;Written for Sorlio&rdquo;, the grammar lessons and the exercises were written for Sorlio. English translations of reading texts are machine-generated and can contain mistakes.
          </p>
        </section>

        <section className="rounded-card bg-cream-card p-4 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Classic literature</h2>
          <p className="mt-2">
            The {publicDomainTexts.length} literature extracts are unabridged passages from works in the public domain, taken from the free editions published by{" "}
            <External href="https://www.gutenberg.org/">Project Gutenberg</External>. Spelling and punctuation are as in those editions. Each extract links to its source edition.
          </p>
          <ul className="mt-2 space-y-1">
            {works.map((work) => (
              <li key={work.label}>
                {work.urls.length === 1 ? (
                  <External href={work.urls[0]}>{work.label}</External>
                ) : (
                  <>
                    {work.label}:{" "}
                    {work.urls.map((url, index) => (
                      <span key={url}>
                        {index > 0 ? ", " : ""}
                        <External href={url}>{`volume ${index + 1}`}</External>
                      </span>
                    ))}
                  </>
                )}{" "}
                <span>
                  ({work.count} {work.count === 1 ? "extract" : "extracts"})
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-card bg-cream-card p-4 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Dictionary</h2>
          <p className="mt-2">
            Common words come from Sorlio&rsquo;s own hand-written dictionary. Most other entries are adapted from{" "}
            <External href="https://www.wiktionary.org/">Wiktionary</External> by its contributors, via{" "}
            <External href="https://www.wikdict.com/">WikDict</External> and{" "}
            <External href="https://kaiko.getalp.org/about-dbnary/">DBnary</External>, and are licensed under{" "}
            <External href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</External>. Sorlio filtered the entries (removing names and formatting), merged senses, limited each entry to six translations and added estimated levels. The adapted dictionary data is shared under the same licence.
          </p>
        </section>

        <section className="rounded-card bg-cream-card p-4 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">News</h2>
          <p className="mt-2">
            News items are the headline and summary published in each source&rsquo;s public feed, reused under the source&rsquo;s terms with a link to the full original. Sorlio does not copy the linked articles.
          </p>
          <ul className="mt-2 space-y-2">
            {newsSources.map((source) => (
              <li key={source.id}>
                <span className="font-semibold text-ink">{source.name}</span>
                {source.attributionText ? <span className="block">{source.attributionText}</span> : null}
                {source.reuseTermsUrl ? <External href={source.reuseTermsUrl}>Reuse terms</External> : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-card bg-cream-card p-4 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Fonts</h2>
          <p className="mt-2">
            {FONTS.join(", ")}, licensed under the <External href="https://openfontlicense.org/">SIL Open Font License 1.1</External>.
          </p>
        </section>

        <section className="rounded-card bg-cream-card p-4 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Software</h2>
          <p className="mt-2">Sorlio is built with open-source software, including:</p>
          <ul className="mt-2 space-y-1">
            {SOFTWARE.map((item) => (
              <li key={item.name}>
                <External href={item.url}>{item.name}</External> <span>({item.licence})</span>
              </li>
            ))}
          </ul>
          <p className="mt-2">Listening uses your device&rsquo;s built-in voices. AI features are provided by OpenAI.</p>
        </section>
      </div>
    </div>
  );
}
