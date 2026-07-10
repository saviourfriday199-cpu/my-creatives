import type { NextRequest } from "next/server";
import { json, route, error } from "@/lib/http";
import {
  requireRole,
  requireUser,
  assertUniversityScope,
} from "@/lib/auth/current-user";
import { createEdgeSchema } from "@/lib/validators";
import { listEdges, createEdge, getCourseScope } from "@/lib/curriculum/service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req: NextRequest, ctx: Ctx) => {
  await requireUser();
  const { id } = await ctx.params;
  if (!(await getCourseScope(id))) return error("Course not found", 404);
  return json({ edges: await listEdges(id) });
});

/** Wire a prerequisite between two concepts. Lecturer+ within scope. DAG-checked. */
export const POST = route(async (req: NextRequest, ctx: Ctx) => {
  const user = await requireRole("lecturer");
  const { id } = await ctx.params;
  const scope = await getCourseScope(id);
  if (!scope) return error("Course not found", 404);
  assertUniversityScope(user, scope.universityId);
  const input = createEdgeSchema.parse(await req.json());
  const edge = await createEdge(id, input);
  return json({ edge }, 201);
});
