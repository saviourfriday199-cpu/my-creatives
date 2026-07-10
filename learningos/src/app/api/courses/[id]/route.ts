import type { NextRequest } from "next/server";
import { json, route, error } from "@/lib/http";
import { requireUser } from "@/lib/auth/current-user";
import { getCourseScope, loadGraph } from "@/lib/curriculum/service";

type Ctx = { params: Promise<{ id: string }> };

/** Course detail with its concepts and prerequisite edges (authenticated). */
export const GET = route(async (_req: NextRequest, ctx: Ctx) => {
  await requireUser();
  const { id } = await ctx.params;
  const scope = await getCourseScope(id);
  if (!scope) return error("Course not found", 404);
  const graph = await loadGraph(id);
  return json({
    course: scope.course,
    concepts: graph.concepts,
    edges: graph.edges,
  });
});
