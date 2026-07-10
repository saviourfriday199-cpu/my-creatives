import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./constants";
import { getUserByToken } from "./session";
import type { SessionUser } from "./session-types";
import { AuthzError, hasAtLeast, assertUniversityScope } from "./authz";
import type { Role } from "@/db/schema";

export { AuthzError, hasAtLeast, assertUniversityScope };

/** The current user from the session cookie, or null if unauthenticated. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  return getUserByToken(store.get(SESSION_COOKIE)?.value);
}

/** Require an authenticated user; throws AuthzError(401) otherwise. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthzError("Authentication required", 401);
  return user;
}

/**
 * Require the user to hold at least the given role. Returns the user so calls
 * read as `const admin = await requireRole("admin")`.
 */
export async function requireRole(min: Role): Promise<SessionUser> {
  const user = await requireUser();
  if (!hasAtLeast(user.role, min)) {
    throw new AuthzError("Insufficient permissions", 403);
  }
  return user;
}
