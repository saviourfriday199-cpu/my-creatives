/**
 * Parse a YouTube video id from the many URL shapes lecturers paste. Pure and
 * isomorphic so it's trivially testable. Returns null when no valid 11-char id
 * is present.
 */
const ID_RE = /^[A-Za-z0-9_-]{11}$/;

export function parseYouTubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  // Bare id.
  if (ID_RE.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return ID_RE.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (v && ID_RE.test(v)) return v;
    // /embed/<id>, /shorts/<id>, /live/<id>, /v/<id>
    const m = url.pathname.match(/^\/(embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
    if (m) return m[2];
  }
  return null;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}
