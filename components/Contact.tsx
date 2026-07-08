"use client";

import { useState, type FormEvent } from "react";
import { services, site } from "@/lib/data";
import { Icon } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";

const inputCls =
  "w-full rounded-none border-0 border-b border-ink/15 bg-transparent px-0 py-3.5 text-[0.9375rem] text-ink placeholder:text-ink/35 transition-colors duration-300 focus:border-pine focus:outline-none focus:ring-0";

/**
 * The form composes a WhatsApp message and opens it in the client's
 * WhatsApp — bookings land directly in the company inbox, no backend needed.
 */
export function Contact() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const message = [
      "Hello O&F Pristine Solution! I'd like to book a cleaning.",
      "",
      `Name: ${data.get("name")}`,
      `Phone: ${data.get("phone")}`,
      `Service: ${data.get("service")}`,
      data.get("message") ? `Details: ${data.get("message")}` : null,
    ]
      .filter((line) => line !== null)
      .join("\n");
    window.open(`${site.whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    setSent(true);
  }

  return (
    <section id="contact" className="border-t hairline bg-white py-28 sm:py-36">
      <div className="container-luxe">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left — heading + channels */}
          <Reveal>
            <p className="eyebrow">Contact</p>
            <h2 className="font-display mt-5 text-4xl leading-[1.08] font-medium tracking-tight text-balance sm:text-5xl">
              Let&apos;s make it <span className="italic text-pine">pristine.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-mute">
              Tell us about your space and we&apos;ll respond within 24 hours with a free,
              no-obligation quote.
            </p>

            <ul className="mt-12 space-y-6">
              {site.phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={`tel:+234${phone.slice(1)}`}
                    className="group flex items-center gap-4"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pine-mist text-pine transition-colors duration-300 group-hover:bg-pine group-hover:text-white">
                      <Icon name="phone" size={20} />
                    </span>
                    <span>
                      <span className="block text-xs font-bold tracking-[0.18em] text-ink/45 uppercase">Call us</span>
                      <span className="text-lg font-semibold tabular-nums">{phone}</span>
                    </span>
                  </a>
                </li>
              ))}
              <li>
                <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pine-mist text-pine transition-colors duration-300 group-hover:bg-pine group-hover:text-white">
                    <Icon name="instagram" size={20} />
                  </span>
                  <span>
                    <span className="block text-xs font-bold tracking-[0.18em] text-ink/45 uppercase">Instagram</span>
                    <span className="text-lg font-semibold">{site.instagram.handle}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={site.tiktok.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pine-mist text-pine transition-colors duration-300 group-hover:bg-pine group-hover:text-white">
                    <Icon name="tiktok" size={20} />
                  </span>
                  <span>
                    <span className="block text-xs font-bold tracking-[0.18em] text-ink/45 uppercase">TikTok</span>
                    <span className="text-lg font-semibold">{site.tiktok.handle}</span>
                  </span>
                </a>
              </li>
            </ul>

            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-pine px-8 py-4 text-[0.9375rem] font-semibold text-white transition-colors duration-300 hover:bg-ink"
            >
              <Icon name="whatsapp" size={20} />
              Chat with us on WhatsApp
            </a>

            {/* Map */}
            <div className="mt-12 overflow-hidden rounded-3xl border hairline">
              <iframe
                title="O&F Pristine Solution — service area, Calabar, Nigeria"
                src="https://www.google.com/maps?q=Calabar,+Cross+River,+Nigeria&output=embed"
                width="100%"
                height="260"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block grayscale transition-all duration-700 hover:grayscale-0"
              />
            </div>
          </Reveal>

          {/* Right — form */}
          <Reveal delay={0.15}>
            <form
              onSubmit={onSubmit}
              className="rounded-3xl bg-mist/70 p-8 sm:p-12"
              aria-label="Booking request form"
            >
              <h3 className="font-display text-2xl font-medium">Request a free quote</h3>
              <p className="mt-2 text-sm text-ink-mute">
                Sends straight to our WhatsApp — we reply fast.
              </p>

              <div className="mt-10 space-y-8">
                <div>
                  <label htmlFor="cf-name" className="text-xs font-bold tracking-[0.18em] text-ink/50 uppercase">
                    Your name
                  </label>
                  <input id="cf-name" name="name" required autoComplete="name" placeholder="Adaeze Okonkwo" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="cf-phone" className="text-xs font-bold tracking-[0.18em] text-ink/50 uppercase">
                    Phone / WhatsApp
                  </label>
                  <input id="cf-phone" name="phone" type="tel" required autoComplete="tel" placeholder="0803 000 0000" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="cf-service" className="text-xs font-bold tracking-[0.18em] text-ink/50 uppercase">
                    Service
                  </label>
                  <select id="cf-service" name="service" required defaultValue="" className={`${inputCls} cursor-pointer appearance-none`}>
                    <option value="" disabled>
                      Choose a service…
                    </option>
                    {services.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.priceRange})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="cf-message" className="text-xs font-bold tracking-[0.18em] text-ink/50 uppercase">
                    Tell us about your space <span className="normal-case font-medium text-ink/35">(optional)</span>
                  </label>
                  <textarea
                    id="cf-message"
                    name="message"
                    rows={3}
                    placeholder="e.g. Three-bedroom flat in State Housing, needs a deep clean before the weekend…"
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="group mt-10 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-ink px-8 py-4 text-[0.9375rem] font-semibold text-cream transition-colors duration-300 hover:bg-pine"
              >
                Send via WhatsApp
                <Icon name="arrow-right" size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              {sent && (
                <p role="status" className="mt-5 text-center text-sm font-semibold text-pine">
                  ✓ WhatsApp opened — just press send and we&apos;ll take it from there.
                </p>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
