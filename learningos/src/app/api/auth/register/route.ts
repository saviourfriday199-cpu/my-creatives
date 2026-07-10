import type { NextRequest } from "next/server";
import { json, route } from "@/lib/http";
import { registerSchema } from "@/lib/validators";
import { registerUser } from "@/lib/auth/service";
import { createSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookie";
import { toPublicUser } from "@/lib/auth/public-user";

/** Public self-registration. Always creates a STUDENT and signs them in. */
export const POST = route(async (req: NextRequest) => {
  const body = registerSchema.parse(await req.json());
  const user = await registerUser(body); // role defaults to student
  const { token, expiresAt } = await createSession(user.id);
  await setSessionCookie(token, expiresAt);
  return json({ user: toPublicUser(user) }, 201);
});
