import { describe, it, expect, beforeEach } from "vitest";
import { createUniversity, createDepartment } from "@/lib/org/service";
import { registerUser } from "@/lib/auth/service";
import { createCourse, createConcept, getConcept } from "@/lib/curriculum/service";
import { heuristicGenerator } from "@/lib/content/heuristic";
import { contentBundleSchema } from "@/lib/content/types";
import {
  setConceptVideo,
  generateContent,
  listContent,
  setContentStatus,
  deleteContent,
} from "@/lib/content/service";
import { CurriculumError } from "@/lib/curriculum/service";

const TRANSCRIPT =
  "ATP is the energy currency of the cell. It stores energy in phosphate bonds. Hydrolysis of ATP to ADP releases that energy. Cells recharge ADP back to ATP during respiration.";

let AUTHOR: string;
async function concept() {
  const u = await createUniversity({ name: "U", slug: `u-${Math.random().toString(36).slice(2, 8)}` });
  const d = await createDepartment(u.id, { name: "Biology", code: "BIO" });
  const c = await createCourse(d.id, { code: "BIO 301", title: "Respiration" }, AUTHOR);
  return createConcept(c.id, { title: "Energy & ATP" }, AUTHOR);
}

beforeEach(async () => {
  const author = await registerUser({
    email: "lect@test.com",
    name: "Dr Author",
    password: "password1",
    role: "lecturer",
  });
  AUTHOR = author.id;
});

describe("heuristic content generator", () => {
  it("produces a schema-valid bundle from a transcript", async () => {
    const bundle = await heuristicGenerator.generate(TRANSCRIPT, {
      conceptTitle: "Energy & ATP",
    });
    expect(() => contentBundleSchema.parse(bundle)).not.toThrow();
    expect(bundle.summary.length).toBeGreaterThan(0);
    expect(bundle.flashcards.length).toBeGreaterThan(0);
    expect(bundle.quiz[0].options.length).toBeGreaterThanOrEqual(2);
    // The correct option is the referenced sentence.
    expect(bundle.quiz[0].answerIndex).toBe(0);
  });
});

describe("concept video", () => {
  it("parses and stores a YouTube id from a URL", async () => {
    const c = await concept();
    const { videoId } = await setConceptVideo(c.id, "https://youtu.be/dQw4w9WgXcQ");
    expect(videoId).toBe("dQw4w9WgXcQ");
    expect((await getConcept(c.id))?.videoId).toBe("dQw4w9WgXcQ");
  });
  it("rejects a non-YouTube URL", async () => {
    const c = await concept();
    await expect(setConceptVideo(c.id, "https://vimeo.com/1")).rejects.toMatchObject({
      code: "invalid",
    });
  });
});

describe("content service", () => {
  it("generates draft items and enforces the publish gate", async () => {
    const c = await concept();
    const items = await generateContent(c.id, TRANSCRIPT, AUTHOR);
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items.every((i) => i.status === "draft")).toBe(true);
    expect(items.every((i) => i.source === "ai")).toBe(true);

    // Students (publishedOnly) see nothing until something is published.
    expect(await listContent(c.id, { publishedOnly: true })).toHaveLength(0);

    const summary = items.find((i) => i.kind === "summary")!;
    await setContentStatus(summary.id, "published");
    const published = await listContent(c.id, { publishedOnly: true });
    expect(published).toHaveLength(1);
    expect(published[0].kind).toBe("summary");
  });

  it("deletes a content item", async () => {
    const c = await concept();
    const [first] = await generateContent(c.id, TRANSCRIPT, AUTHOR);
    await deleteContent(first.id);
    const remaining = await listContent(c.id);
    expect(remaining.find((i) => i.id === first.id)).toBeUndefined();
  });

  it("rejects generation for a missing concept", async () => {
    await expect(generateContent("nope", TRANSCRIPT, AUTHOR)).rejects.toBeInstanceOf(
      CurriculumError,
    );
  });
});
