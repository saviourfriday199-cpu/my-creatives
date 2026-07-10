import type { NextRequest } from "next/server";
import { json, route, error } from "@/lib/http";
import {
  requireRole,
  requireUser,
  assertUniversityScope,
} from "@/lib/auth/current-user";
import { createCourseSchema } from "@/lib/validators";
import {
  listCourses,
  createCourse,
  getDepartmentUniversityId,
} from "@/lib/curriculum/service";

type Ctx = { params: Promise<{ id: string }> };

/** List courses in a department (any authenticated user). */
export const GET = route(async (_req: NextRequest, ctx: Ctx) => {
  await requireUser();
  const { id } = await ctx.params;
  if (!(await getDepartmentUniversityId(id)))
    return error("Department not found", 404);
  return json({ courses: await listCourses(id) });
});

/** Create a course. Lecturer+ within the department's university. */
export const POST = route(async (req: NextRequest, ctx: Ctx) => {
  const user = await requireRole("lecturer");
  const { id } = await ctx.params;
  const universityId = await getDepartmentUniversityId(id);
  if (!universityId) return error("Department not found", 404);
  assertUniversityScope(user, universityId);
  const input = createCourseSchema.parse(await req.json());
  const course = await createCourse(id, input, user.id);
  return json({ course }, 201);
});
