import { json, route } from "@/lib/http";
import { destroySession } from "@/lib/auth/session";
import { readSessionCookie, clearSessionCookie } from "@/lib/auth/cookie";

export const POST = route(async () => {
  const token = await readSessionCookie();
  await destroySession(token);
  await clearSessionCookie();
  return json({ ok: true });
});
