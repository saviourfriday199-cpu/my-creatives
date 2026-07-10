import type { NextRequest } from "next/server";
import { json, route, error } from "@/lib/http";
import {
  requireRole,
  requireUser,
  assertUniversityScope,
} from "@/lib/auth/current-user";
import { runExtractionSchema } from "@/lib/validators";
import { getCourseScope } from "@/lib/curriculum/service";
import { runExtraction, listExtractionRuns } from "@/lib/extraction/service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req: NextRequest, ctx: Ctx) => {
  await requireUser();
  const { id } = await ctx.params;
  if (!(await getCourseScope(id))) return error("Course not found", 404);
  return json({ runs: await listExtractionRuns(id) });
});

/** Run the AI Content Engine over pasted material → a proposal for review. */
export const POST = route(async (req: NextRequest, ctx: Ctx) => {
  const user = await requireRole("lecturer");
  const { id } = await ctx.params;
  const scope = await getCourseScope(id);
  if (!scope) return error("Course not found", 404);
  assertUniversityScope(user, scope.universityId);
  const { sourceText } = runExtractionSchema.parse(await req.json());
  const run = await runExtraction(id, sourceText, user.id);
  return json({ run }, 201);
});
