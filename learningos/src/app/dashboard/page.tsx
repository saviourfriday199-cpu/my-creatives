import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUniversity } from "@/lib/org/service";

const ROLE_LABEL: Record<string, string> = {
  student: "Student",
  lecturer: "Lecturer",
  admin: "Administrator",
  super_admin: "Super administrator",
};

export const metadata = { title: "Dashboard — LearningOS" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const university = user.universityId
    ? await getUniversity(user.universityId)
    : null;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-[clamp(16px,4vw,40px)] py-10">
        <p className="mb-1 font-mono text-[12px] uppercase tracking-[0.14em] text-ice">
          Signed in
        </p>
        <h1 className="mb-8 font-display text-[clamp(24px,4vw,34px)] font-semibold tracking-[-0.02em]">
          Welcome, {user.name}.
        </h1>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card">
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
              Account
            </h2>
            <dl className="space-y-2 text-[14px]">
              <Row label="Name" value={user.name} />
              <Row label="Email" value={user.email} />
              <Row label="Role" value={ROLE_LABEL[user.role] ?? user.role} />
            </dl>
          </div>
          <div className="card">
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
              Institution
            </h2>
            <dl className="space-y-2 text-[14px]">
              <Row
                label="University"
                value={university?.name ?? "Not assigned"}
              />
              <Row
                label="Department"
                value={user.departmentId ? "Assigned" : "Not assigned"}
              />
            </dl>
          </div>
        </div>

        <p className="mt-8 max-w-[560px] text-[13px] leading-[1.6] text-locked">
          Courses, concepts, and the knowledge graph arrive in later phases. This
          foundation release covers identity, roles, and the university /
          department backbone.
        </p>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
