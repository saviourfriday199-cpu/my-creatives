import { trustItems } from "@/lib/data";

/**
 * Slow marquee of trust indicators between hairlines.
 * Duplicated list creates the seamless loop; pauses on hover.
 */
export function TrustBar() {
  return (
    <section aria-label="What we offer" className="marquee border-y hairline bg-white/50 py-6 overflow-hidden">
      <div className="marquee-track" aria-hidden="false">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center"
          >
            {trustItems.map((item) => (
              <li
                key={`${copy}-${item}`}
                className="flex items-center gap-10 pr-10 text-[0.8125rem] font-bold tracking-[0.22em] whitespace-nowrap text-ink/55 uppercase"
              >
                {item}
                <span className="text-xs text-gold" aria-hidden="true">
                  ✦
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
