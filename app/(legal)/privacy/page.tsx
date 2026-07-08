import type { Metadata } from "next";
import { site } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How O&F Pristine Solution collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <p className="eyebrow">Legal</p>
      <h1 className="font-display mt-5 text-4xl font-medium tracking-tight sm:text-5xl">
        Privacy <span className="italic text-pine">Policy</span>
      </h1>
      <div className="mt-10 space-y-8 leading-relaxed text-ink-soft">
        <section>
          <h2 className="text-lg font-bold text-ink">Information we collect</h2>
          <p className="mt-3">
            When you book a cleaning or request a quote, we collect the details you share with
            us — your name, phone number, service address and the description of your space.
            We use this information only to schedule, deliver and follow up on your cleaning.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-ink">How we use it</h2>
          <p className="mt-3">
            Your details are used to prepare quotes, coordinate our teams and contact you about
            your bookings. We never sell your information, and we never share it with third
            parties except where required to deliver the service you requested.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-ink">Your choices</h2>
          <p className="mt-3">
            You may ask us to update or delete your information at any time by calling{" "}
            {site.phones[0]} or messaging us on WhatsApp. We&apos;ll act on your request promptly.
          </p>
        </section>
        <p className="text-sm text-ink-mute">Last updated: July 2026</p>
      </div>
    </>
  );
}
