import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import LessonView from "@/components/LessonView";
import { getCourseDataset, getCourses } from "@/lib/courses";
import { buildGraph } from "@/lib/graph";

export function generateStaticParams() {
  const params: { id: string; topicId: string }[] = [];
  for (const c of getCourses()) {
    const ds = getCourseDataset(c.id);
    ds?.topics.forEach((t) => params.push({ id: c.id, topicId: t.id }));
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; topicId: string }>;
}) {
  const { id, topicId } = await params;
  const ds = getCourseDataset(id);
  const topic = ds?.topics.find((t) => t.id === topicId);
  if (!topic) return {};
  return { title: `${topic.title} — Threadline`, description: topic.description };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; topicId: string }>;
}) {
  const { id, topicId } = await params;
  const ds = getCourseDataset(id);
  if (!ds) notFound();
  const topic = ds.topics.find((t) => t.id === topicId);
  if (!topic) notFound();

  const graph = buildGraph(ds.topics, ds.dependencies);
  const prerequisites = graph.prerequisites(topic.id).map((d) => ({
    topic: graph.get(d.from)!,
    strength: d.strength,
    reason: d.reason,
  }));
  const dependents = graph.dependents(topic.id).map((d) => graph.get(d.to)!);
  const downstreamCount = graph.downstreamDependentCount(topic.id);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-[clamp(16px,4vw,40px)] py-8">
        <Link
          href={`/courses/${id}`}
          className="mb-6 inline-block font-mono text-[12px] text-muted transition-colors hover:text-gold"
        >
          ← {ds.course.code} · {ds.course.title}
        </Link>
        <LessonView
          courseId={id}
          topic={topic}
          prerequisites={prerequisites}
          dependents={dependents}
          downstreamCount={downstreamCount}
        />
      </main>
    </div>
  );
}
