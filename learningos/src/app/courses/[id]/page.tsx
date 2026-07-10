import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser, hasAtLeast } from "@/lib/auth/current-user";
import { getCourseScope, loadGraph } from "@/lib/curriculum/service";
import AddConceptForm from "@/components/curriculum/AddConceptForm";
import AddEdgeForm from "@/components/curriculum/AddEdgeForm";
import ImportPanel from "@/components/curriculum/ImportPanel";
import type { Concept } from "@/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const scope = await getCourseScope(id);
  return { title: scope ? `${scope.course.code} — LearningOS` : "Course" };
}

export default async function CoursePage({ params }: Params) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const scope = await getCourseScope(id);
  if (!scope) notFound();

  const { course } = scope;
  const graph = await loadGraph(id);
  const canEdit =
    hasAtLeast(user.role, "lecturer") &&
    (user.role === "super_admin" || user.universityId === scope.universityId);

  // Group concepts by module, preserving insertion/position order.
  const groups: { module: string; items: Concept[] }[] = [];
  const index = new Map<string, number>();
  for (const c of graph.concepts) {
    const key = c.module ?? "Ungrouped";
    if (!index.has(key)) {
      index.set(key, groups.length);
      groups.push({ module: key, items: [] });
    }
    groups[index.get(key)!].items.push(c);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-[clamp(16px,4vw,40px)] py-10">
        <p className="mb-1 font-mono text-[12px] uppercase tracking-[0.14em] text-ice">
          {course.code}
          {course.level ? ` · Level ${course.level}` : ""} ·{" "}
          {course.status}
        </p>
        <h1 className="mb-2 font-display text-[clamp(24px,4vw,34px)] font-semibold tracking-[-0.02em]">
          {course.title}
        </h1>
        {course.description && (
          <p className="mb-6 max-w-[640px] text-[15px] leading-[1.6] text-muted">
            {course.description}
          </p>
        )}
        <p className="mb-8 font-mono text-[12px] text-muted">
          {graph.concepts.length} concept
          {graph.concepts.length === 1 ? "" : "s"} · {graph.edges.length}{" "}
          prerequisite link{graph.edges.length === 1 ? "" : "s"}
        </p>

        {graph.concepts.length === 0 ? (
          <p className="card mb-8 text-[14px] text-muted">
            No concepts yet.
            {canEdit
              ? " Add the first one below."
              : " A lecturer hasn't added any yet."}
          </p>
        ) : (
          <div className="mb-10 space-y-8">
            {groups.map((g) => (
              <section key={g.module}>
                <h2 className="mb-3 font-display text-[16px] font-semibold">
                  {g.module}
                </h2>
                <ul className="space-y-2">
                  {g.items.map((c) => {
                    const prereqs = graph.prerequisites(c.id);
                    const downstream = graph.downstreamCount(c.id);
                    return (
                      <li key={c.id} className="card">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Link
                            href={`/courses/${id}/concepts/${c.id}`}
                            className="font-display text-[15px] font-medium hover:text-gold"
                          >
                            {c.title}
                          </Link>
                          {c.videoId && (
                            <span className="font-mono text-[10px] text-gold" title="Has a video">
                              ▶
                            </span>
                          )}
                          {c.bloomLevel && (
                            <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ice">
                              {c.bloomLevel}
                            </span>
                          )}
                          {c.difficulty != null && (
                            <span className="font-mono text-[10px] text-muted">
                              difficulty {c.difficulty}/5
                            </span>
                          )}
                          {downstream > 0 && (
                            <span className="font-mono text-[10px] text-gold">
                              {downstream} downstream
                            </span>
                          )}
                        </div>
                        {c.description && (
                          <p className="mb-1.5 text-[13px] leading-[1.5] text-muted">
                            {c.description}
                          </p>
                        )}
                        {prereqs.length > 0 && (
                          <p className="font-mono text-[11px] text-muted">
                            needs:{" "}
                            {prereqs
                              .map((e) => {
                                const from = graph.concepts.find(
                                  (x) => x.id === e.fromConceptId,
                                );
                                return `${from?.title ?? "?"}${
                                  e.strength === "soft" ? " (soft)" : ""
                                }`;
                              })
                              .join(", ")}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        {canEdit && (
          <div className="space-y-6 border-t border-line pt-8">
            <ImportPanel courseId={id} />
            <AddConceptForm courseId={id} />
            <AddEdgeForm courseId={id} concepts={graph.concepts} />
          </div>
        )}
      </main>
    </div>
  );
}
