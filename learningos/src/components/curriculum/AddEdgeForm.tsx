"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Concept } from "@/db/schema";

/** Wire a prerequisite: "<from> is required before <to>". */
export default function AddEdgeForm({
  courseId,
  concepts,
}: {
  courseId: string;
  concepts: Concept[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries());
    const payload = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== ""),
    );
    const res = await fetch(`/api/courses/${courseId}/edges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (res.ok) {
      form.reset();
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Could not add prerequisite.");
  }

  if (concepts.length < 2) {
    return (
      <p className="text-[13px] text-muted">
        Add at least two concepts to wire a prerequisite.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card">
      <h3 className="mb-4 font-display text-[15px] font-semibold">
        Add a prerequisite link
      </h3>
      <div className="flex flex-wrap items-end gap-3">
        <div className="field mb-0 flex-1">
          <label htmlFor="ae-from">Prerequisite (must come first)</label>
          <select id="ae-from" name="fromConceptId" required defaultValue="">
            <option value="" disabled>
              Select a concept…
            </option>
            {concepts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field mb-0 flex-1">
          <label htmlFor="ae-to">Unlocks (depends on it)</label>
          <select id="ae-to" name="toConceptId" required defaultValue="">
            <option value="" disabled>
              Select a concept…
            </option>
            {concepts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field mb-0 w-28">
          <label htmlFor="ae-strength">Strength</label>
          <select id="ae-strength" name="strength" defaultValue="hard">
            <option value="hard">hard</option>
            <option value="soft">soft</option>
          </select>
        </div>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Link"}
        </button>
      </div>
      {error && <p className="mt-3 text-[13px] text-danger" role="alert">{error}</p>}
    </form>
  );
}
