import { redirect } from "next/navigation";

// /articles predates the lessons map moving to "/" — it rendered the exact
// same ArticleBrowserPage with no distinguishing title or heading, which
// reads as a second, unlabeled product living at a different URL. Reader.tsx
// and BottomNav already treat the two paths as equivalent; this makes that
// canonical instead of duplicating the page.
export default function ArticlesPage() {
  redirect("/");
}
