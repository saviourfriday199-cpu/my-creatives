"use client";

import { motion } from "framer-motion";
import { services } from "@/lib/data";
import { Icon } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

export function Services() {
  return (
    <section id="services" className="py-28 sm:py-36">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="Our Services"
          title={
            <>
              Care, tailored to <span className="italic text-pine">your space.</span>
            </>
          }
          lede="Three ways to hand the cleaning to professionals — each finished to the same exacting standard."
        />

        <div className="mt-20 grid gap-6 lg:grid-cols-3">
          {services.map((service, i) => {
            const featured = service.featured;
            return (
              <Reveal key={service.id} delay={i * 0.12} className="h-full">
                <motion.article
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className={`group relative flex h-full flex-col rounded-3xl p-9 transition-shadow duration-500 ${
                    featured
                      ? "bg-ink text-cream shadow-2xl shadow-ink/25"
                      : "border hairline bg-white shadow-sm hover:shadow-xl hover:shadow-ink/[0.07]"
                  }`}
                >
                  {featured && (
                    <span className="absolute -top-3.5 left-9 rounded-full bg-gold px-4 py-1.5 text-[0.625rem] font-bold tracking-[0.18em] text-ink uppercase">
                      {service.footnote}
                    </span>
                  )}

                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:-rotate-6 ${
                      featured ? "bg-cream/10 text-gold-soft" : "bg-pine-mist text-pine"
                    }`}
                  >
                    <Icon name={service.icon} size={26} />
                  </div>

                  <h3 className="font-display mt-7 text-2xl font-medium">{service.name}</h3>
                  <p className={`font-display mt-2 text-lg italic ${featured ? "text-gold-soft" : "text-pine"}`}>
                    {service.priceRange}
                  </p>
                  <p className={`mt-4 leading-relaxed ${featured ? "text-cream/70" : "text-ink-mute"}`}>
                    {service.description}
                  </p>

                  <ul className="mt-7 space-y-3">
                    {service.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[0.9375rem]">
                        <Icon
                          name="check"
                          size={16}
                          strokeWidth={2.2}
                          className={`mt-1 shrink-0 ${featured ? "text-gold-soft" : "text-pine"}`}
                        />
                        <span className={featured ? "text-cream/85" : "text-ink-soft"}>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#contact"
                    className={`mt-auto inline-flex items-center gap-2 pt-9 text-sm font-bold tracking-wide ${
                      featured ? "text-gold-soft" : "text-pine"
                    }`}
                  >
                    Book this service
                    <Icon
                      name="arrow-right"
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1.5"
                    />
                  </a>
                </motion.article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
