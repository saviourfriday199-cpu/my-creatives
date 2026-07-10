import type { Role } from "@/db/schema";
import type { SessionUser } from "./session-types";

/** Role privilege ordering for hierarchical checks. */
export const RANK: Record<Role, number> = {
  student: 0,
  lecturer: 1,
  admin: 2,
  super_admin: 3,
};

export class AuthzError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403 = 403,
  ) {
    super(message);
    this.name = "AuthzError";
  }
}

/** True if `role` is at least `min` in the privilege hierarchy. */
export function hasAtLeast(role: Role, min: Role): boolean {
  return RANK[role] >= RANK[min];
}

/**
 * Tenancy guard: a super_admin may act on any university; anyone else only on
 * the university they belong to. Throws AuthzError(403) on mismatch.
 */
export function assertUniversityScope(
  user: Pick<SessionUser, "role" | "universityId">,
  universityId: string,
): void {
  if (user.role === "super_admin") return;
  if (user.universityId !== universityId) {
    throw new AuthzError("Outside your university scope", 403);
  }
}
