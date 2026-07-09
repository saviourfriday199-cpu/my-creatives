"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Topic, Dependency } from "@/lib/types";
import { buildGraph } from "@/lib/graph";
import { isDue } from "@/lib/sr";
import { useProgress } from "@/lib/progress";
import { ProgressBar, StatusPill, TypeTag, LockIcon, type TopicStatus } from "@/components/ui";

interface ModuleGroup {
  module: string;
  weekRange: string;
  topics: Topic[];
}

export default function TopicMap({
  courseId,
  topics,
  dependencies,
}: {
  courseId: string;
  topics: Topic[];
  dependencies: Dependency[];
}) {
  const { masteredIds, cards, hydrated } = useProgress();
  const graph = useMemo(
    () => buildGraph(topics, dependencies),
    [topics, dependencies],
  );

  const groups = useMemo<ModuleGroup[]>(() => {
    const order: string[] = [];
    const map = new Map<string, Topic[]>();
    for (const t of topics) {
      if (!map.has(t.module)) {
        map.set(t.module, []);
        order.push(t.module);
      }
      map.get(t.module)!.push(t);
    }
    return order.map((module) => {
      const list = map.get(module)!;
      const weeks = list.map((t) => t.week);
      const lo = Math.min(...weeks);
      const hi = Math.max(...weeks);
      return {
        module,
        weekRange: lo === hi ? `Week ${lo}` : `Weeks ${lo}–${hi}`,
        topics: list,
      };
    });
  }, [topics]);

  function statusFor(topic: Topic): TopicStatus {
    if (!graph.isUnlocked(topic.id, masteredIds)) return "locked";
    if (masteredIds.has(topic.id)) {
      const card = cards[topic.id];
      return card && isDue(card) ? "due" : "mastered";
    }
    return "available";
  }

  const masteredCount = topics.filter((t) => masteredIds.has(t.id)).length;
  const pct = topics.length ? masteredCount / topics.length : 0;

  return (
    <div>
      <div className="mb-8 rounded-xl border border-line bg-panel/60 p-5">
        <div className="mb-2 flex items-center justify-between font-mono text-[12px] text-muted">
          <span>Course progress</span>
          <span className="text-gold">
            {masteredCount}/{topics.length} mastered
          </span>
        </div>
        <ProgressBar value={hydrated ? pct : 0} />
      </div>

      <div className="space-y-10">
        {groups.map((g) => (
          <section key={g.module}>
            <div className="mb-4 flex items-baseline gap-3">
              <h2 className="font-display text-[18px] font-semibold tracking-[-0.01em]">
                {g.module}
              </h2>
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                {g.weekRange}
              </span>
            </div>
            <ul className="space-y-2">
              {g.topics.map((t) => {
                const status = statusFor(t);
                const locked = status === "locked";
                const missing = graph.missingHard(t.id, masteredIds);
                const softWarn = graph.softWarnings(t.id, masteredIds);
                const weight = graph.downstreamDependentCount(t.id);

                const inner = (
                  <div
                    className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                      locked
                        ? "border-line/60 bg-panel/30"
                        : "border-line bg-panel hover:border-gold/50"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        locked ? "text-locked" : "text-gold"
                      }`}
                    >
                      {locked ? (
                        <LockIcon />
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-full bg-current" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span
                          className={`font-display text-[15px] font-medium ${
                            locked ? "text-muted" : "text-text"
                          }`}
                        >
                          {t.title}
                        </span>
                        <TypeTag type={t.type} />
                        {weight > 0 && (
                          <span
                            className="font-mono text-[10px] tracking-[0.05em] text-muted"
                            title="Topics that depend on this one"
                          >
                            {weight} downstream
                          </span>
                        )}
                      </div>
                      <p className="mb-2 line-clamp-2 text-[13px] leading-[1.5] text-muted">
                        {t.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <StatusPill status={status} />
                        {locked && missing.length > 0 && (
                          <span className="font-mono text-[11px] text-muted">
                            Needs:{" "}
                            {missing
                              .map((d) => graph.get(d.from)?.title ?? d.from)
                              .join(", ")}
                          </span>
                        )}
                        {!locked && softWarn.length > 0 && (
                          <span className="font-mono text-[11px] text-ice/80">
                            Recommended first:{" "}
                            {softWarn
                              .map((d) => graph.get(d.from)?.title ?? d.from)
                              .join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );

                return (
                  <li key={t.id}>
                    {locked ? (
                      <div aria-disabled className="cursor-not-allowed">
                        {inner}
                      </div>
                    ) : (
                      <Link href={`/courses/${courseId}/${t.id}`}>{inner}</Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
