import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

/**
 * Applies all pending SQL migrations from ./drizzle to the target database.
 * Run with `npm run db:migrate`. Safe to run repeatedly (idempotent).
 */
const file = process.env.DATABASE_URL?.replace(/^file:/, "") ?? "learningos.db";
const sqlite = new Database(file);
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: "./drizzle" });
sqlite.close();
console.log(`Migrations applied to ${file}`);
