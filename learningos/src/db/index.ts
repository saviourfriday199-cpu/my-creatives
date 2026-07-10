import "server-only";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

/**
 * Database singleton. Uses better-sqlite3 for dev/test. In production the
 * connection URL points at Postgres and the driver import is swapped here (the
 * rest of the app talks only to the exported `db`, so nothing else changes).
 *
 * The instance is cached on globalThis so Next's dev hot-reload doesn't open a
 * new file handle on every request.
 */
const DB_FILE =
  process.env.DATABASE_URL?.replace(/^file:/, "") ?? "learningos.db";

const globalForDb = globalThis as unknown as {
  __sqlite?: Database.Database;
};

const sqlite = globalForDb.__sqlite ?? new Database(DB_FILE);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
if (process.env.NODE_ENV !== "production") globalForDb.__sqlite = sqlite;

export const db = drizzle(sqlite, { schema });
export { schema };
