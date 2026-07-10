import "server-only";
import { youtubeWatchUrl } from "./url";

export interface YouTubeMetadata {
  title: string;
  author: string | null;
  thumbnailUrl: string | null;
}

/**
 * Fetch public video metadata via YouTube's oEmbed endpoint — no API key
 * required. Returns null on any failure (private video, network blocked, etc.);
 * metadata is a nice-to-have, never load-bearing.
 */
export async function fetchYouTubeMetadata(
  videoId: string,
): Promise<YouTubeMetadata | null> {
  try {
    const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      youtubeWatchUrl(videoId),
    )}&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };
    return {
      title: data.title ?? "",
      author: data.author_name ?? null,
      thumbnailUrl: data.thumbnail_url ?? null,
    };
  } catch {
    return null;
  }
}
