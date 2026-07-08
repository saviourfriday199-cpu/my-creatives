import { nav, services, site } from "@/lib/data";
import { Icon } from "./ui/Icon";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-cream">
      <div className="container-luxe py-20">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <p className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold italic tracking-tight">O&F</span>
              <span className="text-[0.625rem] font-bold tracking-[0.32em] text-cream/70 uppercase">
                Pristine Solution
              </span>
            </p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/55">
              Nigeria&apos;s premium residential &amp; commercial cleaning company.
              Trained professionals. Eco-friendly products. Satisfaction guaranteed.
            </p>
            <div className="mt-7 flex gap-3">
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 text-cream/70 transition-colors duration-300 hover:border-gold hover:text-gold"
              >
                <Icon name="whatsapp" size={17} />
              </a>
              <a
                href={site.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 text-cream/70 transition-colors duration-300 hover:border-gold hover:text-gold"
              >
                <Icon name="instagram" size={17} />
              </a>
              <a
                href={site.tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 text-cream/70 transition-colors duration-300 hover:border-gold hover:text-gold"
              >
                <Icon name="tiktok" size={17} />
              </a>
            </div>
          </div>

          {/* Company */}
          <nav aria-label="Footer — company">
            <p className="text-xs font-bold tracking-[0.22em] text-cream/40 uppercase">Company</p>
            <ul className="mt-5 space-y-3 text-sm">
              {nav
                .filter((item) => item.label !== "Home")
                .map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-cream/65 transition-colors hover:text-gold-soft">
                      {item.label}
                    </a>
                  </li>
                ))}
            </ul>
          </nav>

          {/* Services */}
          <nav aria-label="Footer — services">
            <p className="text-xs font-bold tracking-[0.22em] text-cream/40 uppercase">Services</p>
            <ul className="mt-5 space-y-3 text-sm">
              {services.map((s) => (
                <li key={s.id}>
                  <a href="/#services" className="text-cream/65 transition-colors hover:text-gold-soft">
                    {s.name}
                  </a>
                </li>
              ))}
              <li>
                <a href="/#results" className="text-cream/65 transition-colors hover:text-gold-soft">
                  Before &amp; After
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-cream/40 uppercase">Contact</p>
            <ul className="mt-5 space-y-3 text-sm text-cream/65">
              {site.phones.map((phone) => (
                <li key={phone}>
                  <a href={`tel:+234${phone.slice(1)}`} className="tabular-nums transition-colors hover:text-gold-soft">
                    {phone}
                  </a>
                </li>
              ))}
              <li>{site.instagram.handle}</li>
              <li className="flex items-center gap-2">
                <Icon name="map-pin" size={14} className="text-gold/70" />
                Lagos, Nigeria
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-5 border-t border-cream/10 pt-8 text-xs text-cream/40 sm:flex-row">
          <p>© {year} O&amp;F Pristine Solution. All rights reserved.</p>
          <p className="flex gap-6">
            <a href="/privacy" className="transition-colors hover:text-gold-soft">
              Privacy Policy
            </a>
            <a href="/terms" className="transition-colors hover:text-gold-soft">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
