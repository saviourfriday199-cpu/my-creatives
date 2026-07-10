"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Item {
  id: string;
  kind: string;
  status: string;
  model: string | null;
}

/**
 * Lecturer controls for a concept's video + AI content pipeline: link a YouTube
 * video, generate draft study content from a transcript, and publish/unpublish/
 * delete each item. Students never see this — it's editor-only.
 */
export default function LecturerStudio({
  conceptId,
  hasVideo,
  items,
}: {
  conceptId: string;
  hasVideo: boolean;
  items: Item[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function call(url: string, init: RequestInit, label: string) {
    setBusy(label);
    setError(null);
    const res = await fetch(url, init);
    setBusy(null);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Action failed.");
      return null;
    }
    router.refresh();
    return data;
  }

  async function linkVideo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNote(null);
    const url = (new FormData(e.currentTarget).get("url") as string) ?? "";
    const data = await call(
      `/api/concepts/${conceptId}/video`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      },
      "video",
    );
    if (data) setNote(`Linked video ${data.videoId}${data.metadata?.title ? ` — “${data.metadata.title}”` : ""}.`);
  }

  async function generate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNote(null);
    const form = e.currentTarget;
    const sourceText = (new FormData(form).get("sourceText") as string) ?? "";
    const data = await call(
      `/api/concepts/${conceptId}/content`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceText }),
      },
      "generate",
    );
    if (data) {
      form.reset();
      setNote(`Drafted ${data.content.length} content item${data.content.length === 1 ? "" : "s"} for review.`);
    }
  }

  return (
    <div className="space-y-6 border-t border-line pt-8">
      <form onSubmit={linkVideo} className="card">
        <h3 className="mb-3 font-display text-[15px] font-semibold">
          {hasVideo ? "Replace video" : "Link a YouTube video"}
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="field mb-0 flex-1">
            <label htmlFor="vurl">YouTube URL</label>
            <input id="vurl" name="url" required placeholder="https://youtu.be/…" />
          </div>
          <button className="btn btn-primary" disabled={busy === "video"}>
            {busy === "video" ? "Linking…" : "Link video"}
          </button>
        </div>
      </form>

      <form onSubmit={generate} className="card">
        <h3 className="mb-1 font-display text-[15px] font-semibold">
          Generate study content
        </h3>
        <p className="mb-3 text-[13px] leading-[1.5] text-muted">
          Paste the lesson transcript or your notes. The engine drafts a summary,
          lecture notes, flashcards and a quiz for you to review — students only
          see what you publish.
        </p>
        <div className="field">
          <label htmlFor="ctext">Transcript / notes</label>
          <textarea
            id="ctext"
            name="sourceText"
            required
            minLength={20}
            rows={5}
            className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-[13px] text-text placeholder:text-locked focus:border-gold focus:outline-none"
          />
        </div>
        <button className="btn btn-primary" disabled={busy === "generate"}>
          {busy === "generate" ? "Generating…" : "Generate draft content"}
        </button>
      </form>

      {items.length > 0 && (
        <div className="card">
          <h3 className="mb-3 font-display text-[15px] font-semibold">
            Content items
          </h3>
          <ul className="divide-y divide-line/60">
            {items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="flex items-center gap-2 text-[13px]">
                  <span className="font-mono uppercase text-muted">{it.kind}</span>
                  <span
                    className={`font-mono text-[11px] ${
                      it.status === "published" ? "text-gold" : "text-locked"
                    }`}
                  >
                    {it.status}
                  </span>
                </span>
                <span className="flex gap-2">
                  {it.status === "published" ? (
                    <button
                      className="font-mono text-[11px] text-muted hover:text-text"
                      onClick={() =>
                        call(`/api/content/${it.id}/unpublish`, { method: "POST" }, it.id)
                      }
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      className="font-mono text-[11px] text-gold hover:underline"
                      onClick={() =>
                        call(`/api/content/${it.id}/publish`, { method: "POST" }, it.id)
                      }
                    >
                      Publish
                    </button>
                  )}
                  <button
                    className="font-mono text-[11px] text-danger hover:underline"
                    onClick={() =>
                      call(`/api/content/${it.id}`, { method: "DELETE" }, it.id)
                    }
                  >
                    Delete
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-[13px] text-danger" role="alert">{error}</p>}
      {note && <p className="text-[13px] text-ice" role="status">{note}</p>}
    </div>
  );
}
