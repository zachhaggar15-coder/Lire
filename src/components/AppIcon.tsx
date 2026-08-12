import type { SVGProps } from "react";

export type AppIconName =
  | "back"
  | "book"
  | "check"
  | "close"
  | "lessons"
  | "library"
  | "news"
  | "pause"
  | "review"
  | "skip-back"
  | "skip-forward"
  | "volume";

interface AppIconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: AppIconName;
  active?: boolean;
}

/** One optical grid and stroke language for persistent app chrome. */
export default function AppIcon({ name, active = false, className = "h-5 w-5", ...props }: AppIconProps) {
  const shared = {
    viewBox: "0 0 24 24",
    className,
    "aria-hidden": true,
    focusable: false,
    ...props,
  } as const;

  if (active && (name === "lessons" || name === "book")) {
    return (
      <svg {...shared} fill="currentColor">
        <path d="M3 5.7A3.2 3.2 0 0 1 6.2 2.5H11v17H6.6A3.6 3.6 0 0 0 3 23V5.7Zm18 0a3.2 3.2 0 0 0-3.2-3.2H13v17h4.4A3.6 3.6 0 0 1 21 23V5.7Z" />
      </svg>
    );
  }

  if (active && name === "news") {
    return (
      <svg {...shared} fill="currentColor">
        <path d="M4 2.5h13.5v4H21v12a3 3 0 0 1-3 3H6.8A3.8 3.8 0 0 1 3 17.7V3.5A1 1 0 0 1 4 2.5Zm13.5 6v9.2c0 1 .5 1.8 1.5 1.8s1.5-.8 1.5-1.8V8.5h-3Z" />
        <path d="M6.5 7h8v2h-8zm0 4h8v2h-8zm0 4h5v2h-5z" fill="var(--app-surface)" />
      </svg>
    );
  }

  if (active && name === "review") {
    return (
      <svg {...shared} fill="currentColor">
        <path d="M4.1 5.6A8.8 8.8 0 0 1 19 8h2.1a1 1 0 0 1 .7 1.7l-3.7 3.7a1 1 0 0 1-1.4 0L13 9.7A1 1 0 0 1 13.7 8H17a6.8 6.8 0 0 0-11.3-.9L4.1 5.6Zm15.8 12.8A8.8 8.8 0 0 1 5 16H2.9a1 1 0 0 1-.7-1.7l3.7-3.7a1 1 0 0 1 1.4 0l3.7 3.7a1 1 0 0 1-.7 1.7H7a6.8 6.8 0 0 0 11.3.9l1.6 1.5Z" />
      </svg>
    );
  }

  if (active && name === "library") {
    return (
      <svg {...shared} fill="currentColor">
        <path d="M5 3h14a2 2 0 0 1 2 2v16H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm1 4v2h10V7H6Zm0 5v2h10v-2H6Zm0 5v2h7v-2H6Z" />
      </svg>
    );
  }

  const strokeProps = {
    ...shared,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "back":
      return <svg {...strokeProps}><path d="m15 18-6-6 6-6" /></svg>;
    case "close":
      return <svg {...strokeProps}><path d="m7 7 10 10M17 7 7 17" /></svg>;
    case "check":
      return <svg {...strokeProps}><path d="m5 12.5 4.2 4.2L19 7" /></svg>;
    case "pause":
      return <svg {...strokeProps}><rect x="6.5" y="5" width="3.5" height="14" rx="1" /><rect x="14" y="5" width="3.5" height="14" rx="1" /></svg>;
    case "volume":
      return <svg {...strokeProps}><path d="m11 5-5 4H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>;
    case "news":
      return <svg {...strokeProps}><path d="M4 3h13v17H7a3 3 0 0 1-3-3V3Z" /><path d="M17 7h3v10a3 3 0 0 1-3 3M7 8h7M7 12h7M7 16h4" /></svg>;
    case "review":
      return <svg {...strokeProps}><path d="M5 7a8 8 0 0 1 13.5 2H21l-4 4-4-4h3.5A6 6 0 0 0 6.6 8M19 17A8 8 0 0 1 5.5 15H3l4-4 4 4H7.5a6 6 0 0 0 9.9 1" /></svg>;
    case "skip-back":
      return <svg {...strokeProps}><path d="M19 5v14M16 6 6 12l10 6V6Z" /></svg>;
    case "skip-forward":
      return <svg {...strokeProps}><path d="M5 5v14M8 6l10 6-10 6V6Z" /></svg>;
    case "library":
      return <svg {...strokeProps}><path d="M5 3h14a2 2 0 0 1 2 2v16H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z" /><path d="M6 8h10M6 12h10M6 16h7" /></svg>;
    case "book":
    case "lessons":
    default:
      return <svg {...strokeProps}><path d="M3.5 5.5A3 3 0 0 1 6.5 2.5H11v17H6.5A3 3 0 0 0 3.5 22.5v-17ZM20.5 5.5a3 3 0 0 0-3-3H13v17h4.5a3 3 0 0 1 3 3v-17Z" /></svg>;
  }
}
