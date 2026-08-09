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
  practicePage: readFileSync(new URL("../src/app/reader/[id]/practice/PracticePageClient.tsx", import.meta.url), "utf8"),
  listening: readFileSync(new URL("../src/components/practice/ListeningPractice.tsx", import.meta.url), "utf8"),
  wordSheet: readFileSync(new URL("../src/components/WordSheet.tsx", import.meta.url), "utf8"),
  phraseSheet: readFileSync(new URL("../src/components/PhraseSheet.tsx", import.meta.url), "utf8"),
  sentenceSheet: readFileSync(new URL("../src/components/SentenceSheet.tsx", import.meta.url), "utf8"),
  bottomNav: readFileSync(new URL("../src/components/BottomNav.tsx", import.meta.url), "utf8"),
  modalFocus: readFileSync(new URL("../src/lib/useModalFocus.ts", import.meta.url), "utf8"),
  swRoute: readFileSync(new URL("../src/app/sw.js/route.ts", import.meta.url), "utf8"),
  swClient: readFileSync(new URL("../src/components/ServiceWorker.tsx", import.meta.url), "utf8"),
  readingTextHook: readFileSync(new URL("../src/lib/useReadingTextById.ts", import.meta.url), "utf8"),
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

console.log("--- tutorial and practice interaction regressions ---");
check("the tutorial includes all five interactive steps", files.tutorial.includes("const STEP_COUNT = 5"));
check("the tutorial explicitly teaches holding a phrase", files.tutorial.includes("Hold for a phrase") && files.tutorial.includes("onPointerDown={startDemoPhraseHold}"));
check(
  "tutorial and real word cards both offer a single Save action",
  !files.tutorial.includes("<WordLearningActions") && !files.wordSheet.includes("<WordLearningActions")
);
check(
  "the real word card's Save button toggles back off",
  files.wordSheet.includes("saved ? onUnsave?.() : onSave?.(\"learning\")") && files.wordSheet.includes('saved ? "Saved" : "Save"')
);
check("the real word card closes with an X, not a Done label", files.wordSheet.includes('aria-label="Close"'));
check("the real word card is viewport-bounded on mobile and web", files.wordSheet.includes("100dvh") && files.wordSheet.includes("sm:items-center"));
check(
  "mobile word-card actions stay pinned outside the scrolling definition body",
  files.wordSheet.includes("min-h-0 flex-1 touch-pan-y overflow-y-auto") && files.wordSheet.includes("shrink-0 border-t")
);
// The nav is a sibling of <main>, so a sheet's z-index can be trapped by any
// ancestor stacking context and lose to it, covering the sheet's actions.
check(
  "the bottom nav yields to open sheets instead of racing them on z-index",
  files.bottomNav.includes("useAnyModalOpen") && files.bottomNav.includes("if (modalOpen) return null;")
);
check(
  "every bottom sheet registers itself so the nav knows to yield",
  ["wordSheet", "phraseSheet", "sentenceSheet"].every((key) => files[key].includes("useModalPresence(open)"))
);
check("incorrect practice offers retry and reveal", files.practice.includes("Try again") && files.practice.includes("Reveal answer"));
check("the canonical reconstruction is hidden until correct or revealed", files.practice.includes('(result === "correct" || answerRevealed) &&'));
check(
  "completed practice returns directly to the map",
  files.practice.includes("Return to map") &&
    files.practice.includes("onReturnToMap={onReturnToMap}") &&
    files.practicePage.includes('router.replace("/")') &&
    files.practicePage.includes("onReturnToMap={returnToMap}")
);

console.log("--- hydration and modal isolation regressions ---");
check("listening support starts hydration-safe", files.listening.includes("useState(false)") && !files.listening.includes("useState(canSpeak())"));
check("full-screen practice declares modal semantics", files.practice.includes('aria-modal="true"'));
check("modal focus isolation makes background branches inert", files.modalFocus.includes("sibling.inert = true") && files.modalFocus.includes("handleKeyDown"));
check("bottom navigation stays hidden until the tutorial is complete", files.bottomNav.includes("state.walkthroughCompleted === true"));
check("bottom navigation is absent on dedicated practice/listen routes", files.bottomNav.includes("(practice|listen)"));

console.log("--- offline and fresh-link regressions ---");
check("the service worker only caches successful suitable responses", files.swRoute.includes("res.ok") && files.swRoute.includes('!url.pathname.startsWith("/api/")'));
check("homepage fallback is restricted to document navigation", files.swRoute.includes("if (isNavigation) return (await caches.match(\"/\"))"));
check("the auto-reload guard is cleared for a later deployment", files.swClient.includes("sessionStorage.removeItem(RELOAD_GUARD_KEY)"));
check("fresh RSS links fall back to exact-id candidate lookup", files.readingTextHook.includes("/api/rss-texts?id=${encodedId}"));

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
