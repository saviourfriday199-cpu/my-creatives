"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/data";
import { Icon } from "./ui/Icon";

const EASE = [0.22, 1, 0.36, 1] as const;

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <a href="/#home" className="flex items-baseline gap-2" aria-label={`${site.name} — home`}>
      <span
        className={`font-display text-2xl font-semibold italic tracking-tight ${
          light ? "text-cream" : "text-ink"
        }`}
      >
        O&F
      </span>
      <span
        className={`text-[0.625rem] font-bold tracking-[0.32em] uppercase ${
          light ? "text-cream/80" : "text-ink/70"
        }`}
      >
        Pristine Solution
      </span>
    </a>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  // Lock body scroll while the fullscreen menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: EASE }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b hairline bg-cream/80 py-3 backdrop-blur-xl"
            : "bg-transparent py-5"
        }`}
      >
        <nav className="container-luxe flex items-center justify-between" aria-label="Main">
          <Wordmark />

          {/* Desktop links — centered */}
          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 lg:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="group relative text-[0.8125rem] font-semibold tracking-wide text-ink/70 transition-colors hover:text-ink"
                >
                  {item.label}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href="/#contact"
              className="hidden rounded-full bg-ink px-6 py-2.5 text-[0.8125rem] font-semibold text-cream transition-colors duration-300 hover:bg-pine lg:inline-flex"
            >
              Book Cleaning
            </a>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 text-ink lg:hidden"
            >
              <Icon name="menu" size={20} />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Fullscreen mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "circle(0% at calc(100% - 3.5rem) 3rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 3.5rem) 3rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 3.5rem) 3rem)" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="fixed inset-0 z-[70] flex flex-col bg-ink"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="container-luxe flex items-center justify-between py-5">
              <Wordmark light />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 text-cream"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <ul className="container-luxe mt-6 flex flex-1 flex-col gap-1">
              {nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.7, ease: EASE }}
                >
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-baseline gap-4 py-3"
                  >
                    <span className="text-xs font-semibold text-gold/70 tabular-nums">
                      0{i + 1}
                    </span>
                    <span className="font-display text-4xl font-medium text-cream transition-colors group-hover:text-gold-soft">
                      {item.label}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="container-luxe border-t border-cream/10 py-8"
            >
              <a
                href="/#contact"
                onClick={() => setOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-full bg-gold py-4 text-sm font-bold text-ink"
              >
                Book Cleaning
              </a>
              <p className="mt-6 text-sm text-cream/50">
                {site.phones.join(" · ")} — {site.instagram.handle}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
