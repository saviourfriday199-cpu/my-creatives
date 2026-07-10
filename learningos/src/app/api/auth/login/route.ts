import type { NextRequest } from "next/server";
import { json, route } from "@/lib/http";
import { loginSchema } from "@/lib/validators";
import { authenticate } from "@/lib/auth/service";
import { createSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookie";
import { toPublicUser } from "@/lib/auth/public-user";

export const POST = route(async (req: NextRequest) => {
  const { email, password } = loginSchema.parse(await req.json());
  const user = await authenticate(email, password);
  const { token, expiresAt } = await createSession(user.id);
  await setSessionCookie(token, expiresAt);
  return json({ user: toPublicUser(user) });
});
