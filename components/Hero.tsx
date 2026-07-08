"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Icon } from "./ui/Icon";
import { MagneticButton } from "./ui/MagneticButton";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Headline words rise out of a masked line, one after another. */
function RevealWords({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "115%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: delay + i * 0.06, ease: EASE }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Sunlight-in-a-still-room atmosphere: warm beams, drifting colour fields, dust motes. */
function Atmosphere() {
  const reduce = useReducedMotion();
  const motes = [
    { left: "18%", bottom: "22%", size: 5, duration: "16s", delay: "0s", opacity: 0.5 },
    { left: "32%", bottom: "12%", size: 3, duration: "13s", delay: "3s", opacity: 0.4 },
    { left: "58%", bottom: "28%", size: 4, duration: "18s", delay: "1.5s", opacity: 0.45 },
    { left: "71%", bottom: "16%", size: 3, duration: "12s", delay: "5s", opacity: 0.5 },
    { left: "84%", bottom: "30%", size: 5, duration: "17s", delay: "2s", opacity: 0.35 },
    { left: "44%", bottom: "8%", size: 2, duration: "14s", delay: "7s", opacity: 0.4 },
  ];

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* Warm sun field, upper right */}
      <div
        className="ambient-a absolute -top-1/4 -right-1/4 h-[80vmin] w-[80vmin] rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgb(245 158 11 / 0.16) 0%, rgb(251 191 36 / 0.07) 45%, transparent 70%)",
        }}
      />
      {/* Emerald calm, lower left */}
      <div
        className="ambient-b absolute -bottom-1/4 -left-1/5 h-[70vmin] w-[70vmin] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgb(15 118 110 / 0.12) 0%, rgb(20 184 166 / 0.05) 50%, transparent 70%)",
        }}
      />
      {/* Diagonal window light beams */}
      <div
        className="absolute -top-1/3 right-0 h-[160%] w-[70%] opacity-[0.35] blur-2xl"
        style={{
          background:
            "repeating-linear-gradient(115deg, transparent 0px, transparent 90px, rgb(245 158 11 / 0.09) 90px, rgb(245 158 11 / 0.09) 150px, transparent 150px, transparent 260px)",
        }}
      />
      {/* Architectural arch — a quiet nod to interiors */}
      <svg
        className="absolute top-[12%] right-[6%] hidden h-[70%] w-auto text-ink/[0.05] xl:block"
        viewBox="0 0 400 600"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M40 600V220C40 116 112 40 200 40s160 76 160 180v380" />
        <path d="M90 600V240c0-80 50-140 110-140s110 60 110 140v360" />
        <line x1="0" y1="600" x2="400" y2="600" />
      </svg>

      {!reduce &&
        motes.map((m, i) => (
          <span
            key={i}
            className="mote"
            style={
              {
                left: m.left,
                bottom: m.bottom,
                width: m.size,
                height: m.size,
                "--mote-duration": m.duration,
                "--mote-delay": m.delay,
                "--mote-opacity": m.opacity,
              } as React.CSSProperties
            }
          />
        ))}
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} id="home" className="relative flex min-h-svh flex-col justify-center overflow-hidden">
      <Atmosphere />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-luxe relative z-10 pt-32 pb-24 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
          className="mx-auto inline-flex items-center gap-2.5 rounded-full border border-ink/[0.08] bg-white/60 px-5 py-2.5 backdrop-blur-md"
        >
          <Icon name="sparkle" size={14} className="text-gold" />
          <span className="text-[0.6875rem] font-bold tracking-[0.18em] text-ink/70 uppercase">
            Trusted Residential &amp; Commercial Cleaning Experts
          </span>
        </motion.div>

        {/* Headline */}
        <h1 className="font-display mx-auto mt-9 max-w-[800px] text-[2.75rem] leading-[1.06] font-medium tracking-tight text-balance sm:text-6xl lg:text-7xl">
          <RevealWords text="Premium cleaning that gives you back" delay={0.45} />{" "}
          <RevealWords text="your time." className="italic text-pine" delay={0.95} />
        </h1>

        {/* Supporting copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.15, ease: EASE }}
          className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-ink-mute"
        >
          Transform your home, office or commercial property into a spotless environment —
          with trained professionals committed to excellence, hygiene and attention to detail.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3, ease: EASE }}
          className="mt-11 flex flex-wrap items-center justify-center gap-4"
        >
          <MagneticButton href="#contact" variant="primary">
            Book Cleaning
            <Icon
              name="arrow-right"
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </MagneticButton>
          <MagneticButton href="#pricing" variant="ghost">
            Get Free Quote
          </MagneticButton>
        </motion.div>

        {/* Quiet proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.6 }}
          className="mt-12 text-[0.8125rem] font-medium tracking-wide text-ink/45"
        >
          Homes · Offices · Events · Post-Construction — across Nigeria
        </motion.p>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="relative h-14 w-px overflow-hidden bg-ink/10">
          <motion.span
            className="absolute top-0 left-0 h-5 w-px bg-gold"
            animate={reduce ? undefined : { y: [-20, 56] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
