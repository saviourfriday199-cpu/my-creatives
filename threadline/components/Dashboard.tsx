"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { isDue } from "@/lib/sr";
import { ProgressBar } from "@/components/ui";

export interface DashboardCourse {
  id: string;
  code: string;
  title: string;
  institution: string;
  topicIds: string[];
}

export default function Dashboard({
  courses,
}: {
  courses: DashboardCourse[];
}) {
  const { masteredIds, cards, streak, reviewDays, hydrated } = useProgress();

  const totals = useMemo(() => {
    const allTopics = courses.reduce((n, c) => n + c.topicIds.length, 0);
    const mastered = courses.reduce(
      (n, c) => n + c.topicIds.filter((id) => masteredIds.has(id)).length,
      0,
    );
    const dueNow = Object.values(cards).filter((card) => isDue(card)).length;
    return { allTopics, mastered, dueNow };
  }, [courses, masteredIds, cards]);

  if (!hydrated) {
    return (
      <p className="py-16 text-center font-mono text-[13px] text-muted">
        Loading…
      </p>
    );
  }

  const started = totals.mastered > 0 || reviewDays.length > 0;

  return (
    <div>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Topics mastered" value={`${totals.mastered}/${totals.allTopics}`} />
        <Stat label="Due today" value={String(totals.dueNow)} accent={totals.dueNow > 0} />
        <Stat label="Day streak" value={String(streak)} />
        <Stat label="Days reviewed" value={String(reviewDays.length)} />
      </div>

      {!started && (
        <div className="mb-8 rounded-xl border border-line bg-panel/60 p-6 text-center">
          <p className="mb-2 text-[15px] text-muted">
            You haven&apos;t studied anything yet.
          </p>
          <Link
            href="/courses"
            className="inline-block rounded-lg bg-gold px-5 py-2.5 text-[14px] font-semibold text-[#14100A]"
          >
            Start a course
          </Link>
        </div>
      )}

      <h2 className="mb-4 font-display text-[16px] font-semibold">
        Per-course progress
      </h2>
      <div className="space-y-3">
        {courses.map((c) => {
          const mastered = c.topicIds.filter((id) =>
            masteredIds.has(id),
          ).length;
          const due = c.topicIds.filter((id) => {
            const card = cards[id];
            return card && isDue(card);
          }).length;
          const pct = c.topicIds.length ? mastered / c.topicIds.length : 0;
          return (
            <Link
              key={c.id}
              href={`/courses/${c.id}`}
              className="block rounded-xl border border-line bg-panel p-4 transition-colors hover:border-gold/50"
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] tracking-[0.06em] text-ice">
                    {c.code}
                  </span>
                  <span className="ml-2 font-display text-[15px] font-medium">
                    {c.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-muted">
                  {due > 0 && <span className="text-gold">{due} due</span>}
                  <span>
                    {mastered}/{c.topicIds.length}
                  </span>
                </div>
              </div>
              <ProgressBar value={pct} />
            </Link>
          );
        })}
      </div>

      <p className="mt-8 text-center font-mono text-[11px] text-locked">
        Progress is stored in this browser. Sign-in and cross-device sync land
        with the auth phase.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div
        className={`font-display text-[26px] font-semibold ${
          accent ? "text-gold" : "text-text"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
        {label}
      </div>
    </div>
  );
}
