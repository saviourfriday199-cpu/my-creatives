"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateUniversityForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const res = await fetch("/api/universities", {
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
    setError(data.error ?? "Could not create university.");
  }

  return (
    <form onSubmit={onSubmit} className="card">
      <h3 className="mb-4 font-display text-[15px] font-semibold">
        Add a university
      </h3>
      <div className="field">
        <label htmlFor="u-name">Name</label>
        <input id="u-name" name="name" required minLength={2} placeholder="Gombe State University" />
      </div>
      <div className="field">
        <label htmlFor="u-slug">Slug</label>
        <input id="u-slug" name="slug" required placeholder="gombe-state-university" pattern="[a-z0-9]+(-[a-z0-9]+)*" />
      </div>
      <div className="field">
        <label htmlFor="u-country">Country (optional)</label>
        <input id="u-country" name="country" placeholder="Nigeria" />
      </div>
      {error && <p className="mb-3 text-[13px] text-danger" role="alert">{error}</p>}
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Saving…" : "Create university"}
      </button>
    </form>
  );
}
