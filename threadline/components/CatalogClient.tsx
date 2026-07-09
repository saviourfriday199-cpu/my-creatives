"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Course } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { ProgressBar } from "@/components/ui";

export interface CatalogCourse extends Course {
  topicIds: string[];
}

export default function CatalogClient({
  courses,
}: {
  courses: CatalogCourse[];
}) {
  const { masteredIds, hydrated } = useProgress();
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<string>("all");

  const subjects = useMemo(
    () =>
      Array.from(
        new Set(courses.map((c) => c.subject).filter(Boolean) as string[]),
      ).sort(),
    [courses],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (subject !== "all" && c.subject !== subject) return false;
      if (!q) return true;
      return [c.title, c.code, c.institution, c.subject, c.description]
        .filter(Boolean)
        .some((f) => (f as string).toLowerCase().includes(q));
    });
  }, [courses, query, subject]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by course, code or institution…"
          aria-label="Search courses"
          className="min-w-[240px] flex-1 rounded-lg border border-line bg-panel px-4 py-2.5 text-[14px] text-text placeholder:text-muted focus:border-gold focus:outline-none"
        />
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={subject === "all"}
            onClick={() => setSubject("all")}
            label="All"
          />
          {subjects.map((s) => (
            <FilterChip
              key={s}
              active={subject === s}
              onClick={() => setSubject(s)}
              label={s}
            />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center font-mono text-[13px] text-muted">
          No courses match “{query}”.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const mastered = c.topicIds.filter((id) =>
              masteredIds.has(id),
            ).length;
            const pct = c.topicIds.length
              ? mastered / c.topicIds.length
              : 0;
            const started = hydrated && mastered > 0;
            return (
              <Link
                key={c.id}
                href={`/courses/${c.id}`}
                className="group flex flex-col rounded-xl border border-line bg-panel p-5 transition-colors hover:border-gold/50"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-[0.08em] text-ice">
                    {c.code}
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    L{c.level}
                  </span>
                </div>
                <h2 className="mb-1.5 font-display text-[18px] font-semibold leading-[1.2] tracking-[-0.01em] group-hover:text-gold">
                  {c.title}
                </h2>
                <p className="mb-2 font-mono text-[11px] tracking-[0.04em] text-muted">
                  {c.institution}
                </p>
                <p className="mb-4 line-clamp-3 flex-1 text-[13px] leading-[1.55] text-muted">
                  {c.description}
                </p>
                <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-muted">
                  <span>{c.topic_count} topics</span>
                  {started && (
                    <span className="text-gold">
                      {mastered}/{c.topicIds.length} mastered
                    </span>
                  )}
                </div>
                {started && <ProgressBar value={pct} />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors ${
        active
          ? "border-gold text-gold"
          : "border-line text-muted hover:text-text"
      }`}
    >
      {label}
    </button>
  );
}
