import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { site } from "@/lib/data";
import "./globals.css";

/**
 * Typography: Fraunces (editorial display serif, optical sizing) paired
 * with Manrope (quietly geometric sans) — hierarchy through contrast.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "O&F Pristine Solution — Premium Cleaning Services in Nigeria",
    template: "%s — O&F Pristine Solution",
  },
  description: site.description,
  keywords: [
    "cleaning services Nigeria",
    "premium cleaning Calabar",
    "cleaning company Cross River",
    "home cleaning",
    "commercial cleaning",
    "executive housekeeping",
    "post construction cleaning",
    "move in move out cleaning",
  ],
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: "O&F Pristine Solution — Premium Cleaning That Gives You Back Your Time",
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "O&F Pristine Solution — Premium Cleaning Services in Nigeria",
    description: site.description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

/** LocalBusiness structured data for rich results. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.name,
  description: site.description,
  url: site.url,
  telephone: site.phoneIntl,
  priceRange: "₦40,000 – ₦200,000",
  address: {
    "@type": "PostalAddress",
    addressLocality: site.address.locality,
    addressRegion: site.address.region,
    addressCountry: site.address.country,
  },
  areaServed: { "@type": "Country", name: "Nigeria" },
  sameAs: [site.instagram.url, site.tiktok.url],
  makesOffer: [
    {
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: "Home Cleaning", serviceType: "House cleaning" },
    },
    {
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: "Commercial Cleaning", serviceType: "Commercial cleaning" },
    },
    {
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: "Executive Housekeeping", serviceType: "Housekeeping" },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="grain">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
