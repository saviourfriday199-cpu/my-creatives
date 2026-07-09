import type { TopicType } from "@/lib/types";

/** Small labelled progress bar used on catalog cards and the dashboard. */
export function ProgressBar({
  value,
  className = "",
}: {
  value: number; // 0-1
  className?: string;
}) {
  const pct = Math.round(value * 100);
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-locked/40 ${className}`}>
      <div
        className="h-full rounded-full bg-gold transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const TYPE_LABEL: Record<TopicType, string> = {
  conceptual: "Concept",
  procedural: "Procedure",
  representational: "Representation",
  language: "Language",
  meta: "Meta",
};

export function TypeTag({ type }: { type: TopicType }) {
  return (
    <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
      {TYPE_LABEL[type]}
    </span>
  );
}

export type TopicStatus = "mastered" | "due" | "available" | "locked";

const STATUS_STYLE: Record<TopicStatus, { dot: string; label: string; text: string }> = {
  mastered: { dot: "bg-gold shadow-[0_0_8px_var(--color-gold)]", label: "Mastered", text: "text-gold" },
  due: { dot: "bg-ice shadow-[0_0_8px_var(--color-ice)]", label: "Review due", text: "text-ice" },
  available: { dot: "bg-ice", label: "Available", text: "text-ice" },
  locked: { dot: "bg-locked", label: "Locked", text: "text-muted" },
};

export function StatusPill({ status }: { status: TopicStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.05em] ${s.text}`}>
      <span className={`h-[6px] w-[6px] rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      width="14"
      height="14"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
