import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/**
 * Editorial section header: tracked eyebrow, display headline, quiet lede.
 */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <Reveal className={`max-w-2xl ${alignCls}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="font-display mt-5 text-4xl leading-[1.08] font-medium tracking-tight text-balance sm:text-5xl">
        {title}
      </h2>
      {lede && <p className="mt-6 text-lg leading-relaxed text-ink-mute">{lede}</p>}
    </Reveal>
  );
}
