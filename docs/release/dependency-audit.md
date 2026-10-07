# Dependency audit (7 Oct 2026)

`npm audit --omit=dev`: **0 vulnerabilities** in anything shipped to readers
or run by the server.

## Fixed in this release

| Package | From | To | Advisory |
| --- | --- | --- | --- |
| `next` | 16.3.6 | 16.3.8 | Latest 16.3 patch. 16.4.0 (released 6 Oct) deliberately not taken for a release candidate. |
| `sharp` | 0.35.4 | 0.35.5 | CVE-2026-96889 (librsvg) |
| `source-map-js` | 1.2.1 | 1.2.2 | Event-loop DoS via indexed source-map offsets |

`productionBrowserSourceMaps` is off, so no source maps are served.

## Accepted: development tooling only

`npm audit` (including dev dependencies) still reports 8 findings, all in
build-time tooling that never runs on readers' devices or on the server, and
only ever processes this repository's own files:

| Package | Severity | Path | Why accepted |
| --- | --- | --- | --- |
| `braces` ≤3.0.3 | high | `tailwindcss@3` → `chokidar`/`micromatch` | No fixed `braces` release exists; the DoS needs attacker-controlled glob patterns, and the only patterns are in `tailwind.config`. |
| `micromatch`, `chokidar`, `fast-glob` | high | same chain, and `@next/eslint-plugin-next` | Same root cause. |
| `postcss-selector-parser` <7.1.6, `postcss-nested` | moderate | `tailwindcss@3` | Quadratic parsing of our own CSS at build time. Tailwind 3 requires the 6.x line. |

The clean fix is Tailwind 4, a breaking migration of the styling pipeline.
It is tracked as post-launch work rather than done inside a release
candidate.

## Re-checking

```bash
npm audit --omit=dev
npm audit
```
