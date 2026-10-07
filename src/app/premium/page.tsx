import type { Metadata } from "next";
import PremiumPageClient from "./PremiumPageClient";

export const metadata: Metadata = {
  title: "Sorlio Premium",
  description: "Unlimited word saving and AI help for French learners. Sorlio's reader, news, listening and review stay free.",
};

export default function PremiumPage() {
  return <PremiumPageClient />;
}
