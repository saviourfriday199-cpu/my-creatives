import "server-only";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { newId } from "@/lib/ids";
import {
  CurriculumError,
  getCourse,
  createConcept,
  createEdge,
} from "@/lib/curriculum/service";
import { getExtractor } from "./index";
import { extractionProposalSchema, type ExtractionProposal } from "./types";

/** Run an extraction for a course and store the proposal for lecturer review. */
export async function runExtraction(
  courseId: string,
  sourceText: string,
  createdById: string,
): Promise<schema.ExtractionRun> {
  const course = await getCourse(courseId);
  if (!course) throw new CurriculumError("Course not found", "not_found");

  const extractor = getExtractor();
  let status: schema.ExtractionStatus = "proposed";
  let proposal: ExtractionProposal = { concepts: [], edges: [] };
  let error: string | null = null;

  try {
    proposal = await extractor.extract(sourceText, {
      courseCode: course.code,
      courseTitle: course.title,
    });
  } catch (e) {
    status = "error";
    error = e instanceof Error ? e.message : "Extraction failed";
  }

  const [row] = await db
    .insert(schema.extractionRuns)
    .values({
      id: newId(),
      courseId,
      sourceText,
      status,
      model: extractor.id,
      proposal: JSON.stringify(proposal),
      error,
      createdById,
    })
    .returning();
  return row;
}

export async function listExtractionRuns(
  courseId: string,
): Promise<schema.ExtractionRun[]> {
  return db
    .select()
    .from(schema.extractionRuns)
    .where(eq(schema.extractionRuns.courseId, courseId))
    .orderBy(desc(schema.extractionRuns.createdAt))
    .all();
}

export async function getExtractionRun(
  id: string,
): Promise<schema.ExtractionRun | null> {
  return (
    (await db
      .select()
      .from(schema.extractionRuns)
      .where(eq(schema.extractionRuns.id, id))
      .get()) ?? null
  );
}

export interface ApplyResult {
  conceptsCreated: number;
  edgesCreated: number;
  edgesSkipped: number;
}

/**
 * Apply a proposed extraction: create draft concepts and prerequisite edges in
 * the graph. Edges that would break the DAG (cycles), duplicate an existing
 * link, or reference an unknown concept are skipped rather than failing the
 * whole apply — the graph invariants from the curriculum service are the
 * authority. Idempotent guard: only a `proposed` run can be applied.
 */
export async function applyExtraction(
  runId: string,
  createdById: string,
): Promise<ApplyResult> {
  const run = await getExtractionRun(runId);
  if (!run) throw new CurriculumError("Extraction run not found", "not_found");
  if (run.status !== "proposed") {
    throw new CurriculumError(
      "This proposal has already been handled",
      "conflict",
    );
  }

  const proposal = extractionProposalSchema.parse(JSON.parse(run.proposal));

  // Create concepts, remembering each proposed key -> new concept id.
  const keyToId = new Map<string, string>();
  for (const c of proposal.concepts) {
    const concept = await createConcept(
      run.courseId,
      {
        title: c.title,
        description: c.description,
        module: c.module,
        difficulty: c.difficulty,
        bloomLevel: c.bloomLevel,
        learningObjective: c.learningObjective,
      },
      createdById,
    );
    keyToId.set(c.key, concept.id);
  }

  let edgesCreated = 0;
  let edgesSkipped = 0;
  for (const e of proposal.edges) {
    const from = keyToId.get(e.fromKey);
    const to = keyToId.get(e.toKey);
    if (!from || !to) {
      edgesSkipped++;
      continue;
    }
    try {
      await createEdge(run.courseId, {
        fromConceptId: from,
        toConceptId: to,
        strength: e.strength,
        reason: e.reason,
      });
      edgesCreated++;
    } catch (err) {
      // Cycle / duplicate / invalid — skip, keeping the graph a valid DAG.
      if (err instanceof CurriculumError) edgesSkipped++;
      else throw err;
    }
  }

  await db
    .update(schema.extractionRuns)
    .set({ status: "applied", updatedAt: new Date() })
    .where(eq(schema.extractionRuns.id, runId));

  return {
    conceptsCreated: proposal.concepts.length,
    edgesCreated,
    edgesSkipped,
  };
}

export async function discardExtraction(runId: string): Promise<void> {
  const run = await getExtractionRun(runId);
  if (!run) throw new CurriculumError("Extraction run not found", "not_found");
  if (run.status !== "proposed") {
    throw new CurriculumError(
      "This proposal has already been handled",
      "conflict",
    );
  }
  await db
    .update(schema.extractionRuns)
    .set({ status: "discarded", updatedAt: new Date() })
    .where(eq(schema.extractionRuns.id, runId));
}
