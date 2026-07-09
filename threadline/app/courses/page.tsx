import SiteHeader from "@/components/SiteHeader";
import CatalogClient, { type CatalogCourse } from "@/components/CatalogClient";
import { getCourses, getCourseDataset } from "@/lib/courses";

export const metadata = {
  title: "Course catalog — Threadline",
  description: "Every course on the channel, decomposed into prerequisite-linked micro-topics.",
};

export default function CoursesPage() {
  const courses: CatalogCourse[] = getCourses().map((course) => {
    const ds = getCourseDataset(course.id);
    return {
      ...course,
      topicIds: ds ? ds.topics.map((t) => t.id) : [],
    };
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-[clamp(16px,4vw,40px)] py-10">
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 font-mono text-[12px] uppercase tracking-[0.14em] text-ice">
            Course catalog
          </p>
          <h1 className="mb-3 font-display text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] tracking-[-0.02em]">
            Pick a course. Follow the thread.
          </h1>
          <p className="text-[15px] leading-[1.6] text-muted">
            Each course is broken into small micro-topics wired by prerequisite.
            Your progress unlocks what comes next and schedules what needs
            reviewing.
          </p>
        </div>
        <CatalogClient courses={courses} />
      </main>
    </div>
  );
}
