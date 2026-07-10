import { describe, it, expect, beforeEach } from "vitest";
import { createUniversity, createDepartment } from "@/lib/org/service";
import { registerUser } from "@/lib/auth/service";
import {
  createCourse,
  listCourses,
  createConcept,
  createEdge,
  listEdges,
  loadGraph,
  getCourseScope,
  CurriculumError,
} from "@/lib/curriculum/service";

let AUTHOR: string;
beforeEach(async () => {
  const author = await registerUser({
    email: "lecturer@test.com",
    name: "Dr Author",
    password: "password1",
    role: "lecturer",
  });
  AUTHOR = author.id;
});

async function department() {
  const u = await createUniversity({ name: "U", slug: `u-${Math.random().toString(36).slice(2, 8)}` });
  const d = await createDepartment(u.id, { name: "Biology", code: "BIO" });
  return { universityId: u.id, departmentId: d.id };
}

async function courseWithConcepts(codes: string[]) {
  const { departmentId, universityId } = await department();
  const course = await createCourse(
    departmentId,
    { code: "BIO 301", title: "Cellular Respiration" },
    AUTHOR,
  );
  const concepts: Record<string, string> = {};
  for (const label of codes) {
    const c = await createConcept(course.id, { title: label }, AUTHOR);
    concepts[label] = c.id;
  }
  return { course, concepts, universityId };
}

describe("courses", () => {
  it("creates and lists a course, resolving its university scope", async () => {
    const { departmentId, universityId } = await department();
    const course = await createCourse(
      departmentId,
      { code: "BIO 301", title: "Cellular Respiration", level: "300" },
      AUTHOR,
    );
    expect((await listCourses(departmentId)).map((c) => c.id)).toContain(course.id);
    const scope = await getCourseScope(course.id);
    expect(scope?.universityId).toBe(universityId);
  });

  it("rejects a duplicate course code within a department", async () => {
    const { departmentId } = await department();
    await createCourse(departmentId, { code: "BIO 301", title: "A" }, AUTHOR);
    await expect(
      createCourse(departmentId, { code: "BIO 301", title: "B" }, AUTHOR),
    ).rejects.toBeInstanceOf(CurriculumError);
  });

  it("rejects a course for a missing department", async () => {
    await expect(
      createCourse("nope", { code: "X 1", title: "X" }, AUTHOR),
    ).rejects.toMatchObject({ code: "not_found" });
  });
});

describe("concepts & edges", () => {
  it("creates concepts and a valid prerequisite edge", async () => {
    const { course, concepts } = await courseWithConcepts(["A", "B"]);
    const edge = await createEdge(course.id, {
      fromConceptId: concepts.A,
      toConceptId: concepts.B,
    });
    expect(edge.strength).toBe("hard");
    expect(await listEdges(course.id)).toHaveLength(1);
  });

  it("rejects a self-dependency", async () => {
    const { course, concepts } = await courseWithConcepts(["A"]);
    await expect(
      createEdge(course.id, { fromConceptId: concepts.A, toConceptId: concepts.A }),
    ).rejects.toMatchObject({ code: "invalid" });
  });

  it("rejects an edge to a concept outside the course", async () => {
    const { course, concepts } = await courseWithConcepts(["A"]);
    await expect(
      createEdge(course.id, { fromConceptId: concepts.A, toConceptId: "ghost" }),
    ).rejects.toMatchObject({ code: "invalid" });
  });

  it("rejects a duplicate edge", async () => {
    const { course, concepts } = await courseWithConcepts(["A", "B"]);
    await createEdge(course.id, { fromConceptId: concepts.A, toConceptId: concepts.B });
    await expect(
      createEdge(course.id, { fromConceptId: concepts.A, toConceptId: concepts.B }),
    ).rejects.toBeInstanceOf(CurriculumError);
  });

  it("rejects an edge that would create a cycle (keeps a DAG)", async () => {
    const { course, concepts } = await courseWithConcepts(["A", "B", "C"]);
    await createEdge(course.id, { fromConceptId: concepts.A, toConceptId: concepts.B });
    await createEdge(course.id, { fromConceptId: concepts.B, toConceptId: concepts.C });
    await expect(
      createEdge(course.id, { fromConceptId: concepts.C, toConceptId: concepts.A }),
    ).rejects.toMatchObject({ code: "cycle" });
  });

  it("exposes graph weight through loadGraph", async () => {
    const { course, concepts } = await courseWithConcepts(["A", "B", "C"]);
    await createEdge(course.id, { fromConceptId: concepts.A, toConceptId: concepts.B });
    await createEdge(course.id, { fromConceptId: concepts.B, toConceptId: concepts.C });
    const graph = await loadGraph(course.id);
    expect(graph.downstreamCount(concepts.A)).toBe(2);
  });
});
