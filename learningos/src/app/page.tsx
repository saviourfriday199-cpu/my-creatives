import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth/current-user";

const PILLARS = [
  ["Knowledge graph", "University curricula become a living graph of concepts and prerequisites."],
  ["Lecturer content", "Import syllabi and notes; AI drafts concepts and objectives for lecturer review."],
  ["Student mastery", "Adaptive review and mastery scoring built on the graph, not on guesswork."],
];

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-[clamp(16px,4vw,40px)]">
        <section className="py-[clamp(48px,10vh,96px)]">
          <p className="mb-4 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] text-ice">
            <span className="h-[6px] w-[6px] rounded-full bg-ice shadow-[0_0_8px_var(--color-ice)]" />
            Platform foundation · Phase 2B
          </p>
          <h1 className="mb-5 max-w-[720px] font-display text-[clamp(32px,5.4vw,52px)] font-semibold leading-[1.08] tracking-[-0.02em]">
            The learning operating system for{" "}
            <span className="text-gold">university mastery.</span>
          </h1>
          <p className="mb-8 max-w-[560px] text-[clamp(15px,1.7vw,17px)] leading-[1.6] text-muted">
            LearningOS turns curricula into a living knowledge graph — so
            lecturers create less by hand and students reach mastery faster. This
            build establishes the platform foundation: identity, roles, and the
            university &amp; department backbone everything else will hang from.
          </p>
          <div className="flex flex-wrap gap-3">
            {user ? (
              <Link href="/dashboard" className="btn btn-primary">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary">
                  Create an account
                </Link>
                <Link href="/login" className="btn btn-ghost">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="grid gap-6 border-t border-line py-14 sm:grid-cols-3">
          {PILLARS.map(([title, body]) => (
            <div key={title}>
              <h3 className="mb-2 font-display text-[15px] font-semibold text-gold">
                {title}
              </h3>
              <p className="max-w-[300px] text-[14px] leading-[1.6] text-muted">
                {body}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
