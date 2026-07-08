# O&F Pristine Solution — Premium Cleaning Website

A luxury digital experience for **O&F Pristine Solution**, Nigeria's premium residential
and commercial cleaning company. Editorial typography, restrained color, motion that
whispers — built to sell time, confidence and peace of mind, not just cleaning.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

## Tech stack

| Layer      | Choice                                        |
| ---------- | --------------------------------------------- |
| Framework  | Next.js 15 (App Router) + React 19            |
| Language   | TypeScript (strict)                           |
| Styling    | Tailwind CSS v4 (`@theme` design tokens)      |
| Motion     | Framer Motion 12                              |
| Typography | Fraunces (display) + Manrope (body) via `next/font` |

## Design system

- **Palette** — Deep Navy `#0F172A` (`ink`), Emerald `#0F766E` (`pine`), Luxury Gold
  `#F59E0B` (`gold`), Warm White `#FAFAF8` (`cream`), Soft Gray `#F3F4F6` (`mist`).
  Tokens live in `app/globals.css` under `@theme`.
- **No stock photography.** The visual language is fully crafted: ambient light fields,
  drifting dust motes, an architectural arch, film grain, and a bespoke SVG living-room
  illustration that powers the interactive Before/After slider.
- **Motion whispers** — masked text reveals, magnetic buttons, scroll-linked timeline,
  hero parallax. Everything respects `prefers-reduced-motion`.

## Project structure

```
app/
  layout.tsx            # Fonts, metadata, JSON-LD LocalBusiness schema
  page.tsx              # Section composition (the whole story, in order)
  globals.css           # Design tokens, grain, marquee, atmosphere keyframes
  sitemap.ts, robots.ts # SEO
  opengraph-image.tsx   # Social share card, generated at build time
  icon.svg              # Favicon (O&F monogram)
  (legal)/              # /privacy and /terms
components/
  Navbar.tsx            # Glass-on-scroll bar + fullscreen animated mobile menu
  Hero.tsx              # Atmosphere, masked headline reveal, magnetic CTAs
  TrustBar.tsx          # Seamless marquee of trust indicators
  Services.tsx          # Three service cards (Executive Housekeeping featured)
  WhyChooseUs.tsx       # Eight numbered feature cards
  Process.tsx           # Scroll-linked five-step timeline
  RoomScene.tsx         # The illustrated room, in `before` and `after` states
  BeforeAfter.tsx       # Draggable + keyboard-accessible comparison slider
  Testimonials.tsx      # Masonry of client cards with monogram avatars
  Pricing.tsx           # Rate card set like a fine menu (dotted leaders)
  FAQ.tsx               # Animated accordion
  Contact.tsx           # Channels, map, and a form that opens a pre-filled WhatsApp chat
  Footer.tsx
  ui/                   # Icon set, Reveal, MagneticButton, SectionHeading
lib/
  data.ts               # ALL content: copy, pricing, contact details, FAQs
```

## Editing content

Everything a non-developer would want to change — prices, phone numbers, testimonials,
FAQ answers, social handles — lives in **`lib/data.ts`**. Components read from it.

> Note: the TikTok display handle is `@O&Fpristinesolution` as printed on the flyer, but
> `&` isn't valid in TikTok URLs — update `site.tiktok.url` in `lib/data.ts` with the
> real profile link. Set `site.url` to the production domain before launch for correct
> canonical/OG/sitemap URLs.

## How bookings work

The contact form has no backend by design: submitting composes a structured message and
opens WhatsApp (`wa.me/2349139192450`) with it pre-filled. Bookings arrive where the
business already works.

## Engineering notes

- Semantic HTML with a skip link, labelled landmarks, `aria-expanded`/`role="slider"`
  where interaction demands it — WCAG AA color pairs throughout.
- SEO: metadata + Open Graph + Twitter cards, `LocalBusiness` JSON-LD, sitemap, robots.
- Performance: zero raster images (SVG + CSS only), self-hosted fonts with `display:swap`,
  lazy-loaded map iframe, static prerender of every route.
