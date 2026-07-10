import { beforeAll, beforeEach, afterAll } from "vitest";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { existsSync, rmSync } from "node:fs";

/**
 * Test database lifecycle. DATABASE_URL is file:test.db (vitest.config), so the
 * app's own db singleton (src/db) opens the same file. Here we own a second
 * client purely to (re)build the schema and truncate between tests.
 */
const FILE = "test.db";
const control = createClient({ url: `file:${FILE}` });

beforeAll(async () => {
  await migrate(drizzle(control), { migrationsFolder: "./drizzle" });
});

beforeEach(async () => {
  const tables = [
    "content_items",
    "extraction_runs",
    "concept_edges",
    "concepts",
    "courses",
    "sessions",
    "users",
    "departments",
    "universities",
  ];
  await control.executeMultiple(
    "PRAGMA foreign_keys=OFF;" +
      tables.map((t) => `DELETE FROM ${t};`).join("") +
      "PRAGMA foreign_keys=ON;",
  );
});

afterAll(() => {
  control.close();
  for (const f of [FILE, `${FILE}-shm`, `${FILE}-wal`]) {
    if (existsSync(f)) rmSync(f);
  }
});
