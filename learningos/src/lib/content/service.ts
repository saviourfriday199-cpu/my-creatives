import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { newId } from "@/lib/ids";
import { CurriculumError, getConcept } from "@/lib/curriculum/service";
import { parseYouTubeId } from "@/lib/youtube/url";
import { getContentGenerator } from "./index";
import type { ContentKind } from "@/db/schema";

/** Attach a YouTube video to a concept (validates + normalises the URL). */
export async function setConceptVideo(
  conceptId: string,
  videoUrl: string,
): Promise<{ videoId: string }> {
  const concept = await getConcept(conceptId);
  if (!concept) throw new CurriculumError("Concept not found", "not_found");
  const videoId = parseYouTubeId(videoUrl);
  if (!videoId) {
    throw new CurriculumError("Could not read a YouTube video id", "invalid");
  }
  await db
    .update(schema.concepts)
    .set({ videoId, updatedAt: new Date() })
    .where(eq(schema.concepts.id, conceptId));
  return { videoId };
}

/**
 * Generate draft study content (summary, notes, flashcards, quiz) for a concept
 * from a transcript/notes blob. Everything is created as a draft for lecturer
 * review; students only see published items.
 */
export async function generateContent(
  conceptId: string,
  sourceText: string,
  createdById: string,
): Promise<schema.ContentItem[]> {
  const concept = await getConcept(conceptId);
  if (!concept) throw new CurriculumError("Concept not found", "not_found");

  const generator = getContentGenerator();
  const bundle = await generator.generate(sourceText, {
    conceptTitle: concept.title,
    conceptDescription: concept.description,
  });

  const rows: { kind: ContentKind; body: string }[] = [];
  if (bundle.summary.trim()) rows.push({ kind: "summary", body: bundle.summary });
  if (bundle.notes.trim()) rows.push({ kind: "notes", body: bundle.notes });
  if (bundle.flashcards.length)
    rows.push({ kind: "flashcards", body: JSON.stringify(bundle.flashcards) });
  if (bundle.quiz.length)
    rows.push({ kind: "quiz", body: JSON.stringify(bundle.quiz) });

  const created: schema.ContentItem[] = [];
  for (const r of rows) {
    const [row] = await db
      .insert(schema.contentItems)
      .values({
        id: newId(),
        conceptId,
        kind: r.kind,
        body: r.body,
        status: "draft",
        source: "ai",
        model: generator.id,
        createdById,
      })
      .returning();
    created.push(row);
  }
  return created;
}

export async function listContent(
  conceptId: string,
  opts: { publishedOnly?: boolean } = {},
): Promise<schema.ContentItem[]> {
  const where = opts.publishedOnly
    ? and(
        eq(schema.contentItems.conceptId, conceptId),
        eq(schema.contentItems.status, "published"),
      )
    : eq(schema.contentItems.conceptId, conceptId);
  return db
    .select()
    .from(schema.contentItems)
    .where(where)
    .orderBy(asc(schema.contentItems.createdAt))
    .all();
}

export async function getContentItem(
  id: string,
): Promise<schema.ContentItem | null> {
  return (
    (await db
      .select()
      .from(schema.contentItems)
      .where(eq(schema.contentItems.id, id))
      .get()) ?? null
  );
}

export async function setContentStatus(
  id: string,
  status: schema.PublishStatus,
): Promise<void> {
  await db
    .update(schema.contentItems)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.contentItems.id, id));
}

export async function deleteContent(id: string): Promise<void> {
  await db.delete(schema.contentItems).where(eq(schema.contentItems.id, id));
}

/** Resolve the university a content item belongs to (via concept → course → dept). */
export async function getContentUniversityId(
  id: string,
): Promise<{ item: schema.ContentItem; universityId: string } | null> {
  const row = await db
    .select({ item: schema.contentItems, universityId: schema.departments.universityId })
    .from(schema.contentItems)
    .innerJoin(schema.concepts, eq(schema.contentItems.conceptId, schema.concepts.id))
    .innerJoin(schema.courses, eq(schema.concepts.courseId, schema.courses.id))
    .innerJoin(schema.departments, eq(schema.courses.departmentId, schema.departments.id))
    .where(eq(schema.contentItems.id, id))
    .get();
  return row ?? null;
}
