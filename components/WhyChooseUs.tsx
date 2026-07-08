"use client";

import { motion } from "framer-motion";
import { features } from "@/lib/data";
import { Icon, type IconName } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

export function WhyChooseUs() {
  return (
    <section id="about" className="bg-mist/60 py-28 sm:py-36">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="Why Choose Us"
          title={
            <>
              The standard behind <span className="italic text-pine">every visit.</span>
            </>
          }
          lede="People aren't buying cleaning. They're buying time, confidence and a healthier environment. This is how we deliver all three."
        />

        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 4) * 0.08} className="h-full">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="group flex h-full flex-col rounded-2xl border hairline bg-white p-7 transition-shadow duration-500 hover:shadow-lg hover:shadow-ink/[0.06]"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-pine-mist text-pine transition-colors duration-500 group-hover:bg-gold-mist group-hover:text-gold">
                    <Icon name={feature.icon as IconName} size={21} />
                  </span>
                  <span className="font-display text-sm text-ink/20 italic">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 text-[0.9375rem] font-bold tracking-wide">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-mute">{feature.body}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
