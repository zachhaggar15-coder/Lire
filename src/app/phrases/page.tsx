import { redirect } from "next/navigation";

// The phrase bank now lives inside /words as its "Phrases" tab, so the two
// no longer render as visually inconsistent, separately-maintained pages.
// This route is kept only so old links/bookmarks still land somewhere.
export default function PhrasesPage() {
  redirect("/words?tab=phrases");
}
