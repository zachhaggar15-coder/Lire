import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import AppBar from "@/components/AppBar";
import { FREE_DAILY_NEW_SAVES } from "@/lib/access/features";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy - Sorlio",
  description: "What Sorlio stores, where, for how long, and how to delete it.",
};

const linkClass = "font-semibold text-brand underline underline-offset-2";
const Mail = () => (
  <a className={linkClass} href={`mailto:${LEGAL.contactEmail}`}>
    {LEGAL.contactEmail}
  </a>
);

/** Plain-language summary first: Sorlio is used by readers from 13 up. */
const shortVersion = [
  "You can use Sorlio without an account. Your saved words, progress and settings then stay on your device.",
  "Sorlio has no adverts, no analytics or tracking tools, and never sells your data.",
  "If you sign in with Google, Sorlio keeps your email address and your learning data so it can sync between your devices. It does not keep your name or photo.",
  "Texts you import stay on your device unless you choose to sync them.",
  "AI features (Premium) send the word, sentence or text you ask about to OpenAI to get an answer. Nothing else about you is sent.",
  "You can delete your account, and everything synced to it, from Settings at any time.",
];

type Section = { title: string; body: ReactNode };

const sections: Section[] = [
  {
    title: "Who is responsible",
    body: (
      <>
        <p>
          Sorlio is operated by {LEGAL.operatorLegalName} ({LEGAL.operatorCountry}), referred to here as &ldquo;Sorlio&rdquo;, &ldquo;we&rdquo; or &ldquo;us&rdquo;. The data controller for Sorlio is {LEGAL.operatorLegalName}. This policy covers the Sorlio website, the installed web app and the Android app.
        </p>
        <p className="mt-2">
          Questions, requests and complaints: <Mail />. Postal address: {LEGAL.operatorAddress}.
        </p>
      </>
    ),
  },
  {
    title: "Using Sorlio without an account",
    body: (
      <>
        <p>
          Without an account, everything Sorlio stores is kept in your browser or the app&rsquo;s storage on your device: saved and known words, phrases, reading history and progress, streaks and goals, grammar and practice progress, review settings, reading and listening preferences, texts you import, and a count of how many new words you have saved today (without Premium you can save {FREE_DAILY_NEW_SAVES} new words a day).
        </p>
        <p className="mt-2">
          None of this is sent to us. It stays until you remove it in Sorlio, clear the app&rsquo;s or browser&rsquo;s storage, or uninstall the app. If several people share a device, each Sorlio account&rsquo;s data is kept separately from the others and from data saved while signed out.
        </p>
      </>
    ),
  },
  {
    title: "Accounts",
    body: (
      <>
        <p>
          Accounts are optional and use Google sign-in. Sorlio never sees your Google password. Our account provider, Supabase, keeps:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>an account identifier and your email address (shown in Settings so you can see which account is signed in);</li>
          <li>Google&rsquo;s identifier for your Google account, so you are recognised next time you sign in;</li>
          <li>sign-in records, including the time, IP address and device type, used to keep the account secure.</li>
        </ul>
        <p className="mt-2">
          Google also sends your name and profile picture when you sign in. Sorlio does not use them and removes them from our records automatically.
        </p>
      </>
    ),
  },
  {
    title: "Sync",
    body: (
      <>
        <p>
          When you are signed in, your learning data (the on-device data listed above) is copied to our database so it is the same on each device where you sign in. This is what an account is for, so it is on whenever you are signed in.
        </p>
        <p className="mt-2">
          <strong className="text-ink">Texts you import are not synced unless you turn this on</strong> in Settings → Account. Turning it off again removes your imported texts from our database; the copy on your device stays.
        </p>
        <p className="mt-2">
          Signing out stops syncing and leaves that account&rsquo;s data on the device until you clear it. Our database is hosted by Supabase in {LEGAL.databaseRegion}.
        </p>
      </>
    ),
  },
  {
    title: "Premium and payments",
    body: (
      <>
        <p>
          Premium costs {LEGAL.premiumPrice}, is bought through Google Play and needs a Sorlio account so it can be restored on your other devices. Google handles the payment; we never receive your card or bank details.
        </p>
        <p className="mt-2">
          To provide Premium we keep the subscription&rsquo;s product, Google Play purchase and order references, its state (for example active, cancelled or on hold), renewal and expiry times, and when we last checked it with Google. Google tells us directly when a subscription changes, so Premium stays accurate if you cancel, pause or are refunded. These records are kept while your account exists. A log of Google&rsquo;s notifications, holding only a one-way fingerprint of the purchase reference, is kept for 90 days.
        </p>
      </>
    ),
  },
  {
    title: "AI features",
    body: (
      <>
        <p>
          AI features are part of Premium and only run when you ask: explaining a word, phrase or sentence, translating a text naturally, or creating a practice exercise. For each request we send OpenAI the text needed to answer, such as the word and the sentence around it, or the text you asked to translate (including an imported text, if you choose to translate it), plus the level you are reading at. We never send your name, email or account identifier.
        </p>
        <p className="mt-2">
          We ask OpenAI not to store responses for later use, and under OpenAI&rsquo;s API terms this content is not used to train its models. OpenAI may keep requests for up to 30 days to detect abuse. To keep AI costs fair we count how many AI requests each account makes per day; those counts are deleted after 30 days.
        </p>
        <p className="mt-2">
          AI answers can be wrong. Each one has a &ldquo;Report&rdquo; button, which sends us the word and the AI&rsquo;s answer so we can fix the problem (see Feedback below).
        </p>
      </>
    ),
  },
  {
    title: "Feedback and reports",
    body: (
      <p>
        When you send feedback or report an answer, we receive what you choose to send: the type of problem, the screen and feature it concerns, the article or word involved, and any comment you write. Please don&rsquo;t include personal details in comments. Feedback is not linked to your email; if you are signed in it is linked to your account identifier so that it is deleted with your account. Feedback is deleted after 12 months.
      </p>
    ),
  },
  {
    title: "News, listening and the dictionary",
    body: (
      <p>
        News articles are collected by our server from publishers&rsquo; public feeds, so your device does not contact those publishers unless you open an original article link. The built-in dictionary works on your device. Listening uses your device&rsquo;s own text-to-speech voices; depending on your device settings, its maker may provide those voices online.
      </p>
    ),
  },
  {
    title: "Keeping Sorlio running and secure",
    body: (
      <>
        <p>Like any website, our hosting provider (Vercel) receives your IP address, device type and the page requested with each request, and keeps short-lived server logs to run and secure the service.</p>
        <p className="mt-2">
          To stop abuse, some requests (feedback, account checks, sign-in to the admin area) are limited per IP address; the address is held for at most 15 minutes for this. We also keep daily totals with no information about who made them, such as &ldquo;AI requests that failed&rdquo; or &ldquo;accounts deleted&rdquo;, for up to 400 days.
        </p>
      </>
    ),
  },
  {
    title: "What Sorlio does not do",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>No adverts, and no advertising or marketing profiles.</li>
        <li>No analytics, crash-reporting or tracking tools, and no tracking across other apps or websites.</li>
        <li>No selling or renting of personal data.</li>
        <li>No location, contacts, camera or microphone access, and no push notifications.</li>
        <li>No public profiles, chat or contact with other users.</li>
      </ul>
    ),
  },
  {
    title: "Who we share data with",
    body: (
      <>
        <p>We use these providers to run Sorlio. They act on our instructions and may only use the data to provide their service to us:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong className="text-ink">Supabase</strong>: accounts, sync, subscription records and feedback.</li>
          <li><strong className="text-ink">Vercel</strong>: hosting.</li>
          <li><strong className="text-ink">OpenAI</strong>: AI features (Premium).</li>
          <li><strong className="text-ink">Upstash</strong>: request limits and the news article cache (no learning data).</li>
          <li><strong className="text-ink">Google</strong>: sign-in, and Google Play for purchases and subscription status. Google is responsible for the payment data it collects as the seller of record.</li>
        </ul>
        <p className="mt-2">
          Some of these providers process data outside the UK and European Economic Area, including in the United States. Where they do, transfers are covered by the safeguards in their data processing terms, such as standard contractual clauses and the UK International Data Transfer Addendum. We may also disclose information if the law requires it.
        </p>
      </>
    ),
  },
  {
    title: "Why we use your data (legal bases)",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li><strong className="text-ink">To provide what you ask for</strong> (contract): your account, sync, Premium and AI answers.</li>
        <li><strong className="text-ink">Legitimate interests</strong>: keeping Sorlio secure and working, limiting abuse, anonymous daily totals, and acting on feedback. We have balanced these against your interests, taking extra care because some readers are teenagers.</li>
        <li><strong className="text-ink">Legal obligations</strong>: where the law requires us to keep or disclose information.</li>
      </ul>
    ),
  },
  {
    title: "How long we keep it",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Account, synced data and subscription records: until you delete your account.</li>
        <li>Imported texts in our database: until you turn off their sync or delete your account.</li>
        <li>Records of deleted items, needed so a deletion reaches all your devices: 180 days.</li>
        <li>Feedback: 12 months. Daily AI request counts: 30 days. Google Play notification log: 90 days.</li>
        <li>Anonymous daily totals: up to 400 days. Rate-limit records: up to 15 minutes.</li>
        <li>Supabase keeps encrypted backups for a limited period, after which deleted data is gone from backups too.</li>
      </ul>
    ),
  },
  {
    title: "Teenagers and children",
    body: (
      <p>
        Sorlio is for learners aged {LEGAL.minimumAge} and over. We designed it with the UK Age Appropriate Design Code in mind: the most private settings are the default, nothing is shared publicly, and there are no adverts, profiling or nudges to give up privacy. If you believe a child under {LEGAL.minimumAge} has created an account, contact <Mail /> and we will delete it.
      </p>
    ),
  },
  {
    title: "Your rights and choices",
    body: (
      <>
        <p>
          You can delete your account and everything synced to it in Settings, or at{" "}
          <Link className={linkClass} href="/account/delete">sorlio.site/account/delete</Link> if you don&rsquo;t have the app. Data on a device stays there until you clear the app&rsquo;s storage or uninstall it. Deleting your account does not cancel a Premium subscription: cancel it in Google Play first.
        </p>
        <p className="mt-2">
          You can also ask us for a copy of your data, to correct it, to restrict or object to how we use it, or to delete it, by emailing <Mail />. We will reply within one month. If you are unhappy with our answer you can complain to the UK Information Commissioner&rsquo;s Office (ico.org.uk) or your local data protection authority.
        </p>
      </>
    ),
  },
  {
    title: "Earlier test versions",
    body: (
      <p>
        Test versions of Sorlio released before this policy could, if you agreed, collect anonymous usage analytics and crash reports. This version collects neither. The analytics records collected earlier are being deleted; contact <Mail /> if you have questions about them.
      </p>
    ),
  },
  {
    title: "Changes to this policy",
    body: (
      <p>
        If we change how Sorlio uses personal data, we will update this page and, for significant changes, tell you in the app before the change takes effect.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="ligne-screen">
      <AppBar title="Privacy policy" kicker="Sorlio" backHref="/settings" backLabel="Back to You" />
      <p className="mb-5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">Effective {LEGAL.privacyEffectiveDate}</p>

      <section aria-labelledby="privacy-short" className="mb-4 rounded-card bg-cream-card p-4 shadow-card">
        <h2 id="privacy-short" className="text-base font-bold text-ink">The short version</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-muted">
          {shortVersion.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <div className="space-y-3 text-sm leading-relaxed text-ink-muted">
        {sections.map((section) => (
          <section key={section.title} className="rounded-card bg-cream-card p-4 shadow-card">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink">{section.title}</h2>
            <div className="mt-2">{section.body}</div>
          </section>
        ))}
      </div>

      <p className="mt-5 text-sm text-ink-muted">
        See also the <Link className={linkClass} href="/terms">terms of use</Link> and <Link className={linkClass} href="/credits">credits and licences</Link>.
      </p>
    </div>
  );
}
