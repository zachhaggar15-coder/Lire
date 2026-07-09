import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

/**
 * Native flat config, no `@eslint/eslintrc` FlatCompat bridging. `next
 * lint` no longer exists as of Next 16, and `eslint-config-next`'s
 * legacy-style shareable configs crash under FlatCompat with this
 * project's ESLint/plugin versions (a circular-JSON error inside
 * @eslint/eslintrc's own config validator, coming from newer plugins'
 * self-referencing flat-compat shims — not specific to this codebase).
 * Every plugin here ships a real native flat config, so this just uses
 * those directly instead of bridging through the legacy shareable-config
 * format.
 */
const eslintConfig = [
  { ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "src/data/dictionaries/generated/**", "public/**"] },
  ...tseslint.configs.recommended,
  {
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs["recommended-latest"].rules,
  },
  {
    rules: {
      // Plenty of intentional `catch {}` blocks and untyped third-party
      // JSON throughout this codebase (RSS parsing, AI responses, etc.) —
      // matches the project's existing style rather than fighting it.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // This app relies deliberately and extensively on the standard SSR
      // hydration-safe pattern: start state at a neutral default matching
      // server output, then fill in the real localStorage-backed value
      // inside a mount-only useEffect (see "A hydration gotcha worth
      // knowing" in the README). That's exactly the pattern this newer
      // react-hooks rule flags — it's tuned for a React-Compiler/Server-
      // Components world where setState-in-effect is usually avoidable,
      // which doesn't hold for a client-only, localStorage-driven app with
      // no backend to read that data from during SSR.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
