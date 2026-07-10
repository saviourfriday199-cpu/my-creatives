import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { newId } from "@/lib/ids";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { Role } from "@/db/schema";

export class AuthError extends Error {
  constructor(
    message: string,
    readonly code:
      | "email_taken"
      | "invalid_credentials"
      | "not_found" = "invalid_credentials",
  ) {
    super(message);
    this.name = "AuthError";
  }
}

interface RegisterParams {
  email: string;
  name: string;
  password: string;
  /** Defaults to student. Elevated roles must be set by a caller that has already checked authorization. */
  role?: Role;
  universityId?: string | null;
  departmentId?: string | null;
}

export async function registerUser(
  params: RegisterParams,
): Promise<schema.User> {
  const email = params.email.trim().toLowerCase();
  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .get();
  if (existing) throw new AuthError("Email already registered", "email_taken");

  const passwordHash = await hashPassword(params.password);
  const [user] = await db
    .insert(schema.users)
    .values({
      id: newId(),
      email,
      name: params.name.trim(),
      passwordHash,
      role: params.role ?? "student",
      universityId: params.universityId ?? null,
      departmentId: params.departmentId ?? null,
    })
    .returning();
  return user;
}

/** Verify credentials; throws AuthError on failure. Returns the user row. */
export async function authenticate(
  emailRaw: string,
  password: string,
): Promise<schema.User> {
  const email = emailRaw.trim().toLowerCase();
  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .get();
  if (!user) {
    // Do a dummy hash compare to reduce user-enumeration timing signal.
    await verifyPassword(password, "$2a$12$0000000000000000000000000000000000000000000000000000");
    throw new AuthError("Invalid email or password", "invalid_credentials");
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new AuthError("Invalid email or password", "invalid_credentials");
  return user;
}
