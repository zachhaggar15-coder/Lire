import { getTextById, texts } from "@/data/texts";
import ListenPageClient from "./ListenPageClient";

export function generateStaticParams() {
  return texts.map((t) => ({ id: t.id }));
}

export default async function ListenRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hardcodedText = getTextById(id) ?? null;
  return <ListenPageClient id={id} initialText={hardcodedText} />;
}
