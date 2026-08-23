import type { Metadata } from "next";
import PremiumPageClient from "./PremiumPageClient";

export const metadata: Metadata = {
  title: "Sorlio Premium",
  description: "Unlimited French reading for £3.99 per month.",
};

export default function PremiumPage() {
  return <PremiumPageClient />;
}
