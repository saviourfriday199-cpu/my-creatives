"use client";

import { motion } from "framer-motion";
import { testimonials } from "@/lib/data";
import { Icon } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

/** Monogram avatar — initials on a navy-to-emerald gradient. */
function Monogram({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      aria-hidden="true"
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-cream"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #0f766e 100%)" }}
    >
      {initials}
    </span>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1 text-gold" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <Icon key={i} name="star" size={14} />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="testimonials" className="py-28 sm:py-36">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="Testimonials"
          title={
            <>
              Loved by homes and businesses <span className="italic text-pine">across Nigeria.</span>
            </>
          }
          lede="We measure success in return bookings and referrals. Here's what our clients say."
        />

        <div className="mt-20 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 0.1} className="break-inside-avoid">
              <motion.figure
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="rounded-3xl border hairline bg-white p-8 shadow-sm transition-shadow duration-500 hover:shadow-xl hover:shadow-ink/[0.07]"
              >
                <Icon name="quote" size={26} className="text-gold/40" />
                <blockquote className="mt-4 leading-relaxed text-ink-soft">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-4 border-t hairline pt-6">
                  <Monogram name={t.name} />
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="mt-0.5 text-xs text-ink-mute">{t.location}</p>
                  </div>
                  <div className="ml-auto">
                    <Stars count={t.rating} />
                  </div>
                </figcaption>
              </motion.figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
