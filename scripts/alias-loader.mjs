// A tiny Node module-resolution hook so the plain `node scripts/*.mjs` test
// scripts can import modules that use the app's `@/` path alias (a
// TypeScript/Next.js-only feature Node doesn't understand natively),
// without touching tsconfig or rewriting any app source to use a Node
// `imports` map instead. Registered via register-alias-loader.mjs.
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const rootDir = path.resolve(import.meta.dirname, "..");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = path.join(rootDir, "src", specifier.slice(2) + ".ts");
    return nextResolve(pathToFileURL(target).href, context);
  }
  return nextResolve(specifier, context);
}

// Next's bundler resolves a plain `import x from "./y.json"` without any
// import-attribute syntax; Node's own ESM loader requires `with { type:
// "json" }` on the importing statement, and validates that *before* this
// hook's `format` even gets a say. Reading the file and returning its
// source directly (short-circuiting past `nextLoad`/Node's own JSON
// handling entirely) sidesteps that validation, rather than adding an
// attribute to app source purely for this test runner.
export async function load(url, context, nextLoad) {
  if (url.endsWith(".json")) {
    const source = readFileSync(fileURLToPath(url), "utf8");
    return { format: "json", source, shortCircuit: true };
  }
  return nextLoad(url, context);
}
