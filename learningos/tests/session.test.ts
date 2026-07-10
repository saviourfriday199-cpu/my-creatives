import { describe, it, expect } from "vitest";
import { db, schema } from "@/db";
import { registerUser } from "@/lib/auth/service";
import {
  createSession,
  getUserByToken,
  destroySession,
} from "@/lib/auth/session";
import { newId, hashToken } from "@/lib/ids";

async function makeUser(email = "sess@example.com") {
  return registerUser({ email, name: "Sess", password: "password1" });
}

describe("sessions", () => {
  it("resolves a valid token to its user", async () => {
    const user = await makeUser();
    const { token } = await createSession(user.id);
    const resolved = await getUserByToken(token);
    expect(resolved?.id).toBe(user.id);
    expect(resolved?.email).toBe("sess@example.com");
  });

  it("returns null for an unknown or empty token", async () => {
    expect(await getUserByToken("not-a-real-token")).toBeNull();
    expect(await getUserByToken(undefined)).toBeNull();
  });

  it("returns null for an expired session", async () => {
    const user = await makeUser("exp@example.com");
    const token = "expired-token-value";
    await db.insert(schema.sessions).values({
      id: newId(),
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() - 1000),
    });
    expect(await getUserByToken(token)).toBeNull();
  });

  it("destroys a session so its token no longer resolves", async () => {
    const user = await makeUser("del@example.com");
    const { token } = await createSession(user.id);
    await destroySession(token);
    expect(await getUserByToken(token)).toBeNull();
  });

  it("stores only the token hash, never the raw token", async () => {
    const user = await makeUser("hash@example.com");
    const { token } = await createSession(user.id);
    const rows = await db.select().from(schema.sessions).all();
    for (const r of rows) expect(r.tokenHash).not.toBe(token);
  });
});
