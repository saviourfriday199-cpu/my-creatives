import type { NextRequest } from "next/server";
import { json, route, error } from "@/lib/http";
import {
  requireRole,
  requireUser,
  assertUniversityScope,
} from "@/lib/auth/current-user";
import { createConceptSchema } from "@/lib/validators";
import {
  listConcepts,
  createConcept,
  getCourseScope,
} from "@/lib/curriculum/service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req: NextRequest, ctx: Ctx) => {
  await requireUser();
  const { id } = await ctx.params;
  if (!(await getCourseScope(id))) return error("Course not found", 404);
  return json({ concepts: await listConcepts(id) });
});

/** Add a concept to a course. Lecturer+ within the course's university. */
export const POST = route(async (req: NextRequest, ctx: Ctx) => {
  const user = await requireRole("lecturer");
  const { id } = await ctx.params;
  const scope = await getCourseScope(id);
  if (!scope) return error("Course not found", 404);
  assertUniversityScope(user, scope.universityId);
  const input = createConceptSchema.parse(await req.json());
  const concept = await createConcept(id, input, user.id);
  return json({ concept }, 201);
});
