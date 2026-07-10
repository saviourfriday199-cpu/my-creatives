import type { NextRequest } from "next/server";
import { json, route, error } from "@/lib/http";
import {
  requireUser,
  requireRole,
  hasAtLeast,
  assertUniversityScope,
} from "@/lib/auth/current-user";
import { generateContentSchema } from "@/lib/validators";
import { getConcept, getCourseScope } from "@/lib/curriculum/service";
import { generateContent, listContent } from "@/lib/content/service";

type Ctx = { params: Promise<{ id: string }> };

/** List content for a concept. Lecturers see drafts; students see published only. */
export const GET = route(async (_req: NextRequest, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const concept = await getConcept(id);
  if (!concept) return error("Concept not found", 404);
  const scope = await getCourseScope(concept.courseId);
  if (!scope) return error("Course not found", 404);

  const isEditor =
    hasAtLeast(user.role, "lecturer") &&
    (user.role === "super_admin" || user.universityId === scope.universityId);
  return json({ content: await listContent(id, { publishedOnly: !isEditor }) });
});

/** Generate draft study content from a transcript/notes blob. Lecturer-scoped. */
export const POST = route(async (req: NextRequest, ctx: Ctx) => {
  const user = await requireRole("lecturer");
  const { id } = await ctx.params;
  const concept = await getConcept(id);
  if (!concept) return error("Concept not found", 404);
  const scope = await getCourseScope(concept.courseId);
  if (!scope) return error("Course not found", 404);
  assertUniversityScope(user, scope.universityId);

  const { sourceText } = generateContentSchema.parse(await req.json());
  const content = await generateContent(id, sourceText, user.id);
  return json({ content }, 201);
});
