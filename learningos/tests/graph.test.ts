import { describe, it, expect } from "vitest";
import { ConceptGraph, wouldCreateCycle } from "@/lib/graph/graph";
import type { Concept, ConceptEdge } from "@/db/schema";

function concept(id: string): Concept {
  return {
    id,
    courseId: "c",
    title: id,
    description: null,
    module: null,
    position: 0,
    difficulty: null,
    bloomLevel: null,
    learningObjective: null,
    status: "draft",
    createdById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function edge(from: string, to: string, strength: "hard" | "soft" = "hard"): ConceptEdge {
  return {
    id: `${from}->${to}`,
    courseId: "c",
    fromConceptId: from,
    toConceptId: to,
    strength,
    reason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("ConceptGraph", () => {
  // a -> b -> c, a -> d (soft)
  const concepts = ["a", "b", "c", "d"].map(concept);
  const edges = [edge("a", "b"), edge("b", "c"), edge("a", "d", "soft")];
  const g = new ConceptGraph(concepts, edges);

  it("computes transitive downstream reach", () => {
    expect(g.downstreamCount("a")).toBe(3); // b, c, d
    expect(g.downstreamCount("b")).toBe(1); // c
    expect(g.downstreamCount("c")).toBe(0);
  });

  it("unlocks only when hard prerequisites are mastered", () => {
    expect(g.isUnlocked("a", new Set())).toBe(true); // no prereqs
    expect(g.isUnlocked("b", new Set())).toBe(false);
    expect(g.isUnlocked("b", new Set(["a"]))).toBe(true);
    // d's only prerequisite is soft, so it never blocks
    expect(g.isUnlocked("d", new Set())).toBe(true);
  });
});

describe("wouldCreateCycle", () => {
  const edges = [
    { fromConceptId: "a", toConceptId: "b" },
    { fromConceptId: "b", toConceptId: "c" },
  ];

  it("detects a direct back-edge", () => {
    expect(wouldCreateCycle(edges, "c", "a")).toBe(true);
  });
  it("detects a self-edge", () => {
    expect(wouldCreateCycle(edges, "a", "a")).toBe(true);
  });
  it("allows an edge that keeps the DAG", () => {
    expect(wouldCreateCycle(edges, "a", "c")).toBe(false);
    expect(wouldCreateCycle(edges, "c", "d")).toBe(false);
  });
});
