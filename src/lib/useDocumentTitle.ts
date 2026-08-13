"use client";

import { useEffect } from "react";

/**
 * Sets the browser tab / history title for the current route. Restores the
 * previous title on unmount so a route that mounts and unmounts this (e.g.
 * behind a client-side transition) never leaves a stale title behind.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · Lire`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
