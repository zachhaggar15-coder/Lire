import { getTextById, texts } from "@/data/texts";
import PracticePageClient from "./PracticePageClient";

export function generateStaticParams() {
  return texts.map((t) => ({ id: t.id }));
}

export default async function PracticeRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hardcodedText = getTextById(id) ?? null;
  return <PracticePageClient id={id} initialText={hardcodedText} />;
}
