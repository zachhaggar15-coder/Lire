import { readFileSync } from "node:fs";

const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
  location: { origin: "https://liree.example" },
  dispatchEvent: () => true,
};

const { accountScopedKeys, clearAccountScopedLocalData } = await import("../src/lib/account/deleteAccount.ts");

/**
 * Google sign-in and self-service account deletion.
 *
 * Sign-in moved from magic links to Google OAuth while keeping Supabase
 * underneath, because every user-owned row is keyed on `auth.users.id`, RLS is
 * written against `auth.uid()`, Play subscriptions are owned by that id, and
 * deletion relies on its cascades. These tests pin the parts of that which are
 * easy to break silently: that the old flow is really gone, that deletion is
 * authorised by the session rather than by a submitted id, that tables without
 * a cascade are cleaned up explicitly, and that the UI does not claim to have
 * deleted more than it did.
 */

let passed = 0;
let failed = 0;
const failures = [];

function check(label, condition, detail = "") {
  if (condition) passed++;
  else {
    failed++;
    failures.push(`${label}${detail ? ` - ${detail}` : ""}`);
  }
}

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

const auth = read("src/lib/supabase/auth.ts");
const deleteRoute = read("src/app/api/account/delete/route.ts");
const deleteClient = read("src/lib/account/deleteAccount.ts");
const dialog = read("src/components/DeleteAccountDialog.tsx");
const accountCard = read("src/components/AccountCard.tsx");
const premiumPage = read("src/app/premium/PremiumPageClient.tsx");
const schema = [
  "supabase/migrations/0002_user_data.sql",
  "supabase/migrations/0003_subscriptions.sql",
  "supabase/migrations/0007_account_deletion_contract.sql",
].map(read).join("\n");
const privacy = read("src/app/privacy/page.tsx");
const verifyRoute = read("src/app/api/premium/google-play/verify/route.ts");
const statusRoute = read("src/app/api/premium/status/route.ts");

console.log("--- Magic-link sign-in is gone ---");
{
  const sources = { auth, accountCard, premiumPage };
  for (const [name, source] of Object.entries(sources)) {
    check(`${name} has no signInWithOtp`, !/signInWithOtp/.test(source));
    check(`${name} has no sendMagicLink`, !/sendMagicLink/.test(source));
  }
  check("no email input remains on the account card", !/type="email"/.test(accountCard));
  check("no email input remains on the premium page", !/type="email"/.test(premiumPage));
  check("no 'check your email' messaging remains", !/check your email/i.test(accountCard + premiumPage));
}

console.log("--- Google sign-in through Supabase ---");
{
  check("signInWithOAuth is used", /signInWithOAuth/.test(auth));
  check("the provider is google", /provider:\s*"google"/.test(auth));
  check("a redirect target is passed", /redirectTo/.test(auth));
  check("Supabase session helpers are retained", /getAccessToken|onAuthStateChange|getCurrentUser/.test(auth));
  check("one button covers new and returning users", /Continue with Google/.test(read("src/components/GoogleSignInButton.tsx")));
  check("no separate sign-up flow is offered", !/Create account|Sign up/i.test(accountCard + premiumPage));
}
{
  // An absolute URL in the return path would turn the OAuth callback into an
  // open redirect, so only same-origin paths may be echoed back.
  check("the redirect is restricted to same-origin paths", /startsWith\("\/"\)/.test(auth));
  check("protocol-relative paths are rejected", /startsWith\("\/\/"\)/.test(auth));
}

console.log("--- Sign-in returns to where it started ---");
{
  check("settings returns to settings", /signInWithGoogle\("\/settings"\)/.test(accountCard));
  check("premium returns to premium", /signInWithGoogle\("\/premium"\)/.test(premiumPage));
  check(
    "the deletion page returns to itself",
    /signInWithGoogle\("\/account\/delete"\)/.test(read("src/app/account/delete/DeleteAccountPageClient.tsx"))
  );
}

