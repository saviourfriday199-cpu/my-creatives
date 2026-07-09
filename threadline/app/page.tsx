import Link from "next/link";
import GraphHero from "@/components/GraphHero";
import { getPlatformStats } from "@/lib/courses";

const PILLARS = [
  {
    n: "01",
    title: "Course-specific video",
    body: "Every video is generated from the real syllabus of one course at one school, not generic content — hosted on your own channel, embedded here.",
  },
  {
    n: "02",
    title: "Prerequisite unlocking",
    body: "Topics are wired into a dependency graph. A lesson only unlocks once what it's built on has actually been mastered.",
  },
  {
    n: "03",
    title: "Spaced repetition",
    body: "Review priority is weighted by the graph itself — topics that more of the tree depends on come back around first.",
  },
];

export default function Home() {
  const stats = getPlatformStats();

  return (
    <>
      <section className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[radial-gradient(120%_100%_at_50%_0%,var(--color-bg)_0%,var(--color-bg-deep)_70%)]">
        <GraphHero />
        {/* legibility veil — keeps the copy readable over the animation */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(6,9,16,0.92)_0%,rgba(6,9,16,0.72)_32%,rgba(6,9,16,0.15)_58%,rgba(6,9,16,0)_72%)] max-[720px]:bg-[linear-gradient(180deg,rgba(6,9,16,0.55)_0%,rgba(6,9,16,0.92)_60%,rgba(6,9,16,0.96)_100%)]" />

        <nav className="relative z-10 flex items-center justify-between px-[clamp(20px,5vw,64px)] pt-7">
          <div className="font-display text-[19px] font-bold tracking-[-0.01em]">
            thread<span className="text-gold">line</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/courses"
              className="font-mono text-[12px] tracking-[0.06em] text-muted transition-colors hover:text-gold max-[520px]:hidden"
            >
              COURSES
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-line px-[14px] py-2 font-mono text-[12px] tracking-[0.06em] text-muted transition-colors hover:border-gold hover:text-gold"
            >
              SIGN IN
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mt-[clamp(40px,8vh,90px)] max-w-[640px] px-[clamp(20px,5vw,64px)]">
          <div className="mb-[18px] inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] text-ice">
            <span className="h-[6px] w-[6px] rounded-full bg-ice shadow-[0_0_8px_var(--color-ice)]" />
            {stats.courses} courses live on the channel
          </div>
          <h1 className="mb-5 font-display text-[clamp(34px,5.6vw,56px)] font-semibold leading-[1.08] tracking-[-0.02em]">
            Every topic knows
            <br />
            what it&apos;s <span className="text-gold">built on.</span>
          </h1>
          <p className="mb-8 max-w-[480px] text-[clamp(15px,1.7vw,17px)] leading-[1.6] text-muted">
            Course videos from your channel, broken into small topics and
            threaded by prerequisite — so nothing unlocks before you&apos;re
            ready for it, and spaced review makes sure nothing gets forgotten
            after.
          </p>
          <div className="mb-12 flex flex-wrap gap-[14px]">
            <Link
              href="/courses"
              className="rounded-lg bg-gold px-[22px] py-[13px] text-[14px] font-semibold text-[#14100A] transition-transform hover:-translate-y-px hover:opacity-92"
            >
              Explore courses
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-lg border border-[rgba(255,255,255,0.18)] px-[22px] py-[13px] text-[14px] font-semibold text-text transition-colors hover:border-[rgba(255,255,255,0.4)]"
            >
              How it works
            </Link>
          </div>
          <div className="flex flex-wrap gap-7 font-mono text-[12px] tracking-[0.05em] text-muted">
            <span>
              <b className="font-medium text-text">{stats.courses}</b> courses
            </span>
            <span>
              <b className="font-medium text-text">{stats.topics}</b>{" "}
              micro-topics
            </span>
            <span>
              <b className="font-medium text-text">{stats.edges}</b> prerequisite
              links
            </span>
          </div>
        </div>

        <footer className="relative z-10 px-[clamp(20px,5vw,64px)] pb-7 pt-5 font-mono text-[11px] uppercase tracking-[0.08em] text-[rgba(136,145,165,0.6)]">
          Live map of what&apos;s mastered, what&apos;s next, what&apos;s still
          locked
        </footer>
      </section>

      <section
        id="how-it-works"
        className="grid grid-cols-3 gap-10 bg-panel px-[clamp(20px,5vw,64px)] py-[72px] max-[720px]:grid-cols-1"
      >
        {PILLARS.map((p) => (
          <div key={p.n}>
            <h3 className="mb-[10px] font-display text-[16px] font-semibold text-gold">
              {p.n} — {p.title}
            </h3>
            <p className="max-w-[320px] text-[14px] leading-[1.6] text-muted">
              {p.body}
            </p>
          </div>
        ))}
      </section>
    </>
  );
}
