import SiteHeader from "@/components/SiteHeader";
import ReviewQueue from "@/components/ReviewQueue";
import { getCourses, getCourseDataset } from "@/lib/courses";
import type { CourseDataset } from "@/lib/types";

export const metadata = {
  title: "Review queue — Threadline",
  description: "What's due today, ranked by how overdue it is and how much of the graph depends on it.",
};

export default function ReviewPage() {
  const datasets: CourseDataset[] = getCourses()
    .map((c) => getCourseDataset(c.id))
    .filter((d): d is CourseDataset => Boolean(d));

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-[clamp(16px,4vw,40px)] py-10">
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 font-mono text-[12px] uppercase tracking-[0.14em] text-ice">
            Review queue
          </p>
          <h1 className="mb-3 font-display text-[clamp(26px,4vw,38px)] font-semibold leading-[1.1] tracking-[-0.02em]">
            Due today, most important first.
          </h1>
          <p className="text-[15px] leading-[1.6] text-muted">
            Ranked by how overdue each topic is and how much of the graph is
            built on it — forgetting a load-bearing topic resurfaces it sooner.
          </p>
        </div>
        <ReviewQueue datasets={datasets} />
      </main>
    </div>
  );
}
