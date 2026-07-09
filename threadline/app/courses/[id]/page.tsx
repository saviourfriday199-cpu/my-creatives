import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import TopicMap from "@/components/TopicMap";
import { getCourseDataset, getCourses } from "@/lib/courses";

export function generateStaticParams() {
  return getCourses().map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ds = getCourseDataset(id);
  if (!ds) return {};
  return {
    title: `${ds.course.code} · ${ds.course.title} — Threadline`,
    description: ds.course.description,
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ds = getCourseDataset(id);
  if (!ds) notFound();
  const { course, topics, dependencies } = ds;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-[clamp(16px,4vw,40px)] py-10">
        <Link
          href="/courses"
          className="mb-6 inline-block font-mono text-[12px] text-muted transition-colors hover:text-gold"
        >
          ← All courses
        </Link>
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 font-mono text-[12px] uppercase tracking-[0.1em] text-ice">
            {course.code} · {course.institution} · Level {course.level}
          </p>
          <h1 className="mb-3 font-display text-[clamp(26px,4vw,38px)] font-semibold leading-[1.1] tracking-[-0.02em]">
            {course.title}
          </h1>
          <p className="text-[15px] leading-[1.6] text-muted">
            {course.description}
          </p>
        </div>
        <TopicMap
          courseId={course.id}
          topics={topics}
          dependencies={dependencies}
        />
      </main>
    </div>
  );
}
