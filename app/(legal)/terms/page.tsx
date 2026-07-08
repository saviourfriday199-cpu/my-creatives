import type { Metadata } from "next";
import { site } from "@/lib/data";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern bookings with O&F Pristine Solution.",
};

export default function TermsPage() {
  return (
    <>
      <p className="eyebrow">Legal</p>
      <h1 className="font-display mt-5 text-4xl font-medium tracking-tight sm:text-5xl">
        Terms of <span className="italic text-pine">Service</span>
      </h1>
      <div className="mt-10 space-y-8 leading-relaxed text-ink-soft">
        <section>
          <h2 className="text-lg font-bold text-ink">Quotes &amp; pricing</h2>
          <p className="mt-3">
            Published prices are ranges. Your final price is confirmed after an inspection and
            depends on property size, condition and service requirements. Work begins only after
            you approve the quote.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-ink">Bookings &amp; rescheduling</h2>
          <p className="mt-3">
            Bookings are confirmed by phone or WhatsApp. If you need to reschedule, please give
            us at least 24 hours&apos; notice so we can offer your slot to another client.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-ink">Satisfaction guarantee</h2>
          <p className="mt-3">
            If any part of our work falls short of the agreed standard, tell us within 24 hours
            and we will return to make it right at no additional cost.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-ink">Contact</h2>
          <p className="mt-3">
            Questions about these terms? Call {site.phones.join(" or ")} — we&apos;re happy to help.
          </p>
        </section>
        <p className="text-sm text-ink-mute">Last updated: July 2026</p>
      </div>
    </>
  );
}
