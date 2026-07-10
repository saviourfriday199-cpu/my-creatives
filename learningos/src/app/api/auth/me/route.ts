import { json, route } from "@/lib/http";
import { getCurrentUser } from "@/lib/auth/current-user";
import { toPublicUser } from "@/lib/auth/public-user";

export const GET = route(async () => {
  const user = await getCurrentUser();
  return json({ user: user ? toPublicUser(user) : null });
});
