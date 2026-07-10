import { describe, it, expect } from "vitest";
import { hasAtLeast, assertUniversityScope, AuthzError } from "@/lib/auth/authz";

describe("role hierarchy", () => {
  it("treats higher roles as satisfying lower requirements", () => {
    expect(hasAtLeast("super_admin", "admin")).toBe(true);
    expect(hasAtLeast("admin", "admin")).toBe(true);
    expect(hasAtLeast("lecturer", "student")).toBe(true);
  });

  it("rejects insufficient roles", () => {
    expect(hasAtLeast("student", "admin")).toBe(false);
    expect(hasAtLeast("lecturer", "admin")).toBe(false);
    expect(hasAtLeast("admin", "super_admin")).toBe(false);
  });
});

describe("university scope", () => {
  const admin = { role: "admin" as const, universityId: "uni-1" };

  it("allows an admin within their own university", () => {
    expect(() => assertUniversityScope(admin, "uni-1")).not.toThrow();
  });

  it("blocks an admin from another university", () => {
    expect(() => assertUniversityScope(admin, "uni-2")).toThrow(AuthzError);
  });

  it("lets a super_admin act on any university", () => {
    const sup = { role: "super_admin" as const, universityId: null };
    expect(() => assertUniversityScope(sup, "any")).not.toThrow();
  });
});
