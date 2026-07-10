import "server-only";
import { and, eq, gt, lt } from "drizzle-orm";
import { db, schema } from "@/db";
import { newId, newSessionToken, hashToken } from "@/lib/ids";
import { SESSION_COOKIE, SESSION_TTL_MS } from "./constants";
import type { SessionUser } from "./session-types";

export { SESSION_COOKIE };
export type { SessionUser };

/** Create a session row and return the raw token to set as a cookie. */
export async function createSession(userId: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(schema.sessions).values({
    id: newId(),
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  });
  return { token, expiresAt };
}

/** Resolve a raw token to its (non-expired) user, or null. */
export async function getUserByToken(
  token: string | undefined,
): Promise<SessionUser | null> {
  if (!token) return null;
  const row = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      universityId: schema.users.universityId,
      departmentId: schema.users.departmentId,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(
      and(
        eq(schema.sessions.tokenHash, hashToken(token)),
        gt(schema.sessions.expiresAt, new Date()),
      ),
    )
    .get();
  return row ?? null;
}

/** Invalidate a single session by its raw token. */
export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  await db
    .delete(schema.sessions)
    .where(eq(schema.sessions.tokenHash, hashToken(token)));
}

/** Housekeeping: drop expired sessions (call opportunistically). */
export async function purgeExpiredSessions(): Promise<void> {
  await db
    .delete(schema.sessions)
    .where(lt(schema.sessions.expiresAt, new Date()));
}
