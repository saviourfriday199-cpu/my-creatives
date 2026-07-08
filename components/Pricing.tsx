import { services } from "@/lib/data";
import { Icon } from "./ui/Icon";
import { MagneticButton } from "./ui/MagneticButton";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

/**
 * Rate card, set like a fine menu — service, what it covers,
 * and its range separated by a dotted leader.
 */
export function Pricing() {
  return (
    <section id="pricing" className="bg-mist/60 py-28 sm:py-36">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="Pricing"
          title={
            <>
              Transparent ranges. <span className="italic text-pine">No surprises.</span>
            </>
          }
          lede="Every engagement starts with a free quote — you'll know the exact figure before we lift a finger."
        />

        <Reveal delay={0.1} className="mx-auto mt-20 max-w-3xl">
          <div className="rounded-3xl border hairline bg-white p-8 shadow-sm sm:p-12">
            <ul className="divide-y divide-ink/[0.06]">
              {services.map((service) => (
                <li key={service.id} className="py-8 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h3 className="font-display text-xl font-medium">{service.name}</h3>
                    <span
                      aria-hidden="true"
                      className="hidden min-w-8 flex-1 border-b border-dotted border-ink/20 sm:block"
                    />
                    <p className="font-display text-xl text-pine italic">{service.priceRange}</p>
                  </div>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-mute">
                    {service.includes.join(" · ")}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex items-start gap-3 rounded-2xl bg-gold-mist p-5">
              <Icon name="sparkle" size={18} className="mt-0.5 shrink-0 text-gold" />
              <p className="text-sm leading-relaxed text-ink-soft">
                Final pricing depends on property size, condition, and service requirements.
                Request a free inspection and we&apos;ll confirm an exact quote — no obligation.
              </p>
            </div>

            <div className="mt-10 text-center">
              <MagneticButton href="#contact" variant="primary">
                Get a Free Quote
                <Icon name="arrow-right" size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
              </MagneticButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
