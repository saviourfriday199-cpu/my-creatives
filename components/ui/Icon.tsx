import type { SVGProps } from "react";

export type IconName =
  | "sparkle"
  | "home"
  | "building"
  | "bell"
  | "academy"
  | "spark"
  | "leaf"
  | "wallet"
  | "calendar"
  | "detail"
  | "family"
  | "shield"
  | "star"
  | "phone"
  | "whatsapp"
  | "instagram"
  | "tiktok"
  | "arrow-right"
  | "check"
  | "plus"
  | "menu"
  | "close"
  | "map-pin"
  | "quote";

const paths: Record<IconName, React.ReactNode> = {
  sparkle: (
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
  ),
  home: (
    <path d="M3 10.5L12 3l9 7.5M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5" />
  ),
  building: (
    <path d="M4 21V5a2 2 0 012-2h8a2 2 0 012 2v16M4 21h16M16 21V11h3a1 1 0 011 1v9M8 7h2m-2 4h2m-2 4h2m2-8h2m-2 4h2" />
  ),
  bell: (
    <path d="M4 17h16M5 17a7 7 0 0114 0M12 10V7m-2 0h4m-9 13h14" />
  ),
  academy: (
    <path d="M12 4L2 9l10 5 10-5-10-5zM6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v5" />
  ),
  spark: (
    <path d="M13 2L4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" />
  ),
  leaf: (
    <path d="M5 19c0-8 5-14 14-14 0 9-6 14-12 14M5 19c0-4 2-7 6-9M5 19l-2 2" />
  ),
  wallet: (
    <path d="M3 7a2 2 0 012-2h13a1 1 0 011 1v2M3 7v10a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2H3m13 5h.01" />
  ),
  calendar: (
    <path d="M4 7a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7zm0 4h16M8 3v4m8-4v4m-6 7l2 2 4-4" />
  ),
  detail: (
    <path d="M15.5 15.5L21 21m-10.5-3a7.5 7.5 0 110-15 7.5 7.5 0 010 15zm0-11v3.5l2.5 1.5" />
  ),
  family: (
    <path d="M8 11a3 3 0 100-6 3 3 0 000 6zm8 1a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM2.5 20a5.5 5.5 0 0111 0m1.5 0a4.5 4.5 0 016.5-4" />
  ),
  shield: (
    <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3zm-3 9l2 2 4-4" />
  ),
  star: (
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5L2.5 9.4l6.6-.9 2.9-6z" />
  ),
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
  ),
  whatsapp: (
    <path d="M12 3a9 9 0 00-7.8 13.5L3 21l4.7-1.2A9 9 0 1012 3zm-3.5 5.7c.2-.5.5-.5.7-.5h.6c.2 0 .5-.1.7.5s.8 1.9.8 2-.1.4-.2.5l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.4 1.8 2.2 1.3 1.1 2.3 1.4 2.6 1.6.3.1.5.1.7-.1l1-1.2c.2-.3.5-.2.8-.1l1.9.9c.3.2.5.2.6.4 0 .2 0 1-.4 1.9" />
  ),
  instagram: (
    <path d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zM17.5 6.5h.01" />
  ),
  tiktok: (
    <path d="M15 3v9.5a4.5 4.5 0 11-4.5-4.5M15 3a6 6 0 006 6" />
  ),
  "arrow-right": <path d="M4 12h16m0 0l-6-6m6 6l-6 6" />,
  check: <path d="M4 12.5l5 5L20 6.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  "map-pin": (
    <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11zm0-8.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
  ),
  quote: (
    <path d="M8.5 5C5.5 6.5 4 9 4 12.5V19h6.5v-6.5H6.8c0-2.3 1-3.9 3.2-5L8.5 5zm10 0c-3 1.5-4.5 4-4.5 7.5V19h6.5v-6.5h-3.7c0-2.3 1-3.9 3.2-5L18.5 5z" />
  ),
};

/** Filled (not stroked) icon names */
const filled: IconName[] = ["star", "quote", "sparkle"];

export function Icon({
  name,
  size = 24,
  strokeWidth = 1.6,
  ...props
}: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  const isFilled = filled.includes(name);
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={isFilled ? "currentColor" : "none"}
      stroke={isFilled ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
