"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Topic, DependencyStrength } from "@/lib/types";
import type { Grade } from "@/lib/sr";
import { overdueDays } from "@/lib/sr";
import { useProgress } from "@/lib/progress";
import { TypeTag, LockIcon } from "@/components/ui";

interface PrereqRef {
  topic: Topic;
  strength: DependencyStrength;
  reason: string;
}

const GRADES: { grade: Grade; label: string; hint: string }[] = [
  { grade: 1, label: "Blank", hint: "Couldn't recall it" },
  { grade: 2, label: "Shaky", hint: "Got there with effort" },
  { grade: 3, label: "Solid", hint: "Recalled it well" },
  { grade: 4, label: "Effortless", hint: "Knew it cold" },
];

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LessonView({
  courseId,
  topic,
  prerequisites,
  dependents,
  downstreamCount,
}: {
  courseId: string;
  topic: Topic;
  prerequisites: PrereqRef[];
  dependents: Topic[];
  downstreamCount: number;
}) {
  const { masteredIds, cards, recordReview, hydrated } = useProgress();
  const [justRated, setJustRated] = useState<Grade | null>(null);

  const missingHard = useMemo(
    () =>
      prerequisites.filter(
        (p) => p.strength === "hard" && !masteredIds.has(p.topic.id),
      ),
    [prerequisites, masteredIds],
  );
  const softPending = useMemo(
    () =>
      prerequisites.filter(
        (p) => p.strength === "soft" && !masteredIds.has(p.topic.id),
      ),
    [prerequisites, masteredIds],
  );

  const locked = hydrated && missingHard.length > 0;
  const card = cards[topic.id];
  const hasVideo = topic.video_id && topic.video_id !== "PLACEHOLDER";

  function rate(grade: Grade) {
    recordReview(topic.id, courseId, grade);
    setJustRated(grade);
  }

  return (
    <article>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ice">
          {topic.module} · Week {topic.week}
        </span>
        <TypeTag type={topic.type} />
      </div>
      <h1 className="mb-5 font-display text-[clamp(24px,3.5vw,34px)] font-semibold leading-[1.12] tracking-[-0.02em]">
        {topic.title}
      </h1>

      {locked && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-gold/40 bg-gold/5 p-4">
          <span className="mt-0.5 text-gold">
            <LockIcon />
          </span>
          <div>
            <p className="mb-1 text-[14px] font-medium text-text">
              This topic is still locked.
            </p>
            <p className="text-[13px] leading-[1.5] text-muted">
              Master these first:{" "}
              {missingHard.map((p, i) => (
                <span key={p.topic.id}>
                  {i > 0 && ", "}
                  <Link
                    href={`/courses/${courseId}/${p.topic.id}`}
                    className="text-gold underline-offset-2 hover:underline"
                  >
                    {p.topic.title}
                  </Link>
                </span>
              ))}
              .
            </p>
          </div>
        </div>
      )}

      {/* Video */}
      <div className="mb-6 aspect-video w-full overflow-hidden rounded-xl border border-line bg-black">
        {hasVideo ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${topic.video_id}`}
            title={topic.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-panel text-center">
            <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-muted">
              Video pending · {fmtDuration(topic.video_duration_seconds)}
            </span>
            <span className="max-w-xs text-[12px] leading-[1.5] text-locked">
              Wire the real YouTube id into this topic&apos;s{" "}
              <code className="font-mono">video_id</code> to embed the lesson.
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <h2 className="mb-2 font-display text-[15px] font-semibold text-gold">
            What this covers
          </h2>
          <p className="mb-6 text-[15px] leading-[1.65] text-muted">
            {topic.description}
          </p>

          <h2 className="mb-2 font-display text-[15px] font-semibold text-gold">
            Mastery criteria
          </h2>
          <p className="mb-6 rounded-lg border border-line bg-panel/60 p-4 text-[14px] leading-[1.6] text-text">
            {topic.mastery_criteria}
          </p>

          {/* Self-assessment */}
          <div className="rounded-xl border border-line bg-panel p-5">
            <h2 className="mb-1 font-display text-[15px] font-semibold">
              How well did you understand this?
            </h2>
            <p className="mb-4 text-[13px] leading-[1.5] text-muted">
              Your honest rating schedules the next review. Weaker recall comes
              back sooner.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {GRADES.map((g) => {
                const active = justRated === g.grade;
                return (
                  <button
                    key={g.grade}
                    disabled={locked}
                    onClick={() => rate(g.grade)}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      active
                        ? "border-gold bg-gold/10"
                        : "border-line hover:border-gold/60"
                    }`}
                  >
                    <span className="font-display text-[18px] font-semibold text-gold">
                      {g.grade}
                    </span>
                    <span className="text-[12px] font-medium text-text">
                      {g.label}
                    </span>
                    <span className="text-[10px] leading-tight text-muted">
                      {g.hint}
                    </span>
                  </button>
                );
              })}
            </div>
            {justRated !== null && card && (
              <p className="mt-4 rounded-lg bg-bg-deep/60 p-3 font-mono text-[12px] text-ice">
                Saved. Next review in {card.intervalDays}{" "}
                {card.intervalDays === 1 ? "day" : "days"} ·{" "}
                {new Date(card.due).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
                .
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {card && (
            <div className="rounded-xl border border-line bg-panel/60 p-4">
              <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                Your review state
              </h3>
              <dl className="space-y-1.5 text-[13px]">
                <Row label="Status" value={card.mastered ? "Mastered" : "Learning"} />
                <Row label="Reps" value={String(card.repetitions)} />
                <Row label="Interval" value={`${card.intervalDays}d`} />
                <Row
                  label="Due"
                  value={
                    overdueDays(card) >= 0
                      ? "Now"
                      : new Date(card.due).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                  }
                />
              </dl>
            </div>
          )}

          <div className="rounded-xl border border-line bg-panel/60 p-4">
            <h3 className="mb-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
              Graph weight
            </h3>
            <p className="text-[13px] leading-[1.5] text-muted">
              <span className="font-display text-[20px] font-semibold text-gold">
                {downstreamCount}
              </span>{" "}
              topic{downstreamCount === 1 ? "" : "s"} downstream depend on this.
            </p>
          </div>

          {prerequisites.length > 0 && (
            <div>
              <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                Built on
              </h3>
              <ul className="space-y-1.5">
                {prerequisites.map((p) => (
                  <li key={p.topic.id}>
                    <Link
                      href={`/courses/${courseId}/${p.topic.id}`}
                      className="group flex items-center gap-2 text-[13px] text-muted hover:text-text"
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          masteredIds.has(p.topic.id) ? "bg-gold" : "bg-locked"
                        }`}
                      />
                      <span className="group-hover:text-gold">
                        {p.topic.title}
                      </span>
                      {p.strength === "soft" && (
                        <span className="font-mono text-[10px] text-ice/70">
                          soft
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {dependents.length > 0 && (
            <div>
              <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                Unlocks next
              </h3>
              <ul className="space-y-1.5">
                {dependents.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/courses/${courseId}/${d.id}`}
                      className="text-[13px] text-muted hover:text-gold"
                    >
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {softPending.length > 0 && (
            <p className="rounded-lg border border-ice/30 bg-ice/5 p-3 text-[12px] leading-[1.5] text-ice/90">
              Recommended (not required) to review first:{" "}
              {softPending.map((p) => p.topic.title).join(", ")}.
            </p>
          )}
        </aside>
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-mono text-text">{value}</dd>
    </div>
  );
}
