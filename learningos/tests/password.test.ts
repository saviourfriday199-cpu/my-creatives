import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("password hashing", () => {
  it("hashes and verifies a correct password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash).not.toContain("correct horse");
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("s3cret-password");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("produces different hashes for the same input (salted)", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    expect(a).not.toEqual(b);
  });
});
