/**
 * Seed the database with a super-admin and one demo university + department.
 * Idempotent: re-running will not create duplicates.
 *
 * Credentials come from env (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD) or fall
 * back to safe local defaults. Change them before any shared deployment.
 */
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { randomUUID, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import * as schema from "./schema";

const file = process.env.DATABASE_URL?.replace(/^file:/, "") ?? "learningos.db";
const sqlite = new Database(file);
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@learningos.local")
    .trim()
    .toLowerCase();
  const password =
    process.env.SEED_ADMIN_PASSWORD ?? randomBytes(9).toString("base64url");
  const generated = !process.env.SEED_ADMIN_PASSWORD;

  // Demo university
  let uni = db
    .select()
    .from(schema.universities)
    .where(eq(schema.universities.slug, "gombe-state-university"))
    .get();
  if (!uni) {
    [uni] = db
      .insert(schema.universities)
      .values({
        id: randomUUID(),
        name: "Gombe State University",
        slug: "gombe-state-university",
        country: "Nigeria",
      })
      .returning()
      .all();
    console.log("Created university:", uni.name);
  }

  // Demo department
  const dept = db
    .select()
    .from(schema.departments)
    .where(eq(schema.departments.code, "BIO"))
    .get();
  if (!dept) {
    db.insert(schema.departments)
      .values({
        id: randomUUID(),
        universityId: uni.id,
        name: "Biological Sciences",
        code: "BIO",
      })
      .run();
    console.log("Created department: Biological Sciences (BIO)");
  }

  // Super admin
  const existing = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .get();
  if (!existing) {
    db.insert(schema.users)
      .values({
        id: randomUUID(),
        email,
        name: "Platform Admin",
        passwordHash: await bcrypt.hash(password, 12),
        role: "super_admin",
      })
      .run();
    console.log("\nCreated super-admin:");
    console.log(`  email:    ${email}`);
    console.log(
      generated
        ? `  password: ${password}   (generated — save it now)`
        : "  password: (from SEED_ADMIN_PASSWORD)",
    );
  } else {
    console.log(`Super-admin ${email} already exists — left unchanged.`);
  }

  sqlite.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
