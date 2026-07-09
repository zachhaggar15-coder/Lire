// Preloaded via `node --import` — registers alias-loader.mjs's `@/` ->
// `src/` resolution hook before the actual test script's imports run.
import { register } from "node:module";

register("./alias-loader.mjs", import.meta.url);
