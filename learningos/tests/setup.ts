import { beforeAll, beforeEach, afterAll } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { existsSync, rmSync } from "node:fs";

/**
 * Test database lifecycle. DATABASE_URL is set to ./test.db via vitest.config,
 * so the app's own db singleton (src/db) opens the same file. Here we own a
 * second handle purely to (re)build the schema and truncate between tests.
 */
const FILE = "test.db";
const control = new Database(FILE);
control.pragma("foreign_keys = ON");

beforeAll(() => {
  migrate(drizzle(control), { migrationsFolder: "./drizzle" });
});

beforeEach(() => {
  control.pragma("foreign_keys = OFF");
  for (const t of ["sessions", "users", "departments", "universities"]) {
    control.exec(`DELETE FROM ${t};`);
  }
  control.pragma("foreign_keys = ON");
});

afterAll(() => {
  control.close();
  for (const f of [FILE, `${FILE}-shm`, `${FILE}-wal`]) {
    if (existsSync(f)) rmSync(f);
  }
});
