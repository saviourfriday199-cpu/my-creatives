import type { NextRequest } from "next/server";
import { json, route, error } from "@/lib/http";
import { requireRole, assertUniversityScope } from "@/lib/auth/current-user";
import { getContentUniversityId, deleteContent } from "@/lib/content/service";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = route(async (_req: NextRequest, ctx: Ctx) => {
  const user = await requireRole("lecturer");
  const { id } = await ctx.params;
  const found = await getContentUniversityId(id);
  if (!found) return error("Content not found", 404);
  assertUniversityScope(user, found.universityId);
  await deleteContent(id);
  return json({ ok: true });
});
