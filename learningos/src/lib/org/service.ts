import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { newId } from "@/lib/ids";

export class OrgError extends Error {
  constructor(
    message: string,
    readonly code: "conflict" | "not_found" = "conflict",
  ) {
    super(message);
    this.name = "OrgError";
  }
}

/* ---------------- universities ---------------- */

export async function listUniversities(): Promise<schema.University[]> {
  return db
    .select()
    .from(schema.universities)
    .orderBy(asc(schema.universities.name))
    .all();
}

export async function getUniversity(
  id: string,
): Promise<schema.University | null> {
  return (
    (await db
      .select()
      .from(schema.universities)
      .where(eq(schema.universities.id, id))
      .get()) ?? null
  );
}

export async function createUniversity(input: {
  name: string;
  slug: string;
  country?: string;
}): Promise<schema.University> {
  const dup = await db
    .select({ id: schema.universities.id })
    .from(schema.universities)
    .where(eq(schema.universities.slug, input.slug))
    .get();
  if (dup) throw new OrgError("A university with that slug already exists");

  const [row] = await db
    .insert(schema.universities)
    .values({
      id: newId(),
      name: input.name,
      slug: input.slug,
      country: input.country ?? null,
    })
    .returning();
  return row;
}

/* ---------------- departments ---------------- */

export async function listDepartments(
  universityId: string,
): Promise<schema.Department[]> {
  return db
    .select()
    .from(schema.departments)
    .where(eq(schema.departments.universityId, universityId))
    .orderBy(asc(schema.departments.name))
    .all();
}

export async function createDepartment(
  universityId: string,
  input: { name: string; code: string },
): Promise<schema.Department> {
  const university = await getUniversity(universityId);
  if (!university) throw new OrgError("University not found", "not_found");

  const dup = await db
    .select({ id: schema.departments.id })
    .from(schema.departments)
    .where(
      and(
        eq(schema.departments.universityId, universityId),
        eq(schema.departments.code, input.code),
      ),
    )
    .get();
  if (dup) {
    throw new OrgError("A department with that code already exists here");
  }

  const [row] = await db
    .insert(schema.departments)
    .values({
      id: newId(),
      universityId,
      name: input.name,
      code: input.code,
    })
    .returning();
  return row;
}
