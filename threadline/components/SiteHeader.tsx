"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/review", label: "Review" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-[rgba(6,9,16,0.82)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-[clamp(16px,4vw,40px)] py-4">
        <Link
          href="/"
          className="font-display text-[18px] font-bold tracking-[-0.01em]"
        >
          thread<span className="text-gold">line</span>
        </Link>
        <nav className="flex items-center gap-1 font-mono text-[12px] tracking-[0.05em]">
          {LINKS.map((l) => {
            const active =
              pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-1.5 uppercase transition-colors ${
                  active
                    ? "text-gold"
                    : "text-muted hover:text-text"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
