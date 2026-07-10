"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BLOOM_LEVELS } from "@/db/schema";

export default function AddConceptForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries());
    // Drop empty optional fields so validation treats them as absent.
    const payload = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== ""),
    );
    const res = await fetch(`/api/courses/${courseId}/concepts`, {
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
    setError(data.error ?? "Could not add concept.");
  }

  return (
    <form onSubmit={onSubmit} className="card">
      <h3 className="mb-4 font-display text-[15px] font-semibold">Add a concept</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="field mb-0 sm:col-span-2">
          <label htmlFor="ac-title">Title</label>
          <input id="ac-title" name="title" required minLength={2} placeholder="ATP Synthesis Mechanism" />
        </div>
        <div className="field mb-0 sm:col-span-2">
          <label htmlFor="ac-desc">Description</label>
          <input id="ac-desc" name="description" placeholder="How ATP synthase converts a proton gradient into energy." />
        </div>
        <div className="field mb-0">
          <label htmlFor="ac-module">Module</label>
          <input id="ac-module" name="module" placeholder="Oxidative Phosphorylation" />
        </div>
        <div className="field mb-0">
          <label htmlFor="ac-difficulty">Difficulty (1–5)</label>
          <input id="ac-difficulty" name="difficulty" type="number" min={1} max={5} />
        </div>
        <div className="field mb-0">
          <label htmlFor="ac-bloom">Bloom level</label>
          <select id="ac-bloom" name="bloomLevel" defaultValue="">
            <option value="">—</option>
            {BLOOM_LEVELS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div className="field mb-0">
          <label htmlFor="ac-obj">Learning objective</label>
          <input id="ac-obj" name="learningObjective" placeholder="Student can explain chemiosmosis." />
        </div>
      </div>
      {error && <p className="mt-3 text-[13px] text-danger" role="alert">{error}</p>}
      <button className="btn btn-primary mt-4" disabled={busy}>
        {busy ? "Saving…" : "Add concept"}
      </button>
    </form>
  );
}
