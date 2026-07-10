"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateCourseForm({
  departmentId,
}: {
  departmentId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const res = await fetch(`/api/departments/${departmentId}/courses`, {
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
    setError(data.error ?? "Could not create course.");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <div className="field mb-0 w-28">
        <label htmlFor={`c-code-${departmentId}`}>Code</label>
        <input id={`c-code-${departmentId}`} name="code" required placeholder="BIO 301" />
      </div>
      <div className="field mb-0 flex-1">
        <label htmlFor={`c-title-${departmentId}`}>Course title</label>
        <input id={`c-title-${departmentId}`} name="title" required minLength={2} placeholder="Cellular Respiration" />
      </div>
      <div className="field mb-0 w-20">
        <label htmlFor={`c-level-${departmentId}`}>Level</label>
        <input id={`c-level-${departmentId}`} name="level" placeholder="300" />
      </div>
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Saving…" : "Add course"}
      </button>
      {error && <p className="w-full text-[13px] text-danger" role="alert">{error}</p>}
    </form>
  );
}
