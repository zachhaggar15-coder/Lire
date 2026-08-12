import { redirect } from "next/navigation";

// Phrase management is part of Vocabulary so both saved-item types share one
// consistent screen. Keep the route as a compatibility redirect for old links.
export default function PhrasesPage() {
  redirect("/words?tab=phrases");
}
