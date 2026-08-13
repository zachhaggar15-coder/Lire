"use client";

import ArticleBrowserPage from "@/components/ArticleBrowserPage";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

export default function LiveNewsPage() {
  useDocumentTitle("News");
  return <ArticleBrowserPage mode="live" />;
}
