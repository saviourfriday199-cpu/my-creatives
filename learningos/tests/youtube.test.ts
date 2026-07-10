import { describe, it, expect } from "vitest";
import { parseYouTubeId } from "@/lib/youtube/url";

describe("parseYouTubeId", () => {
  const id = "dQw4w9WgXcQ";
  it("reads every common URL shape", () => {
    expect(parseYouTubeId(`https://www.youtube.com/watch?v=${id}`)).toBe(id);
    expect(parseYouTubeId(`https://youtu.be/${id}`)).toBe(id);
    expect(parseYouTubeId(`https://www.youtube.com/embed/${id}`)).toBe(id);
    expect(parseYouTubeId(`https://youtube.com/shorts/${id}`)).toBe(id);
    expect(parseYouTubeId(`https://m.youtube.com/watch?v=${id}&t=30s`)).toBe(id);
    expect(parseYouTubeId(id)).toBe(id); // bare id
  });
  it("returns null for non-YouTube or malformed input", () => {
    expect(parseYouTubeId("https://vimeo.com/12345")).toBeNull();
    expect(parseYouTubeId("not a url")).toBeNull();
    expect(parseYouTubeId("https://youtu.be/short")).toBeNull();
    expect(parseYouTubeId("")).toBeNull();
  });
});
