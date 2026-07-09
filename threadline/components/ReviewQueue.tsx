"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CourseDataset } from "@/lib/types";
import { buildGraph } from "@/lib/graph";
import { isDue, overdueDays, reviewPriority, type Grade } from "@/lib/sr";
import { useProgress } from "@/lib/progress";

interface QueueItem {
  courseId: string;
  courseCode: string;
  topicId: string;
  title: string;
  module: string;
  overdue: number;
  weight: number; // normalised 0-1
  downstream: number;
  priority: number;
}

const QUICK_GRADES: { grade: Grade; label: string }[] = [
  { grade: 1, label: "Blank" },
  { grade: 2, label: "Shaky" },
  { grade: 3, label: "Solid" },
  { grade: 4, label: "Easy" },
];

export default function ReviewQueue({
  datasets,
}: {
  datasets: CourseDataset[];
}) {
  const { cards, recordReview, hydrated } = useProgress();
  const [flash, setFlash] = useState<Record<string, string>>({});

  const graphs = useMemo(
    () =>
      new Map(
        datasets.map((d) => [d.course.id, buildGraph(d.topics, d.dependencies)]),
      ),
    [datasets],
  );
  const weightMaps = useMemo(
    () => new Map([...graphs].map(([id, g]) => [id, g.graphWeights()])),
    [graphs],
  );

  const queue = useMemo<QueueItem[]>(() => {
    const items: QueueItem[] = [];
    const now = new Date();
    for (const d of datasets) {
      const g = graphs.get(d.course.id)!;
      const weights = weightMaps.get(d.course.id)!;
      for (const t of d.topics) {
        const card = cards[t.id];
        if (!card || !isDue(card, now)) continue;
        const weight = weights.get(t.id) ?? 0;
        items.push({
          courseId: d.course.id,
          courseCode: d.course.code,
          topicId: t.id,
          title: t.title,
          module: t.module,
          overdue: overdueDays(card, now),
          weight,
          downstream: g.downstreamDependentCount(t.id),
          priority: reviewPriority(card, weight, now),
        });
      }
    }
    return items.sort((a, b) => b.priority - a.priority);
  }, [datasets, graphs, weightMaps, cards]);

  function quickRate(item: QueueItem, grade: Grade) {
    recordReview(item.topicId, item.courseId, grade);
    setFlash((f) => ({
      ...f,
      [item.topicId]: grade >= 3 ? "Rescheduled ✓" : "Back soon ↺",
    }));
  }

  if (!hydrated) {
    return (
      <p className="py-16 text-center font-mono text-[13px] text-muted">
        Loading your review state…
      </p>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-panel/60 p-10 text-center">
        <p className="mb-2 font-display text-[18px] font-semibold">
          Nothing due right now.
        </p>
        <p className="mb-5 text-[14px] text-muted">
          Study some topics and rate your recall — they&apos;ll reappear here on
          schedule.
        </p>
        <Link
          href="/courses"
          className="inline-block rounded-lg bg-gold px-5 py-2.5 text-[14px] font-semibold text-[#14100A]"
        >
          Browse courses
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 font-mono text-[12px] text-muted">
        {queue.length} topic{queue.length === 1 ? "" : "s"} due
      </p>
      <ul className="space-y-3">
        {queue.map((item, i) => (
          <li
            key={item.topicId}
            className="rounded-xl border border-line bg-panel p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2 font-mono text-[11px] tracking-[0.05em] text-muted">
                  <span className="text-ice">#{i + 1}</span>
                  <span>{item.courseCode}</span>
                  <span>·</span>
                  <span>{item.module}</span>
                </div>
                <Link
                  href={`/courses/${item.courseId}/${item.topicId}`}
                  className="font-display text-[16px] font-medium hover:text-gold"
                >
                  {item.title}
                </Link>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
                  <span className={item.overdue > 0 ? "text-gold" : ""}>
                    {item.overdue > 0
                      ? `${item.overdue}d overdue`
                      : "due today"}
                  </span>
                  <span title="Topics that depend on this one">
                    {item.downstream} downstream
                  </span>
                  <span title="Graph-weighted priority score">
                    priority {item.priority.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex gap-1">
                  {QUICK_GRADES.map((g) => (
                    <button
                      key={g.grade}
                      onClick={() => quickRate(item, g.grade)}
                      title={g.label}
                      className="h-8 w-8 rounded-md border border-line font-display text-[13px] font-semibold text-gold transition-colors hover:border-gold hover:bg-gold/10"
                    >
                      {g.grade}
                    </button>
                  ))}
                </div>
                {flash[item.topicId] && (
                  <span className="font-mono text-[11px] text-ice">
                    {flash[item.topicId]}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
