import { describe, it, expect } from "vitest";
import { registerUser, authenticate, AuthError } from "@/lib/auth/service";
import { verifyPassword } from "@/lib/password";

describe("registerUser", () => {
  it("creates a student by default with a hashed password", async () => {
    const user = await registerUser({
      email: "Ada@Example.com",
      name: "Ada Lovelace",
      password: "supersecret",
    });
    expect(user.role).toBe("student");
    expect(user.email).toBe("ada@example.com"); // normalised
    expect(user.passwordHash).not.toBe("supersecret");
    expect(await verifyPassword("supersecret", user.passwordHash)).toBe(true);
  });

  it("rejects a duplicate email", async () => {
    await registerUser({ email: "dup@example.com", name: "One", password: "password1" });
    await expect(
      registerUser({ email: "dup@example.com", name: "Two", password: "password2" }),
    ).rejects.toMatchObject({ code: "email_taken" });
  });

  it("honours an explicitly-provided elevated role", async () => {
    const user = await registerUser({
      email: "admin@example.com",
      name: "Admin",
      password: "password1",
      role: "admin",
      universityId: null,
    });
    expect(user.role).toBe("admin");
  });
});

describe("authenticate", () => {
  it("returns the user for correct credentials", async () => {
    await registerUser({ email: "log@example.com", name: "Log In", password: "rightpass1" });
    const user = await authenticate("log@example.com", "rightpass1");
    expect(user.email).toBe("log@example.com");
  });

  it("throws for a wrong password", async () => {
    await registerUser({ email: "wp@example.com", name: "WP", password: "rightpass1" });
    await expect(authenticate("wp@example.com", "nope")).rejects.toBeInstanceOf(AuthError);
  });

  it("throws for an unknown email (no user enumeration)", async () => {
    await expect(authenticate("ghost@example.com", "whatever")).rejects.toMatchObject({
      code: "invalid_credentials",
    });
  });
});
