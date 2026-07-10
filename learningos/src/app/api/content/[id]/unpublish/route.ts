import type { NextRequest } from "next/server";
import { json, route, error } from "@/lib/http";
import { requireRole, assertUniversityScope } from "@/lib/auth/current-user";
import { getContentUniversityId, setContentStatus } from "@/lib/content/service";

type Ctx = { params: Promise<{ id: string }> };

export const POST = route(async (_req: NextRequest, ctx: Ctx) => {
  const user = await requireRole("lecturer");
  const { id } = await ctx.params;
  const found = await getContentUniversityId(id);
  if (!found) return error("Content not found", 404);
  assertUniversityScope(user, found.universityId);
  await setContentStatus(id, "draft");
  return json({ ok: true });
});
