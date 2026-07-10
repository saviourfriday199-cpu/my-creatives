"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateDepartmentForm({
  universityId,
}: {
  universityId: string;
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
    const res = await fetch(`/api/universities/${universityId}/departments`, {
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
    setError(data.error ?? "Could not create department.");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <div className="field mb-0 flex-1">
        <label htmlFor="d-name">Department name</label>
        <input id="d-name" name="name" required minLength={2} placeholder="Biological Sciences" />
      </div>
      <div className="field mb-0 w-28">
        <label htmlFor="d-code">Code</label>
        <input id="d-code" name="code" required placeholder="BIO" pattern="[A-Za-z0-9]+" />
      </div>
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Saving…" : "Add"}
      </button>
      {error && <p className="w-full text-[13px] text-danger" role="alert">{error}</p>}
    </form>
  );
}
