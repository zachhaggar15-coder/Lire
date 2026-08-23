import type { Metadata } from "next";
import AppBar from "@/components/AppBar";

export const metadata: Metadata = {
  title: "Privacy Policy - Lire",
  description: "How Lire collects, uses, stores, and deletes app and learning data.",
};

const sections = [
  {
    title: "Who operates Lire",
    body: (
      <>
        <p>Lire is operated by Zach Haggar as an independent developer. This policy applies to the Lire website, installed web app, and Android app.</p>
        <p className="mt-2">
          Privacy enquiries and data requests can be sent to{" "}
          <a className="font-semibold text-brand underline underline-offset-2" href="mailto:zach.haggar15@gmail.com">
            zach.haggar15@gmail.com
          </a>.
        </p>
      </>
    ),
  },
  {
    title: "Data kept on your device",
    body: (
      <p>
        By default, Lire stores saved and known words, reading history and progress, goals, grammar progress, settings, imported or custom texts, offline files, and the article selected for the current day&apos;s free allowance on your device. This information remains until you remove it in Lire, clear the app or browser storage, or uninstall the app. It is not sent to Lire merely because it exists locally.
      </p>
    ),
  },
  {
    title: "Free access and Premium subscriptions",
    body: (
      <>
        <p>
          The free version can be used without an account and includes one article per day on that device. A passwordless Lire account is required for Premium so paid access can be restored and used across supported devices. Google Play processes Premium purchases and payment information; Lire does not receive or store full card details.
        </p>
        <p className="mt-2">
          Lire stores the account identifier, Google Play product and purchase-token references, subscription status, and access-expiry time needed to verify and provide Premium. Premium renews monthly unless cancelled through Google Play. Cancellation stops future renewal, while access normally continues through the paid period. Subscription records are retained while needed to provide access, handle disputes, meet accounting or legal duties, and prevent fraud.
        </p>
      </>
    ),
  },
  {
    title: "Optional account and sync",
    body: (
      <p>
        Liree can be used fully without an account. If you choose to sign in, you do so with Google, and Supabase provides the authentication and account infrastructure. Liree never receives your Google password. Liree stores an account identifier and your email address so you can see which Google account is signed in; it does not copy your Google profile name, profile picture or other Google account details. Signing in copies the learning stores described in the sync screen to Supabase so they can be merged across your devices. Account and synced data are kept while the account exists and are removed when you delete the account, except for limited records that must be retained for security or legal reasons.
      </p>
    ),
  },
  {
    title: "Optional product analytics and diagnostics",
    body: (
      <>
        <p>
          Lire asks before enabling optional analytics. If you allow them, Lire may collect a random anonymous identifier, session identifier, screens or features opened, reading and review events, approximate device category, installation state, referral or campaign information, and app version. Client crash diagnostics may also be sent to Sentry; error replays are configured to mask text and input content.
        </p>
        <p className="mt-2">
          Analytics do not include full article or imported text, saved private text, full email addresses, feedback comments, translations, or OpenAI responses. You can turn analytics off at any time in Library. Turning them off immediately stops new optional analytics and clears Lire's analytics identifiers and locally retained analytics events from that device.
        </p>
      </>
    ),
  },
  {
    title: "Information you choose to submit",
    body: (
      <p>
        Feedback may include the category, affected feature or article, and any comment you enter. Android beta registration includes your email and any optional answers you provide; it may also include summary learning counts from the app at submission time. Beta data is used only for testing and launch communication. Unsubscribe requests are retained as needed to prevent further messages, and other beta data is deleted or anonymised when it is no longer needed for the programme.
      </p>
    ),
  },
  {
    title: "AI features",
    body: (
      <p>
        Lire sends text to OpenAI only when an AI-backed feature needs it, such as a requested word explanation, sentence explanation, paraphrase exercise, or natural translation. If natural translation preloading is enabled, Lire may request or retrieve a cached translation after an article is opened. The relevant word, sentence, or article text—including text you imported if you use an AI feature on it—may be included in that request. Lire does not use this content to advertise to you.
      </p>
    ),
  },
  {
    title: "Service providers and sharing",
    body: (
      <p>
        Lire uses Supabase for optional accounts, sync, subscription entitlements, feedback, and product records; Google Play for Android subscription billing and purchase verification; Sentry for diagnostics; OpenAI for AI features; Resend for optional beta confirmation email; Upstash for request control and content infrastructure; and Vercel for hosting. These providers process information on Lire&apos;s behalf. Lire does not sell personal or learning data or share it for behavioural advertising. Information may also be disclosed where required by law or to protect users and the service.
      </p>
    ),
  },
  {
    title: "Legal bases, retention, and security",
    body: (
      <p>
        Where UK or European data-protection law applies, optional analytics are processed with your consent; requested accounts, sync, Premium subscriptions, AI, beta, and feedback features are processed to provide the service you ask for; payment, tax, and accounting records are handled where legally required; and limited security and operational records are processed for legitimate interests in keeping Lire reliable and preventing abuse. Data is retained only for as long as needed for those purposes, then deleted or anonymised. Lire uses HTTPS and access controls, but no online service can guarantee absolute security.
      </p>
    ),
  },
  {
    title: "Your choices and rights",
    body: (
      <p>
        You can use Lire without an account and without optional analytics. You may withdraw analytics consent, unsubscribe from beta email, stop using the app, clear local storage, or uninstall at any time. You can delete your account yourself from Settings, or from the web page at /account/delete if the app is not installed. Deleting your account removes the account and the learning data synced to it, along with any feedback or research responses submitted while signed in; learning data already stored on a device stays there until you clear the app&rsquo;s storage or uninstall it. Premium subscriptions are billed by Google Play, so deleting your Liree account does not cancel a subscription — cancel it in Google Play. You may also contact the address above to request access, correction, export, restriction, or objection. Applicable law may give you the right to complain to your local data-protection authority, including the UK Information Commissioner&rsquo;s Office.
      </p>
    ),
  },
  {
    title: "Service availability and discontinuation",
    body: (
      <>
        <p>
          Lire is an independently operated service and is not guaranteed to remain available indefinitely. The developer may change, suspend, withdraw, or permanently discontinue some or all of Lire at any time, including if the project is no longer practical to operate. Where reasonably possible, advance notice will be provided so users can save or remove their information.
        </p>
        <p className="mt-2">
          Discontinuing Lire does not remove the developer's obligations to handle retained personal data lawfully. Hosted features such as sync, live news, AI, email, and account recovery may stop when the service ends; information already stored locally may remain on a device until the user clears it or uninstalls the app. Nothing in this section limits rights that cannot legally be excluded.
        </p>
      </>
    ),
  },
  {
    title: "Changes to this policy",
    body: (
      <p>
        This policy may be updated when Lire's features, providers, or legal obligations change. Material changes will be highlighted in the app or changelog where practical. The effective date below identifies the current version.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="ligne-screen">
      <AppBar title="Privacy policy" kicker="Lire" backHref="/settings" backLabel="Back to Library" />
      <p className="-mt-3 mb-2 text-sm leading-relaxed text-ink-muted">
        How Lire collects, uses, stores, shares, and deletes app and learning data.
      </p>
      <p className="mb-5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">Effective 21 August 2026</p>

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
