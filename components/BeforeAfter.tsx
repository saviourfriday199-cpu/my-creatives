"use client";

import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { RoomScene } from "./RoomScene";
import { Icon } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

/**
 * Interactive comparison slider. Drag (or use arrow keys) to sweep the
 * pristine "after" room across the untidy "before" room.
 */
export function BeforeAfter() {
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const setFromClientX = useCallback((clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(96, Math.max(4, next)));
  }, []);

  function onPointerDown(e: PointerEvent) {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  }

  function onPointerMove(e: PointerEvent) {
    if (dragging.current) setFromClientX(e.clientX);
  }

  function onPointerUp() {
    dragging.current = false;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(4, p - 4));
    if (e.key === "ArrowRight") setPos((p) => Math.min(96, p + 4));
    if (e.key === "Home") setPos(4);
    if (e.key === "End") setPos(96);
  }

  return (
    <section id="results" className="bg-ink py-28 text-cream sm:py-36">
      <div className="container-luxe">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow !text-gold-soft">Before &amp; After</p>
          <h2 className="font-display mt-5 text-4xl leading-[1.08] font-medium tracking-tight text-balance sm:text-5xl">
            Drag to see the <span className="italic text-gold-soft">difference.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-cream/60">
            Same room. Same light. One visit from O&amp;F Pristine Solution.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-16">
          <div
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="relative mx-auto aspect-[16/10] max-w-4xl cursor-ew-resize touch-none overflow-hidden rounded-3xl shadow-2xl shadow-black/40 select-none"
          >
            {/* Before (base layer) */}
            <div className="absolute inset-0">
              <RoomScene variant="before" />
            </div>

            {/* After (clipped on top) */}
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
              <RoomScene variant="after" />
            </div>

            {/* Labels */}
            <span className="absolute top-5 right-5 rounded-full bg-ink/60 px-4 py-1.5 text-[0.6875rem] font-bold tracking-[0.18em] uppercase backdrop-blur-sm">
              Before
            </span>
            <span
              className="absolute top-5 left-5 rounded-full bg-pine px-4 py-1.5 text-[0.6875rem] font-bold tracking-[0.18em] uppercase transition-opacity duration-300"
              style={{ opacity: pos > 22 ? 1 : 0 }}
            >
              After
            </span>

            {/* Divider + handle */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Compare the room before and after cleaning"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pos)}
              aria-orientation="horizontal"
              onKeyDown={onKeyDown}
              className="absolute top-0 bottom-0 z-10 w-px bg-white/90"
              style={{ left: `${pos}%` }}
            >
              <span className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gold bg-cream text-ink shadow-xl">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 7l-4 5 4 5M16 7l4 5-4 5" />
                </svg>
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.25} className="mt-12 text-center">
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 text-sm font-bold tracking-wide text-gold-soft"
          >
            Ready for your own after?
            <Icon name="arrow-right" size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
