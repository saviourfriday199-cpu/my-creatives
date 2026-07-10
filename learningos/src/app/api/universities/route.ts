import type { NextRequest } from "next/server";
import { json, route } from "@/lib/http";
import { requireRole, requireUser } from "@/lib/auth/current-user";
import { createUniversitySchema } from "@/lib/validators";
import { listUniversities, createUniversity } from "@/lib/org/service";

/** Any authenticated user can list universities. */
export const GET = route(async () => {
  await requireUser();
  return json({ universities: await listUniversities() });
});

/** Only a super_admin can create a university (a new tenant). */
export const POST = route(async (req: NextRequest) => {
  await requireRole("super_admin");
  const input = createUniversitySchema.parse(await req.json());
  const university = await createUniversity(input);
  return json({ university }, 201);
});
