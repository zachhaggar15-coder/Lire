/** Real SSR/hydration of Premium with stored account identity and delayed entitlement. */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import React, { act } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import ts from "typescript";
import * as store from "../src/lib/localData/store.ts";
import * as types from "../src/lib/premium/types.ts";
import * as features from "../src/lib/access/features.ts";
import * as legal from "../src/lib/legal.ts";
import { createRunner } from "./lib/fakeBrowser.mjs";

const require = createRequire(import.meta.url);
const t = createRunner("Premium hydration");
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://testref.supabase.co";
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Execute the real TSX and status hook using existing dependencies. Only the
// surrounding navigation and external auth/Play/network calls are substituted.
function loadSource(path, dependencies) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: path,
  });
  const compiled = { exports: {} };
  const resolve = (name) => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name);
  new Function("require", "module", "exports", outputText)(resolve, compiled, compiled.exports);
  return compiled.exports;
}

for (const scenario of [
  { name: "signed-in free", account: true, inApp: false, response: types.FREE_PREMIUM_STATUS, message: "Subscribe in the Sorlio Android app" },
  { name: "signed-in Premium", account: true, inApp: true, response: { ...types.FREE_PREMIUM_STATUS, isPremium: true, status: "active" }, message: "Premium is active" },
  { name: "guest", account: false, inApp: false, response: types.FREE_PREMIUM_STATUS, message: "Sign in to subscribe" },
]) {
  await t.section(scenario.name, async () => {
    let settleStatus;
    let fetches = 0;
    let restores = 0;
    const statusPromise = new Promise((resolve) => { settleStatus = resolve; });
    const hook = loadSource("src/lib/premium/usePremiumStatus.ts", {
      "@/lib/premium/client": { fetchPremiumStatus: () => { fetches++; return statusPromise; } },
      "@/lib/premium/types": types,
      "@/lib/localData/store": store,
    });
    const Page = loadSource("src/app/premium/PremiumPageClient.tsx", {
      "next/link": ({ href, children }) => React.createElement("a", { href }, children),
      "@/components/AppBar": ({ title }) => React.createElement("h1", null, title),
      "@/components/GoogleSignInButton": ({ onClick, disabled }) => React.createElement("button", { onClick, disabled }, "Continue with Google"),
      "@/lib/supabase/auth": { signInWithGoogle: async () => ({ ok: true }) },
      "@/lib/localData/store": store,
      "@/lib/premium/usePremiumStatus": hook,
      "@/lib/premium/types": types,
      "@/lib/premium/playBilling": {
        billingSupported: () => scenario.inApp,
        loadOffer: async () => null,
        restorePurchases: async () => { restores++; return null; },
        purchasePremium: async () => { throw new Error("Hydration must not initiate a purchase"); },
      },
      "@/lib/access/features": features,
      "@/lib/legal": legal,
    }).default;

    store.__resetLocalStoreForTests();
    const serverHtml = renderToString(React.createElement(Page));
    const dom = new JSDOM(`<div id="root">${serverHtml}</div>`, { url: "https://sorlio.test/premium" });
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    if (scenario.account) {
      window.localStorage.setItem("sb-testref-auth-token", JSON.stringify({
        access_token: "test-token", user: { id: "aaaaaaaa-0000-4000-8000-0000000000a1" },
      }));
    }
    store.__resetLocalStoreForTests();
    const firstClientHtml = renderToString(React.createElement(Page));
    t.check(`${scenario.name}: server and first client markup match`, firstClientHtml === serverHtml);
    t.check(`${scenario.name}: no account-only link in hydration markup`, !firstClientHtml.includes("Manage or cancel in Google Play"));

    const container = document.getElementById("root");
    const errors = [];
    let root;
    try {
      await act(async () => {
        root = hydrateRoot(container, React.createElement(Page), { onRecoverableError: (error) => errors.push(error.message) });
      });
      t.check(`${scenario.name}: no recoverable hydration error`, errors.length === 0, errors.join("\n"));
      t.check(`${scenario.name}: account-only link resolves after mount`, container.textContent.includes("Manage or cancel in Google Play") === scenario.account);
      t.check(`${scenario.name}: only accounts fetch entitlement`, fetches === (scenario.account ? 1 : 0));
      t.check(`${scenario.name}: only signed-in app visits restore`, restores === (scenario.account && scenario.inApp ? 1 : 0));
      if (scenario.account) {
        t.check(`${scenario.name}: checking state waits for server`, container.textContent.includes("Checking your subscription…"));
        t.check(`${scenario.name}: no premature Premium or guest prompt`, !container.textContent.includes("Premium is active") && !container.textContent.includes("Sign in to subscribe"));
      }
      await act(async () => { settleStatus(scenario.response); });
      t.check(`${scenario.name}: correct state after entitlement response`, container.textContent.includes(scenario.message));
      t.check(`${scenario.name}: sign-in button only for guest`, [...container.querySelectorAll("button")].some((button) => button.textContent === "Continue with Google") === !scenario.account);
    } finally {
      if (root) await act(async () => { root.unmount(); });
      dom.window.close();
      delete globalThis.window;
      delete globalThis.document;
      store.__resetLocalStoreForTests();
    }
  });
}
t.finish();
