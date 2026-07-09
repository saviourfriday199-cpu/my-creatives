import SiteHeader from "@/components/SiteHeader";
import Dashboard from "@/components/Dashboard";
import { getCourses, getCourseDataset } from "@/lib/courses";
import type { DashboardCourse } from "@/components/Dashboard";

export const metadata = {
  title: "Dashboard — Threadline",
  description: "Your progress across every course, review consistency and streak.",
};

export default function DashboardPage() {
  const courses: DashboardCourse[] = getCourses().map((c) => {
    const ds = getCourseDataset(c.id);
    return {
      id: c.id,
      code: c.code,
      title: c.title,
      institution: c.institution,
      topicIds: ds ? ds.topics.map((t) => t.id) : [],
    };
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-[clamp(16px,4vw,40px)] py-10">
        <div className="mb-8">
          <p className="mb-2 font-mono text-[12px] uppercase tracking-[0.14em] text-ice">
            Dashboard
          </p>
          <h1 className="font-display text-[clamp(26px,4vw,38px)] font-semibold leading-[1.1] tracking-[-0.02em]">
            Where you stand.
          </h1>
        </div>
        <Dashboard courses={courses} />
      </main>
    </div>
  );
}
