import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { newId } from "@/lib/ids";
import { wouldCreateCycle, ConceptGraph } from "@/lib/graph/graph";
import type { BloomLevel, EdgeStrength } from "@/db/schema";

export class CurriculumError extends Error {
  constructor(
    message: string,
    readonly code: "conflict" | "not_found" | "cycle" | "invalid" = "conflict",
  ) {
    super(message);
    this.name = "CurriculumError";
  }
}

/* ----------------------------- scoping ----------------------------- */

/**
 * Resolve the university a course belongs to (via its department), plus the
 * course row. Routes use the universityId with assertUniversityScope so a
 * lecturer/admin can only touch curricula in their own institution.
 */
export async function getCourseScope(
  courseId: string,
): Promise<{ course: schema.Course; universityId: string } | null> {
  const row = await db
    .select({ course: schema.courses, universityId: schema.departments.universityId })
    .from(schema.courses)
    .innerJoin(
      schema.departments,
      eq(schema.courses.departmentId, schema.departments.id),
    )
    .where(eq(schema.courses.id, courseId))
    .get();
  return row ?? null;
}

export async function getDepartmentUniversityId(
  departmentId: string,
): Promise<string | null> {
  const row = await db
    .select({ universityId: schema.departments.universityId })
    .from(schema.departments)
    .where(eq(schema.departments.id, departmentId))
    .get();
  return row?.universityId ?? null;
}

/* ----------------------------- courses ----------------------------- */

export async function listCourses(
  departmentId: string,
): Promise<schema.Course[]> {
  return db
    .select()
    .from(schema.courses)
    .where(eq(schema.courses.departmentId, departmentId))
    .orderBy(asc(schema.courses.code))
    .all();
}

export async function getCourse(id: string): Promise<schema.Course | null> {
  return (
    (await db.select().from(schema.courses).where(eq(schema.courses.id, id)).get()) ??
    null
  );
}

export async function createCourse(
  departmentId: string,
  input: { code: string; title: string; description?: string; level?: string },
  createdById: string,
): Promise<schema.Course> {
  const dept = await db
    .select({ id: schema.departments.id })
    .from(schema.departments)
    .where(eq(schema.departments.id, departmentId))
    .get();
  if (!dept) throw new CurriculumError("Department not found", "not_found");

  const dup = await db
    .select({ id: schema.courses.id })
    .from(schema.courses)
    .where(
      and(
        eq(schema.courses.departmentId, departmentId),
        eq(schema.courses.code, input.code),
      ),
    )
    .get();
  if (dup) throw new CurriculumError("A course with that code already exists here");

  const [row] = await db
    .insert(schema.courses)
    .values({
      id: newId(),
      departmentId,
      code: input.code,
      title: input.title,
      description: input.description ?? null,
      level: input.level ?? null,
      createdById,
    })
    .returning();
  return row;
}

/* ----------------------------- concepts ----------------------------- */

export async function listConcepts(
  courseId: string,
): Promise<schema.Concept[]> {
  return db
    .select()
    .from(schema.concepts)
    .where(eq(schema.concepts.courseId, courseId))
    .orderBy(asc(schema.concepts.position), asc(schema.concepts.createdAt))
    .all();
}

export async function getConcept(id: string): Promise<schema.Concept | null> {
  return (
    (await db.select().from(schema.concepts).where(eq(schema.concepts.id, id)).get()) ??
    null
  );
}

export async function createConcept(
  courseId: string,
  input: {
    title: string;
    description?: string;
    module?: string;
    position?: number;
    difficulty?: number;
    bloomLevel?: BloomLevel;
    learningObjective?: string;
  },
  createdById: string,
): Promise<schema.Concept> {
  if (!(await getCourse(courseId)))
    throw new CurriculumError("Course not found", "not_found");

  const [row] = await db
    .insert(schema.concepts)
    .values({
      id: newId(),
      courseId,
      title: input.title,
      description: input.description ?? null,
      module: input.module ?? null,
      position: input.position ?? 0,
      difficulty: input.difficulty ?? null,
      bloomLevel: input.bloomLevel ?? null,
      learningObjective: input.learningObjective ?? null,
      createdById,
    })
    .returning();
  return row;
}

/* ----------------------------- edges ----------------------------- */

export async function listEdges(
  courseId: string,
): Promise<schema.ConceptEdge[]> {
  return db
    .select()
    .from(schema.conceptEdges)
    .where(eq(schema.conceptEdges.courseId, courseId))
    .all();
}

/** Load a course's concepts + edges as a graph for logic/queries. */
export async function loadGraph(courseId: string): Promise<ConceptGraph> {
  const [concepts, edges] = await Promise.all([
    listConcepts(courseId),
    listEdges(courseId),
  ]);
  return new ConceptGraph(concepts, edges);
}

/**
 * Create a prerequisite edge from→to within a course. Enforces: both concepts
 * exist and belong to this course (no orphans / cross-course edges), no
 * self-edge, no duplicate, and no cycle (the graph must stay a DAG).
 */
export async function createEdge(
  courseId: string,
  input: {
    fromConceptId: string;
    toConceptId: string;
    strength?: EdgeStrength;
    reason?: string;
  },
): Promise<schema.ConceptEdge> {
  const { fromConceptId, toConceptId } = input;
  if (fromConceptId === toConceptId)
    throw new CurriculumError("A concept cannot depend on itself", "invalid");

  const concepts = await listConcepts(courseId);
  const ids = new Set(concepts.map((c) => c.id));
  if (!ids.has(fromConceptId) || !ids.has(toConceptId)) {
    throw new CurriculumError(
      "Both concepts must exist in this course",
      "invalid",
    );
  }

  const edges = await listEdges(courseId);
  if (
    edges.some(
      (e) => e.fromConceptId === fromConceptId && e.toConceptId === toConceptId,
    )
  ) {
    throw new CurriculumError("That prerequisite link already exists");
  }
  if (wouldCreateCycle(edges, fromConceptId, toConceptId)) {
    throw new CurriculumError(
      "That link would create a circular prerequisite",
      "cycle",
    );
  }

  const [row] = await db
    .insert(schema.conceptEdges)
    .values({
      id: newId(),
      courseId,
      fromConceptId,
      toConceptId,
      strength: input.strength ?? "hard",
      reason: input.reason ?? null,
    })
    .returning();
  return row;
}