console.log("--- Guest progress survives signing in ---");
{
  const authSync = read("src/components/AuthSync.tsx");
  const sync = read("src/lib/supabase/sync.ts");
  check("sign-in triggers a merge, not a replace", /pullAndMergeAllStores/.test(authSync));
  check("an empty cloud never overwrites local data", /if \(usableRemote == null\) return \{ value: usableLocal/.test(sync));
  // Two concurrent merges would race on the same stores, so exactly one
  // listener may start one.
  check("only AuthSync starts the merge", !/syncNow\(\)/.test(accountCard.split("onAuthStateChange")[1]?.split("}, [])")[0] ?? ""));
}

console.log("--- Deletion is authorised by the session, not by a submitted id ---");
{
  check("the endpoint derives the user from the token", /authenticatedUser\(request\)/.test(deleteRoute));
  check("no user id is read from the request body", !/body.*user_?[Ii]d|json\(\)/.test(deleteRoute));
  check("unauthenticated requests are rejected", /status:\s*401/.test(deleteRoute));
  check("the service client is server-side only", /getSupabaseServiceClient/.test(deleteRoute));
  check("the auth user itself is deleted", /auth\.admin\.deleteUser/.test(deleteRoute));
  check("the client sends only a bearer token", /Authorization:\s*`Bearer/.test(deleteClient));
  check("the client sends no user id", !/user_?[Ii]d/.test(deleteClient));
}

console.log("--- Every user-linked table is covered ---");
{
  check("sorlio_user_data cascades", /sorlio_user_data[\s\S]*?references auth\.users \(id\) on delete cascade/.test(schema));
  check("sorlio_subscriptions cascades", /sorlio_subscriptions[\s\S]*?references auth\.users \(id\) on delete cascade/.test(schema));
  for (const table of ["sorlio_feedback", "sorlio_research_prompt_responses", "sorlio_analytics_events"]) {
    check(`${table} is deleted explicitly`, deleteRoute.includes(table), "no cascade exists for it");
  }
  check("non-cascading rows are removed before the auth user", deleteRoute.indexOf("NON_CASCADING_USER_TABLES") < deleteRoute.indexOf("auth.admin.deleteUser"));
  check("the schema documents what does not cascade", /(does|do) NOT cascade/i.test(schema));
  // Keyed by email with its own unsubscribe token, and stores user_id as null.
  check("the beta mailing list is not silently deleted", !deleteRoute.includes("sorlio_android_beta_interest"));
}

console.log("--- A failed deletion changes nothing ---");
{
  const beforeClear = deleteClient.indexOf("clearAccountScopedLocalData()");
  check("nothing is cleared before the server confirms", deleteClient.indexOf("if (!response.ok)") < beforeClear);
  check("a network failure reports that nothing happened", /has not been deleted/.test(deleteClient));
  check("a failed dialog keeps the user signed in", /setWorking\(false\);\s*\n\s*setError/.test(dialog));
  check("success is only reported after the server confirms", /if \(result\.ok\) \{\s*\n\s*onDeleted\(\)/.test(dialog));
}

console.log("--- Local data claims are truthful ---");
{
  const keys = accountScopedKeys();
  check("the cached entitlement is cleared", keys.includes("lire.premium.status.v1"));
  check("sync bookkeeping is cleared", keys.includes("lire.sync.storeMetadata.v1"));
  check("learning data is not in the cleared set", !keys.some((k) => /savedWords|knownWords|gamification|progress\.v1/.test(k)));

  store.clear();
  store.set("lire.premium.status.v1", "{}");
  store.set("lire.sync.storeMetadata.v1", "{}");
  store.set("lire.savedWords.v1", '[{"word":"bonjour"}]');
  clearAccountScopedLocalData();
  check("account traces are removed", !store.has("lire.premium.status.v1") && !store.has("lire.sync.storeMetadata.v1"));
  check("saved words survive deletion", store.get("lire.savedWords.v1") === '[{"word":"bonjour"}]');

  check("the dialog says progress stays on the device", /stay on this device/.test(dialog));
  check("the dialog does not claim everything is deleted", !/all (your )?data (is|will be) deleted/i.test(dialog));
}

console.log("--- Google Play subscriptions are handled honestly ---");
{
  check("a live subscription is detected before deleting", /premium\.isPremium/.test(dialog));
  check("grace period counts as live", /grace_period/.test(dialog));
  check("the warning says deletion does not cancel billing", /does not cancel/.test(dialog));
  check("Play's own management page is linked", /play\.google\.com\/store\/account\/subscriptions/.test(dialog));
  check("no custom cancellation is attempted", !/cancelSubscription|\/api\/premium\/cancel/.test(dialog));
  check("the warning cannot be skipped", /acknowledgedSubscription/.test(dialog));
}

console.log("--- The Play payment path is unchanged ---");
{
  check("purchases are still verified server-side", /verifyPlaySubscription/.test(verifyRoute));
  check("the product id is still validated", /PREMIUM_PRODUCT_ID/.test(verifyRoute));
  check("purchases are still owned by the authenticated user", /user_id:\s*user\.id/.test(verifyRoute));
  check("subscription writes still require the service client", /getSupabaseServiceClient/.test(verifyRoute));
  check("status still re-verifies with Google", /verifyPlaySubscription/.test(statusRoute));
  check("expiry is still checked", /expires_at|expiresAt/.test(statusRoute));
  check("verification did not move client-side", !/androidpublisher/.test(read("src/lib/premium/client.ts")));
}

console.log("--- The web deletion page exists and reuses the same logic ---");
{
  const page = read("src/app/account/delete/DeleteAccountPageClient.tsx");
  check("it uses the shared dialog", /DeleteAccountDialog/.test(page));
  check("it requires signing in first", /GoogleSignInButton/.test(page));
  check("it explains the Play subscription relationship", /Google Play/.test(page));
  check("it does not implement its own deletion call", !/\/api\/account\/delete/.test(page));
}

console.log("--- The privacy policy matches the implementation ---");
{
  check("it says Google is used for sign-in", /sign in with Google|with Google/.test(privacy));
  check("it names Supabase as the account infrastructure", /Supabase/.test(privacy));
  check("it states Sorlio never receives the Google password", /never receives your Google password/.test(privacy));
  check("it points to self-service deletion", /account\/delete/.test(privacy));
  check("it says deletion is available from Settings", /from Settings/.test(privacy));
  check("it warns that Play subscriptions are separate", /does not cancel a subscription/.test(privacy));
  check("it no longer describes magic links", !/passwordless sign-in link/.test(privacy));
  check("it states local data stays on the device", /stays there until you clear/.test(privacy));
}

console.log("--- Only the minimum personal data is handled ---");
{
  // Comments are stripped first: these files *explain* that Sorlio stores no
  // password or phone number, and that prose should not fail the test that
  // enforces it.
  const codeOnly = (source) =>
    source
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|[^:])\/\/.*$/gm, "$1 ");
  const sources = [auth, accountCard, deleteClient, deleteRoute].map(codeOnly).join(" ");
  for (const field of ["full_name", "avatar_url", "phone", "birthday", "date_of_birth", "address"]) {
    check(`no ${field} is stored`, !new RegExp(field, "i").test(sources), "found outside comments");
  }
  check("no password handling exists", !/password/i.test(codeOnly(auth) + codeOnly(accountCard)));
  check("only the email is surfaced in the account UI", /user\?\.email/.test(accountCard));
  // The OAuth call must not widen scope beyond what Supabase requests by
  // default, which is what keeps profile name and picture out of Sorlio.
  check("no extra Google scopes are requested", !/scopes:/.test(codeOnly(auth)));
}

if (failures.length > 0) {
  console.log("");
  for (const failure of failures) console.log(`FAIL ${failure}`);
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
