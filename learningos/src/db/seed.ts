/**
 * Seed the database with a super-admin and one demo university + department.
 * Idempotent. Works against a local file: DB or a remote Turso libsql:// URL.
 *
 * Credentials come from env (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD) or fall
 * back to safe local defaults. Change them before any shared deployment.
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { randomUUID, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import * as schema from "./schema";

async function main() {
  const url = process.env.DATABASE_URL ?? "file:learningos.db";
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  const client = createClient(authToken ? { url, authToken } : { url });
  const db = drizzle(client, { schema });

  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@learningos.local")
    .trim()
    .toLowerCase();
  const password =
    process.env.SEED_ADMIN_PASSWORD ?? randomBytes(9).toString("base64url");
  const generated = !process.env.SEED_ADMIN_PASSWORD;

  let uni = await db
    .select()
    .from(schema.universities)
    .where(eq(schema.universities.slug, "gombe-state-university"))
    .get();
  if (!uni) {
    [uni] = await db
      .insert(schema.universities)
      .values({
        id: randomUUID(),
        name: "Gombe State University",
        slug: "gombe-state-university",
        country: "Nigeria",
      })
      .returning();
    console.log("Created university:", uni.name);
  }

  const dept = await db
    .select()
    .from(schema.departments)
    .where(eq(schema.departments.code, "BIO"))
    .get();
  if (!dept) {
    await db.insert(schema.departments).values({
      id: randomUUID(),
      universityId: uni.id,
      name: "Biological Sciences",
      code: "BIO",
    });
    console.log("Created department: Biological Sciences (BIO)");
  }

  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .get();
  if (!existing) {
    await db.insert(schema.users).values({
      id: randomUUID(),
      email,
      name: "Platform Admin",
      passwordHash: await bcrypt.hash(password, 12),
      role: "super_admin",
    });
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

  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
