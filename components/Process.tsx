"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { processSteps } from "@/lib/data";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

/**
 * Horizontal timeline whose connecting line draws itself as you scroll.
 * Collapses to a vertical rail on small screens.
 */
export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 60%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });

  return (
    <section id="process" className="py-28 sm:py-36">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="Our Process"
          title={
            <>
              Five steps to <span className="italic text-pine">pristine.</span>
            </>
          }
          lede="A calm, predictable process from first call to finished space — so you always know what happens next."
        />

        <div ref={ref} className="relative mt-24">
          {/* Connecting rail */}
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[1.4375rem] w-px bg-ink/10 lg:top-6 lg:right-[10%] lg:bottom-auto lg:left-[10%] lg:h-px lg:w-auto"
          />
          <motion.div
            aria-hidden="true"
            style={{ scaleY: progress, scaleX: 1 }}
            className="absolute top-0 bottom-0 left-[1.4375rem] w-px origin-top bg-gold lg:hidden"
          />
          <motion.div
            aria-hidden="true"
            style={{ scaleX: progress }}
            className="absolute top-6 right-[10%] left-[10%] hidden h-px origin-left bg-gold lg:block"
          />

          <ol className="relative grid gap-12 lg:grid-cols-5 lg:gap-6">
            {processSteps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.12}>
                <li className="flex gap-6 lg:flex-col lg:items-center lg:gap-0 lg:text-center">
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-cream">
                    <span className="font-display text-lg text-pine italic">{i + 1}</span>
                  </div>
                  <div className="lg:mt-7">
                    <h3 className="text-base font-bold tracking-wide">{step.title}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-mute lg:mx-auto">
                      {step.body}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
