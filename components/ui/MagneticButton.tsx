"use client";

import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode, type PointerEvent } from "react";

/**
 * A button/link that leans gently toward the cursor — motion that whispers.
 * Renders an <a> when `href` is given, otherwise a <button>.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  className = "",
  variant = "primary",
  ariaLabel,
  type,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "ghost" | "gold";
  ariaLabel?: string;
  type?: "button" | "submit";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 16, mass: 0.4 });

  function onMove(e: PointerEvent) {
    if (reduce || !ref.current || e.pointerType !== "mouse") return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.22);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.3);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  const base =
    "group inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-[0.9375rem] font-semibold tracking-wide transition-colors duration-300 select-none";
  const variants = {
    primary: "bg-ink text-cream hover:bg-pine",
    gold: "bg-gold text-ink hover:bg-gold-soft",
    ghost:
      "border border-ink/15 text-ink hover:border-pine hover:text-pine bg-white/40 backdrop-blur-sm",
  } as const;

  const inner = (
    <motion.span style={{ x: sx, y: sy }} className="inline-flex">
      {href ? (
        <a href={href} onClick={onClick} aria-label={ariaLabel} className={`${base} ${variants[variant]} ${className}`}>
          {children}
        </a>
      ) : (
        <button type={type ?? "button"} onClick={onClick} aria-label={ariaLabel} className={`${base} ${variants[variant]} ${className}`}>
          {children}
        </button>
      )}
    </motion.span>
  );

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className="inline-block">
      {inner}
    </div>
  );
}
