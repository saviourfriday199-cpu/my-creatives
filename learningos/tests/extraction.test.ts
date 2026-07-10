import { describe, it, expect, beforeEach } from "vitest";
import { createUniversity, createDepartment } from "@/lib/org/service";
import { registerUser } from "@/lib/auth/service";
import { createCourse, listConcepts, listEdges } from "@/lib/curriculum/service";
import { heuristicExtractor } from "@/lib/extraction/heuristic";
import {
  runExtraction,
  applyExtraction,
  discardExtraction,
  getExtractionRun,
} from "@/lib/extraction/service";
import { CurriculumError } from "@/lib/curriculum/service";

const OUTLINE = `Module 1: Foundations
- Energy and ATP
- Redox reactions
Module 2: Glycolysis
- Glucose as fuel
- The ten-step overview`;

let AUTHOR: string;
async function course() {
  const u = await createUniversity({ name: "U", slug: `u-${Math.random().toString(36).slice(2, 8)}` });
  const d = await createDepartment(u.id, { name: "Biology", code: "BIO" });
  return createCourse(d.id, { code: "BIO 301", title: "Cellular Respiration" }, AUTHOR);
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

describe("heuristic extractor", () => {
  it("parses modules, concepts and a sequential prerequisite chain", async () => {
    const p = await heuristicExtractor.extract(OUTLINE, {
      courseCode: "BIO 301",
      courseTitle: "Cellular Respiration",
    });
    expect(p.concepts.map((c) => c.title)).toEqual([
      "Energy and ATP",
      "Redox reactions",
      "Glucose as fuel",
      "The ten-step overview",
    ]);
    expect(p.concepts[0].module).toBe("Foundations");
    expect(p.concepts[2].module).toBe("Glycolysis");
    // One hard edge within each module (chain), not across the module boundary.
    expect(p.edges).toHaveLength(2);
    expect(p.edges.every((e) => e.strength === "hard")).toBe(true);
  });

  it("is deterministic", async () => {
    const ctx = { courseCode: "X", courseTitle: "Y" };
    const a = await heuristicExtractor.extract(OUTLINE, ctx);
    const b = await heuristicExtractor.extract(OUTLINE, ctx);
    expect(a).toEqual(b);
  });
});

describe("extraction service", () => {
  it("runs an extraction and stores a proposal for review", async () => {
    const c = await course();
    const run = await runExtraction(c.id, OUTLINE, AUTHOR);
    expect(run.status).toBe("proposed");
    expect(run.model).toBe("heuristic");
    const proposal = JSON.parse(run.proposal);
    expect(proposal.concepts).toHaveLength(4);
  });

  it("rejects extraction for a missing course", async () => {
    await expect(runExtraction("nope", OUTLINE, AUTHOR)).rejects.toMatchObject({
      code: "not_found",
    });
  });

  it("applies a proposal into the graph as concepts + edges", async () => {
    const c = await course();
    const run = await runExtraction(c.id, OUTLINE, AUTHOR);
    const result = await applyExtraction(run.id, AUTHOR);
    expect(result.conceptsCreated).toBe(4);
    expect(result.edgesCreated).toBe(2);
    expect(result.edgesSkipped).toBe(0);
    expect(await listConcepts(c.id)).toHaveLength(4);
    expect(await listEdges(c.id)).toHaveLength(2);
    expect((await getExtractionRun(run.id))?.status).toBe("applied");
  });

  it("cannot apply the same proposal twice", async () => {
    const c = await course();
    const run = await runExtraction(c.id, OUTLINE, AUTHOR);
    await applyExtraction(run.id, AUTHOR);
    await expect(applyExtraction(run.id, AUTHOR)).rejects.toBeInstanceOf(
      CurriculumError,
    );
  });

  it("discards a proposal, after which it cannot be applied", async () => {
    const c = await course();
    const run = await runExtraction(c.id, OUTLINE, AUTHOR);
    await discardExtraction(run.id);
    expect((await getExtractionRun(run.id))?.status).toBe("discarded");
    await expect(applyExtraction(run.id, AUTHOR)).rejects.toMatchObject({
      code: "conflict",
    });
    expect(await listConcepts(c.id)).toHaveLength(0);
  });
});
