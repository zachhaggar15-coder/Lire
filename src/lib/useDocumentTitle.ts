"use client";

import { useEffect } from "react";

/** Sets the browser tab / history title for the current route. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · Lire`;
  }, [title]);
}
