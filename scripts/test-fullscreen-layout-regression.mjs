// Guards the CSS/ownership contract that keeps viewport-fixed tutorial and
// practice screens from being clipped to a zero-height route wrapper.
// Run with: node scripts/test-fullscreen-layout-regression.mjs
import { existsSync, readFileSync } from "node:fs";

const files = {
  css: readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8"),
  layout: readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8"),
  template: readFileSync(new URL("../src/app/template.tsx", import.meta.url), "utf8"),
  tutorial: readFileSync(new URL("../src/components/onboarding/InteractiveWalkthrough.tsx", import.meta.url), "utf8"),
  practice: readFileSync(new URL("../src/components/practice/PracticeOverlay.tsx", import.meta.url), "utf8"),
};

let passed = 0;
let failed = 0;

function check(label, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`OK ${label}`);
  } else {
    failed++;
    console.log(`FAIL ${label}${detail ? ` - ${detail}` : ""}`);
  }
}

function blockAfter(source, marker) {
  const start = source.indexOf(marker);
  if (start === -1) return "";
  const open = source.indexOf("{", start);
  if (open === -1) return "";
  let depth = 0;
  for (let index = open; index < source.length; index++) {
    if (source[index] === "{") depth++;
    if (source[index] === "}") {
      depth--;
      if (depth === 0) return source.slice(open + 1, index);
    }
  }
  return "";
}

const routeRule = blockAfter(files.css, ".app-route-shell");
const routeKeyframes = blockAfter(files.css, "@keyframes app-route-enter");
const containingBlockProperties =
  /\b(transform|filter|perspective|backdrop-filter|will-change|contain|container-type|content-visibility)\s*:/i;

console.log("--- route transition ownership ---");
check("the Next template owns the route-entry animation", files.template.includes('className="app-route-shell"'));
check("the root layout does not mount a second transition controller", !files.layout.includes("AppRouteTransition"));
check(
  "the redundant transition component is removed",
  !existsSync(new URL("../src/components/AppRouteTransition.tsx", import.meta.url))
);

console.log("--- fixed-position containing-block guard ---");
check("the route shell rule exists", routeRule.length > 0);
check("the route-entry keyframes exist", routeKeyframes.length > 0);
check(
  "the route shell itself has no fixed-position containing-block property",
  !containingBlockProperties.test(routeRule),
  routeRule.trim()
);
check(
  "the route animation never applies a fixed-position containing-block property",
  !containingBlockProperties.test(routeKeyframes),
  routeKeyframes.trim()
);

console.log("--- full-screen overlay contract ---");
check(
  "the tutorial remains a viewport-fixed, scrollable screen",
  files.tutorial.includes("fixed inset-0") && files.tutorial.includes("overflow-y-auto")
);
check(
  "practice remains a viewport-fixed, scrollable screen",
  files.practice.includes("fixed inset-0") && files.practice.includes("overflow-y-auto")
);

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
