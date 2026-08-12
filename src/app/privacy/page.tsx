import AppBar from "@/components/AppBar";

export default function PrivacyPage() {
  return (
    <div className="ligne-screen">
      <AppBar title="Privacy" kicker="Library" backHref="/settings" backLabel="Back to Library" />
      <p className="-mt-3 mb-5 text-sm text-ink-muted">How Lire handles app, learning, and validation data.</p>

      <div className="space-y-3 text-sm leading-relaxed text-ink-muted">
        <section className="rounded-card bg-cream-card p-4 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Local first</h2>
          <p className="mt-2">Lire stores saved words, known words, reading progress, goals, grammar progress, and settings on this device by default.</p>
        </section>
        <section className="rounded-card bg-cream-card p-4 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Optional sync</h2>
          <p className="mt-2">If you sign in with Supabase sync, Lire can merge those local stores across your devices. Accounts are not required for normal reading.</p>
        </section>
        <section className="rounded-card bg-cream-card p-4 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Product validation</h2>
          <p className="mt-2">Lire may collect product analytics such as article openings, reading-session completion, review participation, installation status, beta interest, and feedback categories.</p>
          <p className="mt-2">Analytics do not include full article text, imported text, saved private text, OpenAI responses, or full email addresses.</p>
        </section>
        <section className="rounded-card bg-cream-card p-4 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Android beta email</h2>
          <p className="mt-2">If you join the Android beta list, your email is used for Lire Android beta and launch communication only. You can unsubscribe from beta emails.</p>
        </section>
        <section className="rounded-card bg-cream-card p-4 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">AI</h2>
          <p className="mt-2">AI requests are made only for AI features: asking for word nuance, sentence explanation, or fluent translation. When fluent translation is enabled, Lire may preload one cached translation after you open an article so the English toggle is ready.</p>
        </section>
        <section className="rounded-card bg-cream-card p-4 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">No sale of data</h2>
          <p className="mt-2">Lire does not sell learner data. Validation data is used to decide what to improve and whether an Android release is worth building.</p>
        </section>
      </div>
    </div>
  );
}
