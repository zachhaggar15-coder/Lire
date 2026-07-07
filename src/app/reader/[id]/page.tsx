import { getTextById, texts } from "@/data/texts";
import ReaderPageClient from "./ReaderPageClient";

export function generateStaticParams() {
  return texts.map((t) => ({ id: t.id }));
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hardcodedText = getTextById(id) ?? null;
  return <ReaderPageClient id={id} initialText={hardcodedText} />;
}
