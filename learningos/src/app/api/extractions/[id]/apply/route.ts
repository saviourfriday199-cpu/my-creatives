import type { NextRequest } from "next/server";
import { json, route, error } from "@/lib/http";
import { requireRole, assertUniversityScope } from "@/lib/auth/current-user";
import { getCourseScope } from "@/lib/curriculum/service";
import { getExtractionRun, applyExtraction } from "@/lib/extraction/service";

type Ctx = { params: Promise<{ id: string }> };

/** Apply a proposal into the graph as draft concepts + prerequisites. */
export const POST = route(async (_req: NextRequest, ctx: Ctx) => {
  const user = await requireRole("lecturer");
  const { id } = await ctx.params;
  const run = await getExtractionRun(id);
  if (!run) return error("Extraction run not found", 404);
  const scope = await getCourseScope(run.courseId);
  if (!scope) return error("Course not found", 404);
  assertUniversityScope(user, scope.universityId);
  const result = await applyExtraction(id, user.id);
  return json({ result });
});
