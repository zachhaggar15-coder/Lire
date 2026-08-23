"use client";

/**
 * The single authentication control in the app.
 *
 * There is deliberately no sign-up / log-in pair: Supabase creates the account
 * the first time a Google identity authenticates and returns the same user
 * afterwards, so asking the reader which one they are would be asking a
 * question the system does not need answered.
 */
export default function GoogleSignInButton({
  onClick,
  disabled,
  busy,
  className = "",
}: {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full border border-cream-dark bg-white px-5 py-3 text-sm font-semibold text-ink shadow-card disabled:opacity-60 ${className}`}
    >
      <GoogleMark />
      {busy ? "Opening Google…" : "Continue with Google"}
    </button>
  );
}

/** Google's brand mark, inline so the button works offline and needs no asset host. */
function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="h-[18px] w-[18px] shrink-0">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
