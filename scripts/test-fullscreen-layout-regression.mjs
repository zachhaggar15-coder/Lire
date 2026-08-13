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
  completion: readFileSync(new URL("../src/components/LessonCompleteScreen.tsx", import.meta.url), "utf8"),
  practicePage: readFileSync(new URL("../src/app/reader/[id]/practice/PracticePageClient.tsx", import.meta.url), "utf8"),
  listening: readFileSync(new URL("../src/components/practice/ListeningPractice.tsx", import.meta.url), "utf8"),
  wordSheet: readFileSync(new URL("../src/components/WordSheet.tsx", import.meta.url), "utf8"),
  phraseSheet: readFileSync(new URL("../src/components/PhraseSheet.tsx", import.meta.url), "utf8"),
  sentenceSheet: readFileSync(new URL("../src/components/SentenceSheet.tsx", import.meta.url), "utf8"),
  bottomSheet: readFileSync(new URL("../src/components/BottomSheet.tsx", import.meta.url), "utf8"),
  bottomNav: readFileSync(new URL("../src/components/BottomNav.tsx", import.meta.url), "utf8"),
  appIcon: readFileSync(new URL("../src/components/AppIcon.tsx", import.meta.url), "utf8"),
  navigationPolish: readFileSync(new URL("../src/components/AppNavigationPolish.tsx", import.meta.url), "utf8"),
  routeLoading: readFileSync(new URL("../src/components/RouteLoading.tsx", import.meta.url), "utf8"),
  settingsLoading: readFileSync(new URL("../src/app/settings/loading.tsx", import.meta.url), "utf8"),
  viewportHeight: readFileSync(new URL("../src/components/ViewportHeightVar.tsx", import.meta.url), "utf8"),
  reader: readFileSync(new URL("../src/components/Reader.tsx", import.meta.url), "utf8"),
  review: readFileSync(new URL("../src/app/review/page.tsx", import.meta.url), "utf8"),
  modalFocus: readFileSync(new URL("../src/lib/useModalFocus.ts", import.meta.url), "utf8"),
  swRoute: readFileSync(new URL("../src/app/sw.js/route.ts", import.meta.url), "utf8"),
  swClient: readFileSync(new URL("../src/components/ServiceWorker.tsx", import.meta.url), "utf8"),
  readingTextHook: readFileSync(new URL("../src/lib/useReadingTextById.ts", import.meta.url), "utf8"),
  documentTitle: readFileSync(new URL("../src/lib/useDocumentTitle.ts", import.meta.url), "utf8"),
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
const forwardRouteKeyframes = blockAfter(files.css, "@keyframes app-route-forward");
const backRouteKeyframes = blockAfter(files.css, "@keyframes app-route-back");
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
  [routeKeyframes, forwardRouteKeyframes, backRouteKeyframes].every((rule) => !containingBlockProperties.test(rule)),
  [routeKeyframes, forwardRouteKeyframes, backRouteKeyframes].join("\n").trim()
);

console.log("--- Android quality polish contract ---");
check("primary navigation uses a moving indicator", files.bottomNav.includes("activeIndex * 100") && files.bottomNav.includes("transition-transform"));
check("primary navigation icons have filled active variants", files.bottomNav.includes("active={active}") && files.appIcon.includes("active && name"));
check("route motion distinguishes drill-in, back, and crossfade", ["forward", "back", "crossfade"].every((motion) => files.navigationPolish.includes(`\"${motion}\"`)));
check("route skeletons are delayed and destination-shaped", files.css.includes(".route-loading-delayed") && ["LessonsSkeleton", "ReaderSkeleton", "ReviewSkeleton", "LibrarySkeleton"].every((name) => files.routeLoading.includes(name)));
check("Library owns its route-specific loading state", files.settingsLoading.includes('variant="library"'));
check("keyboard geometry is exposed to app chrome and sheets", files.viewportHeight.includes("--keyboard-inset") && files.css.includes("html.keyboard-open .bottom-nav") && files.bottomSheet.includes("var(--keyboard-inset)"));
check("the reader uses aligned controls and a content boundary", files.reader.includes('canUseSpeech ? "grid-cols-2"') && files.reader.includes("border-t border-cream-dark/90 pt-5"));
check("Review has a composed empty state", files.review.includes('name="book" active') && files.review.includes("Your review deck is ready when you are"));
check("changing review counts retain a stable slot", files.review.includes("ligne-state-slot") && files.review.includes("ligne-value-change"));

console.log("--- full-screen overlay contract ---");
check(
  "the tutorial remains a viewport-fixed, scrollable screen",
  files.tutorial.includes("fixed inset-0") && files.tutorial.includes("overflow-y-auto")
);
check(
  "practice remains a viewport-fixed, scrollable screen",
  files.practice.includes("fixed inset-0") && files.practice.includes("overflow-y-auto")
);
check(
  "completion actions occupy layout space instead of covering the scroll region",
  files.completion.includes("flex min-h-0 flex-col") &&
    files.completion.includes("min-h-0 flex-1 overflow-y-auto") &&
    files.completion.includes("max-w-md shrink-0 border-t") &&
    !files.completion.includes('className="fixed inset-x-0 bottom-0')
);

console.log("--- tutorial and practice interaction regressions ---");
check("the tutorial includes all five interactive steps", files.tutorial.includes("const STEP_COUNT = 5"));
check("the tutorial explicitly teaches holding a phrase", files.tutorial.includes("Hold for a phrase") && files.tutorial.includes("onPointerDown={startDemoPhraseHold}"));
check(
  "tutorial and real word cards both offer a single primary review action",
  !files.tutorial.includes("<WordLearningActions") && !files.wordSheet.includes("<WordLearningActions")
);
check(
  "the real word card's review button toggles back off",
  files.wordSheet.includes("saved ? onUnsave?.() : onSave?.(\"learning\")") &&
    files.wordSheet.includes('saved ? "Remove from review" : "Add to review"')
);
check("the real word card closes with an X, not a Done label", files.wordSheet.includes('aria-label="Close"'));
check(
  "the real word card is viewport-bounded on mobile and web",
  files.wordSheet.includes("<BottomSheet") && files.bottomSheet.includes("100dvh") && files.bottomSheet.includes("sm:items-center")
);
check(
  "mobile word-card actions stay pinned outside the scrolling definition body",
  files.wordSheet.includes("footer={footer}") &&
    files.bottomSheet.includes("min-h-0 flex-1 touch-pan-y overflow-y-auto") &&
    files.bottomSheet.includes("shrink-0 border-t")
);
// The nav is a sibling of <main>, so a sheet's z-index can be trapped by any
// ancestor stacking context and lose to it, covering the sheet's actions.
check(
  "the bottom nav yields to open sheets instead of racing them on z-index",
  files.bottomNav.includes("useAnyModalOpen") && files.bottomNav.includes("if (modalOpen) return null;")
);
check(
  "every bottom sheet registers itself so the nav knows to yield",
  ["wordSheet", "phraseSheet", "sentenceSheet"].every((key) => files[key].includes("<BottomSheet")) &&
    files.bottomSheet.includes("useModalPresence(open)")
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
check("non-RSS missing ids never trigger the remote candidate-pool lookup", files.readingTextHook.includes('if (!id.startsWith("rss-"))'));
check(
  "route-title cleanup cannot overwrite the title set by the next route",
  files.documentTitle.includes("document.title =") && !files.documentTitle.includes("const previous = document.title")
);

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
