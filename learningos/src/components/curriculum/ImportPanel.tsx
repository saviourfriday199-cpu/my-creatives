"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProposedConcept {
  key: string;
  title: string;
  description?: string;
  module?: string;
  difficulty?: number;
  bloomLevel?: string;
  learningObjective?: string;
}
interface ProposedEdge {
  fromKey: string;
  toKey: string;
  strength: string;
  reason?: string;
}
interface Run {
  id: string;
  status: string;
  model: string;
  error?: string | null;
  proposal: string;
}

/**
 * Lecturer-in-control content ingestion: paste course material, the AI Content
 * Engine drafts concepts + prerequisites, the lecturer reviews and applies or
 * discards. Nothing is written to the graph until "Apply" is clicked.
 */
export default function ImportPanel({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [applied, setApplied] = useState<string | null>(null);

  const proposal =
    run && run.status === "proposed"
      ? (JSON.parse(run.proposal) as {
          concepts: ProposedConcept[];
          edges: ProposedEdge[];
        })
      : null;
  const titleByKey = new Map(
    proposal?.concepts.map((c) => [c.key, c.title]) ?? [],
  );

  async function generate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setApplied(null);
    setBusy(true);
    const form = e.currentTarget;
    const sourceText = (new FormData(form).get("sourceText") as string) ?? "";
    const res = await fetch(`/api/courses/${courseId}/extractions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceText }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not run extraction.");
      return;
    }
    setRun(data.run);
    if (data.run.status === "error") {
      setError(data.run.error ?? "Extraction failed.");
    }
  }

  async function act(kind: "apply" | "discard") {
    if (!run) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/extractions/${run.id}/${kind}`, {
      method: "POST",
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Action failed.");
      return;
    }
    if (kind === "apply") {
      const r = data.result;
      setApplied(
        `Added ${r.conceptsCreated} concept${r.conceptsCreated === 1 ? "" : "s"} and ${r.edgesCreated} prerequisite${r.edgesCreated === 1 ? "" : "s"}${
          r.edgesSkipped ? ` (${r.edgesSkipped} link${r.edgesSkipped === 1 ? "" : "s"} skipped to keep the graph acyclic)` : ""
        }.`,
      );
      router.refresh();
    }
    setRun(null);
  }

  return (
    <div className="card">
      <h3 className="mb-1 font-display text-[15px] font-semibold">
        Import &amp; auto-draft
      </h3>
      <p className="mb-4 text-[13px] leading-[1.5] text-muted">
        Paste a course outline, syllabus, or lecture notes. The content engine
        drafts concepts and prerequisites for you to review — nothing is added
        until you apply it.
      </p>

      {!proposal && (
        <form onSubmit={generate}>
          <div className="field">
            <label htmlFor="src">Course material</label>
            <textarea
              id="src"
              name="sourceText"
              required
              minLength={20}
              rows={6}
              placeholder={"Module 1: Foundations\n- Energy and ATP\n- Redox reactions\nModule 2: Glycolysis\n- Glucose as fuel\n- The ten-step overview"}
              className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-[13px] text-text placeholder:text-locked focus:border-gold focus:outline-none"
            />
          </div>
          {error && <p className="mb-3 text-[13px] text-danger" role="alert">{error}</p>}
          {applied && <p className="mb-3 text-[13px] text-ice" role="status">{applied}</p>}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Drafting…" : "Generate draft"}
          </button>
        </form>
      )}

      {proposal && (
        <div>
          <div className="mb-3 flex items-center justify-between font-mono text-[11px] text-muted">
            <span>
              {proposal.concepts.length} concept
              {proposal.concepts.length === 1 ? "" : "s"} ·{" "}
              {proposal.edges.length} prerequisite
              {proposal.edges.length === 1 ? "" : "s"} proposed
            </span>
            <span className="text-locked">via {run?.model}</span>
          </div>

          <ul className="mb-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {proposal.concepts.map((c) => (
              <li
                key={c.key}
                className="rounded-md border border-line/60 px-3 py-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-medium">{c.title}</span>
                  {c.module && (
                    <span className="font-mono text-[10px] text-muted">
                      {c.module}
                    </span>
                  )}
                  {c.bloomLevel && (
                    <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase text-ice">
                      {c.bloomLevel}
                    </span>
                  )}
                  {c.difficulty != null && (
                    <span className="font-mono text-[10px] text-muted">
                      diff {c.difficulty}/5
                    </span>
                  )}
                </div>
                {c.learningObjective && (
                  <p className="mt-0.5 text-[12px] text-muted">
                    {c.learningObjective}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {proposal.edges.length > 0 && (
            <details className="mb-4">
              <summary className="cursor-pointer font-mono text-[11px] text-muted">
                Prerequisite links
              </summary>
              <ul className="mt-2 space-y-1">
                {proposal.edges.map((e, i) => (
                  <li key={i} className="font-mono text-[11px] text-muted">
                    {titleByKey.get(e.fromKey) ?? e.fromKey} →{" "}
                    {titleByKey.get(e.toKey) ?? e.toKey}
                    {e.strength === "soft" ? " (soft)" : ""}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {error && <p className="mb-3 text-[13px] text-danger" role="alert">{error}</p>}

          <div className="flex gap-2">
            <button
              className="btn btn-primary"
              disabled={busy}
              onClick={() => act("apply")}
            >
              {busy ? "Applying…" : "Apply to course"}
            </button>
            <button
              className="btn btn-ghost"
              disabled={busy}
              onClick={() => act("discard")}
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
