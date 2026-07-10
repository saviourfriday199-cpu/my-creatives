import { randomUUID, randomBytes, createHash } from "node:crypto";

/** Primary-key id. UUID v4 keeps us portable across SQLite and Postgres. */
export function newId(): string {
  return randomUUID();
}

/** A high-entropy opaque session token handed to the client (in a cookie). */
export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Deterministic hash of a session token — only the hash is stored server-side. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
