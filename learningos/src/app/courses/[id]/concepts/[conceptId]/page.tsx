import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser, hasAtLeast } from "@/lib/auth/current-user";
import { getCourseScope, getConcept } from "@/lib/curriculum/service";
import { listContent } from "@/lib/content/service";
import LecturerStudio from "@/components/curriculum/LecturerStudio";
import type { ContentItem } from "@/db/schema";

type Params = { params: Promise<{ id: string; conceptId: string }> };

interface Flashcard { front: string; back: string }
interface QuizQ { question: string; options: string[]; answerIndex: number; explanation?: string }

export default async function ConceptPage({ params }: Params) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id, conceptId } = await params;

  const scope = await getCourseScope(id);
  if (!scope) notFound();
  const concept = await getConcept(conceptId);
  if (!concept || concept.courseId !== id) notFound();

  const isEditor =
    hasAtLeast(user.role, "lecturer") &&
    (user.role === "super_admin" || user.universityId === scope.universityId);
  const content = await listContent(conceptId, { publishedOnly: !isEditor });
  const byKind = (k: ContentItem["kind"]) => content.filter((c) => c.kind === k);

  const summary = byKind("summary")[0];
  const notes = byKind("notes")[0];
  const flashItems = byKind("flashcards");
  const quizItems = byKind("quiz");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-[clamp(16px,4vw,40px)] py-10">
        <Link
          href={`/courses/${id}`}
          className="mb-6 inline-block font-mono text-[12px] text-muted transition-colors hover:text-gold"
        >
          ← {scope.course.code} · {scope.course.title}
        </Link>

        <div className="mb-2 flex flex-wrap items-center gap-2">
          {concept.module && (
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ice">
              {concept.module}
            </span>
          )}
          {concept.bloomLevel && (
            <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase text-ice">
              {concept.bloomLevel}
            </span>
          )}
          {concept.difficulty != null && (
            <span className="font-mono text-[10px] text-muted">
              difficulty {concept.difficulty}/5
            </span>
          )}
        </div>
        <h1 className="mb-3 font-display text-[clamp(24px,4vw,34px)] font-semibold tracking-[-0.02em]">
          {concept.title}
        </h1>
        {concept.description && (
          <p className="mb-4 max-w-[640px] text-[15px] leading-[1.6] text-muted">
            {concept.description}
          </p>
        )}
        {concept.learningObjective && (
          <p className="mb-6 rounded-lg border border-line bg-panel/60 p-3 text-[13px] text-text">
            <span className="font-mono text-[11px] uppercase text-muted">
              Objective ·{" "}
            </span>
            {concept.learningObjective}
          </p>
        )}

        {concept.videoId ? (
          <div className="mb-8 aspect-video w-full overflow-hidden rounded-xl border border-line bg-black">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${concept.videoId}`}
              title={concept.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="mb-8 rounded-xl border border-line bg-panel/60 p-4 text-[13px] text-muted">
            No video linked yet.
            {isEditor ? " Link one below." : ""}
          </p>
        )}

        {/* Published/authored study content */}
        {content.length === 0 ? (
          <p className="text-[14px] text-muted">
            No study content yet.
            {isEditor ? " Generate some below." : ""}
          </p>
        ) : (
          <div className="space-y-8">
            {summary && (
              <Section title="Summary" badge={statusBadge(summary)}>
                <p className="text-[15px] leading-[1.65] text-muted">{summary.body}</p>
              </Section>
            )}
            {notes && (
              <Section title="Lecture notes" badge={statusBadge(notes)}>
                <pre className="whitespace-pre-wrap font-body text-[14px] leading-[1.6] text-muted">
                  {notes.body}
                </pre>
              </Section>
            )}
            {flashItems.map((fi) => {
              const cards = safeParse<Flashcard[]>(fi.body) ?? [];
              return (
                <Section key={fi.id} title="Flashcards" badge={statusBadge(fi)}>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {cards.map((c, i) => (
                      <li key={i} className="rounded-lg border border-line bg-panel p-3">
                        <p className="mb-1 text-[13px] font-medium">{c.front}</p>
                        <p className="text-[13px] text-muted">{c.back}</p>
                      </li>
                    ))}
                  </ul>
                </Section>
              );
            })}
            {quizItems.map((qi) => {
              const qs = safeParse<QuizQ[]>(qi.body) ?? [];
              return (
                <Section key={qi.id} title="Quiz" badge={statusBadge(qi)}>
                  <ol className="space-y-4">
                    {qs.map((q, i) => (
                      <li key={i}>
                        <p className="mb-1.5 text-[14px] font-medium">
                          {i + 1}. {q.question}
                        </p>
                        <ul className="mb-1 space-y-1">
                          {q.options.map((o, j) => (
                            <li key={j} className="text-[13px] text-muted">
                              {String.fromCharCode(65 + j)}. {o}
                            </li>
                          ))}
                        </ul>
                        <details className="text-[12px] text-locked">
                          <summary className="cursor-pointer">Answer</summary>
                          <p className="mt-1 text-ice">
                            {String.fromCharCode(65 + q.answerIndex)}
                            {q.explanation ? ` — ${q.explanation}` : ""}
                          </p>
                        </details>
                      </li>
                    ))}
                  </ol>
                </Section>
              );
            })}
          </div>
        )}

        {isEditor && (
          <LecturerStudio
            conceptId={conceptId}
            hasVideo={Boolean(concept.videoId)}
            items={content.map((c) => ({
              id: c.id,
              kind: c.kind,
              status: c.status,
              model: c.model,
            }))}
          />
        )}
      </main>
    </div>
  );
}

function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="font-display text-[16px] font-semibold text-gold">{title}</h2>
        {badge}
      </div>
      {children}
    </section>
  );
}

function statusBadge(item: ContentItem) {
  if (item.status === "published") return null;
  return (
    <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase text-locked">
      draft
    </span>
  );
}

function safeParse<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}
