import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser, hasAtLeast } from "@/lib/auth/current-user";
import {
  listUniversities,
  listDepartments,
  getUniversity,
} from "@/lib/org/service";
import { listCourses } from "@/lib/curriculum/service";
import type { University } from "@/db/schema";
import CreateUniversityForm from "@/components/admin/CreateUniversityForm";
import CreateDepartmentForm from "@/components/admin/CreateDepartmentForm";
import CreateCourseForm from "@/components/curriculum/CreateCourseForm";

export const metadata = { title: "Admin — LearningOS" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasAtLeast(user.role, "admin")) redirect("/dashboard");

  const isSuper = user.role === "super_admin";
  const universities: University[] = isSuper
    ? await listUniversities()
    : user.universityId
      ? [await getUniversity(user.universityId)].filter(
          (u): u is University => u !== null,
        )
      : [];

  // Resolve the university → department → course tree up front so the JSX map
  // can stay synchronous.
  const tree = await Promise.all(
    universities.map(async (u) => ({
      university: u,
      departments: await Promise.all(
        (await listDepartments(u.id)).map(async (d) => ({
          department: d,
          courses: await listCourses(d.id),
        })),
      ),
    })),
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-[clamp(16px,4vw,40px)] py-10">
        <p className="mb-1 font-mono text-[12px] uppercase tracking-[0.14em] text-ice">
          Administration
        </p>
        <h1 className="mb-8 font-display text-[clamp(24px,4vw,34px)] font-semibold tracking-[-0.02em]">
          {isSuper ? "Universities & departments" : "Your department structure"}
        </h1>

        {isSuper && (
          <div className="mb-10 max-w-[440px]">
            <CreateUniversityForm />
          </div>
        )}

        {!isSuper && !user.universityId && (
          <p className="card text-[14px] text-muted">
            You are not assigned to a university yet. Ask a super-admin to assign
            you before creating departments.
          </p>
        )}

        <div className="space-y-8">
          {tree.map(({ university: u, departments }) => {
            return (
              <section key={u.id} className="card">
                <div className="mb-4 flex items-baseline justify-between">
                  <div>
                    <h2 className="font-display text-[18px] font-semibold">
                      {u.name}
                    </h2>
                    <p className="font-mono text-[11px] text-muted">
                      {u.slug}
                      {u.country ? ` · ${u.country}` : ""}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-muted">
                    {departments.length} department
                    {departments.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="mb-5 space-y-5">
                  {departments.map(({ department: d, courses }) => (
                    <div
                      key={d.id}
                      className="rounded-lg border border-line/60 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="font-display text-[14px] font-medium">
                          {d.name}
                        </span>
                        <span className="font-mono text-[12px] text-gold">
                          {d.code}
                        </span>
                      </div>

                      {courses.length > 0 && (
                        <ul className="mb-3 space-y-1.5">
                          {courses.map((c) => (
                            <li key={c.id}>
                              <Link
                                href={`/courses/${c.id}`}
                                className="flex items-center justify-between text-[13px] text-muted hover:text-gold"
                              >
                                <span>
                                  <span className="font-mono text-ice">
                                    {c.code}
                                  </span>{" "}
                                  {c.title}
                                </span>
                                <span className="font-mono text-[11px] text-locked">
                                  {c.status}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}

                      <CreateCourseForm departmentId={d.id} />
                    </div>
                  ))}
                </div>

                <CreateDepartmentForm universityId={u.id} />
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
