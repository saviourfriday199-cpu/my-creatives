import { describe, it, expect } from "vitest";
import {
  createUniversity,
  listUniversities,
  createDepartment,
  listDepartments,
  OrgError,
} from "@/lib/org/service";

async function uni(slug = "test-university") {
  return createUniversity({ name: "Test University", slug, country: "Nigeria" });
}

describe("universities", () => {
  it("creates and lists universities", async () => {
    await uni("alpha-university");
    await uni("beta-university");
    const all = await listUniversities();
    expect(all.map((u) => u.slug).sort()).toEqual([
      "alpha-university",
      "beta-university",
    ]);
  });

  it("rejects a duplicate slug", async () => {
    await uni("dup-slug");
    await expect(uni("dup-slug")).rejects.toBeInstanceOf(OrgError);
  });
});

describe("departments", () => {
  it("creates a department under a university", async () => {
    const u = await uni();
    const d = await createDepartment(u.id, {
      name: "Biological Sciences",
      code: "BIO",
    });
    expect(d.universityId).toBe(u.id);
    const list = await listDepartments(u.id);
    expect(list).toHaveLength(1);
    expect(list[0].code).toBe("BIO");
  });

  it("rejects a duplicate code within the same university", async () => {
    const u = await uni();
    await createDepartment(u.id, { name: "Biology", code: "BIO" });
    await expect(
      createDepartment(u.id, { name: "Biochemistry", code: "BIO" }),
    ).rejects.toBeInstanceOf(OrgError);
  });

  it("allows the same code in different universities", async () => {
    const a = await uni("uni-a");
    const b = await uni("uni-b");
    await createDepartment(a.id, { name: "Biology", code: "BIO" });
    await expect(
      createDepartment(b.id, { name: "Biology", code: "BIO" }),
    ).resolves.toBeTruthy();
  });

  it("rejects a department for a missing university", async () => {
    await expect(
      createDepartment("no-such-id", { name: "Ghost", code: "GHO" }),
    ).rejects.toMatchObject({ code: "not_found" });
  });

  it("scopes department listing to a single university", async () => {
    const a = await uni("scope-a");
    const b = await uni("scope-b");
    await createDepartment(a.id, { name: "Biology", code: "BIO" });
    await createDepartment(b.id, { name: "Chemistry", code: "CHM" });
    expect(await listDepartments(a.id)).toHaveLength(1);
    expect((await listDepartments(a.id))[0].code).toBe("BIO");
  });
});
