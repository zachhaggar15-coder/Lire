import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import AppBar from "@/components/AppBar";
import { FREE_DAILY_NEW_SAVES } from "@/lib/access/features";
import { LEGAL } from "@/lib/legal";
import { MANAGE_SUBSCRIPTION_URL } from "@/lib/premium/types";

export const metadata: Metadata = {
  title: "Terms of Use - Sorlio",
  description: "The terms for using Sorlio and Sorlio Premium.",
};

const linkClass = "font-semibold text-brand underline underline-offset-2";

type Section = { title: string; body: ReactNode };

const sections: Section[] = [
  {
    title: "About these terms",
    body: (
      <p>
        These terms are an agreement between you and {LEGAL.operatorLegalName} (&ldquo;Sorlio&rdquo;, &ldquo;we&rdquo;) for using the Sorlio website, web app and Android app. By using Sorlio you accept them. If you are under 18, please read them with a parent or guardian. How we handle personal data is explained in the{" "}
        <Link className={linkClass} href="/privacy">privacy policy</Link>.
      </p>
    ),
  },
  {
    title: "Who can use Sorlio",
    body: (
      <p>
        Sorlio is for people aged {LEGAL.minimumAge} and over. You can use it without an account. If you create one, you are responsible for keeping access to your Google account secure.
      </p>
    ),
  },
  {
    title: "Free and Premium",
    body: (
      <>
        <p>
          Sorlio is free to use for reading, news, importing your own texts, listening, the built-in dictionary, reviewing saved words, grammar and practice exercises and progress tracking. Free use includes saving {FREE_DAILY_NEW_SAVES} new words a day.
        </p>
        <p className="mt-2">
          Sorlio Premium adds unlimited word saving and the AI features (explanations of words and sentences, natural translations and AI practice). The full comparison is on the <Link className={linkClass} href="/premium">Premium page</Link>.
        </p>
      </>
    ),
  },
  {
    title: "Premium subscription",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Premium costs {LEGAL.premiumPrice} (or the local price Google Play shows you) and renews automatically every month until you cancel. There is no free trial.</li>
        <li>You buy and manage Premium through Google Play with a Sorlio account, and Google Play&rsquo;s terms apply to the payment. If you are under 18, ask a parent or guardian before subscribing.</li>
        <li>
          You can cancel at any time in{" "}
          <a className={linkClass} href={MANAGE_SUBSCRIPTION_URL} target="_blank" rel="noopener noreferrer">Google Play subscriptions</a>. Premium then continues until the end of the month you have paid for, and is not renewed. Deleting the app or your Sorlio account does not cancel the subscription.
        </li>
        <li>Refunds are handled by Google Play under its refund policy. This does not affect your legal rights as a consumer.</li>
        <li>If the price changes, Google Play tells you in advance and, where required, asks you to accept the new price before it applies.</li>
        <li>If a payment fails, Google Play may give you time to fix it. Premium features pause if the subscription is on hold, paused, or ends.</li>
      </ul>
    ),
  },
  {
    title: "Using Sorlio fairly",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Only import texts you are allowed to use for your own study. Imported texts are for your personal use.</li>
        <li>Don&rsquo;t try to get around limits, access other people&rsquo;s data, overload the service, or use AI features to produce harmful content.</li>
        <li>We may limit or suspend access if Sorlio is being misused, and will explain why where we can.</li>
      </ul>
    ),
  },
  {
    title: "AI answers",
    body: (
      <p>
        AI explanations and translations are generated automatically and can be wrong or incomplete. Use them as a study aid, not as an authority, and please report answers that look wrong or inappropriate using the Report button.
      </p>
    ),
  },
  {
    title: "Content",
    body: (
      <p>
        Sorlio&rsquo;s own lessons and texts are provided for your personal learning. Classic literature extracts come from public-domain editions, and news headlines and summaries belong to their publishers, who are credited with a link to the original. Details are on the{" "}
        <Link className={linkClass} href="/credits">credits and licences</Link> page.
      </p>
    ),
  },
  {
    title: "Changes and availability",
    body: (
      <p>
        We keep improving Sorlio, so features may change. We will tell you in the app before a change that significantly reduces what Premium includes, and you can cancel if you don&rsquo;t want to continue. If we ever close Sorlio, we will give as much notice as we reasonably can, stop charging for Premium, and explain how to keep your data. Your on-device data is not affected by the service closing.
      </p>
    ),
  },
  {
    title: "Responsibility",
    body: (
      <p>
        We provide Sorlio with reasonable care and skill. Nothing in these terms limits rights you have by law as a consumer, or our responsibility where the law does not allow it to be limited. Otherwise, we are not responsible for losses that were not foreseeable, or that arise from content or services provided by others (such as news publishers or Google Play).
      </p>
    ),
  },
  {
    title: "Ending",
    body: (
      <p>
        You can stop using Sorlio and delete your account at any time from Settings. These terms are governed by the law of {LEGAL.operatorCountry}; if you live elsewhere you also keep the protection of your local consumer law, and you can bring a claim in your local courts.
      </p>
    ),
  },
  {
    title: "Contact",
    body: (
      <p>
        <a className={linkClass} href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a> · {LEGAL.operatorAddress}
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="ligne-screen">
      <AppBar title="Terms of use" kicker="Sorlio" backHref="/settings" backLabel="Back to Settings" />
      <p className="mb-5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">Effective {LEGAL.termsEffectiveDate}</p>
      <div className="space-y-3 text-sm leading-relaxed text-ink-muted">
        {sections.map((section) => (
          <section key={section.title} className="rounded-card bg-cream-card p-4 shadow-card">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink">{section.title}</h2>
            <div className="mt-2">{section.body}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
