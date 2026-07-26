"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AppRouteTransition() {
  const pathname = usePathname();

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>("[data-app-route-shell]");
    if (!shell) return;

    shell.classList.remove("app-route-shell");
    void shell.offsetWidth;
    shell.classList.add("app-route-shell");

    const timer = window.setTimeout(() => {
      shell.classList.remove("app-route-shell");
    }, 320);

    return () => {
      window.clearTimeout(timer);
      shell.classList.remove("app-route-shell");
    };
  }, [pathname]);

  return null;
}
