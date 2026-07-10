import type { NextRequest } from "next/server";
import { json, route, error } from "@/lib/http";
import {
  requireRole,
  requireUser,
  assertUniversityScope,
} from "@/lib/auth/current-user";
import { createDepartmentSchema } from "@/lib/validators";
import {
  listDepartments,
  createDepartment,
  getUniversity,
} from "@/lib/org/service";

type Ctx = { params: Promise<{ id: string }> };

/** List departments for a university (any authenticated user). */
export const GET = route(async (_req: NextRequest, ctx: Ctx) => {
  await requireUser();
  const { id } = await ctx.params;
  if (!(await getUniversity(id))) return error("University not found", 404);
  return json({ departments: await listDepartments(id) });
});

/**
 * Create a department. Requires admin+, and (unless super_admin) the admin must
 * belong to the target university.
 */
export const POST = route(async (req: NextRequest, ctx: Ctx) => {
  const user = await requireRole("admin");
  const { id } = await ctx.params;
  assertUniversityScope(user, id);
  const input = createDepartmentSchema.parse(await req.json());
  const department = await createDepartment(id, input);
  return json({ department }, 201);
});
